import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { HeadphonesIcon, Plus, MessageSquare } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    messages_count: number;
    created_at: string;
}
interface Props {
    tickets: { data: Ticket[]; links: { url: string | null; label: string; active: boolean }[] };
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

function NewTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        message: '',
        priority: 'normal',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/account/support', {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Open a Support Ticket</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            placeholder="Briefly describe your issue…"
                            className={cn('w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors.subject && 'border-red-400')}
                        />
                        {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                        <div className="flex gap-2">
                            {(['low', 'normal', 'high'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setData('priority', p)}
                                    className={cn(
                                        'rounded-lg border px-4 py-1.5 text-sm capitalize transition-colors',
                                        data.priority === p
                                            ? 'border-[#e94560] bg-[#e94560]/5 font-medium text-[#e94560]'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300',
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            rows={4}
                            placeholder="Describe your issue in detail…"
                            className={cn('w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors.message && 'border-red-400')}
                        />
                        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={processing}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing} className="border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                            {processing ? 'Submitting…' : 'Open Ticket'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function SupportTicketsPage({ tickets }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <CustomerLayout>
            <Head title="Support Tickets — CartAndBuy" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                        <p className="mt-1 text-sm text-gray-500">Get help from our support team.</p>
                    </div>
                    <Button onClick={() => setModalOpen(true)} className="gap-2 border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                        <Plus className="size-4" />
                        New Ticket
                    </Button>
                </div>

                {tickets.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 py-20 text-center">
                        <HeadphonesIcon className="mx-auto mb-4 size-12 text-gray-200" />
                        <p className="font-medium text-gray-500">No tickets yet.</p>
                        <p className="mt-1 text-sm text-gray-400">Have an issue? Our team is here to help.</p>
                        <Button onClick={() => setModalOpen(true)} className="mt-6 gap-2 border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                            <Plus className="size-4" />
                            Open First Ticket
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tickets.data.map((ticket) => (
                            <Link
                                key={ticket.id}
                                href={`/account/support/${ticket.id}`}
                                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-[#e94560]/30 hover:shadow-sm transition-all"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        #{ticket.id} · {new Date(ticket.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <MessageSquare className="size-3.5" />
                                        {ticket.messages_count}
                                    </div>
                                    <Badge className={cn('border-0 text-xs capitalize', priorityColors[ticket.priority])}>
                                        {ticket.priority}
                                    </Badge>
                                    <Badge className={cn('border-0 text-xs capitalize', statusColors[ticket.status] ?? 'bg-gray-100 text-gray-600')}>
                                        {ticket.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <NewTicketModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </CustomerLayout>
    );
}
