import { Head, router } from '@inertiajs/react';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';
import Pagination from '@/components/shop/pagination';
import ProductCard from '@/components/shop/product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    slug: string;
    children: Category[];
}
interface BrandItem {
    id: number;
    name: string;
    slug: string;
}
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
    brand?: { name: string } | null;
}
interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    per_page: number;
    current_page: number;
}

interface Props {
    products: Paginated<Product>;
    categories: Category[];
    brands: BrandItem[];
    filters: {
        category?: string;
        brand?: string;
        label?: string;
        search?: string;
        min_price?: string;
        max_price?: string;
        sort?: string;
    };
}

const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A–Z' },
];

const labelOptions = [
    { value: 'new_arrival', label: '🆕 New Arrivals' },
    { value: 'best_seller', label: '🏆 Best Sellers' },
    { value: 'trending', label: '🔥 Trending' },
];

export default function ProductsPage({
    products,
    categories,
    brands,
    filters,
}: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(filters.min_price ?? '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price ?? '');

    function applyFilter(overrides: Record<string, string | undefined>) {
        const params = { ...filters, ...overrides };
        Object.keys(params).forEach(
            (k) =>
                !params[k as keyof typeof params] &&
                delete params[k as keyof typeof params],
        );
        router.get('/shop', params, { preserveScroll: true });
    }

    function clearAll() {
        router.get('/shop');
    }

    const activeFiltersCount = [
        filters.category,
        filters.search,
        filters.min_price,
        filters.max_price,
        filters.brand,
        filters.label,
    ].filter(Boolean).length;

    const Sidebar = () => (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <h3 className="mb-3 font-semibold text-gray-900">Categories</h3>
                <button
                    onClick={() => applyFilter({ category: undefined })}
                    className={cn(
                        'mb-1 block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                        !filters.category
                            ? 'bg-[#1a1a2e] text-white'
                            : 'text-gray-700 hover:bg-gray-100',
                    )}
                >
                    All Products
                </button>
                {categories.map((cat) => {
                    const hasChildren = cat.children.length > 0;
                    return (
                        <div key={cat.id}>
                            {hasChildren ? (
                                <button
                                    onClick={() =>
                                        applyFilter({ category: cat.slug })
                                    }
                                    className={cn(
                                        'block w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium transition-colors',
                                        filters.category === cat.slug
                                            ? 'bg-[#1a1a2e] text-white'
                                            : 'text-gray-700 hover:bg-gray-100',
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ) : (
                                <span className="block cursor-not-allowed px-3 py-1.5 text-sm font-medium text-gray-400">
                                    {cat.name}
                                </span>
                            )}
                            {cat.children?.map((child) => (
                                <button
                                    key={child.id}
                                    onClick={() =>
                                        applyFilter({ category: child.slug })
                                    }
                                    className={cn(
                                        'block w-full rounded-lg py-1.5 pr-3 pl-6 text-left text-sm transition-colors',
                                        filters.category === child.slug
                                            ? 'bg-[#e94560] text-white'
                                            : 'text-gray-600 hover:bg-gray-100',
                                    )}
                                >
                                    {child.name}
                                </button>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Brands */}
            {brands.length > 0 && (
                <div>
                    <h3 className="mb-3 font-semibold text-gray-900">Brands</h3>
                    <button
                        onClick={() => applyFilter({ brand: undefined })}
                        className={cn(
                            'mb-1 block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                            !filters.brand
                                ? 'bg-[#1a1a2e] text-white'
                                : 'text-gray-700 hover:bg-gray-100',
                        )}
                    >
                        All Brands
                    </button>
                    {brands.map((brand) => (
                        <button
                            key={brand.id}
                            onClick={() => applyFilter({ brand: brand.slug })}
                            className={cn(
                                'block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                                filters.brand === brand.slug
                                    ? 'bg-[#e94560] text-white'
                                    : 'text-gray-700 hover:bg-gray-100',
                            )}
                        >
                            {brand.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Labels */}
            <div>
                <h3 className="mb-3 font-semibold text-gray-900">Labels</h3>
                {labelOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() =>
                            applyFilter({
                                label:
                                    filters.label === opt.value
                                        ? undefined
                                        : opt.value,
                            })
                        }
                        className={cn(
                            'block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                            filters.label === opt.value
                                ? 'bg-[#e94560] text-white'
                                : 'text-gray-700 hover:bg-gray-100',
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Price */}
            <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                    Price Range
                </h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-full rounded-lg border px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-full rounded-lg border px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                    />
                </div>
                <Button
                    size="sm"
                    className="mt-2 w-full border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]"
                    onClick={() =>
                        applyFilter({
                            min_price: minPrice || undefined,
                            max_price: maxPrice || undefined,
                        })
                    }
                >
                    Apply
                </Button>
            </div>
        </div>
    );

    return (
        <ShopLayout>
            <Head title="Shop — CartAndBuy" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header row */}
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {filters.search
                                ? `Results for "${filters.search}"`
                                : filters.category
                                  ? (categories
                                        .flatMap((c) => [
                                            c,
                                            ...(c.children ?? []),
                                        ])
                                        .find(
                                            (c) => c.slug === filters.category,
                                        )?.name ?? 'Products')
                                  : 'All Products'}
                        </h1>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {products.total} products found
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-1.5 text-sm text-[#e94560] hover:underline"
                            >
                                <X className="size-3" /> Clear filters
                            </button>
                        )}
                        <select
                            value={filters.sort ?? 'newest'}
                            onChange={(e) =>
                                applyFilter({ sort: e.target.value })
                            }
                            className="rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                        >
                            {sortOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Filter className="mr-1 size-4" /> Filters{' '}
                            {activeFiltersCount > 0 && (
                                <Badge className="ml-1 border-0 bg-[#e94560] text-white">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar desktop */}
                    <aside className="hidden w-56 shrink-0 lg:block">
                        <Sidebar />
                    </aside>

                    {/* Mobile sidebar overlay */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div
                                className="absolute inset-0 bg-black/50"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <div className="absolute top-0 left-0 h-full w-72 overflow-y-auto bg-white p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="flex items-center gap-2 font-bold">
                                        <SlidersHorizontal className="size-4" />{' '}
                                        Filters
                                    </h2>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
                                <Sidebar />
                            </div>
                        </div>
                    )}

                    {/* Products grid */}
                    <div className="min-w-0 flex-1">
                        {products.data.length === 0 ? (
                            <div className="py-20 text-center text-gray-400">
                                <p className="text-lg font-medium">
                                    No products found
                                </p>
                                <button
                                    onClick={clearAll}
                                    className="mt-2 text-sm text-[#e94560] hover:underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
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
