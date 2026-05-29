import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Shuffle, Trash2 } from 'lucide-react';
import { useState } from 'react';
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

interface Coupon {
    id: number;
    code: string;
    type: 'percent' | 'fixed';
    value: string;
    min_order: string;
    max_uses: number | null;
    used_count: number;
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
    type: 'percent',
    value: '',
    min_order: '0',
    max_uses: '',
    expires_at: '',
    is_active: true,
};

const emptyBulkForm = { prefix: 'PROMO', count: '10', type: 'percent', value: '10', min_order: '0', max_uses: '', expires_at: '' };

export default function AdminCouponsPage({ coupons }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [showBulk, setShowBulk] = useState(false);
    const form = useForm(emptyCouponForm);
    const bulkForm = useForm(emptyBulkForm);

    function openCreate() {
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
            min_order: String(c.min_order),
            max_uses: c.max_uses ? String(c.max_uses) : '',
            expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
            is_active: c.is_active,
        });
        setEditing(c);
        setShowForm(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editing) {
            form.patch(`/admin/coupons/${editing.id}`, {
                onSuccess: () => setShowForm(false),
            });
        } else {
            form.post('/admin/coupons', {
                onSuccess: () => setShowForm(false),
            });
        }
    }

    function destroy(c: Coupon) {
        if (confirm(`Delete coupon "${c.code}"?`))
            router.delete(`/admin/coupons/${c.id}`, { preserveScroll: true });
    }

    function submitBulk(e: React.FormEvent) {
        e.preventDefault();
        bulkForm.post('/admin/coupons/bulk-generate', { onSuccess: () => setShowBulk(false) });
    }

    return (
        <AdminLayout>
            <Head title="Coupons — Admin" />
            <div className="mb-6 flex gap-2 justify-end">
                <Button
                    onClick={() => setShowBulk(true)}
                    variant="outline"
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                    <Shuffle className="mr-1 size-4" /> Bulk Generate
                </Button>
                <Button
                    onClick={openCreate}
                    className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]"
                >
                    <Plus className="mr-1 size-4" /> Add Coupon
                </Button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Code</th>
                            <th className="px-5 py-3 text-left">
                                Type / Value
                            </th>
                            <th className="px-5 py-3 text-center">Min Order</th>
                            <th className="px-5 py-3 text-center">Usage</th>
                            <th className="px-5 py-3 text-left">Expires</th>
                            <th className="px-5 py-3 text-center">Status</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-gray-900">
                        {coupons.data.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 font-mono font-bold text-[#1a1a2e]">
                                    {c.code}
                                </td>
                                <td className="px-5 py-3 text-gray-700">
                                    {c.type === 'percent'
                                        ? `${c.value}% off`
                                        : `৳${Number(c.value).toFixed(2)} off`}
                                </td>
                                <td className="px-5 py-3 text-center text-gray-700">
                                    ৳{Number(c.min_order).toFixed(2)}
                                </td>
                                <td className="px-5 py-3 text-center text-gray-700">
                                    {c.used_count}
                                    {c.max_uses ? ` / ${c.max_uses}` : ''}
                                </td>
                                <td className="px-5 py-3 text-gray-500">
                                    {c.expires_at
                                        ? new Date(
                                              c.expires_at,
                                          ).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <Badge
                                        className={`border-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {c.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => openEdit(c)}
                                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#1a1a2e]"
                                        >
                                            <Edit2 className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => destroy(c)}
                                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {coupons.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-5 py-10 text-center text-gray-400"
                                >
                                    No coupons yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination links={coupons.links} />

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-sm bg-white text-gray-900">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Coupon' : 'Add Coupon'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="mt-2 space-y-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Code
                            </label>
                            <input
                                type="text"
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                            />
                            {form.errors.code && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.code}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Type
                            </label>
                            <select
                                value={form.data.type}
                                onChange={(e) =>
                                    form.setData(
                                        'type',
                                        e.target.value as 'percent' | 'fixed',
                                    )
                                }
                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                            >
                                <option value="percent">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (৳)</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                {form.data.type === 'percent'
                                    ? 'Discount Value (%)'
                                    : 'Discount Amount (৳)'}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={form.data.value}
                                onChange={(e) =>
                                    form.setData('value', e.target.value)
                                }
                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                            />
                            {form.errors.value && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.value}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Min Order Amount (৳)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={form.data.min_order}
                                onChange={(e) =>
                                    form.setData('min_order', e.target.value)
                                }
                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                            />
                            {form.errors.min_order && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.min_order}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Max Uses{' '}
                                <span className="font-normal text-gray-400">
                                    (leave blank for unlimited)
                                </span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={form.data.max_uses}
                                onChange={(e) =>
                                    form.setData('max_uses', e.target.value)
                                }
                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                            />
                            {form.errors.max_uses && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.max_uses}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Expires At{' '}
                                <span className="font-normal text-gray-400">
                                    (optional)
                                </span>
                            </label>
                            <input
                                type="date"
                                value={form.data.expires_at}
                                onChange={(e) =>
                                    form.setData('expires_at', e.target.value)
                                }
                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                            />
                            {form.errors.expires_at && (
                                <p className="mt-1 text-xs text-red-500">
                                    {form.errors.expires_at}
                                </p>
                            )}
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) =>
                                    form.setData('is_active', e.target.checked)
                                }
                            />
                            Active
                        </label>
                        <div className="flex justify-end gap-2 pt-1">
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

            {/* Bulk Generate Dialog */}
            <Dialog open={showBulk} onOpenChange={setShowBulk}>
                <DialogContent className="max-w-sm bg-white text-gray-900">
                    <DialogHeader><DialogTitle>Bulk Generate Coupons</DialogTitle></DialogHeader>
                    <form onSubmit={submitBulk} className="mt-2 space-y-3">
                        {[
                            { label: 'Code Prefix', key: 'prefix', type: 'text', help: 'e.g. SUMMER → SUMMER-XXXXXX' },
                            { label: 'Count', key: 'count', type: 'number', min: 1, max: 200 },
                            { label: 'Discount Value', key: 'value', type: 'number', min: 0, step: 'any' },
                            { label: 'Min Order (৳)', key: 'min_order', type: 'number', min: 0, step: 'any' },
                            { label: 'Max Uses (optional)', key: 'max_uses', type: 'number', min: 1 },
                            { label: 'Expires At (optional)', key: 'expires_at', type: 'date' },
                        ].map(({ label, key, type, ...rest }) => (
                            <div key={key}>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                                <input
                                    type={type}
                                    value={(bulkForm.data as Record<string, string>)[key]}
                                    onChange={(e) => bulkForm.setData(key as keyof typeof emptyBulkForm, e.target.value)}
                                    className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none"
                                    {...rest}
                                />
                                {(bulkForm.errors as Record<string, string>)[key] && <p className="mt-1 text-xs text-red-500">{(bulkForm.errors as Record<string, string>)[key]}</p>}
                            </div>
                        ))}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                            <select value={bulkForm.data.type} onChange={(e) => bulkForm.setData('type', e.target.value)} className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#e94560] focus:outline-none">
                                <option value="percent">Percentage</option>
                                <option value="fixed">Fixed</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => setShowBulk(false)} className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</Button>
                            <Button type="submit" disabled={bulkForm.processing} className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]">Generate</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
