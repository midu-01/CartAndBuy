import { Head, Link, router } from '@inertiajs/react';
import { ShoppingCart, X } from 'lucide-react';
import type React from 'react';
import ShopLayout from '@/layouts/shop-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    description: string | null;
    price: string;
    sale_price: string | null;
    stock_qty: number;
    images: string[] | null;
    tags: string[] | null;
    label: string | null;
    category: { name: string } | null;
    brand: { name: string } | null;
    variants: {
        id: number;
        stock_qty: number;
        attributes: Record<string, string>;
    }[];
}

interface Props {
    products: Product[];
}

export default function ComparePage({ products }: Props) {
    function removeProduct(product: Product) {
        const next = products
            .filter((item) => item.id !== product.id)
            .map((item) => item.id);
        localStorage.setItem('compareProducts', JSON.stringify(next));
        router.visit(
            next.length ? `/compare?products=${next.join(',')}` : '/compare',
        );
    }

    function addToCart(product: Product) {
        router.post(
            '/cart',
            { product_id: product.id, quantity: 1 },
            { preserveScroll: true },
        );
    }

    return (
        <ShopLayout>
            <Head title="Compare Products — CartAndBuy" />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Compare Products
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {products.length} selected
                        </p>
                    </div>
                    <Link href="/shop">
                        <Button
                            variant="outline"
                            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        >
                            Back to Shop
                        </Button>
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-lg font-medium text-gray-700">
                            No products selected
                        </p>
                        <Link
                            href="/shop"
                            className="mt-3 inline-block text-sm text-[#e94560] hover:underline"
                        >
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50 align-top">
                                    <th className="w-40 px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Product
                                    </th>
                                    {products.map((product) => (
                                        <th
                                            key={product.id}
                                            className="min-w-56 px-4 py-4 text-left"
                                        >
                                            <div className="relative space-y-3">
                                                <button
                                                    onClick={() =>
                                                        removeProduct(product)
                                                    }
                                                    className="absolute top-0 right-0 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                                <Link
                                                    href={`/products/${product.slug}`}
                                                >
                                                    <img
                                                        src={
                                                            product
                                                                .images?.[0] ??
                                                            'https://placehold.co/240x240/e2e8f0/64748b?text=No+Image'
                                                        }
                                                        alt={product.name}
                                                        className="aspect-square w-28 rounded-lg bg-gray-50 object-cover"
                                                    />
                                                </Link>
                                                <div className="pr-7">
                                                    <Link
                                                        href={`/products/${product.slug}`}
                                                        className="font-semibold text-gray-900 hover:text-[#e94560]"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {product.brand?.name ??
                                                            product.category
                                                                ?.name ??
                                                            'General'}
                                                    </p>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <CompareRow label="Price">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="font-bold text-[#e94560]"
                                        >
                                            ৳
                                            {Number(
                                                product.sale_price ??
                                                    product.price,
                                            ).toFixed(2)}
                                            {product.sale_price && (
                                                <span className="ml-2 text-xs font-normal text-gray-400 line-through">
                                                    ৳
                                                    {Number(
                                                        product.price,
                                                    ).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </CompareRow>
                                <CompareRow label="Stock">
                                    {products.map((product) => (
                                        <Badge
                                            key={product.id}
                                            className={`border-0 ${product.stock_qty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                        >
                                            {product.stock_qty > 0
                                                ? `${product.stock_qty} available`
                                                : 'Out of stock'}
                                        </Badge>
                                    ))}
                                </CompareRow>
                                <CompareRow label="SKU">
                                    {products.map((product) => (
                                        <span
                                            key={product.id}
                                            className="font-mono text-xs text-gray-600"
                                        >
                                            {product.sku ?? '-'}
                                        </span>
                                    ))}
                                </CompareRow>
                                <CompareRow label="Variants">
                                    {products.map((product) => (
                                        <span
                                            key={product.id}
                                            className="text-gray-700"
                                        >
                                            {product.variants.length
                                                ? `${product.variants.length} options`
                                                : '-'}
                                        </span>
                                    ))}
                                </CompareRow>
                                <CompareRow label="Tags">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex flex-wrap gap-1"
                                        >
                                            {product.tags?.length
                                                ? product.tags.map((tag) => (
                                                      <span
                                                          key={tag}
                                                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                                                      >
                                                          {tag}
                                                      </span>
                                                  ))
                                                : '-'}
                                        </div>
                                    ))}
                                </CompareRow>
                                <CompareRow label="Description">
                                    {products.map((product) => (
                                        <p
                                            key={product.id}
                                            className="line-clamp-4 text-gray-600"
                                        >
                                            {product.description ?? '-'}
                                        </p>
                                    ))}
                                </CompareRow>
                                <CompareRow label="Action">
                                    {products.map((product) => (
                                        <Button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            disabled={product.stock_qty === 0}
                                            className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]"
                                        >
                                            <ShoppingCart className="mr-1 size-4" />{' '}
                                            Add
                                        </Button>
                                    ))}
                                </CompareRow>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ShopLayout>
    );
}

function CompareRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode[];
}) {
    return (
        <tr className="align-top">
            <th className="bg-gray-50 px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                {label}
            </th>
            {children.map((child, index) => (
                <td key={index} className="px-4 py-4 text-gray-700">
                    {child}
                </td>
            ))}
        </tr>
    );
}
