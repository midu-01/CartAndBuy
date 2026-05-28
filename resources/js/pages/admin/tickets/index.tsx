import { Head, Link, router } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    messages_count: number;
    created_at: string;
    user: { name: string; email: string };
}
interface Counts {
    all: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
}
interface Props {
    tickets: { data: Ticket[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { status?: string };
    counts: Counts;
}

const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-gray-100 text-gray-600',
    closed: 'bg-gray-200 text-gray-500',
};

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-500',
    normal: 'bg-blue-50 text-blue-600',
    high: 'bg-red-100 text-red-600',
};

const STATUSES: { key: string; label: string }[] = [
    { key: '', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
];

export default function AdminTicketsPage({ tickets, filters, counts }: Props) {
    function applyFilter(status: string) {
        router.get('/admin/tickets', { status: status || undefined }, { preserveScroll: true });
    }

    const countMap: Record<string, number> = {
        '': counts.all,
        open: counts.open,
        in_progress: counts.in_progress,
        resolved: counts.resolved,
        closed: counts.closed,
    };

    return (
        <AdminLayout>
            <Head title="Support Tickets — Admin" />

            <div className="mb-6 flex flex-wrap gap-1">
                {STATUSES.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => applyFilter(key)}
                        className={cn(
                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                            (filters.status ?? '') === key
                                ? 'bg-[#1a1a2e] text-white'
                                : 'border bg-white text-gray-600 hover:bg-gray-50',
                        )}
                    >
                        {label}
                        {countMap[key] !== undefined && (
                            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                                {countMap[key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border bg-white">
                {tickets.data.length === 0 ? (
                    <div className="py-20 text-center">
                        <MessageSquare className="mx-auto mb-4 size-12 text-gray-200" />
                        <p className="text-sm text-gray-400">No tickets found.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-5 py-3 text-left">#</th>
                                <th className="px-5 py-3 text-left">Subject</th>
                                <th className="px-5 py-3 text-left">Customer</th>
                                <th className="px-5 py-3 text-left">Priority</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Messages</th>
                                <th className="px-5 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-900">
                            {tickets.data.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-gray-400">#{ticket.id}</td>
                                    <td className="px-5 py-3">
                                        <Link
                                            href={`/admin/tickets/${ticket.id}`}
                                            className="font-medium text-gray-900 hover:text-[#e94560] hover:underline"
                                        >
                                            {ticket.subject}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="font-medium">{ticket.user.name}</p>
                                        <p className="text-xs text-gray-400">{ticket.user.email}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <Badge className={cn('border-0 text-xs capitalize', priorityColors[ticket.priority])}>
                                            {ticket.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3">
                                        <Badge className={cn('border-0 text-xs capitalize', statusColors[ticket.status] ?? 'bg-gray-100 text-gray-600')}>
                                            {ticket.status.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <MessageSquare className="size-3.5" />
                                            {ticket.messages_count}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {tickets.links.length > 3 && (
                    <div className="flex justify-center gap-1 border-t px-5 py-4">
                        {tickets.links.map((link, i) => (
                            link.url ? (
                                <a
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={cn(
                                        'rounded-lg px-3 py-1.5 text-sm',
                                        link.active ? 'bg-[#1a1a2e] text-white' : 'text-gray-600 hover:bg-gray-100',
                                    )}
                                />
                            ) : (
                                <span
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="rounded-lg px-3 py-1.5 text-sm text-gray-300"
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
