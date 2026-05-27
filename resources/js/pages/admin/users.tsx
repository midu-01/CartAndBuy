import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/shop/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface User { id: number; name: string; email: string; role: string; orders_count: number; created_at: string }
interface Props { users: { data: User[]; links: { url: string | null; label: string; active: boolean }[] }; filters: { search?: string; role?: string } }

export default function AdminUsersPage({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(params: Record<string, string | undefined>) {
        router.get('/admin/users', { ...filters, ...params }, { preserveScroll: true });
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
                            </tr>
                        ))}
                        {users.data.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No users found</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pagination links={users.links} />
        </AdminLayout>
    );
}
