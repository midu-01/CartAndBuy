import { Head, useForm } from '@inertiajs/react';
import { CreditCard, DollarSign } from 'lucide-react';
import ShopLayout from '@/layouts/shop-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CartItem { id: number; quantity: number; price: string; product: { name: string; images: string[] | null } }
interface Cart { items: CartItem[] }
interface Props { cart: Cart }

export default function CheckoutPage({ cart }: Props) {
    const items = cart.items;
    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const shipping = subtotal >= 100 ? 0 : 9.99;

    const { data, setData, post, processing, errors } = useForm({
        first_name: '', last_name: '', email: '', phone: '',
        address: '', city: '', state: '', zip: '', country: 'US',
        payment_method: 'cod', coupon_code: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/orders');
    }

    const Field = ({ name, label, type = 'text', half = false }: { name: keyof typeof data; label: string; type?: string; half?: boolean }) => (
        <div className={cn(half ? 'col-span-1' : 'col-span-2')}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} value={data[name] as string} onChange={(e) => setData(name, e.target.value)}
                className={cn('w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]', errors[name] && 'border-red-400')} />
            {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
        </div>
    );

    return (
        <ShopLayout>
            <Head title="Checkout — CartAndBuy" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left — form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white border border-gray-100 rounded-xl p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field name="first_name" label="First Name" half />
                                    <Field name="last_name" label="Last Name" half />
                                    <Field name="email" label="Email" type="email" />
                                    <Field name="phone" label="Phone" />
                                    <Field name="address" label="Address" />
                                    <Field name="city" label="City" half />
                                    <Field name="state" label="State / Province" half />
                                    <Field name="zip" label="ZIP / Postal Code" half />
                                    <Field name="country" label="Country" half />
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    {([
                                        { value: 'cod', label: 'Cash on Delivery', icon: DollarSign, desc: 'Pay when your order arrives' },
                                        { value: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
                                    ] as const).map(({ value, label, icon: Icon, desc }) => (
                                        <label key={value} className={cn('flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors', data.payment_method === value ? 'border-[#e94560] bg-[#e94560]/5' : 'border-gray-200 hover:border-gray-300')}>
                                            <input type="radio" name="payment_method" value={value} checked={data.payment_method === value} onChange={() => setData('payment_method', value)} className="hidden" />
                                            <div className={cn('p-2 rounded-lg', data.payment_method === value ? 'bg-[#e94560] text-white' : 'bg-gray-100 text-gray-600')}>
                                                <Icon className="size-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{label}</div>
                                                <div className="text-xs text-gray-500">{desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right — summary */}
                        <div>
                            <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-24">
                                <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
                                <div className="space-y-3 mb-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <img src={item.product.images?.[0] ?? 'https://placehold.co/48x48/e2e8f0/64748b?text=?'} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
                                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t"><span>Total</span><span>${(subtotal + shipping).toFixed(2)}</span></div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                                    <input type="text" value={data.coupon_code} onChange={(e) => setData('coupon_code', e.target.value.toUpperCase())} placeholder="Optional" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                                </div>

                                <Button type="submit" disabled={processing} className="w-full mt-4 bg-[#e94560] hover:bg-[#c73652] border-0 text-white">
                                    {processing ? 'Placing Order…' : 'Place Order'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </ShopLayout>
    );
}
