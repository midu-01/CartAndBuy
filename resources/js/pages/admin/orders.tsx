import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/shop/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Order { id: number; status: string; total: string; payment_status: string; created_at: string; user: { name: string; email: string } }
interface Props { orders: { data: Order[]; links: { url: string | null; label: string; active: boolean }[] }; filters: { status?: string; search?: string } }

const statuses = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

export default function AdminOrdersPage({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(params: Record<string, string | undefined>) {
        router.get('/admin/orders', { ...filters, ...params }, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Orders — Admin" />

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Status tabs */}
                <div className="flex gap-1 flex-wrap">
                    {statuses.map((s) => (
                        <button key={s} onClick={() => applyFilter({ status: s || undefined })}
                            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize', (filters.status ?? '') === s ? 'bg-[#1a1a2e] text-white' : 'bg-white border text-gray-600 hover:bg-gray-50')}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); applyFilter({ search: search || undefined }); }} className="flex gap-2 ml-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer…" className="border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none w-52" />
                    </div>
                    <Button type="submit" variant="outline" size="sm">Search</Button>
                </form>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left">Order</th>
                                <th className="px-5 py-3 text-left">Customer</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Payment</th>
                                <th className="px-5 py-3 text-right">Total</th>
                                <th className="px-5 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-900">
                            {orders.data.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3"><Link href={`/admin/orders/${order.id}`} className="text-[#e94560] hover:underline font-medium">#{order.id}</Link></td>
                                    <td className="px-5 py-3"><div className="font-medium">{order.user.name}</div><div className="text-xs text-gray-400">{order.user.email}</div></td>
                                    <td className="px-5 py-3"><Badge className={`border-0 capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>{order.status}</Badge></td>
                                    <td className="px-5 py-3"><Badge className={`border-0 capitalize ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.payment_status}</Badge></td>
                                    <td className="px-5 py-3 text-right font-bold text-gray-900">৳{Number(order.total).toFixed(2)}</td>
                                    <td className="px-5 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {orders.data.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No orders found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={orders.links} />
        </AdminLayout>
    );
}
