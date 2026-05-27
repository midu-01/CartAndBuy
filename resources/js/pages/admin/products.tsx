import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/shop/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Category { id: number; name: string }
interface Product { id: number; name: string; price: string; sale_price: string | null; stock_qty: number; is_active: boolean; is_featured: boolean; category: Category | null; images: string[] | null }
interface Props { products: { data: Product[]; links: { url: string | null; label: string; active: boolean }[] }; categories: Category[]; filters: { search?: string; category_id?: string } }

type FormData = { name: string; description: string; price: string; sale_price: string; stock_qty: string; category_id: string; is_featured: boolean; is_active: boolean; images: File[] };

export default function AdminProductsPage({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editing, setEditing] = useState<Product | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormData>({ name: '', description: '', price: '', sale_price: '', stock_qty: '', category_id: '', is_featured: false, is_active: true, images: [] });

    function openCreate() { form.reset(); setPreviews([]); setEditing(null); setShowForm(true); }

    function openEdit(p: Product) {
        form.setData({ name: p.name, description: '', price: String(p.price), sale_price: String(p.sale_price ?? ''), stock_qty: String(p.stock_qty), category_id: String(p.category?.id ?? ''), is_featured: p.is_featured, is_active: p.is_active, images: [] });
        setPreviews([]);
        setEditing(p); setShowForm(true);
    }

    function handleFiles(files: FileList | null) {
        if (!files) return;
        const selected = Array.from(files);
        form.setData('images', selected);
        setPreviews(selected.map((f) => URL.createObjectURL(f)));
    }

    function removePreview(index: number) {
        const updated = form.data.images.filter((_, i) => i !== index);
        form.setData('images', updated);
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    }

    function submitForm(e: React.FormEvent) {
        e.preventDefault();
        if (editing) { form.patch(`/admin/products/${editing.id}`, { forceFormData: true, onSuccess: () => setShowForm(false) }); }
        else { form.post('/admin/products', { onSuccess: () => setShowForm(false) }); }
    }

    function destroy(p: Product) {
        if (confirm(`Delete "${p.name}"?`)) router.delete(`/admin/products/${p.id}`, { preserveScroll: true });
    }

    function doSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/products', { search: search || undefined }, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Products — Admin" />

            <div className="flex items-center justify-between mb-6">
                <form onSubmit={doSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] w-64" />
                    </div>
                    <Button type="submit" variant="outline" size="sm">Search</Button>
                </form>
                <Button onClick={openCreate} className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white"><Plus className="size-4 mr-1" /> Add Product</Button>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-right">Price</th>
                                <th className="px-4 py-3 text-center">Stock</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-900">
                            {products.data.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={p.images?.[0] ?? 'https://placehold.co/40x40/e2e8f0/64748b?text=?'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            <div>
                                                <div className="font-medium text-gray-900">{p.name}</div>
                                                {p.is_featured && <Badge className="bg-[#0f3460] text-white border-0 text-xs">Featured</Badge>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        {p.sale_price ? (
                                            <div><span className="font-bold text-[#e94560]">৳{Number(p.sale_price).toFixed(2)}</span><span className="text-xs text-gray-400 line-through ml-1">৳{Number(p.price).toFixed(2)}</span></div>
                                        ) : (
                                            <span className="font-bold text-gray-900">৳{Number(p.price).toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={`border-0 ${p.stock_qty === 0 ? 'bg-red-100 text-red-700' : p.stock_qty < 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{p.stock_qty}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={`border-0 ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-[#1a1a2e]"><Edit2 className="size-4" /></button>
                                            <button onClick={() => destroy(p)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="size-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No products found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={products.links} />

            {/* Product form dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg bg-white text-gray-900 max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
                    <form onSubmit={submitForm} className="space-y-4 mt-2">
                        {(['name', 'description', 'price', 'sale_price', 'stock_qty'] as const).map((f) => (
                            <div key={f}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{f.replace('_', ' ')}</label>
                                {f === 'description' ? (
                                    <textarea value={form.data[f]} onChange={(e) => form.setData(f, e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                                ) : (
                                    <input type={['price', 'sale_price', 'stock_qty'].includes(f) ? 'number' : 'text'} value={form.data[f]} onChange={(e) => form.setData(f, e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                                )}
                                {form.errors[f] && <p className="text-xs text-red-500 mt-1">{form.errors[f]}</p>}
                            </div>
                        ))}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select value={form.data.category_id} onChange={(e) => form.setData('category_id', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                                <option value="">— None —</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        {/* Image upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Images
                            </label>
                            {editing && editing.images && editing.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {editing.images.map((src, i) => (
                                        <img key={i} src={src} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                                    ))}
                                    <p className="w-full text-xs text-gray-400">New uploads will be added to existing images.</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFiles(e.target.files)}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-400 hover:border-[#e94560] hover:text-[#e94560] transition-colors"
                            >
                                <ImagePlus className="size-5" />
                                <span className="text-xs">Click to select images</span>
                            </button>
                            {previews.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {previews.map((src, i) => (
                                        <div key={i} className="relative">
                                            <img src={src} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                                            <button
                                                type="button"
                                                onClick={() => removePreview(i)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full size-4 flex items-center justify-center"
                                            >
                                                <X className="size-2.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {form.errors.images && <p className="text-xs text-red-500 mt-1">{form.errors.images}</p>}
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.data.is_featured} onChange={(e) => form.setData('is_featured', e.target.checked)} />
                                Featured
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                                Active
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">Cancel</Button>
                            <Button type="submit" disabled={form.processing} className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white">{editing ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
