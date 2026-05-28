import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Star, Wallet, Users, Copy, Check, TrendingUp, TrendingDown } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PointTransaction {
    id: number;
    type: string;
    amount: number;
    source: string;
    description: string;
    created_at: string;
}
interface WalletTransaction {
    id: number;
    type: string;
    amount: string;
    source: string;
    description: string;
    created_at: string;
}
interface Referral {
    id: number;
    status: string;
    reward_points: number;
    rewarded_at: string | null;
    referred_user: { name: string; email: string; created_at: string };
}
interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}
interface Stats {
    points_balance: number;
    wallet_balance: string;
    referral_code: string | null;
    total_referrals: number;
    rewarded_referrals: number;
}
interface Props {
    stats: Stats;
    pointTransactions: Paginated<PointTransaction>;
    walletTransactions: Paginated<WalletTransaction>;
    referrals: Referral[];
}

type Tab = 'points' | 'wallet' | 'referral';

export default function RewardsPage({ stats, pointTransactions, walletTransactions, referrals }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('points');
    const [copied, setCopied] = useState(false);

    const referralUrl = stats.referral_code
        ? `${window.location.origin}/?ref=${stats.referral_code}`
        : null;

    function copyReferralLink() {
        if (!referralUrl) return;
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <CustomerLayout>
            <Head title="Rewards & Wallet — CartAndBuy" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rewards & Wallet</h1>
                    <p className="mt-1 text-sm text-gray-500">Track your points, wallet balance, and referrals.</p>
                </div>

                {/* Balance cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-amber-700">Loyalty Points</p>
                            <Star className="size-5 text-amber-500" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-amber-800">{stats.points_balance.toLocaleString()}</p>
                        <p className="mt-1 text-xs text-amber-600">≈ ৳{(stats.points_balance / 100).toFixed(2)} value · 100 pts = ৳1</p>
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-green-700">Wallet Balance</p>
                            <Wallet className="size-5 text-green-600" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-green-800">৳{Number(stats.wallet_balance).toFixed(2)}</p>
                        <p className="mt-1 text-xs text-green-600">Available to use at checkout</p>
                    </div>

                    <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-purple-700">Referrals</p>
                            <Users className="size-5 text-purple-600" />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-purple-800">{stats.total_referrals}</p>
                        <p className="mt-1 text-xs text-purple-600">{stats.rewarded_referrals} rewarded · 100 pts per referral</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="rounded-xl border border-gray-100 bg-white">
                    <div className="flex border-b">
                        {([
                            { key: 'points', label: 'Points History', icon: Star },
                            { key: 'wallet', label: 'Wallet History', icon: Wallet },
                            { key: 'referral', label: 'Referral Program', icon: Users },
                        ] as const).map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                                    activeTab === key
                                        ? 'border-b-2 border-[#e94560] text-[#e94560]'
                                        : 'text-gray-500 hover:text-gray-700',
                                )}
                            >
                                <Icon className="size-4" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-5">
                        {/* Points Tab */}
                        {activeTab === 'points' && (
                            <div>
                                {pointTransactions.data.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-gray-400">No point transactions yet. Shop and earn!</p>
                                ) : (
                                    <div className="divide-y">
                                        {pointTransactions.data.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn('rounded-full p-1.5', tx.type === 'earn' ? 'bg-green-100' : 'bg-red-100')}>
                                                        {tx.type === 'earn' ? (
                                                            <TrendingUp className="size-3.5 text-green-600" />
                                                        ) : (
                                                            <TrendingDown className="size-3.5 text-red-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-900">{tx.description}</p>
                                                        <p className="text-xs text-gray-400 capitalize">{tx.source} · {new Date(tx.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={cn('font-semibold text-sm', tx.type === 'earn' ? 'text-green-600' : 'text-red-500')}>
                                                    {tx.type === 'earn' ? '+' : '-'}{tx.amount} pts
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wallet Tab */}
                        {activeTab === 'wallet' && (
                            <div>
                                {walletTransactions.data.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-gray-400">No wallet transactions yet.</p>
                                ) : (
                                    <div className="divide-y">
                                        {walletTransactions.data.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn('rounded-full p-1.5', tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100')}>
                                                        {tx.type === 'credit' ? (
                                                            <TrendingUp className="size-3.5 text-green-600" />
                                                        ) : (
                                                            <TrendingDown className="size-3.5 text-red-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-900">{tx.description}</p>
                                                        <p className="text-xs text-gray-400 capitalize">{tx.source} · {new Date(tx.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={cn('font-semibold text-sm', tx.type === 'credit' ? 'text-green-600' : 'text-red-500')}>
                                                    {tx.type === 'credit' ? '+' : '-'}৳{Number(tx.amount).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Referral Tab */}
                        {activeTab === 'referral' && (
                            <div className="space-y-6">
                                <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-5">
                                    <h3 className="font-semibold text-gray-900">Your Referral Link</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Share your link. When a friend registers and places their first order, you both earn <strong>100 points</strong>!
                                    </p>
                                    {referralUrl ? (
                                        <div className="mt-4 flex gap-2">
                                            <div className="flex-1 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm text-gray-700 truncate">
                                                {referralUrl}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={copyReferralLink}
                                                className="flex shrink-0 items-center gap-2 rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium text-white hover:bg-[#c73652] transition-colors"
                                            >
                                                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-gray-500">Your referral code is being generated…</p>
                                    )}
                                </div>

                                {referrals.length > 0 && (
                                    <div>
                                        <h3 className="mb-3 font-semibold text-gray-900">Your Referrals</h3>
                                        <div className="divide-y rounded-xl border border-gray-100">
                                            {referrals.map((ref) => (
                                                <div key={ref.id} className="flex items-center justify-between px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{ref.referred_user.name}</p>
                                                        <p className="text-xs text-gray-400">Joined {new Date(ref.referred_user.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {ref.status === 'rewarded' && (
                                                            <span className="text-xs font-semibold text-green-600">+{ref.reward_points} pts</span>
                                                        )}
                                                        <Badge className={cn('border-0 text-xs capitalize', ref.status === 'rewarded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                                                            {ref.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
