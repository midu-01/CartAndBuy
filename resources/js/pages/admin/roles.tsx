import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Permission { id: number; name: string }
interface Role { id: number; name: string; permissions: Permission[] }
interface Props { roles: Role[]; permissions: Permission[] }

const PERMISSION_GROUPS: Record<string, string[]> = {
    'Products': ['view products', 'manage products', 'bulk update products'],
    'Orders': ['view orders', 'manage orders', 'bulk update orders', 'create manual order'],
    'Payments': ['manage payments', 'manage refunds'],
    'Coupons': ['manage coupons', 'bulk generate coupons'],
    'Users': ['manage users', 'add customer notes'],
    'Reports': ['view reports', 'export reports'],
    'System': ['manage roles', 'view activity log'],
};

function CreateRoleDialog({ onClose }: { onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({ name: '' });
    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/roles', { onSuccess: onClose });
    }
    return (
        <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Create Role</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Role Name</label>
                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. order_manager"
                        className={cn('w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-[#e94560] focus:outline-none', errors.name && 'border-red-400')}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={processing} className="border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]">Create</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}

function PermissionGrid({ role, allPermissions, onSave }: { role: Role; allPermissions: Permission[]; onSave: (roleId: number, perms: string[]) => void }) {
    const [selected, setSelected] = useState<Set<string>>(new Set(role.permissions.map((p) => p.name)));
    const [saving, setSaving] = useState(false);

    const isSuperAdmin = role.name === 'super_admin';

    function toggle(name: string) {
        if (isSuperAdmin) return;
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
    }

    function save() {
        setSaving(true);
        router.post(`/admin/roles/${role.id}/permissions`, { permissions: [...selected] }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    }

    const isDirty = JSON.stringify([...selected].sort()) !== JSON.stringify(role.permissions.map((p) => p.name).sort());

    return (
        <div className="space-y-4">
            {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
                <div key={group}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{group}</p>
                    <div className="flex flex-wrap gap-2">
                        {perms.map((perm) => {
                            const exists = allPermissions.some((p) => p.name === perm);
                            if (!exists) return null;
                            const checked = selected.has(perm);
                            return (
                                <button
                                    key={perm}
                                    type="button"
                                    onClick={() => toggle(perm)}
                                    disabled={isSuperAdmin}
                                    className={cn(
                                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                        checked
                                            ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                                        isSuperAdmin && 'cursor-default opacity-60',
                                    )}
                                >
                                    {perm}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
            {!isSuperAdmin && (
                <Button onClick={save} disabled={saving || !isDirty} className="mt-2 border-0 bg-[#e94560] text-white hover:bg-[#c73652]">
                    {saving ? 'Saving…' : 'Save Permissions'}
                </Button>
            )}
        </div>
    );
}

export default function AdminRolesPage({ roles, permissions }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [activeRole, setActiveRole] = useState<Role>(roles[0] ?? null);

    function deleteRole(role: Role) {
        if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
        router.delete(`/admin/roles/${role.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Roles & Permissions — Admin" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-sm text-gray-500">Manage admin roles and their access levels</p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="gap-1.5 border-0 bg-[#1a1a2e] text-white hover:bg-[#0f3460]">
                    <Plus className="size-4" /> New Role
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {/* Role list */}
                <div className="space-y-1">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className={cn(
                                'flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-colors',
                                activeRole?.id === role.id ? 'bg-[#1a1a2e] text-white' : 'hover:bg-gray-100',
                            )}
                            onClick={() => setActiveRole(role)}
                        >
                            <div className="flex items-center gap-2">
                                <Shield className="size-4 shrink-0" />
                                <span className="text-sm font-medium">{role.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Badge className={cn('border-0 text-xs', activeRole?.id === role.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600')}>
                                    {role.permissions.length}
                                </Badge>
                                {role.name !== 'super_admin' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteRole(role); }}
                                        className={cn('rounded p-0.5 transition-colors', activeRole?.id === role.id ? 'hover:bg-white/20 text-white/60 hover:text-white' : 'text-gray-300 hover:bg-red-50 hover:text-red-500')}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Permission grid */}
                <div className="md:col-span-3">
                    {activeRole ? (
                        <div className="rounded-xl border bg-white p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeRole.name}</h2>
                                {activeRole.name === 'super_admin' && (
                                    <Badge className="border-0 bg-amber-100 text-amber-700 text-xs">All permissions (locked)</Badge>
                                )}
                            </div>
                            <PermissionGrid
                                key={activeRole.id}
                                role={activeRole}
                                allPermissions={permissions}
                                onSave={(id, perms) => console.log(id, perms)}
                            />
                        </div>
                    ) : (
                        <div className="flex h-48 items-center justify-center rounded-xl border bg-white text-gray-400">
                            Select a role to manage permissions
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <CreateRoleDialog onClose={() => setCreateOpen(false)} />
            </Dialog>
        </AdminLayout>
    );
}
