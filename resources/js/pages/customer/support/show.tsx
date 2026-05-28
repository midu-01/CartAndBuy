import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Send, XCircle } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface User { id: number; name: string; role?: string }
interface Message {
    id: number;
    message: string;
    is_admin_reply: boolean;
    user: User | null;
    created_at: string;
}
interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    messages: Message[];
}
interface Props { ticket: Ticket }

const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-gray-100 text-gray-600',
    closed: 'bg-gray-200 text-gray-500',
};

export default function TicketShowPage({ ticket }: Props) {
    const isClosed = ticket.status === 'closed';
    const { data, setData, post, processing, errors, reset } = useForm({ message: '' });
    const [closing, setClosing] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/account/support/${ticket.id}/reply`, {
            onSuccess: () => reset(),
        });
    }

    function handleClose() {
        if (!confirm('Close this ticket? You can still re-open it by sending a reply.')) return;
        setClosing(true);
        router.patch(`/account/support/${ticket.id}/close`, {}, {
            onFinish: () => setClosing(false),
        });
    }

    return (
        <CustomerLayout>
            <Head title={`Ticket #${ticket.id} — CartAndBuy`} />

            <div className="space-y-6">
                <div>
                    <Link href="/account/support" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
                        <ArrowLeft className="size-4" /> Back to Tickets
                    </Link>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                            <p className="mt-0.5 text-sm text-gray-400">
                                Ticket #{ticket.id} · Opened {new Date(ticket.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={cn('border-0 text-sm capitalize', statusColors[ticket.status] ?? 'bg-gray-100 text-gray-600')}>
                                {ticket.status.replace('_', ' ')}
                            </Badge>
                            {!isClosed && (
                                <Button variant="outline" size="sm" onClick={handleClose} disabled={closing} className="gap-1.5 text-gray-600">
                                    <XCircle className="size-4" />
                                    {closing ? 'Closing…' : 'Close Ticket'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="space-y-4">
                    {ticket.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn('flex', msg.is_admin_reply ? 'justify-start' : 'justify-end')}
                        >
                            <div className={cn(
                                'max-w-[80%] rounded-2xl px-4 py-3',
                                msg.is_admin_reply
                                    ? 'rounded-tl-sm bg-white border border-gray-100 text-gray-900'
                                    : 'rounded-tr-sm bg-[#e94560] text-white',
                            )}>
                                <div className={cn('mb-1 flex items-center gap-2 text-xs', msg.is_admin_reply ? 'text-gray-400' : 'text-white/80')}>
                                    <span className="font-medium">
                                        {msg.is_admin_reply ? 'Support Team' : 'You'}
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
                {isClosed ? (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center text-sm text-gray-500">
                        This ticket is closed. Send a new message to re-open it.
                    </div>
                ) : (
                    <form onSubmit={submit} className="rounded-xl border border-gray-100 bg-white p-4">
                        <textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            rows={3}
                            placeholder="Write your reply…"
                            className={cn(
                                'w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none',
                                errors.message && 'border-red-400',
                            )}
                        />
                        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                        <div className="mt-3 flex justify-end">
                            <Button type="submit" disabled={processing || !data.message.trim()} className="gap-2 border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                                <Send className="size-4" />
                                {processing ? 'Sending…' : 'Send Reply'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </CustomerLayout>
    );
}
