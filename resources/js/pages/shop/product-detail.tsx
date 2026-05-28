import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronDown,
    Heart,
    Minus,
    Play,
    Plus,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';
import ProductCard from '@/components/shop/product-card';
import StarRating from '@/components/shop/star-rating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    user: { name: string };
}
interface Variant {
    id: number;
    sku: string | null;
    attributes: Record<string, string>;
    price_modifier: string;
    stock_qty: number;
    images: string[] | null;
    is_active: boolean;
}
interface SizeChartRow {
    size: string;
    [key: string]: string;
}
interface Faq {
    question: string;
    answer: string;
}
interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    sale_price: string | null;
    stock_qty: number;
    images: string[] | null;
    is_featured: boolean;
    sku: string | null;
    label: string | null;
    tags: string[] | null;
    video_url: string | null;
    size_chart: SizeChartRow[] | null;
    faqs: Faq[] | null;
    category?: { name: string; slug: string };
    brand?: { name: string; slug: string } | null;
    reviews: Review[];
    variants: Variant[];
}

interface Props {
    product: Product;
    relatedProducts: Product[];
    recentlyViewed: Product[];
    averageRating: number;
    userWishlisted: boolean;
    userReviewed: boolean;
}

const labelStyles: Record<string, { text: string; className: string }> = {
    new_arrival: {
        text: '🆕 New Arrival',
        className: 'bg-emerald-100 text-emerald-700',
    },
    best_seller: {
        text: '🏆 Best Seller',
        className: 'bg-amber-100 text-amber-700',
    },
    trending: {
        text: '🔥 Trending',
        className: 'bg-purple-100 text-purple-700',
    },
};

type TabKey = 'description' | 'reviews' | 'size_chart' | 'faq';

export default function ProductDetailPage({
    product,
    relatedProducts,
    recentlyViewed,
    averageRating,
    userWishlisted,
    userReviewed,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const [qty, setQty] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState<TabKey>('description');
    const [wishlisted, setWishlisted] = useState(userWishlisted);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
        null,
    );
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const price = Number(product.price);
    const salePrice = product.sale_price ? Number(product.sale_price) : null;
    const effectivePrice = selectedVariant
        ? (salePrice ?? price) + Number(selectedVariant.price_modifier)
        : (salePrice ?? price);
    const images = (selectedVariant?.images?.length
        ? selectedVariant.images
        : product.images
    )?.length
        ? (selectedVariant?.images?.length
              ? selectedVariant.images
              : product.images)!
        : ['https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'];
    const currentStock = selectedVariant
        ? selectedVariant.stock_qty
        : product.stock_qty;
    const currentSku = selectedVariant?.sku ?? product.sku;
    const label = product.label ? labelStyles[product.label] : null;

    const reviewForm = useForm({ rating: 5, comment: '' });
    const stockNotifyForm = useForm({ email: auth.user?.email ?? '' });

    // Extract unique attribute keys from variants
    const variantAttributeKeys =
        product.variants.length > 0
            ? [
                  ...new Set(
                      product.variants.flatMap((v) =>
                          Object.keys(v.attributes),
                      ),
                  ),
              ]
            : [];

    function addToCart() {
        router.post(
            '/cart',
            {
                product_id: product.id,
                quantity: qty,
                ...(selectedVariant
                    ? { product_variant_id: selectedVariant.id }
                    : {}),
            },
            { preserveScroll: true },
        );
    }

    function toggleWishlist() {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        setWishlisted(!wishlisted);
        router.post(`/wishlist/${product.id}`, {}, { preserveScroll: true });
    }

    function submitReview(e: React.FormEvent) {
        e.preventDefault();
        reviewForm.post(`/products/${product.slug}/reviews`, {
            preserveScroll: true,
            onSuccess: () => reviewForm.reset(),
        });
    }

    function submitStockNotification(e: React.FormEvent) {
        e.preventDefault();
        stockNotifyForm.post(`/products/${product.id}/stock-notifications`, {
            preserveScroll: true,
        });
    }

    function selectVariant(variant: Variant) {
        setSelectedVariant(selectedVariant?.id === variant.id ? null : variant);
        setActiveImage(0);
        setQty(1);
    }

    function getVideoEmbedUrl(url: string): string | null {
        const ytMatch = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
        );
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        const vmMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
        return null;
    }

    const availableTabs: { key: TabKey; label: string }[] = [
        { key: 'description', label: 'Description' },
        { key: 'reviews', label: `Reviews (${product.reviews.length})` },
        ...(product.size_chart?.length
            ? [{ key: 'size_chart' as TabKey, label: 'Size Chart' }]
            : []),
        ...(product.faqs?.length
            ? [{ key: 'faq' as TabKey, label: 'FAQ' }]
            : []),
    ];

    return (
        <ShopLayout>
            <Head title={`${product.name} — CartAndBuy`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <a href="/" className="hover:text-[#e94560]">
                        Home
                    </a>
                    <span>/</span>
                    <a href="/shop" className="hover:text-[#e94560]">
                        Shop
                    </a>
                    {product.category && (
                        <>
                            <span>/</span>
                            <a
                                href={`/shop?category=${product.category.slug}`}
                                className="hover:text-[#e94560]"
                            >
                                {product.category.name}
                            </a>
                        </>
                    )}
                    <span>/</span>
                    <span className="max-w-xs truncate text-gray-900">
                        {product.name}
                    </span>
                </nav>

                <div className="mb-16 grid grid-cols-1 gap-10 md:grid-cols-2">
                    {/* Gallery */}
                    <div className="space-y-3">
                        <div className="aspect-square overflow-hidden rounded-2xl border bg-gray-50">
                            <img
                                src={images[activeImage]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={cn(
                                            'h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors',
                                            i === activeImage
                                                ? 'border-[#e94560]'
                                                : 'border-transparent',
                                        )}
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Video */}
                        {product.video_url && (
                            <div className="mt-4">
                                {getVideoEmbedUrl(product.video_url) ? (
                                    <div className="aspect-video overflow-hidden rounded-xl border">
                                        <iframe
                                            src={
                                                getVideoEmbedUrl(
                                                    product.video_url,
                                                )!
                                            }
                                            className="h-full w-full"
                                            allowFullScreen
                                            title="Product Video"
                                        />
                                    </div>
                                ) : (
                                    <a
                                        href={product.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-[#e94560] hover:underline"
                                    >
                                        <Play className="size-4" /> Watch
                                        Product Video
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            {product.brand && (
                                <a
                                    href={`/shop?brand=${product.brand.slug}`}
                                    className="text-xs font-semibold tracking-wider text-[#0f3460] uppercase hover:underline"
                                >
                                    {product.brand.name}
                                </a>
                            )}
                            {product.category && (
                                <a
                                    href={`/shop?category=${product.category.slug}`}
                                    className="text-sm font-medium text-[#e94560] hover:underline"
                                >
                                    {product.category.name}
                                </a>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            {product.name}
                        </h1>

                        {/* Labels */}
                        <div className="flex flex-wrap items-center gap-2">
                            {label && (
                                <Badge
                                    className={cn('border-0', label.className)}
                                >
                                    {label.text}
                                </Badge>
                            )}
                            {product.is_featured && (
                                <Badge className="border-0 bg-[#0f3460] text-white">
                                    Featured
                                </Badge>
                            )}
                            {currentSku && (
                                <span className="text-xs text-gray-400">
                                    SKU: {currentSku}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <StarRating
                                value={Math.round(averageRating)}
                                size="md"
                            />
                            <span className="text-sm text-gray-500">
                                ({product.reviews.length} reviews)
                            </span>
                        </div>

                        <div className="flex items-baseline gap-3">
                            {salePrice && !selectedVariant ? (
                                <>
                                    <span className="text-4xl font-bold text-[#e94560]">
                                        ৳{salePrice.toFixed(2)}
                                    </span>
                                    <span className="text-xl text-gray-400 line-through">
                                        ৳{price.toFixed(2)}
                                    </span>
                                    <Badge className="border-0 bg-[#e94560] text-white">
                                        -
                                        {Math.round(
                                            ((price - salePrice) / price) * 100,
                                        )}
                                        % OFF
                                    </Badge>
                                </>
                            ) : (
                                <span className="text-4xl font-bold text-gray-900">
                                    ৳{effectivePrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        <div>
                            {currentStock > 0 ? (
                                <Badge className="border-0 bg-green-100 text-green-700">
                                    ✓ In Stock ({currentStock} left)
                                </Badge>
                            ) : (
                                <Badge className="border-0 bg-red-100 text-red-700">
                                    Out of Stock
                                </Badge>
                            )}
                        </div>

                        {currentStock === 0 && (
                            <form
                                onSubmit={submitStockNotification}
                                className="space-y-3 rounded-xl border border-red-100 bg-red-50 p-4"
                            >
                                <div className="flex items-center gap-2 text-sm font-medium text-red-800">
                                    <Bell className="size-4" /> Notify me when
                                    available
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={stockNotifyForm.data.email}
                                        onChange={(e) =>
                                            stockNotifyForm.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Email address"
                                        className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={stockNotifyForm.processing}
                                        className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]"
                                    >
                                        Notify
                                    </Button>
                                </div>
                                {stockNotifyForm.errors.email && (
                                    <p className="text-xs text-red-600">
                                        {stockNotifyForm.errors.email}
                                    </p>
                                )}
                            </form>
                        )}

                        {/* Variant selectors */}
                        {variantAttributeKeys.length > 0 && (
                            <div className="space-y-3">
                                {variantAttributeKeys.map((attrKey) => {
                                    const uniqueValues = [
                                        ...new Set(
                                            product.variants
                                                .map(
                                                    (v) =>
                                                        v.attributes[attrKey],
                                                )
                                                .filter(Boolean),
                                        ),
                                    ];
                                    return (
                                        <div key={attrKey}>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 capitalize">
                                                {attrKey}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {uniqueValues.map((val) => {
                                                    const matchingVariant =
                                                        product.variants.find(
                                                            (v) =>
                                                                v.attributes[
                                                                    attrKey
                                                                ] === val &&
                                                                v.is_active,
                                                        );
                                                    const isSelected =
                                                        selectedVariant
                                                            ?.attributes[
                                                            attrKey
                                                        ] === val;
                                                    const isAvailable =
                                                        matchingVariant &&
                                                        matchingVariant.stock_qty >
                                                            0;
                                                    return (
                                                        <button
                                                            key={val}
                                                            onClick={() =>
                                                                matchingVariant &&
                                                                selectVariant(
                                                                    matchingVariant,
                                                                )
                                                            }
                                                            disabled={
                                                                !matchingVariant
                                                            }
                                                            className={cn(
                                                                'rounded-lg border-2 px-4 py-2 text-sm transition-all',
                                                                isSelected
                                                                    ? 'border-[#e94560] bg-[#e94560]/5 font-medium text-[#e94560]'
                                                                    : isAvailable
                                                                      ? 'border-gray-200 text-gray-700 hover:border-gray-400'
                                                                      : 'cursor-not-allowed border-gray-100 text-gray-300 line-through',
                                                            )}
                                                        >
                                                            {attrKey ===
                                                                'color' && (
                                                                <span
                                                                    className="mr-1.5 inline-block h-3 w-3 rounded-full border"
                                                                    style={{
                                                                        backgroundColor:
                                                                            val.toLowerCase(),
                                                                    }}
                                                                />
                                                            )}
                                                            {val}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {product.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Qty + buttons */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center overflow-hidden rounded-lg border">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="px-3 py-2 transition-colors hover:bg-gray-100"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <span className="min-w-[3rem] px-4 py-2 text-center text-sm font-medium">
                                    {qty}
                                </span>
                                <button
                                    onClick={() =>
                                        setQty(Math.min(currentStock, qty + 1))
                                    }
                                    className="px-3 py-2 transition-colors hover:bg-gray-100"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                            <Button
                                onClick={addToCart}
                                disabled={currentStock === 0}
                                className="h-10 flex-1 border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]"
                            >
                                <ShoppingCart className="mr-2 size-4" /> Add to
                                Cart
                            </Button>
                            <button
                                onClick={toggleWishlist}
                                className={cn(
                                    'rounded-lg border p-2.5 transition-colors',
                                    wishlisted
                                        ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                                        : 'border-gray-200 text-gray-400 hover:text-[#e94560]',
                                )}
                            >
                                <Heart
                                    className={cn(
                                        'size-5',
                                        wishlisted && 'fill-current',
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b">
                    <div className="flex gap-6 overflow-x-auto">
                        {availableTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'border-b-2 pb-3 text-sm font-medium whitespace-nowrap transition-colors',
                                    activeTab === tab.key
                                        ? 'border-[#e94560] text-[#e94560]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700',
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab content */}
                {activeTab === 'description' && (
                    <p className="max-w-2xl leading-relaxed whitespace-pre-line text-gray-600">
                        {product.description ?? 'No description available.'}
                    </p>
                )}

                {activeTab === 'reviews' && (
                    <div className="max-w-2xl space-y-8">
                        {product.reviews.length === 0 ? (
                            <p className="text-gray-500">
                                No reviews yet. Be the first!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {product.reviews.map((r) => (
                                    <div
                                        key={r.id}
                                        className="rounded-xl border p-4"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-medium text-gray-900">
                                                {r.user.name}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(
                                                    r.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <StarRating
                                            value={r.rating}
                                            size="sm"
                                        />
                                        {r.comment && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {r.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {auth.user && !userReviewed && (
                            <form
                                onSubmit={submitReview}
                                className="space-y-4 rounded-xl border bg-gray-50 p-5"
                            >
                                <h3 className="font-semibold">
                                    Write a Review
                                </h3>
                                <div>
                                    <label className="mb-1 block text-sm text-gray-600">
                                        Rating
                                    </label>
                                    <StarRating
                                        value={reviewForm.data.rating}
                                        interactive
                                        onChange={(v) =>
                                            reviewForm.setData('rating', v)
                                        }
                                        size="lg"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm text-gray-600">
                                        Comment (optional)
                                    </label>
                                    <textarea
                                        value={reviewForm.data.comment}
                                        onChange={(e) =>
                                            reviewForm.setData(
                                                'comment',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={reviewForm.processing}
                                    className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]"
                                >
                                    Submit Review
                                </Button>
                            </form>
                        )}
                    </div>
                )}

                {activeTab === 'size_chart' && product.size_chart && (
                    <div className="max-w-2xl">
                        <div className="overflow-hidden rounded-xl border bg-white">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {Object.keys(product.size_chart[0]).map(
                                            (key) => (
                                                <th
                                                    key={key}
                                                    className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase"
                                                >
                                                    {key}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {product.size_chart.map((row, i) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-gray-50"
                                        >
                                            {Object.values(row).map(
                                                (val, j) => (
                                                    <td
                                                        key={j}
                                                        className={cn(
                                                            'px-4 py-3',
                                                            j === 0
                                                                ? 'font-medium text-gray-900'
                                                                : 'text-gray-600',
                                                        )}
                                                    >
                                                        {val}
                                                    </td>
                                                ),
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'faq' && product.faqs && (
                    <div className="max-w-2xl space-y-2">
                        {product.faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-xl border"
                            >
                                <button
                                    onClick={() =>
                                        setOpenFaqIndex(
                                            openFaqIndex === i ? null : i,
                                        )
                                    }
                                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                                >
                                    <span className="text-sm font-medium text-gray-900">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            'size-4 text-gray-400 transition-transform',
                                            openFaqIndex === i && 'rotate-180',
                                        )}
                                    />
                                </button>
                                {openFaqIndex === i && (
                                    <div className="border-t bg-gray-50/50 px-4 pt-3 pb-4 text-sm leading-relaxed text-gray-600">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Related products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="mb-6 text-2xl font-bold text-gray-900">
                            Related Products
                        </h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}

                {recentlyViewed.length > 0 && (
                    <section className="mt-16">
                        <h2 className="mb-6 text-2xl font-bold text-gray-900">
                            Recently Viewed
                        </h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {recentlyViewed.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </ShopLayout>
    );
}
