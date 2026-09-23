<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
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
            'mail_password' => '', // Never expose real password in plain text to frontend
            'has_mail_password' => ! empty($settings['mail_password']) || ! empty(config('mail.mailers.smtp.password')),
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
            if ($key === 'mail_password') {
                // Only update password if a new one was provided
                if ($request->filled('mail_password')) {
                    Setting::updateOrCreate(
                        ['key' => 'mail_password'],
                        ['value' => Crypt::encryptString($request->mail_password), 'type' => 'string']
                    );
                }

                continue;
            }

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
                $password = $settings['mail_password'] ?? null;
                if (! empty($password)) {
                    try {
                        $password = Crypt::decryptString($password);
                    } catch (\Exception $e) {
                        // Fallback for legacy plaintext password
                    }
                }

                Config::set('mail.default', $settings['mail_mailer'] ?? 'smtp');
                Config::set('mail.mailers.smtp.host', $settings['mail_host'] ?? '127.0.0.1');
                Config::set('mail.mailers.smtp.port', $settings['mail_port'] ?? 2525);
                Config::set('mail.mailers.smtp.encryption', $settings['mail_encryption'] ?? 'tls');
                Config::set('mail.mailers.smtp.username', $settings['mail_username'] ?? null);
                Config::set('mail.mailers.smtp.password', $password);
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
            Log::error('SMTP Test Mail Error: '.$e->getMessage());

            return redirect()->back()->withErrors(['test_email' => 'Gagal mengirim email uji: '.$e->getMessage()]);
        }
    }
}
