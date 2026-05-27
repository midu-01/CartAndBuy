import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, XCircle } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

interface OrderItem { id: number; product_name: string; quantity: number; unit_price: string; total_price: string; product: { images: string[] | null } | null }
interface ShippingAddress { first_name: string; last_name: string; address: string; city: string; state: string; zip: string; country: string; email: string; phone: string }
interface Order { id: number; status: string; subtotal: string; shipping_cost: string; discount_amount: string; total: string; payment_method: string; payment_status: string; coupon_code: string | null; created_at: string; shipping_address: ShippingAddress; items: OrderItem[] }
interface Props { order: Order }

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetailPage({ order }: Props) {
    const addr = order.shipping_address;
    const [cancelling, setCancelling] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    function handleCancel() {
        setCancelling(true);
        router.patch(`/orders/${order.id}/cancel`, {}, {
            onFinish: () => {
                setCancelling(false);
                setDialogOpen(false);
            },
        });
    }

    return (
        <ShopLayout>
            <Head title={`Order #${order.id} — CartAndBuy`} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
                    <ArrowLeft className="size-4" /> Back to Orders
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={`border-0 capitalize text-sm ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>{order.status}</Badge>
                        {order.status === 'pending' && (
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button id="cancel-order-trigger" variant="destructive" size="sm" className="gap-1.5">
                                        <XCircle className="size-4" />
                                        Cancel Order
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Cancel Order #{order.id}?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. Your order will be cancelled and the items will be restocked.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={cancelling}>
                                                Keep Order
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            id="confirm-cancel-order"
                                            variant="destructive"
                                            onClick={handleCancel}
                                            disabled={cancelling}
                                        >
                                            {cancelling ? 'Cancelling…' : 'Yes, Cancel Order'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Items */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b bg-gray-50">
                                <h2 className="font-semibold text-gray-900">Items Ordered</h2>
                            </div>
                            <div className="divide-y">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4">
                                        <img src={item.product?.images?.[0] ?? 'https://placehold.co/64x64/e2e8f0/64748b?text=?'} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.product_name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-gray-900">৳{Number(item.total_price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="bg-white border border-gray-100 rounded-xl p-5">
                            <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
                            <p className="text-sm text-gray-600">{addr.first_name} {addr.last_name}</p>
                            <p className="text-sm text-gray-600">{addr.address}</p>
                            <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                            <p className="text-sm text-gray-600">{addr.country}</p>
                            <p className="text-sm text-gray-500 mt-1">{addr.email} · {addr.phone}</p>
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-3 text-sm">
                            <h2 className="font-semibold text-gray-900">Order Summary</h2>
                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>৳{Number(order.subtotal).toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{Number(order.shipping_cost) === 0 ? 'Free' : `৳${Number(order.shipping_cost).toFixed(2)}`}</span></div>
                            {Number(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-green-600"><span>Discount {order.coupon_code && `(${order.coupon_code})`}</span><span>-৳{Number(order.discount_amount).toFixed(2)}</span></div>
                            )}
                            <div className="flex justify-between font-bold text-gray-900 border-t pt-3"><span>Total</span><span>৳{Number(order.total).toFixed(2)}</span></div>
                            <div className="border-t pt-3 space-y-1 text-gray-500">
                                <div className="flex justify-between"><span>Payment</span><span className="capitalize">{order.payment_method.toUpperCase()}</span></div>
                                <div className="flex justify-between"><span>Status</span><Badge className={`border-0 text-xs capitalize ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.payment_status}</Badge></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}

