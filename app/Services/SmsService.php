<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Envía un SMS al número indicado.
     * Driver en .env: SMS_DRIVER=log|twilio|vonage
     */
    public function send(string $phone, string $message): bool
    {
        $driver = config('services.sms.driver', 'log');

        return match ($driver) {
            'log' => $this->sendViaLog($phone, $message),
            'twilio' => $this->sendViaTwilio($phone, $message),
            'vonage' => $this->sendViaVonage($phone, $message),
            default => $this->sendViaLog($phone, $message),
        };
    }

    /** Solo escribe en el log (desarrollo, sin coste). Ver storage/logs/laravel.log */
    protected function sendViaLog(string $phone, string $message): bool
    {
        Log::info('SMS OTP (driver=log)', [
            'phone' => $phone,
            'message' => $message,
        ]);

        return true;
    }

    /** Envía con Twilio (https://www.twilio.com) */
    protected function sendViaTwilio(string $phone, string $message): bool
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');

        if (! $sid || ! $token || ! $from) {
            Log::warning('Twilio no configurado: revisa TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM');

            return false;
        }

        $phone = $this->normalizePhone($phone);
        $url = "https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json";

        $response = Http::asForm()
            ->withBasicAuth($sid, $token)
            ->post($url, [
                'From' => $from,
                'To' => $phone,
                'Body' => $message,
            ]);

        if (! $response->successful()) {
            Log::error('Twilio SMS error', ['response' => $response->body()]);

            return false;
        }

        return true;
    }

    /** Envía con Vonage / Nexmo (https://www.vonage.com) - alternativa a Twilio */
    protected function sendViaVonage(string $phone, string $message): bool
    {
        $key = config('services.vonage.key');
        $secret = config('services.vonage.secret');
        $from = config('services.vonage.from');

        if (! $key || ! $secret || ! $from) {
            Log::warning('Vonage no configurado: revisa VONAGE_KEY, VONAGE_SECRET, VONAGE_FROM');

            return false;
        }

        $phone = $this->normalizePhone($phone);

        $response = Http::asForm()
            ->post('https://rest.nexmo.com/sms/json', [
                'api_key' => $key,
                'api_secret' => $secret,
                'from' => $from,
                'to' => ltrim($phone, '+'),
                'text' => $message,
            ]);

        $body = $response->json();
        $messages = $body['messages'] ?? [];
        $ok = isset($messages[0]['status']) && (int) $messages[0]['status'] === 0;

        if (! $ok) {
            Log::error('Vonage SMS error', ['response' => $body]);

            return false;
        }

        return true;
    }

    /** Asegura formato E.164 (ej: +573107106961) */
    protected function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\s+/', '', $phone);

        return str_starts_with($phone, '+') ? $phone : '+'.$phone;
    }
}
