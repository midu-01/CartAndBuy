import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Mail, Phone, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#1a1a2e] text-white/70 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap justify-between gap-8">
                    <div className="max-w-xs">
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
                            <li><Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/40">
                        © {new Date().getFullYear()} CartAndBuy. All rights reserved.
                    </p>
                    <div className="flex items-center gap-3">
                        <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-[#e94560] hover:text-white transition-all duration-300" title="Facebook">
                            <Facebook className="size-4" />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-[#e94560] hover:text-white transition-all duration-300" title="Instagram">
                            <Instagram className="size-4" />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-[#e94560] hover:text-white transition-all duration-300" title="Twitter / X">
                            <Twitter className="size-4" />
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-[#e94560] hover:text-white transition-all duration-300" title="YouTube">
                            <Youtube className="size-4" />
                        </a>
                        <span className="w-px h-5 bg-white/10 mx-1" />
                        <a href="tel:#" className="p-2 rounded-lg bg-white/5 hover:bg-[#e94560] hover:text-white transition-all duration-300" title="Phone">
                            <Phone className="size-4" />
                        </a>
                        <a href="mailto:#" className="p-2 rounded-lg bg-white/5 hover:bg-[#e94560] hover:text-white transition-all duration-300" title="Email">
                            <Mail className="size-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

