<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('products:publish-scheduled')]
#[Description('Publish products whose scheduled publish date has arrived')]
class PublishScheduledProducts extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = Product::where('status', 'scheduled')
            ->whereNotNull('publish_at')
            ->where('publish_at', '<=', now())
            ->update([
                'status' => 'published',
                'publish_at' => null,
            ]);

        $label = $count === 1 ? 'product' : 'products';
        $this->info("Published {$count} scheduled {$label}.");

        return self::SUCCESS;
    }
}
