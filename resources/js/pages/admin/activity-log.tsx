import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/shop/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Admin { id: number; name: string; email: string }
interface Log { id: number; action: string; target_type: string | null; target_id: number | null; description: string | null; ip_address: string | null; created_at: string; admin: Admin | null }
interface Props { logs: { data: Log[]; links: { url: string | null; label: string; active: boolean }[] }; filters: { search?: string; action?: string } }

const ACTION_GROUPS: Record<string, string> = {
    order:   'bg-blue-100 text-blue-700',
    product: 'bg-purple-100 text-purple-700',
    user:    'bg-green-100 text-green-700',
    coupon:  'bg-amber-100 text-amber-700',
    role:    'bg-rose-100 text-rose-700',
};

function actionColor(action: string): string {
    const prefix = action.split('.')[0];
    return ACTION_GROUPS[prefix] ?? 'bg-gray-100 text-gray-600';
}

const ACTION_FILTERS = [
    { label: 'All', value: '' },
    { label: 'Orders', value: 'order' },
    { label: 'Products', value: 'product' },
    { label: 'Users', value: 'user' },
    { label: 'Coupons', value: 'coupon' },
    { label: 'Roles', value: 'role' },
];

export default function AdminActivityLogPage({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(params: Record<string, string | undefined>) {
        router.get('/admin/activity-log', { ...filters, ...params }, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Activity Log — Admin" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                <p className="text-sm text-gray-500">Admin actions and system events</p>
            </div>

            <div className="mb-5 flex flex-wrap gap-3 items-center">
                <div className="flex gap-1">
                    {ACTION_FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => applyFilter({ action: f.value || undefined, search: undefined })}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                (filters.action ?? '') === f.value
                                    ? 'bg-[#1a1a2e] text-white'
                                    : 'bg-white border text-gray-600 hover:bg-gray-50',
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <form
                    onSubmit={(e) => { e.preventDefault(); applyFilter({ search: search || undefined }); }}
                    className="flex gap-2 ml-auto"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search actions…"
                            className="border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none w-52 bg-white text-gray-900"
                        />
                    </div>
                    <Button type="submit" variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">Search</Button>
                </form>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left">Action</th>
                                <th className="px-5 py-3 text-left">Admin</th>
                                <th className="px-5 py-3 text-left">Description</th>
                                <th className="px-5 py-3 text-left">IP</th>
                                <th className="px-5 py-3 text-left">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-900">
                            {logs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3">
                                        <Badge className={cn('border-0 text-xs font-mono', actionColor(log.action))}>
                                            {log.action}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="font-medium">{log.admin?.name ?? '—'}</div>
                                        <div className="text-xs text-gray-400">{log.admin?.email}</div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{log.description ?? '—'}</td>
                                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{log.ip_address ?? '—'}</td>
                                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            {logs.data.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No activity recorded yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination links={logs.links} />
        </AdminLayout>
    );
}
