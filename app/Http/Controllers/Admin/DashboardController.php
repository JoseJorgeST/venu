<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_companies' => Company::count(),
            'active_companies' => Company::where('is_active', true)->count(),
            'total_users' => User::count(),
            'total_admins' => User::role('admin')->count(),
            'total_customers' => User::role('customer')->count(),
            'total_orders' => Order::count(),
            'total_revenue' => Order::where('status', 'completed')->sum('total_amount'),
        ];

        $recentCompanies = Company::with('owner')
            ->latest()
            ->take(5)
            ->get();

        $recentOrders = Order::with(['user', 'restaurant'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentCompanies' => $recentCompanies,
            'recentOrders' => $recentOrders,
        ]);
    }
}
