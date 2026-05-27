import { Head, Link, router, useForm } from '@inertiajs/react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Product { id: number; name: string; slug: string; images: string[] | null; stock_qty: number }
interface CartItem { id: number; quantity: number; price: string; product: Product }
interface Cart { id: number; items: CartItem[] }
interface Props { cart: Cart }

export default function CartPage({ cart }: Props) {
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    const items = cart?.items ?? [];
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const shipping = subtotal >= 2000 ? 0 : 130;
    const discountAmount = discount?.amount ?? 0;
    const total = Math.max(0, subtotal + shipping - discountAmount);

    function updateQty(item: CartItem, qty: number) {
        router.patch(`/cart/${item.id}`, { quantity: qty }, { preserveScroll: true });
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
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '') },
                body: JSON.stringify({ code: couponCode, order_total: subtotal }),
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
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <ShoppingBag className="size-16 mx-auto text-gray-200 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                    <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
                    <Link href="/shop"><Button className="bg-[#1a1a2e] hover:bg-[#0f3460] text-white border-0">Start Shopping</Button></Link>
                </div>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout>
            <Head title="Cart — CartAndBuy" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length})</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => {
                            const image = item.product.images?.[0] ?? 'https://placehold.co/100x100/e2e8f0/64748b?text=No+Image';
                            return (
                                <div key={item.id} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4">
                                    <Link href={`/products/${item.product.slug}`}>
                                        <img src={image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg bg-gray-50 shrink-0" />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/products/${item.product.slug}`} className="font-medium text-gray-900 hover:text-[#e94560] transition-colors line-clamp-2 text-sm">{item.product.name}</Link>
                                        <p className="text-[#e94560] font-bold mt-1">৳{Number(item.price).toFixed(2)}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border rounded-lg overflow-hidden text-sm">
                                                <button onClick={() => updateQty(item, Math.max(1, item.quantity - 1))} className="px-2 py-1 hover:bg-gray-100"><Minus className="size-3" /></button>
                                                <span className="px-3 py-1 min-w-[2.5rem] text-center">{item.quantity}</span>
                                                <button onClick={() => updateQty(item, Math.min(item.product.stock_qty, item.quantity + 1))} className="px-2 py-1 hover:bg-gray-100"><Plus className="size-3" /></button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold">৳{(Number(item.price) * item.quantity).toFixed(2)}</span>
                                                <button onClick={() => removeItem(item)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="size-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="text-right">
                            <button onClick={() => router.delete('/cart', { preserveScroll: true })} className="text-sm text-red-400 hover:text-red-600 hover:underline">
                                Clear entire cart
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                        {/* Coupon */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Coupon Code</h3>
                            {discount ? (
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-green-100 text-green-700 border-0">{discount.code}</Badge>
                                    <button onClick={() => { setDiscount(null); setCouponCode(''); }} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-2">
                                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                                        <Button size="sm" onClick={validateCoupon} disabled={validatingCoupon} className="bg-[#1a1a2e] hover:bg-[#0f3460] border-0 text-white">Apply</Button>
                                    </div>
                                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                                </>
                            )}
                        </div>

                        {/* Order summary */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                            <h3 className="font-semibold text-gray-900">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>৳{subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">Free</span> : `৳${shipping}`}</span></div>
                                {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({discount?.code})</span><span>-৳{discountAmount.toFixed(2)}</span></div>}
                                <div className="border-t pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span>৳{total.toFixed(2)}</span></div>
                            </div>
                            <Link href="/checkout">
                                <Button className="w-full bg-[#e94560] hover:bg-[#c73652] border-0 text-white mt-2">Proceed to Checkout</Button>
                            </Link>
                            <Link href="/shop" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-2">← Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
