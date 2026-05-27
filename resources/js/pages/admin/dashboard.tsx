import { Head, Link } from '@inertiajs/react';
import { DollarSign, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';

interface Stats { revenue: number; orders: number; products: number; customers: number }
interface Order { id: number; status: string; total: string; created_at: string; user: { name: string; email: string } }
interface TopProduct { product_name: string; total_sold: number; revenue: number }
interface MonthlyRevenue { month: string; revenue: number; orders: number }
interface Props { stats: Stats; recentOrders: Order[]; topProducts: TopProduct[]; monthlyRevenue: MonthlyRevenue[] }

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboardPage({ stats, recentOrders, topProducts, monthlyRevenue }: Props) {
    const maxRevenue = Math.max(...monthlyRevenue.map((m) => Number(m.revenue)), 1);

    const statCards = [
        { label: 'Total Revenue', value: `৳${Number(stats.revenue).toLocaleString('en', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
        { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
        { label: 'Active Products', value: stats.products, icon: Package, color: 'bg-purple-100 text-purple-600' },
        { label: 'Customers', value: stats.customers, icon: Users, color: 'bg-amber-100 text-amber-600' },
    ];

    return (
        <AdminLayout>
            <Head title="Dashboard — Admin" />

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl border p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500">{label}</span>
                            <div className={`p-2 rounded-lg ${color}`}><Icon className="size-4" /></div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border p-5">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="size-4 text-[#e94560]" /> Monthly Revenue</h2>
                    {monthlyRevenue.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
                    ) : (
                        <div className="flex items-end gap-2 h-40">
                            {monthlyRevenue.map((m) => (
                                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs text-gray-500">৳{Math.round(Number(m.revenue))}</span>
                                    <div className="w-full bg-[#1a1a2e] rounded-t-sm transition-all hover:bg-[#e94560]" style={{ height: `${(Number(m.revenue) / maxRevenue) * 120}px`, minHeight: '4px' }} title={`৳${Number(m.revenue).toFixed(2)}`} />
                                    <span className="text-xs text-gray-400 truncate w-full text-center">{m.month.slice(5)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top products */}
                <div className="bg-white rounded-xl border p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Top Products</h2>
                    {topProducts.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No sales yet</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((p, i) => (
                                <div key={p.product_name} className="flex items-center gap-3">
                                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{p.product_name}</p>
                                        <p className="text-xs text-gray-400">{p.total_sold} sold</p>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">৳{Number(p.revenue).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent orders */}
            <div className="mt-6 bg-white rounded-xl border">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                    <Link href="/admin/orders" className="text-sm text-[#e94560] hover:underline">View all →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left">Order</th>
                                <th className="px-5 py-3 text-left">Customer</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-right">Total</th>
                                <th className="px-5 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-900">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3"><Link href={`/admin/orders/${order.id}`} className="text-[#e94560] hover:underline font-medium">#{order.id}</Link></td>
                                    <td className="px-5 py-3"><div className="font-medium">{order.user.name}</div><div className="text-xs text-gray-400">{order.user.email}</div></td>
                                    <td className="px-5 py-3"><Badge className={`border-0 capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>{order.status}</Badge></td>
                                    <td className="px-5 py-3 text-right font-bold">৳{Number(order.total).toFixed(2)}</td>
                                    <td className="px-5 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No orders yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
