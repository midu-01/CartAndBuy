import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import AiAssistant from '@/components/shop/ai-assistant/AiAssistant';
import Footer from '@/components/shop/footer';
import Navbar from '@/components/shop/navbar';
import type { SharedData } from '@/types';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    const { toast: flashToast } = usePage<SharedData & { toast?: { type: string; message: string } }>().props;

    useEffect(() => {
        if (flashToast) {
            const fn = flashToast.type === 'error' ? toast.error
                : flashToast.type === 'info' ? toast.info
                : flashToast.type === 'warning' ? toast.warning
                : toast.success;
            fn(flashToast.message);
        }
    }, [flashToast]);

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AiAssistant />
        </div>
    );
}
