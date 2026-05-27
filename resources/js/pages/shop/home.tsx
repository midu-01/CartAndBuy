import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ShieldCheck, Truck, Undo2 } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import ProductCard from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';

interface Category { id: number; name: string; slug: string; image: string | null; children: { id: number }[] }
interface Product { id: number; name: string; slug: string; price: string; sale_price: string | null; images: string[] | null; is_featured: boolean; category?: Category }
interface HeroProduct { id: number; name: string; slug: string; images: string[] | null; price: string; sale_price: string | null }

interface Props { featuredProducts: Product[]; heroProducts: HeroProduct[]; topCategories: Category[]; isFirstTimeUser: boolean }

const categoryEmojis: Record<string, string> = {
    electronics: '💻', clothing: '👗', 'home-garden': '🏡',
    sports: '⚽', beauty: '💄',
};

export default function HomePage({ featuredProducts, heroProducts, topCategories, isFirstTimeUser }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (heroProducts.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % heroProducts.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [heroProducts.length]);

    return (
        <ShopLayout>
            <Head title="Home — CartAndBuy" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#1a1a2e] via-[#0f3460] to-[#1a1a2e] text-white py-20 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 text-center md:text-left">
                        <span className="inline-block bg-[#e94560]/20 text-[#e94560] text-sm font-semibold px-3 py-1 rounded-full mb-4">
                            🎉 Free shipping on orders over ৳2000
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
                            Shop Smarter,<br />
                            <span className="text-[#e94560]">Live Better</span>
                        </h1>
                        <p className="text-white/70 text-lg mb-8 max-w-lg">
                            Discover thousands of products across electronics, fashion, home, sports and more — all at unbeatable prices.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <Link href="/shop">
                                <Button size="lg" className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white px-8">
                                    Shop Now <ArrowRight className="size-4 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/shop?featured=1">
                                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                    View Featured
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 hidden md:flex justify-end">
                        {heroProducts.length > 0 ? (
                            <Link
                                href={`/products/${heroProducts[activeIndex].slug}`}
                                className="group relative w-[480px] h-[480px] rounded-2xl overflow-hidden bg-white/10 shadow-[0_0_60px_rgba(233,69,96,0.15)] ring-1 ring-white/10 hover:ring-[#e94560]/40 transition-all duration-500"
                            >
                                {heroProducts.map((product, i) => (
                                    <img
                                        key={product.id}
                                        src={product.images?.[0] ?? ''}
                                        alt={product.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out"
                                        style={{
                                            opacity: i === activeIndex ? 1 : 0,
                                            transform: i === activeIndex ? 'scale(1)' : 'scale(1.15)',
                                            filter: i === activeIndex ? 'brightness(1)' : 'brightness(0.5)',
                                        }}
                                    />
                                ))}
                                <div
                                    key={activeIndex}
                                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 animate-[slideUp_0.5s_ease-out]"
                                >
                                    <p className="text-base font-semibold text-white truncate drop-shadow-md">{heroProducts[activeIndex].name}</p>
                                    <p className="text-sm text-[#e94560] font-bold drop-shadow-md">৳{Number(heroProducts[activeIndex].sale_price ?? heroProducts[activeIndex].price).toFixed(0)}</p>
                                </div>
                                {heroProducts.length > 1 && (
                                    <div className="absolute bottom-3 right-4 flex gap-2">
                                        {heroProducts.map((_, i) => (
                                            <span
                                                key={i}
                                                className={`block rounded-full transition-all duration-500 ${
                                                    i === activeIndex ? 'w-6 h-2 bg-[#e94560]' : 'size-2 bg-white/40'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <div className="w-[480px] h-[480px] rounded-2xl bg-white/10 flex items-center justify-center text-7xl">
                                🛍️
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Trust badges */}
            <section className="bg-gray-50 border-b">
                <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between gap-4">
                    {[
                        { icon: Truck, title: 'Free Shipping', desc: 'On orders over ৳2000' },
                        { icon: Undo2, title: 'Easy Returns', desc: '7-day return policy' },
                        { icon: ShieldCheck, title: 'Secure Payment', desc: '100% protected checkout' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-center gap-3">
                            <div className="p-2 bg-[#e94560]/10 rounded-lg">
                                <Icon className="size-5 text-[#e94560]" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm text-gray-900">{title}</div>
                                <div className="text-xs text-gray-500">{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                    <Link href="/shop" className="text-sm text-[#e94560] hover:underline flex items-center gap-1">
                        All categories <ArrowRight className="size-3" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {topCategories.map((cat) => {
                        const hasChildren = cat.children.length > 0;
                        const inner = (
                            <>
                                <span className="text-4xl group-hover:scale-110 transition-transform">
                                    {categoryEmojis[cat.slug] ?? '🛍️'}
                                </span>
                                <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
                            </>
                        );
                        return hasChildren ? (
                            <Link
                                key={cat.id}
                                href={`/shop?category=${cat.slug}`}
                                className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-100 rounded-xl hover:border-[#e94560] hover:shadow-sm transition-all group"
                            >
                                {inner}
                            </Link>
                        ) : (
                            <div
                                key={cat.id}
                                className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-100 rounded-xl opacity-50 cursor-not-allowed"
                            >
                                {inner}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Featured products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                    <Link href="/shop?featured=1" className="text-sm text-[#e94560] hover:underline flex items-center gap-1">
                        View all <ArrowRight className="size-3" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Promo banner — first-time users only */}
            {isFirstTimeUser && (
                <section className="bg-[#0f3460] text-white py-16 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-3">Get 10% Off Your First Order</h2>
                        <p className="text-white/70 mb-6">Use code <span className="font-bold text-[#e94560]">WELCOME10</span> at checkout — up to ৳500 off</p>
                        <Link href="/shop">
                            <Button size="lg" className="bg-[#e94560] hover:bg-[#c73652] border-0">Start Shopping</Button>
                        </Link>
                    </div>
                </section>
            )}
        </ShopLayout>
    );
}
