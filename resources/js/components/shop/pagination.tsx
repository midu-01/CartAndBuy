import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: PaginationLink[];
}

export default function Pagination({ links }: Props) {
    if (links.length <= 3) return null;

    return (
        <nav className="flex items-center justify-center gap-1 mt-8">
            {links.map((link, i) => {
                const isPrev = i === 0;
                const isNext = i === links.length - 1;

                if (!link.url && (isPrev || isNext)) {
                    return (
                        <span key={i} className="p-2 text-gray-300 cursor-not-allowed">
                            {isPrev ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                        </span>
                    );
                }

                if (isPrev || isNext) {
                    return (
                        <Link key={i} href={link.url!} className="p-2 text-gray-600 hover:text-[#e94560] transition-colors">
                            {isPrev ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                        </Link>
                    );
                }

                if (link.label === '...') {
                    return <span key={i} className="px-2 text-gray-400">…</span>;
                }

                return (
                    <Link
                        key={i}
                        href={link.url ?? '#'}
                        className={cn(
                            'size-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
                            link.active
                                ? 'bg-[#1a1a2e] text-white'
                                : 'text-gray-600 hover:bg-gray-100',
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </nav>
    );
}
