<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoyaltyController extends Controller
{
    /**
     * Devuelve el balance de puntos del usuario autenticado.
     */
    public function balance(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['wallet_points' => 0], 401);
        }

        return response()->json([
            'wallet_points' => (int) $user->wallet_points,
        ]);
    }

    /**
     * Devuelve el historial de puntos (LoyaltyLogs) del usuario.
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['logs' => []], 401);
        }

        $logs = $user->loyaltyLogs()
            ->with('restaurant:id,name')
            ->latest()
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'points_change' => $log->points_change,
                'transaction_type' => $log->transaction_type->value,
                'created_at' => $log->created_at->toIso8601String(),
                'restaurant' => $log->restaurant ? ['id' => $log->restaurant->id, 'name' => $log->restaurant->name] : null,
            ]);

        return response()->json(['logs' => $logs]);
    }

    /**
     * Página de wallet: balance, QR e historial.
     */
    public function wallet(Request $request): Response
    {
        $user = $request->user();
        $walletPoints = $user ? (int) $user->wallet_points : 0;
        $logs = $user
            ? $user->loyaltyLogs()
                ->with('restaurant:id,name')
                ->latest()
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'points_change' => $log->points_change,
                    'transaction_type' => $log->transaction_type->value,
                    'created_at' => $log->created_at->toIso8601String(),
                    'restaurant' => $log->restaurant ? ['id' => $log->restaurant->id, 'name' => $log->restaurant->name] : null,
                ])
            : [];

        return Inertia::render('loyalty/wallet', [
            'user' => $user ? ['id' => $user->id, 'name' => $user->name] : null,
            'wallet_points' => $walletPoints,
            'logs' => $logs,
        ]);
    }
}
