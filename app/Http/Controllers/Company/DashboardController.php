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

        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        $ordersQuery = Order::whereHas('restaurant', function ($q) use ($company) {
            $q->where('company_id', $company->id);
        });

        if ($branch) {
            $ordersQuery->where('restaurant_id', $branch->restaurant_id);
        }

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

        return Inertia::render('company/dashboard', [
            'company' => $company,
            'branch' => $branch,
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'pendingOrders' => $pendingOrders,
        ]);
    }
}
