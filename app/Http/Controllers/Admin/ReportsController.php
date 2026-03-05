<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    // Estados que se consideran como pedidos exitosos/pagados
    private array $successStatuses = ['paid', 'preparing', 'ready', 'completed'];

    /**
     * Lista de empresas para seleccionar y ver reportes.
     */
    public function index(Request $request): Response
    {
        $successStatuses = $this->successStatuses;

        $companies = Company::with(['owner'])
            ->withCount(['branches', 'users'])
            ->withCount(['orders as total_orders'])
            ->withSum(['orders as total_revenue' => function ($query) use ($successStatuses) {
                $query->whereIn('orders.status', $successStatuses);
            }], 'total_amount')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $globalStats = [
            'total_companies' => Company::where('is_active', true)->count(),
            'total_orders' => Order::count(),
            'total_revenue' => Order::whereIn('status', $successStatuses)->sum('total_amount'),
            'total_users' => User::role('customer')->count(),
        ];

        return Inertia::render('admin/reports/index', [
            'companies' => $companies,
            'globalStats' => $globalStats,
        ]);
    }

    /**
     * Reportes detallados de una empresa específica.
     */
    public function show(Request $request, Company $company): Response
    {
        $period = $request->input('period', 'month');
        $startDate = $this->getStartDate($period);
        $endDate = Carbon::now();
        $successStatuses = $this->successStatuses;

        $company->load(['owner', 'branches.restaurant']);

        // Obtener IDs de restaurantes de la empresa
        $restaurantIds = Restaurant::where('company_id', $company->id)->pluck('id');

        // Ventas por día
        $salesOverTime = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as total'),
            DB::raw('COUNT(*) as count')
        )
            ->whereIn('restaurant_id', $restaurantIds)
            ->whereIn('status', $successStatuses)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top productos vendidos (desde JSON de items en orders)
        $topProducts = $this->getTopProductsFromOrders($restaurantIds, $startDate, $endDate);

        // Ventas por sucursal/restaurante
        $salesByBranch = Restaurant::where('company_id', $company->id)
            ->withCount(['orders as total_orders' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->withSum(['orders as total_revenue' => function ($query) use ($startDate, $endDate, $successStatuses) {
                $query->whereIn('status', $successStatuses)
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }], 'total_amount')
            ->get();

        // Pedidos recientes
        $recentOrders = Order::with(['user', 'restaurant'])
            ->whereIn('restaurant_id', $restaurantIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->latest()
            ->limit(10)
            ->get();

        // Top clientes
        $topCustomers = Order::select('user_id')
            ->selectRaw('COUNT(*) as total_orders')
            ->selectRaw('SUM(total_amount) as total_spent')
            ->with('user:id,name,email')
            ->whereIn('restaurant_id', $restaurantIds)
            ->whereIn('status', $successStatuses)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('user_id')
            ->orderByDesc('total_spent')
            ->limit(10)
            ->get();

        // Resumen
        $summary = [
            'total_revenue' => Order::whereIn('restaurant_id', $restaurantIds)
                ->whereIn('status', $successStatuses)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('total_amount'),
            'total_orders' => Order::whereIn('restaurant_id', $restaurantIds)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'completed_orders' => Order::whereIn('restaurant_id', $restaurantIds)
                ->whereIn('status', $successStatuses)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'cancelled_orders' => Order::whereIn('restaurant_id', $restaurantIds)
                ->where('status', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'average_order_value' => Order::whereIn('restaurant_id', $restaurantIds)
                ->whereIn('status', $successStatuses)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->avg('total_amount') ?? 0,
            'unique_customers' => Order::whereIn('restaurant_id', $restaurantIds)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->distinct('user_id')
                ->count('user_id'),
        ];

        return Inertia::render('admin/reports/show', [
            'company' => $company,
            'salesOverTime' => $salesOverTime,
            'topProducts' => $topProducts,
            'salesByBranch' => $salesByBranch,
            'recentOrders' => $recentOrders,
            'topCustomers' => $topCustomers,
            'summary' => $summary,
            'period' => $period,
            'startDate' => $startDate->toDateString(),
            'endDate' => $endDate->toDateString(),
        ]);
    }

    /**
     * Historial de pedidos de una empresa.
     */
    public function orders(Request $request, Company $company): Response
    {
        $restaurantIds = Restaurant::where('company_id', $company->id)->pluck('id');

        $query = Order::with(['user', 'restaurant'])
            ->whereIn('restaurant_id', $restaurantIds)
            ->latest();

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($startDate = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $orders = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/reports/orders', [
            'company' => $company,
            'orders' => $orders,
            'filters' => $request->only(['status', 'start_date', 'end_date']),
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

    /**
     * Obtener productos más vendidos desde el JSON de items en orders.
     */
    private function getTopProductsFromOrders($restaurantIds, Carbon $startDate, Carbon $endDate): \Illuminate\Support\Collection
    {
        $orders = Order::whereIn('restaurant_id', $restaurantIds)
            ->whereIn('status', $this->successStatuses)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get(['items']);

        $productStats = [];

        foreach ($orders as $order) {
            $items = $order->items ?? [];
            foreach ($items as $item) {
                $name = $item['name'] ?? 'Producto desconocido';
                $quantity = $item['quantity'] ?? 1;
                // El precio puede estar en 'unit_price', 'price' o calcular desde 'total'
                $price = $item['unit_price'] ?? $item['price'] ?? 0;
                $subtotal = $item['total'] ?? ($quantity * floatval($price));

                if (!isset($productStats[$name])) {
                    $productStats[$name] = [
                        'name' => $name,
                        'total_quantity' => 0,
                        'total_revenue' => 0,
                    ];
                }

                $productStats[$name]['total_quantity'] += $quantity;
                $productStats[$name]['total_revenue'] += floatval($subtotal);
            }
        }

        return collect($productStats)
            ->sortByDesc('total_quantity')
            ->take(10)
            ->values();
    }
}
