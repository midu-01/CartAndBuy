import { Head, Link, router } from '@inertiajs/react';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';
import Pagination from '@/components/shop/pagination';
import ProductCard from '@/components/shop/product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Category { id: number; name: string; slug: string; children: Category[] }
interface Product { id: number; name: string; slug: string; price: string; sale_price: string | null; images: string[] | null; is_featured: boolean; category?: { name: string } }
interface Paginated<T> { data: T[]; links: { url: string | null; label: string; active: boolean }[]; total: number; per_page: number; current_page: number }

interface Props {
    products: Paginated<Product>;
    categories: Category[];
    filters: { category?: string; search?: string; min_price?: string; max_price?: string; sort?: string };
}

const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A–Z' },
];

export default function ProductsPage({ products, categories, filters }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(filters.min_price ?? '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price ?? '');

    function applyFilter(overrides: Record<string, string | undefined>) {
        const params = { ...filters, ...overrides };
        Object.keys(params).forEach((k) => !params[k as keyof typeof params] && delete params[k as keyof typeof params]);
        router.get('/shop', params, { preserveScroll: true });
    }

    function clearAll() { router.get('/shop'); }

    const activeFiltersCount = [filters.category, filters.search, filters.min_price, filters.max_price].filter(Boolean).length;

    const Sidebar = () => (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <button
                    onClick={() => applyFilter({ category: undefined })}
                    className={cn('block w-full text-left py-1.5 px-3 rounded-lg text-sm transition-colors mb-1', !filters.category ? 'bg-[#1a1a2e] text-white' : 'hover:bg-gray-100 text-gray-700')}
                >
                    All Products
                </button>
                {categories.map((cat) => (
                    <div key={cat.id}>
                        <button
                            onClick={() => applyFilter({ category: cat.slug })}
                            className={cn('block w-full text-left py-1.5 px-3 rounded-lg text-sm transition-colors', filters.category === cat.slug ? 'bg-[#1a1a2e] text-white' : 'hover:bg-gray-100 text-gray-700')}
                        >
                            {cat.name}
                        </button>
                        {cat.children?.map((child) => (
                            <button
                                key={child.id}
                                onClick={() => applyFilter({ category: child.slug })}
                                className={cn('block w-full text-left py-1.5 pl-6 pr-3 rounded-lg text-sm transition-colors', filters.category === child.slug ? 'bg-[#e94560] text-white' : 'hover:bg-gray-100 text-gray-600')}
                            >
                                {child.name}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {/* Price */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                    <span className="text-gray-400">–</span>
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                </div>
                <Button size="sm" className="w-full mt-2 bg-[#1a1a2e] hover:bg-[#0f3460] border-0 text-white" onClick={() => applyFilter({ min_price: minPrice || undefined, max_price: maxPrice || undefined })}>
                    Apply
                </Button>
            </div>
        </div>
    );

    return (
        <ShopLayout>
            <Head title="Shop — CartAndBuy" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {filters.search ? `Results for "${filters.search}"` : filters.category ? categories.flatMap(c => [c, ...(c.children ?? [])]).find(c => c.slug === filters.category)?.name ?? 'Products' : 'All Products'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">{products.total} products found</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeFiltersCount > 0 && (
                            <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-[#e94560] hover:underline">
                                <X className="size-3" /> Clear filters
                            </button>
                        )}
                        <select
                            value={filters.sort ?? 'newest'}
                            onChange={(e) => applyFilter({ sort: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560] bg-white"
                        >
                            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                            <Filter className="size-4 mr-1" /> Filters {activeFiltersCount > 0 && <Badge className="ml-1 bg-[#e94560] border-0 text-white">{activeFiltersCount}</Badge>}
                        </Button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar desktop */}
                    <aside className="hidden lg:block w-56 shrink-0"><Sidebar /></aside>

                    {/* Mobile sidebar overlay */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                            <div className="absolute left-0 top-0 h-full w-72 bg-white p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold flex items-center gap-2"><SlidersHorizontal className="size-4" /> Filters</h2>
                                    <button onClick={() => setSidebarOpen(false)}><X className="size-5" /></button>
                                </div>
                                <Sidebar />
                            </div>
                        </div>
                    )}

                    {/* Products grid */}
                    <div className="flex-1 min-w-0">
                        {products.data.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <p className="text-lg font-medium">No products found</p>
                                <button onClick={clearAll} className="mt-2 text-sm text-[#e94560] hover:underline">Clear filters</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                        <Pagination links={products.links} />
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
