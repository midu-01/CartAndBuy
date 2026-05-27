import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OrderItem { id: number; product_name: string; quantity: number; unit_price: string; total_price: string }
interface ShippingAddress { first_name: string; last_name: string; address: string; city: string; state: string; zip: string; country: string; email: string; phone: string }
interface Order { id: number; status: string; subtotal: string; shipping_cost: string; discount_amount: string; total: string; payment_method: string; payment_status: string; coupon_code: string | null; created_at: string; shipping_address: ShippingAddress; items: OrderItem[]; user: { name: string; email: string } }
interface Props { order: Order }

const statusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetailPage({ order }: Props) {
    const [status, setStatus] = useState(order.status);

    function updateStatus() {
        router.patch(`/admin/orders/${order.id}/status`, { status }, { preserveScroll: true });
    }

    const addr = order.shipping_address;

    return (
        <AdminLayout>
            <Head title={`Order #${order.id} — Admin`} />
            <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6"><ArrowLeft className="size-4" /> Back to Orders</Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()} · Customer: <span className="font-medium">{order.user.name}</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none bg-white text-gray-900">
                        {statuses.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <Button onClick={updateStatus} className="bg-[#1a1a2e] hover:bg-[#0f3460] border-0 text-white" disabled={status === order.status}>Update Status</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white border rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b bg-gray-50 font-semibold">Items</div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-5 py-2 text-left">Product</th>
                                    <th className="px-5 py-2 text-center">Qty</th>
                                    <th className="px-5 py-2 text-right">Unit Price</th>
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

                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold mb-3">Shipping Address</h3>
                        <p className="text-sm text-gray-600">{addr.first_name} {addr.last_name}</p>
                        <p className="text-sm text-gray-600">{addr.address}, {addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                        <p className="text-sm text-gray-500">{addr.email} · {addr.phone}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white border rounded-xl p-5 space-y-3 text-sm">
                        <h3 className="font-semibold">Summary</h3>
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>৳{Number(order.subtotal).toFixed(2)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Shipping</span><span>৳{Number(order.shipping_cost).toFixed(2)}</span></div>
                        {Number(order.discount_amount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{Number(order.discount_amount).toFixed(2)}</span></div>}
                        <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>৳{Number(order.total).toFixed(2)}</span></div>
                        <div className="border-t pt-2 space-y-1 text-gray-500">
                            <div className="flex justify-between"><span>Payment</span><span className="uppercase">{order.payment_method}</span></div>
                            <div className="flex justify-between"><span>Status</span><Badge className={`border-0 capitalize text-xs ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.payment_status}</Badge></div>
                            {order.coupon_code && <div className="flex justify-between"><span>Coupon</span><span className="font-mono">{order.coupon_code}</span></div>}
                        </div>
                    </div>
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold mb-2">Order Status</h3>
                        <Badge className={`border-0 capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>{order.status}</Badge>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
