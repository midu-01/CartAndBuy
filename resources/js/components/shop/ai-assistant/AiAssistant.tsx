import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import AiChatButton from './AiChatButton';
import AiChatWindow from './AiChatWindow';

const PROACTIVE_MESSAGES = [
    "👋 Need help finding something? I'm here!",
    '✨ Looking for something special? Just ask!',
    '💡 I can find deals, coupons, and more!',
];

export default function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [proactiveTip, setProactiveTip] = useState<string | null>(null);
    const hasTriggeredRef = useRef(false);

    function triggerProactive() {
        if (hasTriggeredRef.current || isOpen) return;
        hasTriggeredRef.current = true;
        setProactiveTip(PROACTIVE_MESSAGES[Math.floor(Math.random() * PROACTIVE_MESSAGES.length)]);
        setHasUnread(true);
    }

    useEffect(() => {
        const timer = setTimeout(triggerProactive, 30000);

        function handleMouseLeave(e: MouseEvent) {
            if (e.clientY < 10) triggerProactive();
        }

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleToggle() {
        setIsOpen((prev) => {
            if (!prev) {
                setHasUnread(false);
                setProactiveTip(null);
            }
            return !prev;
        });
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
            {/* Chat window */}
            <div
                aria-hidden={!isOpen}
                className={cn(
                    'transition-all duration-300 origin-bottom-right overflow-hidden flex flex-col',
                    'rounded-3xl shadow-[0_32px_64px_-12px_rgba(15,52,96,0.35),0_0_0_1px_rgba(15,52,96,0.08)] bg-white',
                    'w-[400px] h-[640px] max-h-[85vh]',
                    'max-sm:w-[calc(100vw-24px)] max-sm:h-[85svh]',
                    isOpen
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none',
                )}
            >
                <AiChatWindow onClose={handleToggle} />
            </div>

            {/* Proactive tooltip */}
            {proactiveTip && !isOpen && (
                <div className="relative animate-in slide-in-from-bottom-3 fade-in duration-400 pointer-events-auto">
                    {/* Accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#e94560] to-[#0f3460]" />

                    <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(15,52,96,0.18),0_0_0_1px_rgba(15,52,96,0.08)] px-4 py-3.5 max-w-[220px]">
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-[#e94560] to-[#c73652] flex items-center justify-center mt-0.5">
                                <Sparkles className="size-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={handleToggle}
                                    className="text-[12px] text-gray-700 font-medium text-left leading-snug w-full hover:text-[#0f3460] transition-colors"
                                >
                                    {proactiveTip}
                                </button>
                                <p className="text-[10px] text-gray-400 mt-1">Tap to chat →</p>
                            </div>
                            <button
                                onClick={() => setProactiveTip(null)}
                                aria-label="Dismiss"
                                className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 flex items-center justify-center transition-colors -mt-0.5 -mr-0.5"
                            >
                                <X className="size-2.5" />
                            </button>
                        </div>
                    </div>

                    {/* Arrow pointing to button */}
                    <div className="flex justify-end pr-6">
                        <div className="w-2.5 h-2.5 bg-white border-r border-b border-[#0f3460]/08 rotate-45 -mt-1.5 shadow-sm" />
                    </div>
                </div>
            )}

            {/* Floating button */}
            <div className="pointer-events-auto">
                <AiChatButton isOpen={isOpen} hasUnread={hasUnread} onToggle={handleToggle} />
            </div>
        </div>
    );
}
