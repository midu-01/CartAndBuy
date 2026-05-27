import { Head, router } from '@inertiajs/react';
import { Check, Trash2, X } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/shop/pagination';
import StarRating from '@/components/shop/star-rating';
import { Badge } from '@/components/ui/badge';

interface Review { id: number; rating: number; comment: string | null; is_approved: boolean; created_at: string; user: { name: string }; product: { name: string; slug: string } }
interface Props { reviews: { data: Review[]; links: { url: string | null; label: string; active: boolean }[] }; filters: { approved?: string } }

export default function AdminReviewsPage({ reviews, filters }: Props) {
    function applyFilter(approved: string | undefined) {
        router.get('/admin/reviews', approved !== undefined ? { approved } : {}, { preserveScroll: true });
    }

    function toggleApprove(r: Review) {
        router.patch(`/admin/reviews/${r.id}/approve`, {}, { preserveScroll: true });
    }

    function destroy(r: Review) {
        if (confirm('Delete this review?')) router.delete(`/admin/reviews/${r.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Reviews — Admin" />

            <div className="flex gap-1 mb-6">
                {[{ label: 'All', value: undefined }, { label: 'Approved', value: '1' }, { label: 'Pending', value: '0' }].map(({ label, value }) => (
                    <button key={label} onClick={() => applyFilter(value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(filters.approved ?? undefined) === value ? 'bg-[#1a1a2e] text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-5 py-3 text-left">Customer</th>
                            <th className="px-5 py-3 text-left">Product</th>
                            <th className="px-5 py-3 text-left">Rating</th>
                            <th className="px-5 py-3 text-left">Comment</th>
                            <th className="px-5 py-3 text-center">Status</th>
                            <th className="px-5 py-3 text-left">Date</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-gray-900">
                        {reviews.data.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 font-medium">{r.user.name}</td>
                                <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">{r.product.name}</td>
                                <td className="px-5 py-3"><StarRating value={r.rating} size="sm" /></td>
                                <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate">{r.comment ?? <span className="text-gray-300 italic">No comment</span>}</td>
                                <td className="px-5 py-3 text-center">
                                    <Badge className={`border-0 ${r.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.is_approved ? 'Approved' : 'Pending'}</Badge>
                                </td>
                                <td className="px-5 py-3 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => toggleApprove(r)} className={`p-1.5 rounded transition-colors ${r.is_approved ? 'hover:bg-amber-50 text-amber-500 hover:text-amber-700' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`} title={r.is_approved ? 'Unapprove' : 'Approve'}>
                                            {r.is_approved ? <X className="size-4" /> : <Check className="size-4" />}
                                        </button>
                                        <button onClick={() => destroy(r)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="size-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {reviews.data.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No reviews found</td></tr>}
                    </tbody>
                </table>
            </div>
            <Pagination links={reviews.links} />
        </AdminLayout>
    );
}
