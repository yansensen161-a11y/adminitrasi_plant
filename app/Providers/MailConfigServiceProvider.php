<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class MailConfigServiceProvider extends ServiceProvider
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
        try {
            if (Schema::hasTable('settings')) {
                $mailSettings = Cache::remember('mail_settings', 60 * 24, function () {
                    return Setting::where('key', 'like', 'mail_%')->pluck('value', 'key')->toArray();
                });

                if (count($mailSettings) > 0) {
                    Config::set('mail.default', $mailSettings['mail_mailer'] ?? env('MAIL_MAILER', 'smtp'));
                    Config::set('mail.mailers.smtp.host', $mailSettings['mail_host'] ?? env('MAIL_HOST', '127.0.0.1'));
                    Config::set('mail.mailers.smtp.port', $mailSettings['mail_port'] ?? env('MAIL_PORT', '2525'));
                    Config::set('mail.mailers.smtp.encryption', $mailSettings['mail_encryption'] ?? env('MAIL_ENCRYPTION', 'tls'));
                    Config::set('mail.mailers.smtp.username', $mailSettings['mail_username'] ?? env('MAIL_USERNAME'));
                    Config::set('mail.mailers.smtp.password', $mailSettings['mail_password'] ?? env('MAIL_PASSWORD'));
                    Config::set('mail.from.address', $mailSettings['mail_from_address'] ?? env('MAIL_FROM_ADDRESS', 'hello@example.com'));
                    Config::set('mail.from.name', $mailSettings['mail_from_name'] ?? env('MAIL_FROM_NAME', 'Example'));
                }
            }
        } catch (\Exception $e) {
            // Ignore if DB not setup
        }
    }
}
