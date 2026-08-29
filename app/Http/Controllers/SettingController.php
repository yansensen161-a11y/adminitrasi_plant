<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::where('key', 'like', 'mail_%')->pluck('value', 'key')->toArray();

        // Defaults if not set in DB
        $defaultSettings = [
            'mail_mailer' => $settings['mail_mailer'] ?? config('mail.default', 'smtp'),
            'mail_host' => $settings['mail_host'] ?? config('mail.mailers.smtp.host', '127.0.0.1'),
            'mail_port' => $settings['mail_port'] ?? (string) config('mail.mailers.smtp.port', '2525'),
            'mail_username' => $settings['mail_username'] ?? config('mail.mailers.smtp.username', ''),
            'mail_password' => $settings['mail_password'] ?? config('mail.mailers.smtp.password', ''),
            'mail_encryption' => $settings['mail_encryption'] ?? config('mail.mailers.smtp.encryption', 'tls'),
            'mail_from_address' => $settings['mail_from_address'] ?? config('mail.from.address', 'hello@example.com'),
            'mail_from_name' => $settings['mail_from_name'] ?? config('mail.from.name', 'System Plant'),
        ];

        return Inertia::render('Settings/Mail', [
            'settings' => $defaultSettings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'mail_mailer' => 'required|string',
            'mail_host' => 'required|string',
            'mail_port' => 'required|numeric',
            'mail_username' => 'nullable|string',
            'mail_password' => 'nullable|string',
            'mail_encryption' => 'nullable|string',
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => (string) $value, 'type' => 'string']
            );
        }

        Cache::forget('mail_settings');

        return redirect()->back()->with('message', 'Email configuration updated successfully.');
    }

    public function sendTestMail(Request $request)
    {
        $request->validate([
            'test_email' => 'required|email',
        ]);

        try {
            // Apply current dynamic settings
            $settings = Setting::where('key', 'like', 'mail_%')->pluck('value', 'key')->toArray();

            if (! empty($settings)) {
                Config::set('mail.default', $settings['mail_mailer'] ?? 'smtp');
                Config::set('mail.mailers.smtp.host', $settings['mail_host'] ?? '127.0.0.1');
                Config::set('mail.mailers.smtp.port', $settings['mail_port'] ?? 2525);
                Config::set('mail.mailers.smtp.encryption', $settings['mail_encryption'] ?? 'tls');
                Config::set('mail.mailers.smtp.username', $settings['mail_username'] ?? null);
                Config::set('mail.mailers.smtp.password', $settings['mail_password'] ?? null);
                Config::set('mail.from.address', $settings['mail_from_address'] ?? 'noreply@systemplant.com');
                Config::set('mail.from.name', $settings['mail_from_name'] ?? 'System Plant');
            }

            $recipient = $request->test_email;

            Mail::raw('🎉 Selamat! Konfigurasi SMTP email pada System Plant berhasil terhubung dan bekerja dengan baik.', function ($message) use ($recipient) {
                $message->to($recipient)
                    ->subject('🧪 Test Email - System Plant Verification');
            });

            return redirect()->back()->with('message', "Test email sent successfully to {$recipient}.");
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['test_email' => 'Failed to send email: '.$e->getMessage()]);
        }
    }
}
