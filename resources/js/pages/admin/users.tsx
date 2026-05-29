import { Head, router } from '@inertiajs/react';
import { MessageSquare, Search, X } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/shop/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface User { id: number; name: string; email: string; role: string; orders_count: number; created_at: string; admin_notes: string | null }
interface Props { users: { data: User[]; links: { url: string | null; label: string; active: boolean }[] }; filters: { search?: string; role?: string } }

export default function AdminUsersPage({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [noteUser, setNoteUser] = useState<User | null>(null);
    const [noteText, setNoteText] = useState('');
    const [noteSaving, setNoteSaving] = useState(false);

    function applyFilter(params: Record<string, string | undefined>) {
        router.get('/admin/users', { ...filters, ...params }, { preserveScroll: true });
    }

    function openNote(user: User) {
        setNoteUser(user);
        setNoteText(user.admin_notes ?? '');
    }

    function saveNote() {
        if (!noteUser) return;
        setNoteSaving(true);
        router.patch(`/admin/users/${noteUser.id}/note`, { admin_notes: noteText }, {
            preserveScroll: true,
            onFinish: () => { setNoteSaving(false); setNoteUser(null); },
        });
    }

    return (
        <AdminLayout>
            <Head title="Users — Admin" />

            <div className="flex gap-4 mb-6 flex-wrap">
                <div className="flex gap-1">
                    {['', 'admin', 'customer'].map((r) => (
                        <button key={r} onClick={() => applyFilter({ role: r || undefined })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${(filters.role ?? '') === r ? 'bg-[#1a1a2e] text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                            {r || 'All'}
                        </button>
                    ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); applyFilter({ search: search || undefined }); }} className="flex gap-2 ml-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none w-52 bg-white text-gray-900" />
                    </div>
                    <Button type="submit" variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">Search</Button>
                </form>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Name</th>
                            <th className="px-5 py-3 text-left">Email</th>
                            <th className="px-5 py-3 text-center">Role</th>
                            <th className="px-5 py-3 text-center">Orders</th>
                            <th className="px-5 py-3 text-left">Joined</th>
                            <th className="px-5 py-3 text-center">Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-gray-900">
                        {users.data.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 font-medium text-gray-900">{user.name}</td>
                                <td className="px-5 py-3 text-gray-500">{user.email}</td>
                                <td className="px-5 py-3 text-center">
                                    <Badge className={`border-0 capitalize ${user.role === 'admin' ? 'bg-[#e94560] text-white' : 'bg-gray-100 text-gray-700'}`}>{user.role}</Badge>
                                </td>
                                <td className="px-5 py-3 text-center font-bold text-gray-900">{user.orders_count}</td>
                                <td className="px-5 py-3 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="px-5 py-3 text-center">
                                    <button
                                        onClick={() => openNote(user)}
                                        title={user.admin_notes ? 'Edit note' : 'Add note'}
                                        className={`rounded p-1.5 transition-colors ${user.admin_notes ? 'text-[#1a1a2e] hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-600'}`}
                                    >
                                        <MessageSquare className="size-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.data.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No users found</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pagination links={users.links} />

            {/* Customer Note Dialog */}
            <Dialog open={!!noteUser} onOpenChange={(open) => !open && setNoteUser(null)}>
                <DialogContent className="max-w-sm bg-white text-gray-900">
                    <DialogHeader>
                        <DialogTitle>Customer Note</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500">{noteUser?.name} · {noteUser?.email}</p>
                    <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={5}
                        placeholder="Internal notes about this customer…"
                        className="w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                    />
                    {noteText && (
                        <button onClick={() => setNoteText('')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500">
                            <X className="size-3" /> Clear note
                        </button>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setNoteUser(null)} className="border-gray-300 bg-white text-gray-700">Cancel</Button>
                        <Button onClick={saveNote} disabled={noteSaving} className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]">
                            {noteSaving ? 'Saving…' : 'Save Note'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
