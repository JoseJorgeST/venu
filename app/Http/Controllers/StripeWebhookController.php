<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request, Company $company)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        if (!$company->stripe_webhook_secret) {
            Log::warning('Stripe webhook: Company has no webhook secret configured', [
                'company_id' => $company->id,
            ]);
            return response()->json(['error' => 'Webhook not configured'], 400);
        }

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $company->stripe_webhook_secret
            );
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe webhook: Invalid signature', [
                'company_id' => $company->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event->data->object, $company);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event->data->object, $company);
                break;

            default:
                Log::info('Stripe webhook: Unhandled event type', [
                    'type' => $event->type,
                    'company_id' => $company->id,
                ]);
        }

        return response()->json(['received' => true]);
    }

    protected function handlePaymentIntentSucceeded($paymentIntent, Company $company): void
    {
        $order = Order::where('stripe_payment_id', $paymentIntent->id)->first();

        if ($order) {
            $order->update(['status' => 'paid']);
            Log::info('Stripe webhook: Order confirmed via webhook', [
                'order_id' => $order->id,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        } else {
            Log::info('Stripe webhook: Payment succeeded but no matching order found', [
                'payment_intent_id' => $paymentIntent->id,
                'company_id' => $company->id,
            ]);
        }
    }

    protected function handlePaymentIntentFailed($paymentIntent, Company $company): void
    {
        $order = Order::where('stripe_payment_id', $paymentIntent->id)->first();

        if ($order) {
            $order->update(['status' => 'pending']);
            Log::warning('Stripe webhook: Payment failed, order cancelled', [
                'order_id' => $order->id,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        }
    }
}
