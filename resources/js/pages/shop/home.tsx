import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ShieldCheck, Truck, Undo2 } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import ProductCard from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';

interface Category { id: number; name: string; slug: string; image: string | null }
interface Product { id: number; name: string; slug: string; price: string; sale_price: string | null; images: string[] | null; is_featured: boolean; category?: Category }

interface Props { featuredProducts: Product[]; topCategories: Category[] }

const categoryEmojis: Record<string, string> = {
    electronics: '💻', clothing: '👗', 'home-garden': '🏡',
    sports: '⚽', beauty: '💄',
};

export default function HomePage({ featuredProducts, topCategories }: Props) {
    return (
        <ShopLayout>
            <Head title="Home — CartAndBuy" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-[#1a1a2e] via-[#0f3460] to-[#1a1a2e] text-white py-20 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 text-center md:text-left">
                        <span className="inline-block bg-[#e94560]/20 text-[#e94560] text-sm font-semibold px-3 py-1 rounded-full mb-4">
                            🎉 Free shipping on orders over $100
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
                    <div className="flex-1 hidden md:flex justify-center">
                        <div className="grid grid-cols-2 gap-4 w-80">
                            {['📱','💻','👟','🎧'].map((emoji, i) => (
                                <div key={i} className="bg-white/10 rounded-2xl p-8 flex items-center justify-center text-5xl aspect-square hover:bg-white/15 transition-colors cursor-default">
                                    {emoji}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust badges */}
            <section className="bg-gray-50 border-b">
                <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
                        { icon: Undo2, title: 'Easy Returns', desc: '30-day return policy' },
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
                    {topCategories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-100 rounded-xl hover:border-[#e94560] hover:shadow-sm transition-all group"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform">
                                {categoryEmojis[cat.slug] ?? '🛍️'}
                            </span>
                            <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
                        </Link>
                    ))}
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

            {/* Promo banner */}
            <section className="bg-[#0f3460] text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-3">Get 10% Off Your First Order</h2>
                    <p className="text-white/70 mb-6">Use code <span className="font-bold text-[#e94560]">WELCOME10</span> at checkout</p>
                    <Link href="/shop">
                        <Button size="lg" className="bg-[#e94560] hover:bg-[#c73652] border-0">Start Shopping</Button>
                    </Link>
                </div>
            </section>
        </ShopLayout>
    );
}
