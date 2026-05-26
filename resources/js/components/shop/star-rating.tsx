import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    value: number;
    max?: number;
    interactive?: boolean;
    onChange?: (v: number) => void;
    size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ value, max = 5, interactive = false, onChange, size = 'md' }: Props) {
    const sizeClass = size === 'sm' ? 'size-3' : size === 'lg' ? 'size-6' : 'size-4';

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
                <Star
                    key={star}
                    className={cn(
                        sizeClass,
                        'transition-colors',
                        star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300',
                        interactive && 'cursor-pointer hover:text-amber-400 hover:fill-amber-400',
                    )}
                    onClick={() => interactive && onChange?.(star)}
                />
            ))}
        </div>
    );
}
