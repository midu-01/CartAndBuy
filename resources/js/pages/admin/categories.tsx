import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Category { id: number; name: string; slug: string; parent: { id: number; name: string } | null }
interface Props { categories: Category[] }

export default function AdminCategoriesPage({ categories }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const form = useForm({ name: '', parent_id: '' });
    const parentCategories = categories.filter((c) => !c.parent);

    function openCreate() { form.reset(); setEditing(null); setShowForm(true); }
    function openEdit(c: Category) { form.setData({ name: c.name, parent_id: String(c.parent?.id ?? '') }); setEditing(c); setShowForm(true); }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editing) { form.patch(`/admin/categories/${editing.id}`, { onSuccess: () => setShowForm(false) }); }
        else { form.post('/admin/categories', { onSuccess: () => setShowForm(false) }); }
    }

    function destroy(c: Category) {
        if (confirm(`Delete "${c.name}"?`)) router.delete(`/admin/categories/${c.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Categories — Admin" />
            <div className="flex justify-end mb-6">
                <Button onClick={openCreate} className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white"><Plus className="size-4 mr-1" /> Add Category</Button>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Name</th>
                            <th className="px-5 py-3 text-left">Slug</th>
                            <th className="px-5 py-3 text-left">Parent</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 font-medium flex items-center gap-2"><FolderOpen className="size-4 text-gray-400" />{cat.name}</td>
                                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                                <td className="px-5 py-3 text-gray-500">{cat.parent?.name ?? <span className="text-gray-300">—</span>}</td>
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => openEdit(cat)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-[#1a1a2e]"><Edit2 className="size-4" /></button>
                                        <button onClick={() => destroy(cat)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="size-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-4 mt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]" />
                            {form.errors.name && <p className="text-xs text-red-500 mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                            <select value={form.data.parent_id} onChange={(e) => form.setData('parent_id', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                                <option value="">— None (Top Level) —</option>
                                {parentCategories.filter((c) => c.id !== editing?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.processing} className="bg-[#e94560] hover:bg-[#c73652] border-0 text-white">{editing ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
