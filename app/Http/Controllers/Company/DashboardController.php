<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $company = $request->current_company;
        $branch = $request->current_branch;

        if (!$company) {
            return Inertia::render('company/no-company');
        }

        // Si hay sucursal, usa el restaurante de la sucursal
        // Si no hay sucursal, usa el restaurante principal de la empresa
        $restaurant = $branch ? $branch->restaurant : $company->mainRestaurant;

        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Si no hay restaurante, mostrar stats vacíos
        if (!$restaurant) {
            return Inertia::render('company/dashboard', [
                'company' => $company,
                'branch' => $branch,
                'stats' => [
                    'today_orders' => 0,
                    'today_revenue' => 0,
                    'month_orders' => 0,
                    'month_revenue' => 0,
                    'pending_orders' => 0,
                    'total_branches' => $company->branches()->count(),
                ],
                'recentOrders' => [],
                'pendingOrders' => [],
            ]);
        }

        $ordersQuery = Order::where('restaurant_id', $restaurant->id);

        $stats = [
            'today_orders' => (clone $ordersQuery)->whereDate('created_at', $today)->count(),
            'today_revenue' => (clone $ordersQuery)
                ->whereDate('created_at', $today)
                ->where('status', 'completed')
                ->sum('total_amount'),
            'month_orders' => (clone $ordersQuery)
                ->whereBetween('created_at', [$startOfMonth, Carbon::now()])
                ->count(),
            'month_revenue' => (clone $ordersQuery)
                ->whereBetween('created_at', [$startOfMonth, Carbon::now()])
                ->where('status', 'completed')
                ->sum('total_amount'),
            'pending_orders' => (clone $ordersQuery)
                ->whereIn('status', ['pending', 'paid', 'preparing'])
                ->count(),
            'total_branches' => $company->branches()->count(),
        ];

        $recentOrders = (clone $ordersQuery)
            ->with(['user', 'restaurant'])
            ->latest()
            ->take(10)
            ->get();

        $pendingOrders = (clone $ordersQuery)
            ->with(['user', 'restaurant'])
            ->whereIn('status', ['pending', 'paid', 'preparing'])
            ->latest()
            ->take(5)
            ->get();

        if ($branch) {
            $branch->load('restaurant');
        }

        return Inertia::render('company/dashboard', [
            'company' => $company,
            'branch' => $branch,
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'pendingOrders' => $pendingOrders,
        ]);
    }
}
