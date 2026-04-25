<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class NotificationBootServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Skip execution if running in the console (e.g. migrations, queue workers, tests)
        if ($this->app->runningInConsole()) {
            return;
        }

        // Run the command after the HTTP response has been sent to the client
        // so we don't block or slow down the user's request.
        $this->app->terminating(function () {
            $cache = Cache::store('file');
            $cacheKey = 'notifications_generation_throttle';

            // 10-second atomic lock to prevent parallel execution during page load
            if ($cache->add($cacheKey, true, now()->addSeconds(10))) {
                try {
                    Artisan::call('notifications:generate');
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to auto-generate notifications: " . $e->getMessage());
                }
            }
        });
    }
}
