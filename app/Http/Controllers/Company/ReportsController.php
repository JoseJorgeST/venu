<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $company = $request->current_company;
        $branch = $request->current_branch;

        $period = $request->input('period', 'month');
        $startDate = $this->getStartDate($period);
        $endDate = Carbon::now();

        $ordersQuery = Order::whereHas('restaurant', function ($q) use ($company) {
            $q->where('company_id', $company->id);
        });

        if ($branch) {
            $ordersQuery->where('restaurant_id', $branch->restaurant_id);
        }

        $salesOverTime = (clone $ordersQuery)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $salesByBranch = Order::select('restaurant_id')
            ->selectRaw('SUM(total_amount) as total_sales')
            ->selectRaw('COUNT(*) as total_orders')
            ->whereHas('restaurant', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('restaurant_id')
            ->with('restaurant.branch')
            ->get();

        $topProducts = Order::whereHas('restaurant', function ($q) use ($company) {
            $q->where('company_id', $company->id);
        })
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->flatMap(function ($order) {
                return collect($order->items)->map(function ($item) {
                    return [
                        'name' => $item['name'] ?? 'Unknown',
                        'quantity' => $item['quantity'] ?? 1,
                        'total' => ($item['price'] ?? 0) * ($item['quantity'] ?? 1),
                    ];
                });
            })
            ->groupBy('name')
            ->map(function ($items, $name) {
                return [
                    'name' => $name,
                    'quantity' => $items->sum('quantity'),
                    'total' => $items->sum('total'),
                ];
            })
            ->sortByDesc('quantity')
            ->take(10)
            ->values();

        $summary = [
            'total_revenue' => (clone $ordersQuery)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total_amount'),
            'total_orders' => (clone $ordersQuery)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'completed_orders' => (clone $ordersQuery)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'average_order_value' => (clone $ordersQuery)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->avg('total_amount') ?? 0,
            'cancelled_orders' => (clone $ordersQuery)
                ->where('status', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
        ];

        return Inertia::render('company/reports/index', [
            'company' => $company,
            'branch' => $branch,
            'salesOverTime' => $salesOverTime,
            'salesByBranch' => $salesByBranch,
            'topProducts' => $topProducts,
            'summary' => $summary,
            'period' => $period,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
        ]);
    }

    private function getStartDate(string $period): Carbon
    {
        return match ($period) {
            'week' => Carbon::now()->subWeek(),
            'month' => Carbon::now()->subMonth(),
            'quarter' => Carbon::now()->subQuarter(),
            'year' => Carbon::now()->subYear(),
            default => Carbon::now()->subMonth(),
        };
    }
}
