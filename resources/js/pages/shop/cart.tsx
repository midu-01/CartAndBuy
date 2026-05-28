import { Head, Link, router, useForm } from '@inertiajs/react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Product {
    id: number;
    name: string;
    slug: string;
    images: string[] | null;
    stock_qty: number;
}
interface Variant {
    id: number;
    attributes: Record<string, string>;
    stock_qty: number;
    images: string[] | null;
}
interface CartItem {
    id: number;
    quantity: number;
    price: string;
    product: Product;
    variant: Variant | null;
}
interface Cart {
    id: number;
    items: CartItem[];
}
interface Props {
    cart: Cart;
}

export default function CartPage({ cart }: Props) {
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState<{
        code: string;
        amount: number;
    } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    const items = cart?.items ?? [];
    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
    );
    const shipping = subtotal >= 2000 ? 0 : 130;
    const discountAmount = discount?.amount ?? 0;
    const total = Math.max(0, subtotal + shipping - discountAmount);

    function updateQty(item: CartItem, qty: number) {
        router.patch(
            `/cart/${item.id}`,
            { quantity: qty },
            { preserveScroll: true },
        );
    }

    function removeItem(item: CartItem) {
        router.delete(`/cart/${item.id}`, { preserveScroll: true });
    }

    async function validateCoupon() {
        if (!couponCode.trim()) return;
        setValidatingCoupon(true);
        setCouponError('');
        try {
            const res = await fetch('/coupon/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                },
                body: JSON.stringify({
                    code: couponCode,
                    order_total: subtotal,
                }),
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setDiscount({ code: data.code, amount: data.discount });
            } else {
                setCouponError(data.message ?? 'Invalid coupon.');
            }
        } catch {
            setCouponError('Could not validate coupon.');
        } finally {
            setValidatingCoupon(false);
        }
    }

    if (items.length === 0) {
        return (
            <ShopLayout>
                <Head title="Cart — CartAndBuy" />
                <div className="mx-auto max-w-7xl px-4 py-20 text-center">
                    <ShoppingBag className="mx-auto mb-4 size-16 text-gray-200" />
                    <h2 className="mb-2 text-2xl font-bold text-gray-700">
                        Your cart is empty
                    </h2>
                    <p className="mb-8 text-gray-400">
                        Looks like you haven't added anything yet.
                    </p>
                    <Link href="/shop">
                        <Button className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]">
                            Start Shopping
                        </Button>
                    </Link>
                </div>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout>
            <Head title="Cart — CartAndBuy" />
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-2xl font-bold text-gray-900">
                    Shopping Cart ({items.length})
                </h1>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Items */}
                    <div className="space-y-4 lg:col-span-2">
                        {items.map((item) => {
                            const image =
                                item.variant?.images?.[0] ??
                                item.product.images?.[0] ??
                                'https://placehold.co/100x100/e2e8f0/64748b?text=No+Image';
                            const stockAvailable =
                                item.variant?.stock_qty ??
                                item.product.stock_qty;
                            const variantText = item.variant
                                ? Object.entries(item.variant.attributes)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(' / ')
                                : null;
                            return (
                                <div
                                    key={item.id}
                                    className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4"
                                >
                                    <Link
                                        href={`/products/${item.product.slug}`}
                                    >
                                        <img
                                            src={image}
                                            alt={item.product.name}
                                            className="h-20 w-20 shrink-0 rounded-lg bg-gray-50 object-cover"
                                        />
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/products/${item.product.slug}`}
                                            className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors hover:text-[#e94560]"
                                        >
                                            {item.product.name}
                                        </Link>
                                        {variantText && (
                                            <p className="mt-0.5 text-xs text-gray-400 capitalize">
                                                {variantText}
                                            </p>
                                        )}
                                        <p className="mt-1 font-bold text-[#e94560]">
                                            ৳{Number(item.price).toFixed(2)}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center overflow-hidden rounded-lg border text-sm">
                                                <button
                                                    onClick={() =>
                                                        updateQty(
                                                            item,
                                                            Math.max(
                                                                1,
                                                                item.quantity -
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                    className="px-2 py-1 hover:bg-gray-100"
                                                >
                                                    <Minus className="size-3" />
                                                </button>
                                                <span className="min-w-[2.5rem] px-3 py-1 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQty(
                                                            item,
                                                            Math.min(
                                                                stockAvailable,
                                                                item.quantity +
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                    className="px-2 py-1 hover:bg-gray-100"
                                                >
                                                    <Plus className="size-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold">
                                                    ৳
                                                    {(
                                                        Number(item.price) *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        removeItem(item)
                                                    }
                                                    className="text-gray-400 transition-colors hover:text-red-500"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="text-right">
                            <button
                                onClick={() =>
                                    router.delete('/cart', {
                                        preserveScroll: true,
                                    })
                                }
                                className="text-sm text-red-400 hover:text-red-600 hover:underline"
                            >
                                Clear entire cart
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                        {/* Coupon */}
                        <div className="rounded-xl border border-gray-100 bg-white p-4">
                            <h3 className="mb-3 font-semibold text-gray-900">
                                Coupon Code
                            </h3>
                            {discount ? (
                                <div className="flex items-center justify-between">
                                    <Badge className="border-0 bg-green-100 text-green-700">
                                        {discount.code}
                                    </Badge>
                                    <button
                                        onClick={() => {
                                            setDiscount(null);
                                            setCouponCode('');
                                        }}
                                        className="text-xs text-gray-400 hover:text-red-500"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) =>
                                                setCouponCode(
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="Enter code"
                                            className="flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={validateCoupon}
                                            disabled={validatingCoupon}
                                            className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]"
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                    {couponError && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {couponError}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Order summary */}
                        <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-4">
                            <h3 className="font-semibold text-gray-900">
                                Order Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>৳{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>
                                        {shipping === 0 ? (
                                            <span className="text-green-600">
                                                Free
                                            </span>
                                        ) : (
                                            `৳${shipping}`
                                        )}
                                    </span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({discount?.code})</span>
                                        <span>
                                            -৳{discountAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2 font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>৳{total.toFixed(2)}</span>
                                </div>
                            </div>
                            <Link href="/checkout">
                                <Button className="mt-2 w-full border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                                    Proceed to Checkout
                                </Button>
                            </Link>
                            <Link
                                href="/shop"
                                className="mt-2 block text-center text-sm text-gray-500 hover:text-gray-700"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
