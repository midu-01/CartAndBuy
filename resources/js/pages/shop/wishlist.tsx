import { Head, router } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import ProductCard from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

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
    category?: { name: string };
}
interface WishlistItem {
    id: number;
    product: Product;
}
interface Props {
    wishlists: WishlistItem[];
}

export default function WishlistPage({ wishlists }: Props) {
    return (
        <ShopLayout>
            <Head title="Wishlist — CartAndBuy" />
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Heart className="size-6 fill-[#e94560] text-[#e94560]" />{' '}
                        Wishlist
                        <span className="text-sm font-normal text-gray-400">
                            ({wishlists.length})
                        </span>
                    </h1>
                </div>

                {wishlists.length === 0 ? (
                    <div className="py-20 text-center">
                        <Heart className="mx-auto mb-4 size-14 text-gray-200" />
                        <p className="mb-4 text-gray-500">
                            Your wishlist is empty.
                        </p>
                        <Link href="/shop">
                            <Button className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]">
                                Browse Products
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {wishlists.map(({ product }) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}
