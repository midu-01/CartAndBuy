import { Link, router, usePage } from '@inertiajs/react';
import { Eye, Heart, Scale, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    sale_price: string | number | null;
    images: string[] | null;
    stock_qty: number;
    description?: string | null;
    sku?: string | null;
    is_featured: boolean;
    label: string | null;
    category?: { name: string };
    brand?: { name: string } | null;
}

interface Props {
    product: Product;
}

const labelStyles: Record<string, { text: string; className: string }> = {
    new_arrival: { text: 'New', className: 'bg-emerald-500' },
    best_seller: { text: 'Best Seller', className: 'bg-amber-500' },
    trending: { text: 'Trending', className: 'bg-purple-500' },
};

export default function ProductCard({ product }: Props) {
    const { auth, wishlistProductIds } = usePage<
        SharedData & { wishlistProductIds: number[] }
    >().props;
    const isWishlisted = wishlistProductIds?.includes(product.id);
    const [quickViewOpen, setQuickViewOpen] = useState(false);

    const image =
        product.images?.[0] ??
        'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
    const price = Number(product.price);
    const salePrice = product.sale_price ? Number(product.sale_price) : null;
    const label = product.label ? labelStyles[product.label] : null;

    function addToCart() {
        router.post(
            '/cart',
            { product_id: product.id, quantity: 1 },
            { preserveScroll: true },
        );
    }

    function toggleWishlist() {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        router.post(`/wishlist/${product.id}`, {}, { preserveScroll: true });
    }

    function compareProduct() {
        const current = JSON.parse(
            localStorage.getItem('compareProducts') ?? '[]',
        ) as number[];
        const next = [
            product.id,
            ...current.filter((id) => id !== product.id),
        ].slice(0, 4);
        localStorage.setItem('compareProducts', JSON.stringify(next));
        router.visit(`/compare?products=${next.join(',')}`);
    }

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Link href={`/products/${product.slug}`}>
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>
                {/* Badges - top left */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {salePrice && (
                        <Badge className="border-0 bg-[#e94560] text-xs text-white">
                            -{Math.round(((price - salePrice) / price) * 100)}%
                        </Badge>
                    )}
                    {label && !salePrice && (
                        <Badge
                            className={cn(
                                'border-0 text-xs text-white',
                                label.className,
                            )}
                        >
                            {label.text}
                        </Badge>
                    )}
                    {product.is_featured && !salePrice && !label && (
                        <Badge className="border-0 bg-[#0f3460] text-xs text-white">
                            Featured
                        </Badge>
                    )}
                </div>
                {/* Sale badge + label combo when both present */}
                {salePrice && label && (
                    <Badge
                        className={cn(
                            'absolute top-9 left-2 border-0 text-xs text-white',
                            label.className,
                        )}
                    >
                        {label.text}
                    </Badge>
                )}
                <button
                    onClick={toggleWishlist}
                    className={cn(
                        'absolute top-2 right-2 rounded-full bg-white p-1.5 shadow transition-colors',
                        isWishlisted
                            ? 'text-[#e94560]'
                            : 'text-gray-400 hover:text-[#e94560]',
                    )}
                >
                    <Heart
                        className={cn('size-4', isWishlisted && 'fill-current')}
                    />
                </button>
                <div className="absolute right-2 bottom-2 left-2 grid grid-cols-2 gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={() => setQuickViewOpen(true)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow hover:text-[#e94560]"
                    >
                        <Eye className="size-3" /> View
                    </button>
                    <button
                        onClick={compareProduct}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow hover:text-[#e94560]"
                    >
                        <Scale className="size-3" /> Compare
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-4">
                {product.brand && (
                    <span className="mb-0.5 text-[10px] font-semibold tracking-wider text-[#0f3460] uppercase">
                        {product.brand.name}
                    </span>
                )}
                {product.category && (
                    <span className="mb-1 text-xs text-gray-400">
                        {product.category.name}
                    </span>
                )}
                <Link
                    href={`/products/${product.slug}`}
                    className="mb-2 line-clamp-2 text-sm leading-snug font-medium text-gray-900 transition-colors hover:text-[#e94560]"
                >
                    {product.name}
                </Link>
                <div className="mt-auto mb-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            className={cn(
                                'size-3',
                                s <= 4
                                    ? 'fill-current text-amber-400'
                                    : 'fill-current text-gray-200',
                            )}
                        />
                    ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div>
                        {salePrice ? (
                            <span className="font-bold text-[#e94560]">
                                ৳{salePrice.toFixed(2)}
                            </span>
                        ) : (
                            <span className="font-bold text-gray-900">
                                ৳{price.toFixed(2)}
                            </span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        onClick={addToCart}
                        className="border-0 bg-[#1a1a2e] px-3 text-xs text-white hover:bg-[#0f3460]"
                    >
                        <ShoppingCart className="mr-1 size-3" /> Add
                    </Button>
                </div>
            </div>

            <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
                <DialogContent className="max-w-2xl bg-white text-gray-900">
                    <DialogHeader>
                        <DialogTitle>{product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <img
                            src={image}
                            alt={product.name}
                            className="aspect-square w-full rounded-lg bg-gray-50 object-cover"
                        />
                        <div className="space-y-4">
                            <div className="space-y-1">
                                {product.brand && (
                                    <p className="text-xs font-semibold tracking-wider text-[#0f3460] uppercase">
                                        {product.brand.name}
                                    </p>
                                )}
                                {product.category && (
                                    <p className="text-sm text-gray-500">
                                        {product.category.name}
                                    </p>
                                )}
                                {product.sku && (
                                    <p className="text-xs text-gray-400">
                                        SKU: {product.sku}
                                    </p>
                                )}
                            </div>
                            <div>
                                {salePrice ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-[#e94560]">
                                            ৳{salePrice.toFixed(2)}
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                            ৳{price.toFixed(2)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-2xl font-bold text-gray-900">
                                        ৳{price.toFixed(2)}
                                    </span>
                                )}
                            </div>
                            <Badge
                                className={cn(
                                    'border-0',
                                    product.stock_qty > 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700',
                                )}
                            >
                                {product.stock_qty > 0
                                    ? `In Stock (${product.stock_qty})`
                                    : 'Out of Stock'}
                            </Badge>
                            {product.description && (
                                <p className="line-clamp-4 text-sm text-gray-600">
                                    {product.description}
                                </p>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    onClick={addToCart}
                                    disabled={product.stock_qty === 0}
                                    className="flex-1 border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]"
                                >
                                    <ShoppingCart className="mr-1 size-4" /> Add
                                </Button>
                                <Link
                                    href={`/products/${product.slug}`}
                                    className="flex-1"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                    >
                                        Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
