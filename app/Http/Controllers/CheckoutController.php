<?php

namespace App\Http\Controllers;

use App\Enums\LoyaltyTransactionType;
use App\Models\LoyaltyLog;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\Exception\ApiErrorException;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $walletPoints = $user ? ($user->wallet_points ?? 0) : 0;

        return Inertia::render('checkout/index', [
            'wallet_points' => $walletPoints,
        ]);
    }

    public function createPaymentIntent(Request $request)
    {
        Log::info('createPaymentIntent called', ['request' => $request->all()]);
        
        try {
            $validated = $request->validate([
                'restaurant_id' => 'required|integer|exists:restaurants,id',
                'items' => 'required|array|min:1',
                'items.*.menuItemId' => 'required|integer|exists:menu_items,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'use_points' => 'boolean',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'error' => 'Error de validación: ' . json_encode($e->errors()),
            ], 422);
        }

        $restaurant = Restaurant::findOrFail($validated['restaurant_id']);
        $stripeConfig = $restaurant->getStripeConfig();

        if (!$stripeConfig) {
            return response()->json([
                'error' => 'Este restaurante no tiene configurado el método de pago.',
            ], 400);
        }

        $subtotal = 0;
        $itemsData = [];

        foreach ($validated['items'] as $item) {
            $menuItem = MenuItem::where('id', $item['menuItemId'])
                ->where('restaurant_id', $restaurant->id)
                ->first();

            if (!$menuItem) {
                return response()->json([
                    'error' => 'Producto no encontrado en este restaurante.',
                ], 400);
            }

            $itemTotal = $menuItem->price * $item['quantity'];
            $subtotal += $itemTotal;

            $itemsData[] = [
                'menu_item_id' => $menuItem->id,
                'name' => $menuItem->name,
                'quantity' => $item['quantity'],
                'unit_price' => $menuItem->price,
                'total' => $itemTotal,
            ];
        }

        $commissionRate = 0.10;
        $commission = $subtotal * $commissionRate;
        $totalBeforePoints = $subtotal + $commission;

        $pointsDiscount = 0;
        $pointsUsed = 0;
        $user = $request->user();

        if ($validated['use_points'] ?? false) {
            if ($user && $user->wallet_points > 0) {
                $maxPointsToUse = min(
                    $user->wallet_points,
                    floor($totalBeforePoints * 100)
                );
                $pointsDiscount = $maxPointsToUse / 100;
                $pointsUsed = $maxPointsToUse;
            }
        }

        $finalTotal = max(0, $totalBeforePoints - $pointsDiscount);
        $amountInCents = (int) round($finalTotal * 100);

        if ($amountInCents < 50) {
            return response()->json([
                'error' => 'El monto mínimo de pago es 0.50€',
            ], 400);
        }

        try {
            $stripe = $restaurant->getStripeClient();

            $paymentIntent = $stripe->paymentIntents->create([
                'amount' => $amountInCents,
                'currency' => 'eur',
                'payment_method_types' => ['card'],
                'metadata' => [
                    'restaurant_id' => $restaurant->id,
                    'stripe_source' => $stripeConfig['source'],
                    'stripe_source_id' => $stripeConfig['source_id'],
                    'user_id' => $user?->id,
                    'subtotal' => $subtotal,
                    'commission' => $commission,
                    'points_used' => $pointsUsed,
                    'points_discount' => $pointsDiscount,
                ],
            ]);

            session([
                'pending_order' => [
                    'restaurant_id' => $restaurant->id,
                    'items' => $itemsData,
                    'subtotal' => $subtotal,
                    'commission' => $commission,
                    'points_used' => $pointsUsed,
                    'points_discount' => $pointsDiscount,
                    'total' => $finalTotal,
                    'payment_intent_id' => $paymentIntent->id,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'publishableKey' => $stripeConfig['stripe_key'],
                'amount' => $finalTotal,
            ]);
        } catch (ApiErrorException $e) {
            Log::error('Stripe API error', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Error al procesar el pago: ' . $e->getMessage(),
            ], 500);
        } catch (\Exception $e) {
            Log::error('General error in createPaymentIntent', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'error' => 'Error inesperado: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        $pendingOrder = session('pending_order');

        if (!$pendingOrder || $pendingOrder['payment_intent_id'] !== $validated['payment_intent_id']) {
            return response()->json([
                'error' => 'Orden no encontrada.',
            ], 400);
        }

        $restaurant = Restaurant::findOrFail($pendingOrder['restaurant_id']);

        if (!$restaurant->hasStripeConfigured()) {
            return response()->json([
                'error' => 'Error de configuración.',
            ], 400);
        }

        try {
            $stripe = $restaurant->getStripeClient();
            $paymentIntent = $stripe->paymentIntents->retrieve($validated['payment_intent_id']);

            if ($paymentIntent->status !== 'succeeded') {
                return response()->json([
                    'error' => 'El pago no se ha completado.',
                ], 400);
            }

            $order = DB::transaction(function () use ($pendingOrder, $request) {
                $user = $request->user();

                $order = Order::create([
                    'restaurant_id' => $pendingOrder['restaurant_id'],
                    'user_id' => $user?->id,
                    'status' => 'paid',
                    'items' => $pendingOrder['items'],
                    'total_amount' => $pendingOrder['total'],
                    'commission' => $pendingOrder['commission'],
                    'stripe_payment_id' => $pendingOrder['payment_intent_id'],
                ]);

                if ($user) {
                    // Si usó puntos, descontarlos y registrar en el historial
                    if ($pendingOrder['points_used'] > 0) {
                        $user->decrement('wallet_points', $pendingOrder['points_used']);
                        
                        LoyaltyLog::create([
                            'user_id' => $user->id,
                            'restaurant_id' => $pendingOrder['restaurant_id'],
                            'points_change' => -$pendingOrder['points_used'],
                            'transaction_type' => LoyaltyTransactionType::Redeem,
                            'order_id' => $order->id,
                        ]);
                    }

                    // Puntos ganados por la compra (2 puntos fijos por cada compra)
                    $pointsEarned = 2;
                    $user->increment('wallet_points', $pointsEarned);
                    
                    LoyaltyLog::create([
                        'user_id' => $user->id,
                        'restaurant_id' => $pendingOrder['restaurant_id'],
                        'points_change' => $pointsEarned,
                        'transaction_type' => LoyaltyTransactionType::Earn,
                        'order_id' => $order->id,
                    ]);
                }

                return $order;
            });

            session()->forget('pending_order');

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'message' => '¡Pago completado exitosamente!',
            ]);
        } catch (ApiErrorException $e) {
            return response()->json([
                'error' => 'Error al verificar el pago: ' . $e->getMessage(),
            ], 500);
        }
    }
}
