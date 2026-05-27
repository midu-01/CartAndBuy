import { Link, router, usePage } from '@inertiajs/react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    sale_price: string | number | null;
    images: string[] | null;
    is_featured: boolean;
    category?: { name: string };
}

interface Props {
    product: Product;
}

export default function ProductCard({ product }: Props) {
    const { auth, wishlistProductIds } = usePage<SharedData & { wishlistProductIds: number[] }>().props;
    const isWishlisted = wishlistProductIds?.includes(product.id);

    const image = product.images?.[0] ?? 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
    const price = Number(product.price);
    const salePrice = product.sale_price ? Number(product.sale_price) : null;

    function addToCart() {
        router.post('/cart', { product_id: product.id, quantity: 1 }, { preserveScroll: true });
    }

    function toggleWishlist() {
        if (!auth.user) { router.visit('/login'); return; }
        router.post(`/wishlist/${product.id}`, {}, { preserveScroll: true });
    }

    return (
        <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative overflow-hidden aspect-square bg-gray-50">
                <Link href={`/products/${product.slug}`}>
                    <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>
                {salePrice && (
                    <Badge className="absolute top-2 left-2 bg-[#e94560] border-0 text-white text-xs">
                        -{Math.round(((price - salePrice) / price) * 100)}%
                    </Badge>
                )}
                {product.is_featured && !salePrice && (
                    <Badge className="absolute top-2 left-2 bg-[#0f3460] border-0 text-white text-xs">Featured</Badge>
                )}
                <button
                    onClick={toggleWishlist}
                    className={cn(
                        'absolute top-2 right-2 p-1.5 rounded-full bg-white shadow transition-colors',
                        isWishlisted ? 'text-[#e94560]' : 'text-gray-400 hover:text-[#e94560]',
                    )}
                >
                    <Heart className={cn('size-4', isWishlisted && 'fill-current')} />
                </button>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                {product.category && (
                    <span className="text-xs text-gray-400 mb-1">{product.category.name}</span>
                )}
                <Link href={`/products/${product.slug}`} className="font-medium text-gray-900 hover:text-[#e94560] transition-colors line-clamp-2 text-sm leading-snug mb-2">
                    {product.name}
                </Link>
                <div className="flex items-center gap-1 mb-3 mt-auto">
                    {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={cn('size-3', s <= 4 ? 'text-amber-400 fill-current' : 'text-gray-200 fill-current')} />
                    ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div>
                        {salePrice ? (
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-bold text-[#e94560]">৳{salePrice.toFixed(2)}</span>
                                <span className="text-xs text-gray-400 line-through">৳{price.toFixed(2)}</span>
                            </div>
                        ) : (
                            <span className="font-bold text-gray-900">৳{price.toFixed(2)}</span>
                        )}
                    </div>
                    <Button size="sm" onClick={addToCart} className="bg-[#1a1a2e] hover:bg-[#0f3460] text-white border-0 text-xs px-3">
                        <ShoppingCart className="size-3 mr-1" /> Add
                    </Button>
                </div>
            </div>
        </div>
    );
}
