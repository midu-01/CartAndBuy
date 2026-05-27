import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';
import ProductCard from '@/components/shop/product-card';
import StarRating from '@/components/shop/star-rating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

interface Review { id: number; rating: number; comment: string | null; created_at: string; user: { name: string } }
interface Product { id: number; name: string; slug: string; description: string | null; price: string; sale_price: string | null; stock_qty: number; images: string[] | null; is_featured: boolean; category?: { name: string; slug: string }; reviews: Review[] }

interface Props { product: Product; relatedProducts: Product[]; averageRating: number; userWishlisted: boolean; userReviewed: boolean }

export default function ProductDetailPage({ product, relatedProducts, averageRating, userWishlisted, userReviewed }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [qty, setQty] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [wishlisted, setWishlisted] = useState(userWishlisted);

    const price = Number(product.price);
    const salePrice = product.sale_price ? Number(product.sale_price) : null;
    const images = product.images?.length ? product.images : ['https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'];

    const reviewForm = useForm({ rating: 5, comment: '' });

    function addToCart() {
        router.post('/cart', { product_id: product.id, quantity: qty }, { preserveScroll: true });
    }

    function toggleWishlist() {
        if (!auth.user) { router.visit('/login'); return; }
        setWishlisted(!wishlisted);
        router.post(`/wishlist/${product.id}`, {}, { preserveScroll: true });
    }

    function submitReview(e: React.FormEvent) {
        e.preventDefault();
        reviewForm.post(`/products/${product.slug}/reviews`, { preserveScroll: true, onSuccess: () => reviewForm.reset() });
    }

    return (
        <ShopLayout>
            <Head title={`${product.name} — CartAndBuy`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    <a href="/" className="hover:text-[#e94560]">Home</a>
                    <span>/</span>
                    <a href="/shop" className="hover:text-[#e94560]">Shop</a>
                    {product.category && (<><span>/</span><a href={`/shop?category=${product.category.slug}`} className="hover:text-[#e94560]">{product.category.name}</a></>)}
                    <span>/</span>
                    <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                    {/* Gallery */}
                    <div className="space-y-3">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border">
                            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2">
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => setActiveImage(i)} className={cn('w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors', i === activeImage ? 'border-[#e94560]' : 'border-transparent')}>
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-5">
                        {product.category && (
                            <a href={`/shop?category=${product.category.slug}`} className="text-sm text-[#e94560] font-medium hover:underline">{product.category.name}</a>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

                        <div className="flex items-center gap-3">
                            <StarRating value={Math.round(averageRating)} size="md" />
                            <span className="text-sm text-gray-500">({product.reviews.length} reviews)</span>
                        </div>

                        <div className="flex items-baseline gap-3">
                            {salePrice ? (
                                <>
                                    <span className="text-4xl font-bold text-[#e94560]">৳{salePrice.toFixed(2)}</span>
                                    <span className="text-xl text-gray-400 line-through">৳{price.toFixed(2)}</span>
                                    <Badge className="bg-[#e94560] text-white border-0">-{Math.round(((price - salePrice) / price) * 100)}% OFF</Badge>
                                </>
                            ) : (
                                <span className="text-4xl font-bold text-gray-900">৳{price.toFixed(2)}</span>
                            )}
                        </div>

                        <div>
                            {product.stock_qty > 0
                                ? <Badge className="bg-green-100 text-green-700 border-0">✓ In Stock ({product.stock_qty} left)</Badge>
                                : <Badge className="bg-red-100 text-red-700 border-0">Out of Stock</Badge>
                            }
                        </div>

                        {/* Qty + buttons */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded-lg overflow-hidden">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><Minus className="size-4" /></button>
                                <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{qty}</span>
                                <button onClick={() => setQty(Math.min(product.stock_qty, qty + 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><Plus className="size-4" /></button>
                            </div>
                            <Button onClick={addToCart} disabled={product.stock_qty === 0} className="flex-1 bg-[#1a1a2e] hover:bg-[#0f3460] border-0 text-white h-10">
                                <ShoppingCart className="size-4 mr-2" /> Add to Cart
                            </Button>
                            <button onClick={toggleWishlist} className={cn('p-2.5 rounded-lg border transition-colors', wishlisted ? 'bg-[#e94560]/10 border-[#e94560] text-[#e94560]' : 'border-gray-200 text-gray-400 hover:text-[#e94560]')}>
                                <Heart className={cn('size-5', wishlisted && 'fill-current')} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b mb-8">
                    <div className="flex gap-6">
                        {(['description', 'reviews'] as const).map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={cn('pb-3 text-sm font-medium capitalize border-b-2 transition-colors', activeTab === tab ? 'border-[#e94560] text-[#e94560]' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                                {tab} {tab === 'reviews' && `(${product.reviews.length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'description' ? (
                    <p className="text-gray-600 leading-relaxed max-w-2xl">{product.description ?? 'No description available.'}</p>
                ) : (
                    <div className="max-w-2xl space-y-8">
                        {/* Review list */}
                        {product.reviews.length === 0 ? (
                            <p className="text-gray-500">No reviews yet. Be the first!</p>
                        ) : (
                            <div className="space-y-4">
                                {product.reviews.map((r) => (
                                    <div key={r.id} className="border rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{r.user.name}</span>
                                            <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <StarRating value={r.rating} size="sm" />
                                        {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Submit review */}
                        {auth.user && !userReviewed && (
                            <form onSubmit={submitReview} className="border rounded-xl p-5 space-y-4 bg-gray-50">
                                <h3 className="font-semibold">Write a Review</h3>
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Rating</label>
                                    <StarRating value={reviewForm.data.rating} interactive onChange={(v) => reviewForm.setData('rating', v)} size="lg" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">Comment (optional)</label>
                                    <textarea value={reviewForm.data.comment} onChange={(e) => reviewForm.setData('comment', e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                                </div>
                                <Button type="submit" disabled={reviewForm.processing} className="bg-[#1a1a2e] hover:bg-[#0f3460] border-0 text-white">Submit Review</Button>
                            </form>
                        )}
                    </div>
                )}

                {/* Related products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </section>
                )}
            </div>
        </ShopLayout>
    );
}
