import { ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AiProduct } from './types';

interface Props {
    product: AiProduct;
    onAddToCart: (product: AiProduct) => void;
}

export default function AiProductCard({ product, onAddToCart }: Props) {
    const image = product.image ?? 'https://placehold.co/300x300/f1f5f9/94a3b8?text=No+Image';
    const effectivePrice = product.sale_price ?? product.price;
    const discount = product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : null;
    const isLowStock = product.in_stock && product.stock_qty > 0 && product.stock_qty <= 5;

    return (
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden hover:shadow-md hover:border-[#0f3460]/15 transition-all duration-200 group">
            <div className="flex gap-3 p-3">
                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-50">
                    <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discount !== null && (
                        <div className="absolute top-1 left-1 bg-gradient-to-r from-[#e94560] to-[#c73652] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none shadow-sm">
                            -{discount}%
                        </div>
                    )}
                    {!product.in_stock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-[9px] font-semibold tracking-wide">SOLD OUT</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {product.category && (
                        <span className="text-[9px] font-semibold text-[#0f3460]/50 uppercase tracking-widest">
                            {product.category}
                        </span>
                    )}

                    <p className="text-[12px] font-semibold text-gray-900 line-clamp-2 leading-snug">{product.name}</p>

                    {product.rating !== null && (
                        <div className="flex items-center gap-1">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={cn(
                                            'size-2.5',
                                            s <= Math.round(product.rating!)
                                                ? 'text-amber-400 fill-current'
                                                : 'text-gray-200 fill-current',
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] text-gray-400">({product.review_count})</span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-1.5 mt-auto">
                        <span className={cn('text-sm font-bold', product.sale_price ? 'text-[#e94560]' : 'text-gray-900')}>
                            ৳{effectivePrice.toFixed(0)}
                        </span>
                        {product.sale_price && (
                            <span className="text-[10px] text-gray-400 line-through">৳{product.price.toFixed(0)}</span>
                        )}
                    </div>

                    {/* Stock */}
                    {product.in_stock ? (
                        isLowStock ? (
                            <span className="text-[10px] font-semibold text-amber-600">⚡ Only {product.stock_qty} left!</span>
                        ) : (
                            <span className="text-[10px] font-medium text-emerald-600">✓ In Stock</span>
                        )
                    ) : (
                        <span className="text-[10px] font-medium text-red-500">✗ Out of Stock</span>
                    )}
                </div>
            </div>

            {/* Action bar */}
            <div className="border-t border-gray-50 px-3 py-2.5 flex gap-2">
                <a
                    href={`/products/${product.slug}`}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:border-[#0f3460]/30 hover:text-[#0f3460] hover:bg-[#0f3460]/5 transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="size-3" />
                    View
                </a>
                <button
                    onClick={() => onAddToCart(product)}
                    disabled={!product.in_stock}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-xl transition-all duration-200',
                        product.in_stock
                            ? 'bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] hover:from-[#0f3460] hover:to-[#e94560] text-white shadow-sm hover:shadow-[0_4px_12px_rgba(15,52,96,0.3)]'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                    )}
                >
                    <ShoppingCart className="size-3" />
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
