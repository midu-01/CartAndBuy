<?php

namespace App\Providers;

use App\Models\ActivityLog;
use App\Models\Order;
use App\Models\User;
use App\Observers\OrderObserver;
use App\Services\AiAssistant\AiProviderInterface;
use App\Services\AiAssistant\OpenAiProvider;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AiProviderInterface::class, fn () => new OpenAiProvider(
            apiKey: (string) config('ai.api_key', ''),
            model: (string) config('ai.model', 'gpt-4o-mini'),
        ));
    }

    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerObservers();
        $this->registerActivityListeners();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function registerObservers(): void
    {
        Order::observe(OrderObserver::class);
    }

    protected function registerActivityListeners(): void
    {
        Event::listen(Login::class, function (Login $event): void {
            if (! $event->user instanceof User) {
                return;
            }

            ActivityLog::create([
                'user_id' => $event->user->id,
                'action' => 'login',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });

        Event::listen(Logout::class, function (Logout $event): void {
            if (! $event->user instanceof User) {
                return;
            }

            ActivityLog::create([
                'user_id' => $event->user->id,
                'action' => 'logout',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });
    }
}
