import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, ShoppingBag, MapPin, Gift, HeadphonesIcon,
    Activity, Star, ChevronRight,
} from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', href: '/account', icon: LayoutDashboard, exact: true },
    { label: 'My Orders', href: '/orders', icon: ShoppingBag },
    { label: 'Addresses', href: '/addresses', icon: MapPin },
    { label: 'Rewards & Wallet', href: '/account/rewards', icon: Gift },
    { label: 'Support Tickets', href: '/account/support', icon: HeadphonesIcon },
    { label: 'Activity Log', href: '/account/activity', icon: Activity },
];

function NavLink({ item, currentPath }: { item: typeof navItems[0]; currentPath: string }) {
    const isActive = item.exact ? currentPath === item.href : currentPath.startsWith(item.href);
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                    ? 'bg-[#e94560]/10 font-medium text-[#e94560]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
        >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {isActive && <ChevronRight className="size-3.5 text-[#e94560]" />}
        </Link>
    );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    return (
        <ShopLayout>
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
                <div className="flex gap-8 lg:flex-row flex-col">
                    {/* Sidebar */}
                    <aside className="lg:w-56 shrink-0">
                        <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-3">
                            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                My Account
                            </p>
                            <nav className="space-y-0.5">
                                {navItems.map((item) => (
                                    <NavLink key={item.href} item={item} currentPath={currentPath} />
                                ))}
                            </nav>
                            <div className="mt-3 border-t pt-3">
                                <Link
                                    href="/settings/profile"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                >
                                    <Star className="size-4 shrink-0" />
                                    Profile Settings
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="min-w-0 flex-1">{children}</main>
                </div>
            </div>
        </ShopLayout>
    );
}
