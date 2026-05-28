import { Head } from '@inertiajs/react';
import { LogIn, LogOut, Monitor, Smartphone } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import { cn } from '@/lib/utils';

interface ActivityLog {
    id: number;
    action: string;
    description: string;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}
interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}
interface Props { logs: Paginated<ActivityLog> }

function isMobile(ua: string | null): boolean {
    if (!ua) { return false; }
    return /mobile|android|iphone|ipad/i.test(ua);
}

function parseBrowser(ua: string | null): string {
    if (!ua) { return 'Unknown'; }
    if (ua.includes('Chrome') && !ua.includes('Edg')) { return 'Chrome'; }
    if (ua.includes('Firefox')) { return 'Firefox'; }
    if (ua.includes('Safari') && !ua.includes('Chrome')) { return 'Safari'; }
    if (ua.includes('Edg')) { return 'Edge'; }
    return 'Browser';
}

export default function ActivityPage({ logs }: Props) {
    return (
        <CustomerLayout>
            <Head title="Activity Log — CartAndBuy" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                    <p className="mt-1 text-sm text-gray-500">Your recent account activity and login history.</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white">
                    {logs.data.length === 0 ? (
                        <div className="py-20 text-center">
                            <Monitor className="mx-auto mb-4 size-12 text-gray-200" />
                            <p className="text-sm text-gray-400">No activity recorded yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {logs.data.map((log) => {
                                const isLogin = log.action === 'login';
                                const mobile = isMobile(log.user_agent);

                                return (
                                    <div key={log.id} className="flex items-start gap-4 px-5 py-4">
                                        <div className={cn(
                                            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                                            isLogin ? 'bg-green-100' : 'bg-gray-100',
                                        )}>
                                            {isLogin
                                                ? <LogIn className="size-4 text-green-600" />
                                                : <LogOut className="size-4 text-gray-500" />
                                            }
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900">{log.description}</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                                                <span>{new Date(log.created_at).toLocaleString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}</span>
                                                {log.ip_address && <span>· {log.ip_address}</span>}
                                                <span className="flex items-center gap-1">
                                                    {mobile
                                                        ? <Smartphone className="size-3" />
                                                        : <Monitor className="size-3" />
                                                    }
                                                    {parseBrowser(log.user_agent)} · {mobile ? 'Mobile' : 'Desktop'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {logs.links.length > 3 && (
                        <div className="flex justify-center gap-1 border-t px-5 py-4">
                            {logs.links.map((link, i) => (
                                link.url ? (
                                    <a
                                        key={i}
                                        href={link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-sm transition-colors',
                                            link.active
                                                ? 'bg-[#e94560] text-white'
                                                : 'text-gray-600 hover:bg-gray-100',
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
            </div>
        </CustomerLayout>
    );
}
