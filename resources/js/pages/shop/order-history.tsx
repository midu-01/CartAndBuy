import { Head, Link } from '@inertiajs/react';
import { Package } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import Pagination from '@/components/shop/pagination';
import { Badge } from '@/components/ui/badge';

interface Order { id: number; status: string; total: string; created_at: string; items: { id: number }[] }
interface Props { orders: { data: Order[]; links: { url: string | null; label: string; active: boolean }[] } }

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function OrderHistoryPage({ orders }: Props) {
    return (
        <ShopLayout>
            <Head title="My Orders — CartAndBuy" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

                {orders.data.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="size-14 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500">You haven't placed any orders yet.</p>
                        <Link href="/shop" className="mt-4 inline-block text-sm text-[#e94560] hover:underline">Start shopping →</Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {orders.data.map((order) => (
                                <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-[#e94560] hover:shadow-sm transition-all">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">Order #{order.id}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-gray-900">৳{Number(order.total).toFixed(2)}</span>
                                            <Badge className={`border-0 capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>{order.status}</Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Pagination links={orders.links} />
                    </>
                )}
            </div>
        </ShopLayout>
    );
}
