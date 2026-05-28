import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface OrderItem { id: number; product_name: string; quantity: number; unit_price: string; total_price: string }
interface ShippingAddress { first_name: string; last_name: string; address: string; city: string; state: string; zip: string; country: string; email: string; phone: string }

interface PaymentTransaction {
    id: number;
    gateway: string;
    type: string;
    amount: string;
    status: string;
    gateway_transaction_id: string | null;
    failure_reason: string | null;
    verified_at: string | null;
    notes: string | null;
    created_at: string;
    verified_by: { name: string } | null;
}

interface Refund {
    id: number;
    amount: string;
    type: string;
    reason: string;
    status: string;
    refund_method: string;
    notes: string | null;
    processed_at: string | null;
    refunded_by: { name: string } | null;
}

interface Order {
    id: number;
    status: string;
    subtotal: string;
    shipping_cost: string;
    discount_amount: string;
    wallet_used: string;
    total: string;
    payment_method: string;
    payment_status: string;
    payment_failure_reason: string | null;
    payment_receipt: string | null;
    transaction_id: string | null;
    payment_verified_at: string | null;
    coupon_code: string | null;
    created_at: string;
    shipping_address: ShippingAddress;
    items: OrderItem[];
    user: { name: string; email: string } | null;
    guest_email: string | null;
    payment_transactions: PaymentTransaction[];
    refunds: Refund[];
}

interface Props { order: Order }

const orderStatusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const paymentStatusColors: Record<string, string> = {
    pending_verification: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    unpaid: 'bg-gray-100 text-gray-600',
};

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function RefundDialog({ order, onClose }: { order: Order; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        amount: order.total,
        reason: '',
        refund_method: 'wallet',
        notes: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/admin/orders/${order.id}/refund`, { onSuccess: onClose });
    }

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Issue Refund — Order #{order.id}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Amount (৳)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={order.total}
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className={cn('w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors.amount && 'border-red-400')}
                        />
                        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Refund Via</label>
                        <select
                            value={data.refund_method}
                            onChange={(e) => setData('refund_method', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                        >
                            <option value="wallet">Wallet Credit</option>
                            <option value="original_method">Original Method</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
                    <textarea
                        value={data.reason}
                        onChange={(e) => setData('reason', e.target.value)}
                        rows={2}
                        placeholder="Reason for refund…"
                        className={cn('w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors.reason && 'border-red-400')}
                    />
                    {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Notes <span className="text-xs font-normal text-gray-400">(optional)</span>
                    </label>
                    <textarea
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={processing} className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]">
                        {processing ? 'Processing…' : 'Issue Refund'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

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
                        placeholder="e.g. Transaction ID not found, amount mismatch…"
                        className={cn('w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none', errors.reason && 'border-red-400')}
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

export default function AdminOrderDetailPage({ order }: Props) {
    const [status, setStatus] = useState(order.status);
    const [refundOpen, setRefundOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);

    function updateStatus() {
        router.patch(`/admin/orders/${order.id}/status`, { status }, { preserveScroll: true });
    }

    function approvePayment() {
        router.patch(`/admin/payments/${order.id}/approve`, {}, { preserveScroll: true });
    }

    const addr = order.shipping_address;
    const isPendingVerification = ['pending_verification', 'unpaid'].includes(order.payment_status);
    const canRefund = order.payment_status === 'paid';

    return (
        <AdminLayout>
            <Head title={`Order #${order.id} — Admin`} />
            <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
                <ArrowLeft className="size-4" /> Back to Orders
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                    <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()} · Customer: <span className="font-medium">{order.user?.name ?? order.guest_email ?? 'Guest'}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none bg-white text-gray-900">
                        {orderStatuses.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <Button onClick={updateStatus} className="bg-[#1a1a2e] hover:bg-[#0f3460] border-0 text-white" disabled={status === order.status}>
                        Update Status
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left — Items + payment transactions + refunds */}
                <div className="md:col-span-2 space-y-4">
                    {/* Items */}
                    <div className="bg-white border rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b bg-gray-50 font-semibold">Items</div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-5 py-2 text-left">Product</th>
                                    <th className="px-5 py-2 text-center">Qty</th>
                                    <th className="px-5 py-2 text-right">Unit</th>
                                    <th className="px-5 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {order.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-5 py-3 font-medium">{item.product_name}</td>
                                        <td className="px-5 py-3 text-center">{item.quantity}</td>
                                        <td className="px-5 py-3 text-right">৳{Number(item.unit_price).toFixed(2)}</td>
                                        <td className="px-5 py-3 text-right font-bold">৳{Number(item.total_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Verification */}
                    <div className="bg-white border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Payment Verification</h3>
                            <Badge className={cn('border-0 capitalize text-xs', paymentStatusColors[order.payment_status] ?? 'bg-gray-100 text-gray-600')}>
                                {order.payment_status.replace('_', ' ')}
                            </Badge>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Method</span>
                                <span className="font-medium uppercase">{order.payment_method}</span>
                            </div>
                            {order.transaction_id && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Transaction ID</span>
                                    <span className="font-mono">{order.transaction_id}</span>
                                </div>
                            )}
                            {order.payment_verified_at && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Verified At</span>
                                    <span>{new Date(order.payment_verified_at).toLocaleString()}</span>
                                </div>
                            )}
                            {order.payment_failure_reason && (
                                <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                                    Failure: {order.payment_failure_reason}
                                </div>
                            )}
                        </div>

                        {order.payment_receipt && (
                            <a
                                href={`/storage/${order.payment_receipt}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mb-4 block overflow-hidden rounded-lg border"
                            >
                                <img
                                    src={`/storage/${order.payment_receipt}`}
                                    alt="Payment receipt"
                                    className="max-h-48 w-full object-contain bg-gray-50"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <p className="bg-gray-50 px-3 py-1.5 text-xs text-blue-600 underline">View full receipt</p>
                            </a>
                        )}

                        {isPendingVerification && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={approvePayment}
                                    className="flex-1 border-0 bg-green-600 text-white hover:bg-green-700 gap-1.5"
                                >
                                    <CheckCircle className="size-4" /> Approve Payment
                                </Button>
                                <Button
                                    onClick={() => setRejectOpen(true)}
                                    variant="outline"
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                                >
                                    <XCircle className="size-4" /> Reject
                                </Button>
                            </div>
                        )}

                        {canRefund && (
                            <Button
                                onClick={() => setRefundOpen(true)}
                                variant="outline"
                                className="w-full gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                                <RefreshCw className="size-4" /> Issue Refund
                            </Button>
                        )}
                    </div>

                    {/* Payment Transaction History */}
                    {order.payment_transactions.length > 0 && (
                        <div className="bg-white border rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b bg-gray-50 font-semibold">Transaction History</div>
                            <div className="divide-y text-sm">
                                {order.payment_transactions.map((txn) => (
                                    <div key={txn.id} className="px-5 py-3 flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                                                    txn.type === 'refund' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                )}>
                                                    {txn.type}
                                                </span>
                                                <span className="font-medium uppercase">{txn.gateway}</span>
                                                <Badge className={cn('border-0 text-xs capitalize',
                                                    txn.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    txn.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                )}>
                                                    {txn.status}
                                                </Badge>
                                            </div>
                                            {txn.gateway_transaction_id && (
                                                <p className="mt-0.5 font-mono text-xs text-gray-500">{txn.gateway_transaction_id}</p>
                                            )}
                                            {txn.failure_reason && (
                                                <p className="mt-0.5 text-xs text-red-500">{txn.failure_reason}</p>
                                            )}
                                            {txn.notes && <p className="mt-0.5 text-xs text-gray-400">{txn.notes}</p>}
                                            {txn.verified_by && (
                                                <p className="mt-0.5 text-xs text-gray-400">By {txn.verified_by.name}</p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={cn('font-bold', txn.type === 'refund' ? 'text-orange-600' : 'text-gray-900')}>
                                                {txn.type === 'refund' ? '-' : ''}৳{Number(txn.amount).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-400">{new Date(txn.created_at).toLocaleDateString('en-GB')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Refund History */}
                    {order.refunds.length > 0 && (
                        <div className="bg-white border rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b bg-gray-50 font-semibold">Refunds</div>
                            <div className="divide-y text-sm">
                                {order.refunds.map((refund) => (
                                    <div key={refund.id} className="px-5 py-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-orange-600">-৳{Number(refund.amount).toFixed(2)}</span>
                                                <Badge className={cn('border-0 text-xs capitalize',
                                                    refund.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    refund.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                )}>
                                                    {refund.status}
                                                </Badge>
                                                <span className="text-xs text-gray-500 capitalize">{refund.type} refund</span>
                                            </div>
                                            <span className="text-xs text-gray-400 capitalize">{refund.refund_method.replace('_', ' ')}</span>
                                        </div>
                                        <p className="text-gray-600">{refund.reason}</p>
                                        {refund.refunded_by && (
                                            <p className="mt-0.5 text-xs text-gray-400">By {refund.refunded_by.name} · {refund.processed_at ? new Date(refund.processed_at).toLocaleDateString('en-GB') : ''}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shipping Address */}
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold mb-3">Shipping Address</h3>
                        <p className="text-sm text-gray-600">{addr.first_name} {addr.last_name}</p>
                        <p className="text-sm text-gray-600">{addr.address}, {addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                        <p className="text-sm text-gray-500">{addr.email} · {addr.phone}</p>
                    </div>
                </div>

                {/* Right — Summary */}
                <div className="space-y-4">
                    <div className="bg-white border rounded-xl p-5 space-y-3 text-sm">
                        <h3 className="font-semibold">Order Summary</h3>
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>৳{Number(order.subtotal).toFixed(2)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Shipping</span><span>৳{Number(order.shipping_cost).toFixed(2)}</span></div>
                        {Number(order.discount_amount) > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                                <span>-৳{Number(order.discount_amount).toFixed(2)}</span>
                            </div>
                        )}
                        {Number(order.wallet_used) > 0 && (
                            <div className="flex justify-between text-blue-600">
                                <span>Wallet / Points</span>
                                <span>-৳{Number(order.wallet_used).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total</span>
                            <span>৳{Number(order.total).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold mb-2">Order Status</h3>
                        <Badge className={`border-0 capitalize ${orderStatusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>{order.status}</Badge>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
                <RefundDialog order={order} onClose={() => setRefundOpen(false)} />
            </Dialog>
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <RejectDialog order={order} onClose={() => setRejectOpen(false)} />
            </Dialog>
        </AdminLayout>
    );
}
