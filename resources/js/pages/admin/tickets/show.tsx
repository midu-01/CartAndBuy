import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
    id: number;
    message: string;
    is_admin_reply: boolean;
    user: { name: string } | null;
    created_at: string;
}
interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    messages: Message[];
    user: { id: number; name: string; email: string };
}
interface Props { ticket: Ticket }

const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-gray-100 text-gray-600',
    closed: 'bg-gray-200 text-gray-500',
};

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export default function AdminTicketShowPage({ ticket }: Props) {
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ message: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/admin/tickets/${ticket.id}/reply`, {
            onSuccess: () => reset(),
        });
    }

    function updateStatus(status: string) {
        if (status === ticket.status) { return; }
        setUpdatingStatus(true);
        router.patch(`/admin/tickets/${ticket.id}/status`, { status }, {
            onFinish: () => setUpdatingStatus(false),
        });
    }

    return (
        <AdminLayout>
            <Head title={`Ticket #${ticket.id} — Admin`} />

            <div className="space-y-6">
                <div>
                    <a href="/admin/tickets" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
                        <ArrowLeft className="size-4" /> Back to Tickets
                    </a>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                            <p className="mt-0.5 text-sm text-gray-400">
                                #{ticket.id} · {ticket.user.name} ({ticket.user.email}) · {new Date(ticket.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={cn('border-0 text-sm capitalize', statusColors[ticket.status] ?? 'bg-gray-100 text-gray-600')}>
                                {ticket.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Status Changer */}
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => updateStatus(s)}
                                disabled={updatingStatus || s === ticket.status}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-sm capitalize transition-colors',
                                    s === ticket.status
                                        ? 'cursor-default bg-[#1a1a2e] text-white'
                                        : 'border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50',
                                )}
                            >
                                {s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                <div className="space-y-4">
                    {ticket.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn('flex', msg.is_admin_reply ? 'justify-end' : 'justify-start')}
                        >
                            <div className={cn(
                                'max-w-[80%] rounded-2xl px-4 py-3',
                                msg.is_admin_reply
                                    ? 'rounded-tr-sm bg-[#1a1a2e] text-white'
                                    : 'rounded-tl-sm border border-gray-100 bg-white text-gray-900',
                            )}>
                                <div className={cn('mb-1 flex items-center gap-2 text-xs', msg.is_admin_reply ? 'text-white/60' : 'text-gray-400')}>
                                    <span className="font-medium">
                                        {msg.is_admin_reply ? 'You (Support)' : (msg.user?.name ?? 'Customer')}
                                    </span>
                                    <span>·</span>
                                    <span>{new Date(msg.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply form */}
                <form onSubmit={submit} className="rounded-xl border border-gray-100 bg-white p-4">
                    <textarea
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        rows={3}
                        placeholder="Write your reply…"
                        className={cn(
                            'w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#1a1a2e] focus:outline-none',
                            errors.message && 'border-red-400',
                        )}
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                    <div className="mt-3 flex justify-end">
                        <Button type="submit" disabled={processing || !data.message.trim()} className="gap-2 border-0 bg-[#1a1a2e] text-white hover:bg-[#2d2d4a]">
                            <Send className="size-4" />
                            {processing ? 'Sending…' : 'Send Reply'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
