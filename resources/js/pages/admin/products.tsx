import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Copy,
    Download,
    Edit2,
    ImagePlus,
    Plus,
    Search,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/shop/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Category {
    id: number;
    name: string;
}
interface Brand {
    id: number;
    name: string;
}
interface Product {
    id: number;
    name: string;
    sku: string | null;
    price: string;
    sale_price: string | null;
    stock_qty: number;
    is_active: boolean;
    is_featured: boolean;
    status: string;
    label: string | null;
    tags: string[] | null;
    category: Category | null;
    brand: Brand | null;
    images: string[] | null;
    low_stock_threshold: number;
    variants: Variant[];
}
interface Variant {
    id?: number;
    sku: string | null;
    attributes: Record<string, string>;
    price_modifier: string | number;
    stock_qty: number;
    images: string[] | null;
    is_active: boolean;
}
interface Props {
    products: {
        data: Product[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: Category[];
    brands: Brand[];
    filters: {
        search?: string;
        category_id?: string;
        brand_id?: string;
        status?: string;
        label?: string;
    };
    lowStockCount: number;
}

type FormData = {
    name: string;
    sku: string;
    description: string;
    price: string;
    sale_price: string;
    stock_qty: string;
    category_id: string;
    brand_id: string;
    is_featured: boolean;
    is_active: boolean;
    status: string;
    publish_at: string;
    label: string;
    video_url: string;
    size_chart: string;
    faqs: string;
    low_stock_threshold: string;
    tags: string;
    variants: string;
    images: File[];
};

const labelMap: Record<string, { text: string; className: string }> = {
    new_arrival: {
        text: 'New Arrival',
        className: 'bg-emerald-100 text-emerald-700',
    },
    best_seller: {
        text: 'Best Seller',
        className: 'bg-amber-100 text-amber-700',
    },
    trending: { text: 'Trending', className: 'bg-purple-100 text-purple-700' },
};

const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-gray-200 text-gray-600',
    scheduled: 'bg-blue-100 text-blue-700',
};

const emptyForm: FormData = {
    name: '',
    sku: '',
    description: '',
    price: '',
    sale_price: '',
    stock_qty: '',
    category_id: '',
    brand_id: '',
    is_featured: false,
    is_active: true,
    status: 'published',
    publish_at: '',
    label: '',
    video_url: '',
    size_chart: '',
    faqs: '',
    low_stock_threshold: '5',
    tags: '',
    variants: '',
    images: [],
};

export default function AdminProductsPage({
    products,
    categories,
    brands,
    filters,
    lowStockCount,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editing, setEditing] = useState<Product | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'advanced'>(
        'basic',
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormData>(emptyForm);

    function openCreate() {
        form.setData(emptyForm);
        setPreviews([]);
        setEditing(null);
        setActiveTab('basic');
        setShowForm(true);
    }

    function openEdit(p: Product) {
        form.setData({
            name: p.name,
            sku: p.sku ?? '',
            description: '',
            price: String(p.price),
            sale_price: String(p.sale_price ?? ''),
            stock_qty: String(p.stock_qty),
            category_id: String(p.category?.id ?? ''),
            brand_id: String(p.brand?.id ?? ''),
            is_featured: p.is_featured,
            is_active: p.is_active,
            status: p.status,
            publish_at: '',
            label: p.label ?? '',
            video_url: '',
            size_chart: '',
            faqs: '',
            low_stock_threshold: String(p.low_stock_threshold),
            tags: p.tags?.join(', ') ?? '',
            variants: p.variants?.length
                ? JSON.stringify(
                      p.variants.map((variant) => ({
                          id: variant.id,
                          sku: variant.sku,
                          attributes: variant.attributes,
                          price_modifier: variant.price_modifier,
                          stock_qty: variant.stock_qty,
                          images: variant.images,
                          is_active: variant.is_active,
                      })),
                      null,
                      2,
                  )
                : '',
            images: [],
        });
        setPreviews([]);
        setEditing(p);
        setActiveTab('basic');
        setShowForm(true);
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
        if (editing) {
            form.patch(`/admin/products/${editing.id}`, {
                forceFormData: true,
                onSuccess: () => setShowForm(false),
            });
        } else {
            form.post('/admin/products', {
                onSuccess: () => setShowForm(false),
            });
        }
    }

    function duplicateProduct(p: Product) {
        if (confirm(`Duplicate "${p.name}"?`)) {
            router.post(
                `/admin/products/${p.id}/duplicate`,
                {},
                { preserveScroll: true },
            );
        }
    }

    function destroy(p: Product) {
        if (confirm(`Delete "${p.name}"?`))
            router.delete(`/admin/products/${p.id}`, { preserveScroll: true });
    }

    function doSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            router.get(
                '/admin/products',
                { search: search || undefined },
                { preserveScroll: true },
            );
        }
    }

    function applyFilter(key: string, value: string) {
        router.get(
            '/admin/products',
            { ...filters, [key]: value || undefined },
            { preserveScroll: true },
        );
    }

    function importProducts(file: File | null) {
        if (!file) return;
        router.post(
            '/admin/products/import',
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => {
                    if (importInputRef.current) {
                        importInputRef.current.value = '';
                    }
                },
            },
        );
    }

    const tabs = [
        { key: 'basic' as const, label: 'Basic Info' },
        { key: 'media' as const, label: 'Media' },
        { key: 'advanced' as const, label: 'Advanced' },
    ];

    return (
        <AdminLayout>
            <Head title="Products — Admin" />

            {/* Low stock alert */}
            {lowStockCount > 0 && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                    <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                    <span>
                        <strong>{lowStockCount}</strong> product
                        {lowStockCount > 1 ? 's are' : ' is'} running low on
                        stock.
                    </span>
                    <button
                        onClick={() => applyFilter('status', '')}
                        className="ml-auto text-xs font-medium text-amber-600 underline hover:text-amber-800"
                    >
                        View all
                    </button>
                </div>
            )}

            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={doSearch}
                        placeholder="Search products…"
                        className="w-full rounded-lg border bg-white py-2 pr-4 pl-9 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                    />
                </div>
                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilter('status', e.target.value)}
                    className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
                >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                </select>
                <select
                    value={filters.brand_id ?? ''}
                    onChange={(e) => applyFilter('brand_id', e.target.value)}
                    className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
                >
                    <option value="">All Brands</option>
                    {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
                <select
                    value={filters.label ?? ''}
                    onChange={(e) => applyFilter('label', e.target.value)}
                    className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
                >
                    <option value="">All Labels</option>
                    <option value="new_arrival">New Arrival</option>
                    <option value="best_seller">Best Seller</option>
                    <option value="trending">Trending</option>
                </select>
                <Button
                    onClick={openCreate}
                    className="shrink-0 border-0 bg-[#e94560] text-white hover:bg-[#c73652]"
                >
                    <Plus className="mr-1 size-4" /> Add Product
                </Button>
                <input
                    ref={importInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) =>
                        importProducts(e.target.files?.[0] ?? null)
                    }
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => importInputRef.current?.click()}
                    className="shrink-0 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                    <Upload className="mr-1 size-4" /> Import
                </Button>
                <a href="/admin/products/export">
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                        <Download className="mr-1 size-4" /> Export
                    </Button>
                </a>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Product</th>
                                <th className="px-4 py-3 text-left">SKU</th>
                                <th className="px-4 py-3 text-left">Brand</th>
                                <th className="px-4 py-3 text-right">Price</th>
                                <th className="px-4 py-3 text-center">Stock</th>
                                <th className="px-4 py-3 text-center">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-center">Label</th>
                                <th className="px-4 py-3 text-center">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-900">
                            {products.data.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    p.images?.[0] ??
                                                    'https://placehold.co/40x40/e2e8f0/64748b?text=?'
                                                }
                                                alt=""
                                                className="h-10 w-10 rounded-lg bg-gray-100 object-cover"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {p.name}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {p.category?.name ?? '—'}
                                                    {p.variants?.length
                                                        ? ` · ${p.variants.length} variants`
                                                        : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                        {p.sku ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {p.brand?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {p.sale_price ? (
                                            <div>
                                                <span className="font-bold text-[#e94560]">
                                                    ৳
                                                    {Number(
                                                        p.sale_price,
                                                    ).toFixed(2)}
                                                </span>
                                                <span className="ml-1 text-xs text-gray-400 line-through">
                                                    ৳
                                                    {Number(p.price).toFixed(2)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-bold text-gray-900">
                                                ৳{Number(p.price).toFixed(2)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge
                                            className={`border-0 ${p.stock_qty === 0 ? 'bg-red-100 text-red-700' : p.stock_qty <= p.low_stock_threshold ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}
                                        >
                                            {p.stock_qty === 0
                                                ? 'Out'
                                                : p.stock_qty <=
                                                    p.low_stock_threshold
                                                  ? `Low (${p.stock_qty})`
                                                  : p.stock_qty}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge
                                            className={`border-0 capitalize ${statusColors[p.status] ?? 'bg-gray-100 text-gray-600'}`}
                                        >
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {p.label ? (
                                            <Badge
                                                className={`border-0 ${labelMap[p.label]?.className ?? 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {labelMap[p.label]?.text ??
                                                    p.label}
                                            </Badge>
                                        ) : (
                                            <span className="text-gray-300">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#1a1a2e]"
                                                title="Edit"
                                            >
                                                <Edit2 className="size-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    duplicateProduct(p)
                                                }
                                                className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                                                title="Duplicate"
                                            >
                                                <Copy className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => destroy(p)}
                                                className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-10 text-center text-gray-400"
                                    >
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={products.links} />

            {/* Product form dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white text-gray-900">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Product' : 'Add Product'}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Tabs */}
                    <div className="mb-4 flex gap-1 border-b">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === t.key ? 'border-[#e94560] text-[#e94560]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={submitForm} className="space-y-4">
                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) =>
                                                form.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                        />
                                        {form.errors.name && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {form.errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            SKU
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.sku}
                                            onChange={(e) =>
                                                form.setData(
                                                    'sku',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. PRD-001"
                                            className="w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Category
                                        </label>
                                        <select
                                            value={form.data.category_id}
                                            onChange={(e) =>
                                                form.setData(
                                                    'category_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
                                        >
                                            <option value="">— None —</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Brand
                                        </label>
                                        <select
                                            value={form.data.brand_id}
                                            onChange={(e) =>
                                                form.setData(
                                                    'brand_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
                                        >
                                            <option value="">— None —</option>
                                            {brands.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Price *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.price}
                                            onChange={(e) =>
                                                form.setData(
                                                    'price',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                        />
                                        {form.errors.price && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {form.errors.price}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Sale Price
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.data.sale_price}
                                            onChange={(e) =>
                                                form.setData(
                                                    'sale_price',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Stock Qty *
                                        </label>
                                        <input
                                            type="number"
                                            value={form.data.stock_qty}
                                            onChange={(e) =>
                                                form.setData(
                                                    'stock_qty',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                        />
                                        {form.errors.stock_qty && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {form.errors.stock_qty}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Low Stock Alert
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                form.data.low_stock_threshold
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'low_stock_threshold',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Tags{' '}
                                        <span className="text-xs text-gray-400">
                                            (comma-separated)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.tags}
                                        onChange={(e) =>
                                            form.setData('tags', e.target.value)
                                        }
                                        placeholder="wireless, bluetooth, portable"
                                        className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            value={form.data.status}
                                            onChange={(e) =>
                                                form.setData(
                                                    'status',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
                                        >
                                            <option value="published">
                                                Published
                                            </option>
                                            <option value="draft">Draft</option>
                                            <option value="scheduled">
                                                Scheduled
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Label
                                        </label>
                                        <select
                                            value={form.data.label}
                                            onChange={(e) =>
                                                form.setData(
                                                    'label',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
                                        >
                                            <option value="">— None —</option>
                                            <option value="new_arrival">
                                                New Arrival
                                            </option>
                                            <option value="best_seller">
                                                Best Seller
                                            </option>
                                            <option value="trending">
                                                Trending
                                            </option>
                                        </select>
                                    </div>
                                    {form.data.status === 'scheduled' && (
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Publish At
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={form.data.publish_at}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'publish_at',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_featured}
                                            onChange={(e) =>
                                                form.setData(
                                                    'is_featured',
                                                    e.target.checked,
                                                )
                                            }
                                        />{' '}
                                        Featured
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.data.is_active}
                                            onChange={(e) =>
                                                form.setData(
                                                    'is_active',
                                                    e.target.checked,
                                                )
                                            }
                                        />{' '}
                                        Active
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Media Tab */}
                        {activeTab === 'media' && (
                            <>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Product Images
                                    </label>
                                    {editing &&
                                        editing.images &&
                                        editing.images.length > 0 && (
                                            <div className="mb-2 flex flex-wrap gap-2">
                                                {editing.images.map(
                                                    (src, i) => (
                                                        <img
                                                            key={i}
                                                            src={src}
                                                            alt=""
                                                            className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                                                        />
                                                    ),
                                                )}
                                                <p className="w-full text-xs text-gray-400">
                                                    New uploads will be added to
                                                    existing images.
                                                </p>
                                            </div>
                                        )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                            handleFiles(e.target.files)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 py-6 text-gray-400 transition-colors hover:border-[#e94560] hover:text-[#e94560]"
                                    >
                                        <ImagePlus className="size-6" />
                                        <span className="text-xs">
                                            Click to select images
                                        </span>
                                    </button>
                                    {previews.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {previews.map((src, i) => (
                                                <div
                                                    key={i}
                                                    className="relative"
                                                >
                                                    <img
                                                        src={src}
                                                        alt=""
                                                        className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removePreview(i)
                                                        }
                                                        className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"
                                                    >
                                                        <X className="size-2.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Video URL{' '}
                                        <span className="text-xs text-gray-400">
                                            (YouTube/Vimeo)
                                        </span>
                                    </label>
                                    <input
                                        type="url"
                                        value={form.data.video_url}
                                        onChange={(e) =>
                                            form.setData(
                                                'video_url',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                    />
                                </div>
                            </>
                        )}

                        {/* Advanced Tab */}
                        {activeTab === 'advanced' && (
                            <>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Size Chart{' '}
                                        <span className="text-xs text-gray-400">
                                            (JSON array)
                                        </span>
                                    </label>
                                    <textarea
                                        value={form.data.size_chart}
                                        onChange={(e) =>
                                            form.setData(
                                                'size_chart',
                                                e.target.value,
                                            )
                                        }
                                        rows={4}
                                        placeholder='[{"size":"S","chest":"34","waist":"28"},{"size":"M","chest":"38","waist":"32"}]'
                                        className="w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                    />
                                    {form.errors.size_chart && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.size_chart}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        FAQs{' '}
                                        <span className="text-xs text-gray-400">
                                            (JSON array)
                                        </span>
                                    </label>
                                    <textarea
                                        value={form.data.faqs}
                                        onChange={(e) =>
                                            form.setData('faqs', e.target.value)
                                        }
                                        rows={4}
                                        placeholder='[{"question":"What is the return policy?","answer":"7-day easy return."}]'
                                        className="w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                    />
                                    {form.errors.faqs && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.faqs}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Variants{' '}
                                        <span className="text-xs text-gray-400">
                                            (JSON array)
                                        </span>
                                    </label>
                                    <textarea
                                        value={form.data.variants}
                                        onChange={(e) =>
                                            form.setData(
                                                'variants',
                                                e.target.value,
                                            )
                                        }
                                        rows={7}
                                        placeholder='[{"sku":"TSHIRT-RED-M","attributes":{"color":"Red","size":"M"},"price_modifier":0,"stock_qty":12,"is_active":true}]'
                                        className="w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                    />
                                    {form.errors.variants && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.variants}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-2 border-t pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowForm(false)}
                                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]"
                            >
                                {editing ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
