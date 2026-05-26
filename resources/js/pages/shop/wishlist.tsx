import { Head, router } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import ProductCard from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface Product { id: number; name: string; slug: string; price: string; sale_price: string | null; images: string[] | null; is_featured: boolean; category?: { name: string } }
interface WishlistItem { id: number; product: Product }
interface Props { wishlists: WishlistItem[] }

export default function WishlistPage({ wishlists }: Props) {
    return (
        <ShopLayout>
            <Head title="Wishlist — CartAndBuy" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Heart className="size-6 text-[#e94560] fill-[#e94560]" /> Wishlist
                        <span className="text-sm font-normal text-gray-400">({wishlists.length})</span>
                    </h1>
                </div>

                {wishlists.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="size-14 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                        <Link href="/shop"><Button className="bg-[#1a1a2e] hover:bg-[#0f3460] text-white border-0">Browse Products</Button></Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {wishlists.map(({ product }) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}
