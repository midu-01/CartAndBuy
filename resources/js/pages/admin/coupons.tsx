import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Shuffle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/shop/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CouponUser {
    id: number;
    name: string;
    email: string;
}

interface Coupon {
    id: number;
    code: string;
    type: 'percent' | 'fixed';
    value: string;
    max_discount: string | null;
    min_order: string;
    max_uses: number | null;
    used_count: number;
    once_per_customer: boolean;
    new_customers_only: boolean;
    user_id: number | null;
    user: CouponUser | null;
    expires_at: string | null;
    is_active: boolean;
}

interface PaginatedCoupons {
    data: Coupon[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    coupons: PaginatedCoupons;
}

const emptyCouponForm = {
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    max_discount: '',
    min_order: '0',
    max_uses: '',
    once_per_customer: false,
    new_customers_only: false,
    user_email: '',
    expires_at: '',
    is_active: true,
};

const emptyBulkForm = {
    prefix: 'PROMO',
    count: '10',
    type: 'percent',
    value: '10',
    max_discount: '',
    min_order: '0',
    max_uses: '',
    once_per_customer: false,
    expires_at: '',
};

function ToggleField({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
            <div className="relative mt-0.5 flex-shrink-0">
                <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <div
                    className={`w-9 h-5 rounded-full transition-colors ${checked ? 'bg-[#e94560]' : 'bg-gray-200'}`}
                />
                <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
                />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </label>
    );
}

function Field({
    label,
    error,
    hint,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
                {hint && <span className="ml-1 font-normal text-gray-400 text-xs">{hint}</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

const inputCls = 'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none';

function restrictionBadges(coupon: Coupon) {
    const badges: { label: string; color: string }[] = [];
    if (coupon.new_customers_only) badges.push({ label: 'New customers', color: 'bg-blue-100 text-blue-700' });
    if (coupon.once_per_customer) badges.push({ label: 'Once/customer', color: 'bg-purple-100 text-purple-700' });
    if (coupon.user_id && coupon.user) badges.push({ label: coupon.user.email, color: 'bg-amber-100 text-amber-700' });
    return badges;
}

export default function AdminCouponsPage({ coupons }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [showBulk, setShowBulk] = useState(false);
    const form = useForm(emptyCouponForm);
    const bulkForm = useForm(emptyBulkForm);

    function openCreate() {
        form.reset();
        form.setData(emptyCouponForm);
        form.clearErrors();
        setEditing(null);
        setShowForm(true);
    }

    function openEdit(c: Coupon) {
        form.setData({
            code: c.code,
            type: c.type,
            value: String(c.value),
            max_discount: c.max_discount ? String(c.max_discount) : '',
            min_order: String(c.min_order),
            max_uses: c.max_uses ? String(c.max_uses) : '',
            once_per_customer: c.once_per_customer,
            new_customers_only: c.new_customers_only,
            user_email: c.user?.email ?? '',
            expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
            is_active: c.is_active,
        });
        form.clearErrors();
        setEditing(c);
        setShowForm(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editing) {
            form.patch(`/admin/coupons/${editing.id}`, { onSuccess: () => setShowForm(false) });
        } else {
            form.post('/admin/coupons', { onSuccess: () => setShowForm(false) });
        }
    }

    function destroy(c: Coupon) {
        if (confirm(`Delete coupon "${c.code}"?`)) {
            router.delete(`/admin/coupons/${c.id}`, { preserveScroll: true });
        }
    }

    function submitBulk(e: React.FormEvent) {
        e.preventDefault();
        bulkForm.post('/admin/coupons/bulk-generate', { onSuccess: () => setShowBulk(false) });
    }

    return (
        <AdminLayout>
            <Head title="Coupons — Admin" />

            <div className="mb-6 flex gap-2 justify-end">
                <Button onClick={() => setShowBulk(true)} variant="outline" className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                    <Shuffle className="mr-1 size-4" /> Bulk Generate
                </Button>
                <Button onClick={openCreate} className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                    <Plus className="mr-1 size-4" /> Add Coupon
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Code</th>
                            <th className="px-5 py-3 text-left">Discount</th>
                            <th className="px-5 py-3 text-center">Min Order</th>
                            <th className="px-5 py-3 text-left">Restrictions</th>
                            <th className="px-5 py-3 text-center">Usage</th>
                            <th className="px-5 py-3 text-left">Expires</th>
                            <th className="px-5 py-3 text-center">Status</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-gray-900">
                        {coupons.data.map((c) => {
                            const badges = restrictionBadges(c);
                            return (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 font-mono font-bold text-[#1a1a2e]">{c.code}</td>
                                    <td className="px-5 py-3 text-gray-700">
                                        <div>{c.type === 'percent' ? `${c.value}% off` : `৳${Number(c.value).toFixed(0)} off`}</div>
                                        {c.max_discount && (
                                            <div className="text-xs text-gray-400">max ৳{Number(c.max_discount).toFixed(0)}</div>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-center text-gray-700">৳{Number(c.min_order).toFixed(0)}</td>
                                    <td className="px-5 py-3">
                                        {badges.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {badges.map((b) => (
                                                    <span key={b.label} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${b.color}`}>
                                                        {b.label}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-center text-gray-700">
                                        {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">
                                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <Badge className={`border-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => openEdit(c)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#1a1a2e]">
                                                <Edit2 className="size-4" />
                                            </button>
                                            <button onClick={() => destroy(c)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {coupons.data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-5 py-10 text-center text-gray-400">No coupons yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination links={coupons.links} />

            {/* Create / Edit dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg bg-white text-gray-900 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submit} className="mt-2 space-y-5">
                        {/* ── Basic ── */}
                        <section>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Basic</p>
                            <div className="space-y-3">
                                <Field label="Code" error={form.errors.code}>
                                    <input
                                        type="text"
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                        className={inputCls}
                                        placeholder="e.g. SUMMER20"
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Type" error={form.errors.type}>
                                        <select
                                            value={form.data.type}
                                            onChange={(e) => form.setData('type', e.target.value as 'percent' | 'fixed')}
                                            className={inputCls}
                                        >
                                            <option value="percent">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (৳)</option>
                                        </select>
                                    </Field>

                                    <Field
                                        label={form.data.type === 'percent' ? 'Value (%)' : 'Value (৳)'}
                                        error={form.errors.value}
                                    >
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={form.data.value}
                                            onChange={(e) => form.setData('value', e.target.value)}
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Max Discount (৳)" hint="(optional, % only)" error={form.errors.max_discount}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={form.data.max_discount}
                                            onChange={(e) => form.setData('max_discount', e.target.value)}
                                            className={inputCls}
                                            placeholder="No cap"
                                        />
                                    </Field>

                                    <Field label="Min Order (৳)" error={form.errors.min_order}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={form.data.min_order}
                                            onChange={(e) => form.setData('min_order', e.target.value)}
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </section>

                        {/* ── Usage Limits ── */}
                        <section>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Usage Limits</p>
                            <div className="space-y-3">
                                <Field label="Total Uses" hint="(blank = unlimited)" error={form.errors.max_uses}>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={form.data.max_uses}
                                        onChange={(e) => form.setData('max_uses', e.target.value)}
                                        className={inputCls}
                                        placeholder="Unlimited"
                                    />
                                </Field>

                                <ToggleField
                                    label="Once per customer"
                                    description="Each customer can only use this coupon one time."
                                    checked={form.data.once_per_customer}
                                    onChange={(v) => form.setData('once_per_customer', v)}
                                />
                            </div>
                        </section>

                        {/* ── Restrictions ── */}
                        <section>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Restrictions</p>
                            <div className="space-y-3">
                                <ToggleField
                                    label="New customers only"
                                    description="Only customers with no previous orders can use this coupon."
                                    checked={form.data.new_customers_only}
                                    onChange={(v) => form.setData('new_customers_only', v)}
                                />

                                <Field
                                    label="Specific User"
                                    hint="(enter email — optional)"
                                    error={form.errors.user_email}
                                >
                                    <input
                                        type="email"
                                        value={form.data.user_email}
                                        onChange={(e) => form.setData('user_email', e.target.value)}
                                        className={inputCls}
                                        placeholder="user@example.com"
                                    />
                                </Field>
                            </div>
                        </section>

                        {/* ── Validity ── */}
                        <section>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Validity</p>
                            <div className="space-y-3">
                                <Field label="Expires At" hint="(optional)" error={form.errors.expires_at}>
                                    <input
                                        type="date"
                                        value={form.data.expires_at}
                                        onChange={(e) => form.setData('expires_at', e.target.value)}
                                        className={inputCls}
                                    />
                                </Field>

                                <ToggleField
                                    label="Active"
                                    description="Inactive coupons cannot be redeemed."
                                    checked={form.data.is_active}
                                    onChange={(v) => form.setData('is_active', v)}
                                />
                            </div>
                        </section>

                        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing} className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                                {editing ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Generate Dialog */}
            <Dialog open={showBulk} onOpenChange={setShowBulk}>
                <DialogContent className="max-w-sm bg-white text-gray-900">
                    <DialogHeader>
                        <DialogTitle>Bulk Generate Coupons</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitBulk} className="mt-2 space-y-3">
                        {(
                            [
                                { label: 'Code Prefix', key: 'prefix', type: 'text', placeholder: 'e.g. SUMMER → SUMMER-XXXXXX' },
                                { label: 'Count', key: 'count', type: 'number', min: 1, max: 200 },
                                { label: 'Discount Value', key: 'value', type: 'number', min: 0, step: 'any' },
                                { label: 'Max Discount (৳, optional)', key: 'max_discount', type: 'number', min: 0, step: 'any' },
                                { label: 'Min Order (৳)', key: 'min_order', type: 'number', min: 0, step: 'any' },
                                { label: 'Max Uses (optional)', key: 'max_uses', type: 'number', min: 1 },
                                { label: 'Expires At (optional)', key: 'expires_at', type: 'date' },
                            ] as const
                        ).map(({ label, key, type, ...rest }) => (
                            <div key={key}>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                                <input
                                    type={type}
                                    value={(bulkForm.data as Record<string, string | boolean>)[key] as string}
                                    onChange={(e) => bulkForm.setData(key as keyof typeof emptyBulkForm, e.target.value)}
                                    className={inputCls}
                                    {...rest}
                                />
                                {(bulkForm.errors as Record<string, string>)[key] && (
                                    <p className="mt-1 text-xs text-red-500">{(bulkForm.errors as Record<string, string>)[key]}</p>
                                )}
                            </div>
                        ))}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={bulkForm.data.type}
                                onChange={(e) => bulkForm.setData('type', e.target.value)}
                                className={inputCls}
                            >
                                <option value="percent">Percentage</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </div>

                        <ToggleField
                            label="Once per customer"
                            description="Each customer can only use each generated coupon once."
                            checked={bulkForm.data.once_per_customer}
                            onChange={(v) => bulkForm.setData('once_per_customer', v)}
                        />

                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => setShowBulk(false)} className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={bulkForm.processing} className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]">
                                Generate
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
