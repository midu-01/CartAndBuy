import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-[#1a1a2e] text-white/70 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-extrabold text-white text-lg mb-3">
                            Cart<span className="text-[#e94560]">And</span>Buy
                        </h3>
                        <p className="text-sm leading-relaxed">
                            Your one-stop shop for everything you need, delivered fast.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                            <li><Link href="/shop?featured=1" className="hover:text-white transition-colors">Featured</Link></li>
                            <li><Link href="/shop?sort=price_asc" className="hover:text-white transition-colors">Best Prices</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Account</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                            <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                            <li><Link href="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
                            <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">Returns</span></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/40">
                    © {new Date().getFullYear()} CartAndBuy. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
