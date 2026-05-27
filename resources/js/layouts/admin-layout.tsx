import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    FolderOpen,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Package,
    ShoppingCart,
    Tag,
    Users,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/coupons', label: 'Coupons', icon: Tag },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage<SharedData & { toast?: { type: string; message: string } }>();
    const { toast: flashToast } = props;

    useEffect(() => {
        if (flashToast) {
            const fn = flashToast.type === 'error' ? toast.error
                : flashToast.type === 'info' ? toast.info
                : toast.success;
            fn(flashToast.message);
        }
    }, [flashToast]);

    return (
        <div className="min-h-screen flex bg-gray-100 text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1a1a2e] text-white flex flex-col fixed inset-y-0 z-10">
                <div className="px-6 py-5 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2">
                        <BarChart3 className="size-6 text-[#e94560]" />
                        <span className="font-bold text-lg tracking-tight">CartAndBuy</span>
                    </Link>
                    <span className="text-xs text-white/40 mt-0.5 block">Admin Panel</span>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                url.startsWith(href)
                                    ? 'bg-[#e94560] text-white'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                            )}
                        >
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className="px-3 py-4 border-t border-white/10">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <LogOut className="size-4" />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-800">
                        {navItems.find((n) => url.startsWith(n.href))?.label ?? 'Admin'}
                    </h1>
                    <Link href="/" className="text-sm text-[#e94560] hover:underline">
                        ← View Store
                    </Link>
                </header>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
