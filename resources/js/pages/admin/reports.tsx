import { Head, router } from '@inertiajs/react';
import { Download, TrendingUp, Package, FolderOpen, Users, Tag, UserCheck, ShoppingCart, BarChart2, AlertTriangle, DollarSign, Receipt } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ── Type definitions ────────────────────────────────────────────────────────

interface SalesRow { date: string; orders: number; revenue: string; discounts: string }
interface ProductRow { id: number; name: string; qty_sold: number; revenue: string }
interface CategoryRow { category: string | null; qty_sold: number; revenue: string }
interface CustomerRow { id: number; name: string; email: string; order_count: number; revenue: string }
interface CouponRow { coupon_code: string; type: string; value: string; usage_count: number; total_discount: string; revenue: string; max_uses: number | null }
interface ClvRow { id: number; name: string; email: string; order_count: number; lifetime_value: string; avg_order_value: string; created_at: string }
interface AbandonedRow { cart_id: number; user_name: string | null; user_email: string | null; session_id: string | null; item_count: number; cart_value: string; updated_at: string }
interface InventoryRow { id: number; name: string; sku: string | null; category: string | null; brand: string | null; stock_qty: number; threshold: number; is_low: boolean; price: string; cost_price: string | null; status: string }
interface ProfitRow { id: number; name: string; qty_sold: number; revenue: string; cost: string; profit: string; margin: number }
interface TaxRow { date: string; orders: number; tax_collected: string; revenue: string }

interface Summary { [key: string]: number | string }

interface Props {
    tab: string;
    from: string;
    to: string;
    // each tab provides different data keys
    sales?: SalesRow[];
    summary?: Summary;
    products?: ProductRow[];
    categories?: CategoryRow[];
    customers?: CustomerRow[];
    coupons?: CouponRow[];
    clv?: ClvRow[];
    abandoned?: AbandonedRow[];
    abandoned_summary?: { count: number; total_value: string };
    inventory?: InventoryRow[];
    inventory_summary?: { total_products: number; low_stock: number; out_of_stock: number };
    profit?: ProfitRow[];
    profit_summary?: { total_revenue: string; total_cost: string; total_profit: string; avg_margin: number };
    tax?: TaxRow[];
    tax_summary?: { total_tax: string; total_revenue: string; total_orders: number };
}

const TABS = [
    { key: 'sales',     label: 'Sales by Date',    icon: TrendingUp,   dateRange: true },
    { key: 'product',   label: 'By Product',        icon: Package,      dateRange: true },
    { key: 'category',  label: 'By Category',       icon: FolderOpen,   dateRange: true },
    { key: 'customer',  label: 'By Customer',       icon: Users,        dateRange: true },
    { key: 'coupon',    label: 'Coupon Performance', icon: Tag,         dateRange: true },
    { key: 'clv',       label: 'Customer LTV',      icon: UserCheck,    dateRange: false },
    { key: 'abandoned', label: 'Abandoned Carts',   icon: ShoppingCart, dateRange: false },
    { key: 'inventory', label: 'Inventory',         icon: BarChart2,    dateRange: false },
    { key: 'profit',    label: 'Profit / Margin',   icon: DollarSign,   dateRange: true },
    { key: 'tax',       label: 'Tax',               icon: Receipt,      dateRange: true },
];

function fmt(n: number | string) { return '৳' + Number(n).toFixed(2); }

export default function AdminReportsPage(props: Props) {
    const { tab, from, to } = props;
    const [localFrom, setLocalFrom] = useState(from);
    const [localTo, setLocalTo] = useState(to);

    const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

    function navigate(newTab: string, newFrom = localFrom, newTo = localTo) {
        router.get('/admin/reports', { tab: newTab, from: newFrom, to: newTo }, { preserveScroll: false });
    }

    function applyDates() {
        navigate(tab, localFrom, localTo);
    }

    function exportCsv() {
        const params = new URLSearchParams({ tab, from, to });
        window.location.href = `/admin/reports/export?${params}`;
    }

    return (
        <AdminLayout>
            <Head title="Reports — Admin" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-sm text-gray-500">Analytics and performance data</p>
                </div>
                <Button onClick={exportCsv} variant="outline" className="gap-1.5 bg-white text-gray-700 border-gray-300">
                    <Download className="size-4" /> Export CSV
                </Button>
            </div>

            {/* Tab bar */}
            <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => navigate(key)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                            tab === key ? 'bg-white text-[#1a1a2e] shadow-sm' : 'text-gray-500 hover:text-gray-700',
                        )}
                    >
                        <Icon className="size-3.5" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Date range (only for tabs that use it) */}
            {activeTab.dateRange && (
                <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl bg-white border px-4 py-3">
                    <label className="text-sm font-medium text-gray-700">Date range:</label>
                    <input
                        type="date"
                        value={localFrom}
                        onChange={(e) => setLocalFrom(e.target.value)}
                        className="rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                    />
                    <span className="text-gray-400">→</span>
                    <input
                        type="date"
                        value={localTo}
                        onChange={(e) => setLocalTo(e.target.value)}
                        className="rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                    />
                    <Button onClick={applyDates} size="sm" className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]">Apply</Button>
                </div>
            )}

            {/* ── Sales by Date ── */}
            {tab === 'sales' && props.sales && (
                <>
                    {props.summary && (
                        <div className="mb-4 grid grid-cols-3 gap-4">
                            <SummaryCard label="Total Orders" value={String(props.summary.total_orders)} />
                            <SummaryCard label="Total Revenue" value={fmt(props.summary.total_revenue)} highlight />
                            <SummaryCard label="Total Discounts" value={fmt(props.summary.total_discount)} />
                        </div>
                    )}
                    <Table headers={['Date', 'Orders', 'Revenue', 'Discounts']}>
                        {props.sales.map((r) => (
                            <tr key={r.date} className="hover:bg-gray-50">
                                <Td>{r.date}</Td>
                                <Td>{r.orders}</Td>
                                <Td>{fmt(r.revenue)}</Td>
                                <Td>{fmt(r.discounts)}</Td>
                            </tr>
                        ))}
                        {props.sales.length === 0 && <EmptyRow cols={4} />}
                    </Table>
                </>
            )}

            {/* ── By Product ── */}
            {tab === 'product' && props.products && (
                <Table headers={['Product', 'Qty Sold', 'Revenue']}>
                    {props.products.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                            <Td>{r.name}</Td>
                            <Td>{r.qty_sold}</Td>
                            <Td>{fmt(r.revenue)}</Td>
                        </tr>
                    ))}
                    {props.products.length === 0 && <EmptyRow cols={3} />}
                </Table>
            )}

            {/* ── By Category ── */}
            {tab === 'category' && props.categories && (
                <Table headers={['Category', 'Qty Sold', 'Revenue']}>
                    {props.categories.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <Td>{r.category ?? 'Uncategorised'}</Td>
                            <Td>{r.qty_sold}</Td>
                            <Td>{fmt(r.revenue)}</Td>
                        </tr>
                    ))}
                    {props.categories.length === 0 && <EmptyRow cols={3} />}
                </Table>
            )}

            {/* ── By Customer ── */}
            {tab === 'customer' && props.customers && (
                <Table headers={['Name', 'Email', 'Orders', 'Revenue']}>
                    {props.customers.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                            <Td>{r.name}</Td>
                            <Td className="text-gray-500">{r.email}</Td>
                            <Td>{r.order_count}</Td>
                            <Td>{fmt(r.revenue)}</Td>
                        </tr>
                    ))}
                    {props.customers.length === 0 && <EmptyRow cols={4} />}
                </Table>
            )}

            {/* ── Coupon Performance ── */}
            {tab === 'coupon' && props.coupons && (
                <Table headers={['Code', 'Type', 'Value', 'Uses', 'Total Discount', 'Revenue']}>
                    {props.coupons.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <Td><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{r.coupon_code}</span></Td>
                            <Td><Badge className="border-0 text-xs bg-gray-100 text-gray-700 capitalize">{r.type}</Badge></Td>
                            <Td>{r.type === 'percent' ? `${r.value}%` : fmt(r.value)}</Td>
                            <Td>{r.usage_count}{r.max_uses ? `/${r.max_uses}` : ''}</Td>
                            <Td>{fmt(r.total_discount)}</Td>
                            <Td>{fmt(r.revenue)}</Td>
                        </tr>
                    ))}
                    {props.coupons.length === 0 && <EmptyRow cols={6} />}
                </Table>
            )}

            {/* ── Customer LTV ── */}
            {tab === 'clv' && props.clv && (
                <Table headers={['Name', 'Email', 'Orders', 'Lifetime Value', 'Avg Order', 'Joined']}>
                    {props.clv.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                            <Td>{r.name}</Td>
                            <Td className="text-gray-500">{r.email}</Td>
                            <Td>{r.order_count}</Td>
                            <Td className="font-semibold">{fmt(r.lifetime_value)}</Td>
                            <Td>{fmt(r.avg_order_value)}</Td>
                            <Td className="text-gray-500">{new Date(r.created_at).toLocaleDateString()}</Td>
                        </tr>
                    ))}
                    {props.clv.length === 0 && <EmptyRow cols={6} />}
                </Table>
            )}

            {/* ── Abandoned Carts ── */}
            {tab === 'abandoned' && props.abandoned && (
                <>
                    {props.abandoned_summary && (
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <SummaryCard label="Abandoned Carts" value={String(props.abandoned_summary.count)} />
                            <SummaryCard label="Total Value" value={fmt(props.abandoned_summary.total_value)} highlight />
                        </div>
                    )}
                    <Table headers={['Cart ID', 'Customer', 'Items', 'Value', 'Last Updated']}>
                        {props.abandoned.map((r) => (
                            <tr key={r.cart_id} className="hover:bg-gray-50">
                                <Td>#{r.cart_id}</Td>
                                <Td>
                                    <div className="font-medium">{r.user_name ?? 'Guest'}</div>
                                    <div className="text-xs text-gray-400">{r.user_email ?? r.session_id}</div>
                                </Td>
                                <Td>{r.item_count}</Td>
                                <Td className="font-semibold">{fmt(r.cart_value)}</Td>
                                <Td className="text-gray-500">{new Date(r.updated_at).toLocaleString()}</Td>
                            </tr>
                        ))}
                        {props.abandoned.length === 0 && <EmptyRow cols={5} />}
                    </Table>
                </>
            )}

            {/* ── Inventory ── */}
            {tab === 'inventory' && props.inventory && (
                <>
                    {props.inventory_summary && (
                        <div className="mb-4 grid grid-cols-3 gap-4">
                            <SummaryCard label="Total Products" value={String(props.inventory_summary.total_products)} />
                            <SummaryCard label="Low Stock" value={String(props.inventory_summary.low_stock)} warn />
                            <SummaryCard label="Out of Stock" value={String(props.inventory_summary.out_of_stock)} warn />
                        </div>
                    )}
                    <Table headers={['Product', 'SKU', 'Category', 'Stock', 'Threshold', 'Price', 'Status']}>
                        {props.inventory.map((r) => (
                            <tr key={r.id} className={cn('hover:bg-gray-50', r.is_low && 'bg-red-50')}>
                                <Td>
                                    <div className="flex items-center gap-2">
                                        {r.is_low && <AlertTriangle className="size-3.5 text-red-500 shrink-0" />}
                                        {r.name}
                                    </div>
                                </Td>
                                <Td className="font-mono text-xs">{r.sku ?? '—'}</Td>
                                <Td>{r.category ?? '—'}</Td>
                                <Td>
                                    <span className={cn('font-semibold', r.stock_qty === 0 ? 'text-red-600' : r.is_low ? 'text-amber-600' : 'text-green-600')}>
                                        {r.stock_qty}
                                    </span>
                                </Td>
                                <Td>{r.threshold}</Td>
                                <Td>{fmt(r.price)}</Td>
                                <Td><Badge className={cn('border-0 text-xs capitalize', r.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>{r.status}</Badge></Td>
                            </tr>
                        ))}
                        {props.inventory.length === 0 && <EmptyRow cols={7} />}
                    </Table>
                </>
            )}

            {/* ── Profit / Margin ── */}
            {tab === 'profit' && props.profit && (
                <>
                    {props.profit_summary && (
                        <div className="mb-4 grid grid-cols-4 gap-4">
                            <SummaryCard label="Revenue" value={fmt(props.profit_summary.total_revenue)} />
                            <SummaryCard label="Cost" value={fmt(props.profit_summary.total_cost)} />
                            <SummaryCard label="Profit" value={fmt(props.profit_summary.total_profit)} highlight />
                            <SummaryCard label="Avg Margin" value={`${Number(props.profit_summary.avg_margin).toFixed(1)}%`} />
                        </div>
                    )}
                    <Table headers={['Product', 'Qty', 'Revenue', 'Cost', 'Profit', 'Margin']}>
                        {props.profit.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <Td>{r.name}</Td>
                                <Td>{r.qty_sold}</Td>
                                <Td>{fmt(r.revenue)}</Td>
                                <Td>{fmt(r.cost)}</Td>
                                <Td className={cn('font-semibold', Number(r.profit) >= 0 ? 'text-green-700' : 'text-red-600')}>{fmt(r.profit)}</Td>
                                <Td>
                                    <span className={cn('text-xs font-medium', r.margin >= 20 ? 'text-green-700' : r.margin >= 0 ? 'text-amber-600' : 'text-red-600')}>
                                        {r.margin}%
                                    </span>
                                </Td>
                            </tr>
                        ))}
                        {props.profit.length === 0 && <EmptyRow cols={6} />}
                    </Table>
                </>
            )}

            {/* ── Tax ── */}
            {tab === 'tax' && props.tax && (
                <>
                    {props.tax_summary && (
                        <div className="mb-4 grid grid-cols-3 gap-4">
                            <SummaryCard label="Total Orders" value={String(props.tax_summary.total_orders)} />
                            <SummaryCard label="Tax Collected" value={fmt(props.tax_summary.total_tax)} highlight />
                            <SummaryCard label="Revenue" value={fmt(props.tax_summary.total_revenue)} />
                        </div>
                    )}
                    <Table headers={['Date', 'Orders', 'Tax Collected', 'Revenue']}>
                        {props.tax.map((r) => (
                            <tr key={r.date} className="hover:bg-gray-50">
                                <Td>{r.date}</Td>
                                <Td>{r.orders}</Td>
                                <Td className="font-semibold">{fmt(r.tax_collected)}</Td>
                                <Td>{fmt(r.revenue)}</Td>
                            </tr>
                        ))}
                        {props.tax.length === 0 && <EmptyRow cols={4} />}
                    </Table>
                </>
            )}
        </AdminLayout>
    );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function SummaryCard({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
    return (
        <div className={cn('rounded-xl border p-4', highlight && 'bg-[#1a1a2e] text-white border-transparent', warn && 'bg-amber-50 border-amber-200')}>
            <p className={cn('text-xs font-medium uppercase tracking-wider', highlight ? 'text-white/60' : warn ? 'text-amber-600' : 'text-gray-500')}>{label}</p>
            <p className={cn('mt-1 text-2xl font-bold', highlight ? 'text-white' : warn ? 'text-amber-700' : 'text-gray-900')}>{value}</p>
        </div>
    );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-white overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            {headers.map((h) => <th key={h} className="px-5 py-3 text-left">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y text-gray-900">{children}</tbody>
                </table>
            </div>
        </div>
    );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
    return <td className={cn('px-5 py-3', className)}>{children}</td>;
}

function EmptyRow({ cols }: { cols: number }) {
    return <tr><td colSpan={cols} className="px-5 py-10 text-center text-gray-400">No data for this period</td></tr>;
}
