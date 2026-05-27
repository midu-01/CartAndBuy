import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    isOpen: boolean;
    hasUnread: boolean;
    onToggle: () => void;
}

export default function AiChatButton({ isOpen, hasUnread, onToggle }: Props) {
    return (
        <button
            onClick={onToggle}
            aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
            className={cn(
                'relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e94560]',
                isOpen
                    ? 'bg-[#1a1a2e] shadow-[0_8px_24px_rgba(26,26,46,0.5)] hover:shadow-[0_12px_32px_rgba(26,26,46,0.6)] scale-100'
                    : 'bg-gradient-to-br from-[#e94560] via-[#c73652] to-[#0f3460] shadow-[0_8px_32px_rgba(233,69,96,0.5)] hover:shadow-[0_12px_40px_rgba(233,69,96,0.65)] hover:scale-105',
            )}
        >
            {/* Glow pulse ring */}
            {!isOpen && (
                <span className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-[#e94560]/25 to-[#0f3460]/25 animate-ping pointer-events-none" />
            )}

            {/* Shine overlay */}
            {!isOpen && (
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            )}

            {/* Close icon */}
            <span
                className={cn(
                    'absolute transition-all duration-200',
                    isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50',
                )}
            >
                <X className="size-6 text-white" />
            </span>

            {/* Sparkles icon */}
            <span
                className={cn(
                    'absolute transition-all duration-200',
                    isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100',
                )}
            >
                <Sparkles className="size-6 text-white drop-shadow-sm" />
            </span>

            {/* Unread badge */}
            {!isOpen && hasUnread && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex h-5 w-5 rounded-full bg-white border-2 border-[#e94560] items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e94560]" />
                    </span>
                </span>
            )}
        </button>
    );
}
