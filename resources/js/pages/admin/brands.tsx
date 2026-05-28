import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/shop/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    products_count: number;
}

interface Props {
    brands: { data: Brand[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { search?: string };
}

export default function AdminBrandsPage({ brands, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editing, setEditing] = useState<Brand | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm<{ name: string; logo: File | null }>({ name: '', logo: null });

    function openCreate() {
        form.reset();
        setLogoPreview(null);
        setEditing(null);
        setShowForm(true);
    }

    function openEdit(brand: Brand) {
        form.setData({ name: brand.name, logo: null });
        setLogoPreview(brand.logo);
        setEditing(brand);
        setShowForm(true);
    }

    function handleLogo(files: FileList | null) {
        if (!files?.[0]) return;
        form.setData('logo', files[0]);
        setLogoPreview(URL.createObjectURL(files[0]));
    }

    function submitForm(e: React.FormEvent) {
        e.preventDefault();
        if (editing) {
            form.patch(`/admin/brands/${editing.id}`, { forceFormData: true, onSuccess: () => setShowForm(false) });
        } else {
            form.post('/admin/brands', { onSuccess: () => setShowForm(false) });
        }
    }

    function destroy(brand: Brand) {
        if (confirm(`Delete "${brand.name}"? Products will be unlinked.`)) {
            router.delete(`/admin/brands/${brand.id}`, { preserveScroll: true });
        }
    }

    function doSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            router.get('/admin/brands', { search: search || undefined }, { preserveScroll: true });
        }
    }

    return (
        <AdminLayout>
            <Head title="Brands — Admin" />

            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={doSearch}
                        placeholder="Search brands…"
                        className="w-full border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white text-gray-900"
                    />
                </div>
                <Button onClick={openCreate} className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white shrink-0">
                    <Plus className="size-4 mr-1" /> Add Brand
                </Button>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Brand</th>
                                <th className="px-4 py-3 text-center">Products</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-900">
                            {brands.data.map((brand) => (
                                <tr key={brand.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {brand.logo ? (
                                                <img
                                                    src={`/storage/${brand.logo}`}
                                                    alt=""
                                                    className="w-10 h-10 rounded-lg object-contain bg-gray-50 border"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] flex items-center justify-center text-white text-xs font-bold">
                                                    {brand.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">{brand.name}</div>
                                                <div className="text-xs text-gray-400">{brand.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                            {brand.products_count}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEdit(brand)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-[#1a1a2e]">
                                                <Edit2 className="size-4" />
                                            </button>
                                            <button onClick={() => destroy(brand)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {brands.data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-10 text-center text-gray-400">
                                        No brands found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={brands.links} />

            {/* Brand form dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-sm bg-white text-gray-900">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitForm} className="space-y-4 mt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white text-gray-900"
                            />
                            {form.errors.name && <p className="text-xs text-red-500 mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files)} />
                            {logoPreview && (
                                <div className="relative w-20 h-20 mb-2">
                                    <img src={logoPreview} alt="" className="w-full h-full rounded-lg object-contain border" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLogoPreview(null);
                                            form.setData('logo', null);
                                        }}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full size-4 flex items-center justify-center"
                                    >
                                        <X className="size-2.5" />
                                    </button>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-400 hover:border-[#e94560] hover:text-[#e94560] transition-colors"
                            >
                                <ImagePlus className="size-5" />
                                <span className="text-xs">Upload logo</span>
                            </button>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing} className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white">
                                {editing ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
