import { Head, router } from '@inertiajs/react';
import { Minus, Plus, Search, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Customer { id: number; name: string; email: string }
interface Product { id: number; name: string; price: string; stock_qty: number; sku: string | null }
interface Props { customers: Customer[]; products: Product[] }

interface LineItem { product: Product; quantity: number }

export default function AdminOrderCreatePage({ customers, products }: Props) {
    const [customerId, setCustomerId] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [lines, setLines] = useState<LineItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentStatus, setPaymentStatus] = useState('unpaid');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredProducts = useMemo(() => {
        if (!productSearch) return products.slice(0, 20);
        const q = productSearch.toLowerCase();
        return products.filter((p) => p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)).slice(0, 20);
    }, [productSearch, products]);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return customers.slice(0, 20);
        const q = customerSearch.toLowerCase();
        return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 20);
    }, [customerSearch, customers]);

    const selectedCustomer = customers.find((c) => String(c.id) === customerId);

    function addProduct(product: Product) {
        setLines((prev) => {
            const exists = prev.find((l) => l.product.id === product.id);
            if (exists) {
                return prev.map((l) => l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l);
            }
            return [...prev, { product, quantity: 1 }];
        });
        setProductSearch('');
    }

    function removeProduct(id: number) {
        setLines((prev) => prev.filter((l) => l.product.id !== id));
    }

    function changeQty(id: number, delta: number) {
        setLines((prev) =>
            prev.map((l) => l.product.id === id ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l)
        );
    }

    const subtotal = lines.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0);

    function submit() {
        const newErrors: Record<string, string> = {};
        if (!customerId) newErrors.customer = 'Select a customer.';
        if (lines.length === 0) newErrors.items = 'Add at least one product.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setSubmitting(true);
        router.post('/admin/orders/manual', {
            user_id: customerId,
            items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
            payment_method: paymentMethod,
            payment_status: paymentStatus,
            notes,
        }, {
            onError: (e) => { setErrors(e); setSubmitting(false); },
        });
    }

    return (
        <AdminLayout>
            <Head title="Create Manual Order — Admin" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Create Manual Order</h1>
                <p className="text-sm text-gray-500">Place an order on behalf of a customer</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left column – customer + products */}
                <div className="space-y-5 lg:col-span-2">

                    {/* Customer picker */}
                    <div className="rounded-xl border bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold text-gray-700">Customer</h2>
                        {selectedCustomer ? (
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                                <div>
                                    <div className="font-medium text-gray-900">{selectedCustomer.name}</div>
                                    <div className="text-xs text-gray-500">{selectedCustomer.email}</div>
                                </div>
                                <button onClick={() => setCustomerId('')} className="text-xs text-red-500 hover:underline">Remove</button>
                            </div>
                        ) : (
                            <div>
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                    <input
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        placeholder="Search customers…"
                                        className="w-full rounded-lg border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto rounded-lg border divide-y">
                                    {filteredCustomers.map((c) => (
                                        <button key={c.id} onClick={() => { setCustomerId(String(c.id)); setCustomerSearch(''); }} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                                            <span className="text-xs text-gray-400">{c.email}</span>
                                        </button>
                                    ))}
                                    {filteredCustomers.length === 0 && <div className="px-4 py-3 text-sm text-gray-400">No customers found</div>}
                                </div>
                                {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer}</p>}
                            </div>
                        )}
                    </div>

                    {/* Product search */}
                    <div className="rounded-xl border bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold text-gray-700">Add Products</h2>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder="Search products by name or SKU…"
                                className="w-full rounded-lg border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                            />
                        </div>
                        {productSearch && (
                            <div className="mb-4 max-h-52 overflow-y-auto rounded-lg border divide-y">
                                {filteredProducts.map((p) => (
                                    <button key={p.id} onClick={() => addProduct(p)} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">{p.name}</span>
                                            {p.sku && <span className="ml-2 text-xs text-gray-400 font-mono">{p.sku}</span>}
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-2">
                                            <span className="text-sm font-semibold text-gray-700">৳{Number(p.price).toFixed(2)}</span>
                                            <Plus className="size-4 text-[#e94560]" />
                                        </div>
                                    </button>
                                ))}
                                {filteredProducts.length === 0 && <div className="px-4 py-3 text-sm text-gray-400">No products found</div>}
                            </div>
                        )}
                        {errors.items && <p className="mb-2 text-xs text-red-500">{errors.items}</p>}

                        {/* Line items */}
                        {lines.length > 0 ? (
                            <div className="divide-y rounded-lg border">
                                {lines.map((line) => (
                                    <div key={line.product.id} className="flex items-center justify-between px-4 py-3">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{line.product.name}</div>
                                            <div className="text-xs text-gray-500">৳{Number(line.product.price).toFixed(2)} each</div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => changeQty(line.product.id, -1)} className="rounded-full border p-1 hover:bg-gray-100"><Minus className="size-3" /></button>
                                            <span className="w-8 text-center text-sm font-semibold">{line.quantity}</span>
                                            <button onClick={() => changeQty(line.product.id, 1)} className="rounded-full border p-1 hover:bg-gray-100"><Plus className="size-3" /></button>
                                            <span className="ml-2 w-20 text-right text-sm font-bold text-gray-800">৳{(Number(line.product.price) * line.quantity).toFixed(2)}</span>
                                            <button onClick={() => removeProduct(line.product.id)} className="ml-1 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="size-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={cn('flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 text-gray-400', errors.items && 'border-red-300')}>
                                <ShoppingBag className="size-8" />
                                <span className="text-sm">Search and add products above</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column – order details + summary */}
                <div className="space-y-5">
                    <div className="rounded-xl border bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold text-gray-700">Payment</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Method</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]">
                                    <option value="cash">Cash</option>
                                    <option value="cod">Cash on Delivery</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
                                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]">
                                    <option value="unpaid">Unpaid</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold text-gray-700">Notes</h2>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Admin notes (optional)" className="w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl border bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold text-gray-700">Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>৳{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>৳0.00</span>
                            </div>
                            <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold text-gray-900">
                                <span>Total</span>
                                <span>৳{subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button
                            onClick={submit}
                            disabled={submitting}
                            className="mt-4 w-full border-0 bg-[#e94560] text-white hover:bg-[#c73652]"
                        >
                            {submitting ? 'Creating…' : 'Create Order'}
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
