import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ShieldCheck, Truck, Undo2 } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import ProductCard from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    children: { id: number }[];
}
interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    sale_price: string | null;
    images: string[] | null;
    stock_qty: number;
    description: string | null;
    sku: string | null;
    is_featured: boolean;
    label: string | null;
    category?: Category;
}
interface HeroProduct {
    id: number;
    name: string;
    slug: string;
    images: string[] | null;
    price: string;
    sale_price: string | null;
}

interface Props {
    featuredProducts: Product[];
    heroProducts: HeroProduct[];
    topCategories: Category[];
    isFirstTimeUser: boolean;
}

const categoryEmojis: Record<string, string> = {
    electronics: '💻',
    clothing: '👗',
    'home-garden': '🏡',
    sports: '⚽',
    beauty: '💄',
};

export default function HomePage({
    featuredProducts,
    heroProducts,
    topCategories,
    isFirstTimeUser,
}: Props) {
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
            <section className="bg-gradient-to-br from-[#1a1a2e] via-[#0f3460] to-[#1a1a2e] px-4 py-20 text-white">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 md:flex-row">
                    <div className="flex-1 text-center md:text-left">
                        <span className="mb-4 inline-block rounded-full bg-[#e94560]/20 px-3 py-1 text-sm font-semibold text-[#e94560]">
                            🎉 Free shipping on orders over ৳2000
                        </span>
                        <h1 className="mb-4 text-4xl leading-tight font-extrabold md:text-6xl">
                            Shop Smarter,
                            <br />
                            <span className="text-[#e94560]">Live Better</span>
                        </h1>
                        <p className="mb-8 max-w-lg text-lg text-white/70">
                            Discover thousands of products across electronics,
                            fashion, home, sports and more — all at unbeatable
                            prices.
                        </p>
                        <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                            <Link href="/shop">
                                <Button
                                    size="lg"
                                    className="border-0 bg-[#e94560] px-8 text-white hover:bg-[#c73652]"
                                >
                                    Shop Now{' '}
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </Link>
                            <Link href="/shop?featured=1">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/30 text-white hover:bg-white/10"
                                >
                                    View Featured
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="hidden flex-1 justify-end md:flex">
                        {heroProducts.length > 0 ? (
                            <Link
                                href={`/products/${heroProducts[activeIndex].slug}`}
                                className="group relative h-[480px] w-[480px] overflow-hidden rounded-2xl bg-white/10 shadow-[0_0_60px_rgba(233,69,96,0.15)] ring-1 ring-white/10 transition-all duration-500 hover:ring-[#e94560]/40"
                            >
                                {heroProducts.map((product, i) => (
                                    <img
                                        key={product.id}
                                        src={product.images?.[0] ?? ''}
                                        alt={product.name}
                                        className="absolute inset-0 h-full w-full object-cover transition-all duration-[2000ms] ease-in-out"
                                        style={{
                                            opacity: i === activeIndex ? 1 : 0,
                                            transform:
                                                i === activeIndex
                                                    ? 'scale(1)'
                                                    : 'scale(1.15)',
                                            filter:
                                                i === activeIndex
                                                    ? 'brightness(1)'
                                                    : 'brightness(0.5)',
                                        }}
                                    />
                                ))}
                                <div
                                    key={activeIndex}
                                    className="absolute inset-x-0 bottom-0 animate-[slideUp_0.5s_ease-out] bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5"
                                >
                                    <p className="truncate text-base font-semibold text-white drop-shadow-md">
                                        {heroProducts[activeIndex].name}
                                    </p>
                                    <p className="text-sm font-bold text-[#e94560] drop-shadow-md">
                                        ৳
                                        {Number(
                                            heroProducts[activeIndex]
                                                .sale_price ??
                                                heroProducts[activeIndex].price,
                                        ).toFixed(0)}
                                    </p>
                                </div>
                                {heroProducts.length > 1 && (
                                    <div className="absolute right-4 bottom-3 flex gap-2">
                                        {heroProducts.map((_, i) => (
                                            <span
                                                key={i}
                                                className={`block rounded-full transition-all duration-500 ${
                                                    i === activeIndex
                                                        ? 'h-2 w-6 bg-[#e94560]'
                                                        : 'size-2 bg-white/40'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <div className="flex h-[480px] w-[480px] items-center justify-center rounded-2xl bg-white/10 text-7xl">
                                🛍️
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Trust badges */}
            <section className="border-b bg-gray-50">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-6 sm:flex-row">
                    {[
                        {
                            icon: Truck,
                            title: 'Free Shipping',
                            desc: 'On orders over ৳2000',
                        },
                        {
                            icon: Undo2,
                            title: 'Easy Returns',
                            desc: '7-day return policy',
                        },
                        {
                            icon: ShieldCheck,
                            title: 'Secure Payment',
                            desc: '100% protected checkout',
                        },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-center gap-3">
                            <div className="rounded-lg bg-[#e94560]/10 p-2">
                                <Icon className="size-5 text-[#e94560]" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {title}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Shop by Category
                    </h2>
                    <Link
                        href="/shop"
                        className="flex items-center gap-1 text-sm text-[#e94560] hover:underline"
                    >
                        All categories <ArrowRight className="size-3" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                    {topCategories.map((cat) => {
                        const hasChildren = cat.children.length > 0;
                        const inner = (
                            <>
                                <span className="text-4xl transition-transform group-hover:scale-110">
                                    {categoryEmojis[cat.slug] ?? '🛍️'}
                                </span>
                                <span className="text-center text-sm font-medium text-gray-700">
                                    {cat.name}
                                </span>
                            </>
                        );
                        return hasChildren ? (
                            <Link
                                key={cat.id}
                                href={`/shop?category=${cat.slug}`}
                                className="group flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white p-6 transition-all hover:border-[#e94560] hover:shadow-sm"
                            >
                                {inner}
                            </Link>
                        ) : (
                            <div
                                key={cat.id}
                                className="flex cursor-not-allowed flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white p-6 opacity-50"
                            >
                                {inner}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Featured products */}
            <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Featured Products
                    </h2>
                    <Link
                        href="/shop?featured=1"
                        className="flex items-center gap-1 text-sm text-[#e94560] hover:underline"
                    >
                        View all <ArrowRight className="size-3" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Promo banner — first-time users only */}
            {isFirstTimeUser && (
                <section className="bg-[#0f3460] px-4 py-16 text-white">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-3 text-3xl font-bold">
                            Get 10% Off Your First Order
                        </h2>
                        <p className="mb-6 text-white/70">
                            Use code{' '}
                            <span className="font-bold text-[#e94560]">
                                WELCOME10
                            </span>{' '}
                            at checkout — up to ৳500 off
                        </p>
                        <Link href="/shop">
                            <Button
                                size="lg"
                                className="border-0 bg-[#e94560] hover:bg-[#c73652]"
                            >
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                </section>
            )}
        </ShopLayout>
    );
}
