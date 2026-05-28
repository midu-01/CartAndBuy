import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, Star, Wallet, Package, HeadphonesIcon, Eye, ArrowRight } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import { Badge } from '@/components/ui/badge';

interface Stats {
    points_balance: number;
    wallet_balance: string;
    total_orders: number;
    active_orders: number;
    open_tickets: number;
}
interface Order {
    id: number;
    status: string;
    total: string;
    created_at: string;
    items: { id: number }[];
}
interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
}
interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    sale_price: string | null;
    images: string[] | null;
}
interface Props {
    stats: Stats;
    recentOrders: Order[];
    recentTickets: Ticket[];
    recentlyViewed: Product[];
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const ticketStatusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-gray-100 text-gray-600',
    closed: 'bg-gray-100 text-gray-500',
};

export default function CustomerDashboard({ stats, recentOrders, recentTickets, recentlyViewed }: Props) {
    return (
        <CustomerLayout>
            <Head title="My Account — CartAndBuy" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                    <p className="mt-1 text-sm text-gray-500">Welcome back! Here's an overview of your account.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Loyalty Points', value: stats.points_balance.toLocaleString(), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', href: '/account/rewards' },
                        { label: 'Wallet Balance', value: `৳${Number(stats.wallet_balance).toFixed(2)}`, icon: Wallet, color: 'text-green-600', bg: 'bg-green-50', href: '/account/rewards' },
                        { label: 'Total Orders', value: stats.total_orders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', href: '/orders' },
                        { label: 'Active Orders', value: stats.active_orders, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', href: '/orders' },
                    ].map((card) => (
                        <Link key={card.label} href={card.href} className="rounded-xl border border-gray-100 bg-white p-4 hover:border-[#e94560]/30 hover:shadow-sm transition-all">
                            <div className={`mb-3 inline-flex rounded-lg p-2 ${card.bg}`}>
                                <card.icon className={`size-5 ${card.color}`} />
                            </div>
                            <p className="text-xl font-bold text-gray-900">{card.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Orders */}
                    <div className="rounded-xl border border-gray-100 bg-white">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                            <Link href="/orders" className="text-xs text-[#e94560] hover:underline flex items-center gap-1">
                                View all <ArrowRight className="size-3" />
                            </Link>
                        </div>
                        {recentOrders.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-gray-400">No orders yet.</div>
                        ) : (
                            <div className="divide-y">
                                {recentOrders.map((order) => (
                                    <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                                            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">৳{Number(order.total).toFixed(2)}</span>
                                            <Badge className={`border-0 text-xs capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>{order.status}</Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Support Tickets */}
                    <div className="rounded-xl border border-gray-100 bg-white">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h2 className="font-semibold text-gray-900">Support Tickets</h2>
                            <Link href="/account/support" className="text-xs text-[#e94560] hover:underline flex items-center gap-1">
                                View all <ArrowRight className="size-3" />
                            </Link>
                        </div>
                        {recentTickets.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <HeadphonesIcon className="mx-auto mb-2 size-8 text-gray-200" />
                                <p className="text-sm text-gray-400">No support tickets yet.</p>
                                <Link href="/account/support" className="mt-2 inline-block text-xs text-[#e94560] hover:underline">Open a ticket →</Link>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {recentTickets.map((ticket) => (
                                    <Link key={ticket.id} href={`/account/support/${ticket.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">{ticket.subject}</p>
                                            <p className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Badge className={`ml-3 shrink-0 border-0 text-xs capitalize ${ticketStatusColors[ticket.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                    <div className="rounded-xl border border-gray-100 bg-white">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Eye className="size-4 text-gray-400" />
                                Recently Viewed
                            </h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4 p-5 sm:grid-cols-6">
                            {recentlyViewed.map((product) => (
                                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                                    <img
                                        src={product.images?.[0] ?? 'https://placehold.co/80x80/e2e8f0/64748b?text=?'}
                                        alt={product.name}
                                        className="mb-2 h-20 w-full rounded-lg object-cover bg-gray-50 group-hover:opacity-90 transition-opacity"
                                    />
                                    <p className="line-clamp-2 text-xs text-gray-700">{product.name}</p>
                                    <p className="mt-0.5 text-xs font-semibold text-[#e94560]">
                                        ৳{Number(product.sale_price ?? product.price).toFixed(0)}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
