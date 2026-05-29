<?php

namespace App\Services;

use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class AdminActivityLogger
{
    /**
     * Log an admin action.
     *
     * @param  string  $action  Example: 'order.status_changed', 'product.bulk_updated'
     * @param  string|null  $targetType  Example: 'App\Models\Order'
     */
    public static function log(
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?string $description = null,
        ?array $changes = null
    ): void {
        if (! Auth::check()) {
            return;
        }

        AdminActivityLog::create([
            'admin_id' => Auth::id(),
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'description' => $description,
            'changes' => $changes,
            'ip_address' => request()->ip(),
        ]);
    }
}
