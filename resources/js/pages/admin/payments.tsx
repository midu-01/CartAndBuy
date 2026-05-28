import { Head, Link, router, useForm } from '@inertiajs/react';
import { CheckCircle, ChevronLeft, ChevronRight, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Order {
    id: number;
    payment_method: string;
    payment_status: string;
    payment_failure_reason: string | null;
    payment_receipt: string | null;
    transaction_id: string | null;
    total: string;
    created_at: string;
    user: { name: string; email: string } | null;
    guest_email: string | null;
}

interface PaginationLink { url: string | null; label: string; active: boolean }

interface Props {
    orders: {
        data: Order[];
        links: PaginationLink[];
        meta: { current_page: number; last_page: number; total: number; per_page: number };
    };
    filters: { status?: string; method?: string; search?: string };
    counts: { all: number; pending_verification: number; paid: number; failed: number };
}

const paymentStatusColors: Record<string, string> = {
    pending_verification: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    unpaid: 'bg-gray-100 text-gray-600',
};

const paymentMethodLabels: Record<string, string> = {
    bkash: 'bKash',
    nagad: 'Nagad',
    cod: 'COD',
};

function RejectDialog({ order, onClose }: { order: Order; onClose: () => void }) {
    const { data, setData, patch, processing, errors } = useForm({ reason: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(`/admin/payments/${order.id}/reject`, { onSuccess: onClose });
    }

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Reject Payment — Order #{order.id}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <textarea
                        value={data.reason}
                        onChange={(e) => setData('reason', e.target.value)}
                        rows={3}
                        placeholder="e.g. Transaction ID not found, Amount mismatch…"
                        className={cn(
                            'w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none',
                            errors.reason && 'border-red-400',
                        )}
                    />
                    {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={processing} className="border-0 bg-red-500 text-white hover:bg-red-600">
                        {processing ? 'Rejecting…' : 'Reject Payment'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

export default function AdminPaymentsPage({ orders, filters, counts }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [rejectOrder, setRejectOrder] = useState<Order | null>(null);

    const tabs = [
        { key: '', label: 'All', count: counts.all },
        { key: 'pending_verification', label: 'Pending Verification', count: counts.pending_verification },
        { key: 'paid', label: 'Paid', count: counts.paid },
        { key: 'failed', label: 'Failed', count: counts.failed },
    ];

    function applyFilter(key: string, value: string) {
        router.get('/admin/payments', { ...filters, [key]: value || undefined, page: undefined }, { preserveState: true, replace: true });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilter('search', search);
    }

    function approvePayment(order: Order) {
        router.patch(`/admin/payments/${order.id}/approve`, {}, { preserveScroll: true });
    }

    const receiptBaseUrl = '/storage/';

    return (
        <AdminLayout>
            <Head title="Payment Management — Admin" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                    <p className="text-sm text-gray-500">Verify and manage order payments</p>
                </div>
            </div>

            {/* Status tabs */}
            <div className="mb-5 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => applyFilter('status', tab.key)}
                        className={cn(
                            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                            (filters.status ?? '') === tab.key
                                ? 'bg-[#1a1a2e] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                        )}
                    >
                        {tab.label}
                        <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search + method filter */}
            <div className="mb-5 flex flex-wrap gap-3">
                <form onSubmit={handleSearch} className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search order ID, transaction ID, customer…"
                        className="w-full rounded-lg border bg-white pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                    />
                </form>
                <select
                    value={filters.method ?? ''}
                    onChange={(e) => applyFilter('method', e.target.value)}
                    className="rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                >
                    <option value="">All Methods</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="cod">COD</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-5 py-3 text-left">Order</th>
                            <th className="px-5 py-3 text-left">Customer</th>
                            <th className="px-5 py-3 text-left">Method / TxnID</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                            <th className="px-5 py-3 text-center">Receipt</th>
                            <th className="px-5 py-3 text-center">Status</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                                    No payments found.
                                </td>
                            </tr>
                        )}
                        {orders.data.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3">
                                    <Link href={`/admin/orders/${order.id}`} className="font-mono font-semibold text-[#1a1a2e] hover:text-[#e94560]">
                                        #{order.id}
                                    </Link>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString('en-GB')}
                                    </p>
                                </td>
                                <td className="px-5 py-3">
                                    <p className="font-medium">{order.user?.name ?? 'Guest'}</p>
                                    <p className="text-xs text-gray-400">{order.user?.email ?? order.guest_email}</p>
                                </td>
                                <td className="px-5 py-3">
                                    <p className="font-medium uppercase">{paymentMethodLabels[order.payment_method] ?? order.payment_method}</p>
                                    {order.transaction_id && (
                                        <p className="font-mono text-xs text-gray-500">{order.transaction_id}</p>
                                    )}
                                    {order.payment_failure_reason && (
                                        <p className="mt-0.5 text-xs text-red-500">{order.payment_failure_reason}</p>
                                    )}
                                </td>
                                <td className="px-5 py-3 text-right font-bold">৳{Number(order.total).toFixed(2)}</td>
                                <td className="px-5 py-3 text-center">
                                    {order.payment_receipt ? (
                                        <a
                                            href={`${receiptBaseUrl}${order.payment_receipt}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-blue-600 underline hover:text-blue-800"
                                        >
                                            View
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-300">—</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <Badge className={cn('border-0 capitalize text-xs', paymentStatusColors[order.payment_status] ?? 'bg-gray-100 text-gray-600')}>
                                        {order.payment_status.replace('_', ' ')}
                                    </Badge>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {['pending_verification', 'unpaid', 'failed'].includes(order.payment_status) && (
                                            <button
                                                onClick={() => approvePayment(order)}
                                                title="Approve payment"
                                                className="rounded p-1 text-green-600 hover:bg-green-50"
                                            >
                                                <CheckCircle className="size-4" />
                                            </button>
                                        )}
                                        {['pending_verification', 'unpaid'].includes(order.payment_status) && (
                                            <button
                                                onClick={() => setRejectOrder(order)}
                                                title="Reject payment"
                                                className="rounded p-1 text-red-500 hover:bg-red-50"
                                            >
                                                <XCircle className="size-4" />
                                            </button>
                                        )}
                                        {order.payment_status === 'paid' && (
                                            <span className="text-xs text-gray-400">Verified</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {orders.meta.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                    <span>
                        Showing {(orders.meta.current_page - 1) * orders.meta.per_page + 1}–
                        {Math.min(orders.meta.current_page * orders.meta.per_page, orders.meta.total)} of {orders.meta.total}
                    </span>
                    <div className="flex gap-1">
                        {orders.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={cn(
                                    'rounded px-3 py-1.5 text-xs',
                                    link.active ? 'bg-[#1a1a2e] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
                                    !link.url && 'pointer-events-none opacity-40',
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Reject dialog */}
            <Dialog open={!!rejectOrder} onOpenChange={(open) => !open && setRejectOrder(null)}>
                {rejectOrder && <RejectDialog order={rejectOrder} onClose={() => setRejectOrder(null)} />}
            </Dialog>
        </AdminLayout>
    );
}
