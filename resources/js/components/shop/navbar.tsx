import { Link, router, usePage } from '@inertiajs/react';
import { CheckCircle, Heart, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

export default function Navbar() {
    const { auth, cartCount, wishlistProductIds, avatarUrl, initials } = usePage<SharedData & {
        cartCount: number;
        wishlistProductIds: number[];
        avatarUrl?: string | null;
        initials?: string;
    }>().props;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [search, setSearch] = useState('');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (search.trim()) {
            router.get('/shop', { search: search.trim() });
        }
    }

    return (
        <header className="bg-[#1a1a2e] text-white sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 font-extrabold text-xl tracking-tight">
                        Cart<span className="text-[#e94560]">And</span>Buy
                    </Link>

                    {/* Search — desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products…"
                                className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                                <Search className="size-4" />
                            </button>
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {auth.user && (
                            <Link href="/wishlist" className="relative p-2 hover:text-[#e94560] transition-colors hidden sm:block">
                                <Heart className="size-5" />
                                {wishlistProductIds?.length > 0 && (
                                    <Badge className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px] bg-[#e94560] border-0">
                                        {wishlistProductIds.length}
                                    </Badge>
                                )}
                            </Link>
                        )}

                        <Link href="/cart" className="relative p-2 hover:text-[#e94560] transition-colors">
                            <ShoppingCart className="size-5" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px] bg-[#e94560] border-0">
                                    {cartCount}
                                </Badge>
                            )}
                        </Link>

                        {auth.user ? (
                            <div className="relative group hidden sm:block">
                                <button className="flex items-center gap-1.5 p-1.5 hover:text-[#e94560] transition-colors">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={auth.user.name} className="size-8 rounded-full object-cover ring-2 ring-white/20" />
                                    ) : (
                                        <div className="size-8 rounded-full bg-[#e94560]/20 flex items-center justify-center text-xs font-bold text-white">
                                            {initials ?? <User className="size-4" />}
                                        </div>
                                    )}
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <div className="px-4 py-3 border-b">
                                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900 truncate">
                                            {auth.user.name}
                                            {auth.user.email_verified_at && (
                                                <CheckCircle className="size-3.5 shrink-0 text-green-500" />
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">{auth.user.email}</div>
                                    </div>
                                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                        <User className="size-4 text-gray-400" /> My Profile
                                    </Link>
                                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                        <ShoppingCart className="size-4 text-gray-400" /> My Orders
                                    </Link>
                                    <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                        <Heart className="size-4 text-gray-400" /> Wishlist
                                    </Link>
                                    {auth.user.role === 'admin' && (
                                        <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-[#e94560]">Admin Panel</Link>
                                    )}
                                    <Link href="/logout" method="post" as="button" className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-t text-red-500">
                                        Logout
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-[#e94560] hover:bg-[#c73652] border-0">Sign Up</Button>
                                </Link>
                            </div>
                        )}

                        <button className="sm:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={cn('sm:hidden pb-4 space-y-3 border-t border-white/10 pt-3', !mobileOpen && 'hidden')}>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search…"
                            className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        />
                        <Button type="submit" size="sm" className="bg-[#e94560] border-0">Go</Button>
                    </form>
                    {auth.user ? (
                        <>
                            <Link href="/profile" className="block py-1 text-sm" onClick={() => setMobileOpen(false)}>My Profile</Link>
                            <Link href="/orders" className="block py-1 text-sm" onClick={() => setMobileOpen(false)}>My Orders</Link>
                            <Link href="/wishlist" className="block py-1 text-sm" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                            <Link href="/logout" method="post" as="button" className="block py-1 text-sm text-[#e94560]">Logout</Link>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full">Login</Button></Link>
                            <Link href="/register" className="flex-1"><Button size="sm" className="w-full bg-[#e94560] border-0">Sign Up</Button></Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
