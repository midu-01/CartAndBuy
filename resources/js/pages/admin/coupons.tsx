import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Coupon { id: number; code: string; type: 'percent' | 'fixed'; value: string; min_order: string; max_uses: number | null; used_count: number; expires_at: string | null; is_active: boolean }
interface Props { coupons: Coupon[] }

export default function AdminCouponsPage({ coupons }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const form = useForm({ code: '', type: 'percent', value: '', min_order: '0', max_uses: '', expires_at: '', is_active: true });

    function openCreate() { form.reset({ code: '', type: 'percent', value: '', min_order: '0', max_uses: '', expires_at: '', is_active: true }); setEditing(null); setShowForm(true); }
    function openEdit(c: Coupon) { form.setData({ code: c.code, type: c.type, value: String(c.value), min_order: String(c.min_order), max_uses: c.max_uses ? String(c.max_uses) : '', expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '', is_active: c.is_active }); setEditing(c); setShowForm(true); }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editing) { form.patch(`/admin/coupons/${editing.id}`, { onSuccess: () => setShowForm(false) }); }
        else { form.post('/admin/coupons', { onSuccess: () => setShowForm(false) }); }
    }

    function destroy(c: Coupon) {
        if (confirm(`Delete coupon "${c.code}"?`)) router.delete(`/admin/coupons/${c.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Coupons — Admin" />
            <div className="flex justify-end mb-6">
                <Button onClick={openCreate} className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white"><Plus className="size-4 mr-1" /> Add Coupon</Button>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Code</th>
                            <th className="px-5 py-3 text-left">Type / Value</th>
                            <th className="px-5 py-3 text-center">Min Order</th>
                            <th className="px-5 py-3 text-center">Usage</th>
                            <th className="px-5 py-3 text-left">Expires</th>
                            <th className="px-5 py-3 text-center">Status</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {coupons.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 font-mono font-bold text-[#1a1a2e]">{c.code}</td>
                                <td className="px-5 py-3">{c.type === 'percent' ? `${c.value}% off` : `$${Number(c.value).toFixed(2)} off`}</td>
                                <td className="px-5 py-3 text-center">${Number(c.min_order).toFixed(2)}</td>
                                <td className="px-5 py-3 text-center">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                                <td className="px-5 py-3 text-gray-500">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}</td>
                                <td className="px-5 py-3 text-center"><Badge className={`border-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-[#1a1a2e]"><Edit2 className="size-4" /></button>
                                        <button onClick={() => destroy(c)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="size-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No coupons yet</td></tr>}
                    </tbody>
                </table>
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>{editing ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-3 mt-2">
                        {[{ name: 'code', label: 'Code' }, { name: 'value', label: 'Value', type: 'number' }, { name: 'min_order', label: 'Min Order ($)', type: 'number' }, { name: 'max_uses', label: 'Max Uses (blank = unlimited)' }, { name: 'expires_at', label: 'Expires At', type: 'date' }].map(({ name, label, type = 'text' }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                <input type={type} value={(form.data as Record<string, string>)[name]} onChange={(e) => form.setData(name as keyof typeof form.data, e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                            </div>
                        ))}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select value={form.data.type} onChange={(e) => form.setData('type', e.target.value as 'percent' | 'fixed')} className="w-full border rounded-lg px-3 py-2 text-sm">
                                <option value="percent">Percent (%)</option>
                                <option value="fixed">Fixed ($)</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                            Active
                        </label>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.processing} className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white">{editing ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
