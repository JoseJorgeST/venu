<?php

namespace App\Http\Controllers\Company;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $company = $request->current_company;
        $branch = $request->current_branch;

        // Si hay sucursal, usa el restaurante de la sucursal
        // Si no hay sucursal, usa el restaurante principal de la empresa
        $restaurant = $branch ? $branch->restaurant : $company->mainRestaurant;

        if (!$restaurant) {
            return Inertia::render('company/orders/index', [
                'orders' => ['data' => [], 'links' => [], 'current_page' => 1, 'last_page' => 1],
                'branches' => $company->branches()->with('restaurant')->get(),
                'currentBranch' => $branch,
                'filters' => [],
                'statuses' => OrderStatus::cases(),
            ]);
        }

        $query = Order::with(['user', 'restaurant'])
            ->where('restaurant_id', $restaurant->id);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($startDate = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        $branches = $company->branches()->with('restaurant')->get();

        return Inertia::render('company/orders/index', [
            'orders' => $orders,
            'branches' => $branches,
            'currentBranch' => $branch,
            'filters' => $request->only(['status', 'search', 'start_date', 'end_date']),
            'statuses' => OrderStatus::cases(),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $company = $request->current_company;

        if (!$this->orderBelongsToCompany($order, $company)) {
            abort(403);
        }

        $order->load(['user', 'restaurant', 'loyaltyLogs']);

        return Inertia::render('company/orders/show', [
            'order' => $order,
            'statuses' => OrderStatus::cases(),
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $company = $request->current_company;

        if (!$this->orderBelongsToCompany($order, $company)) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,paid,preparing,ready,completed'],
        ]);

        $order->update(['status' => $validated['status']]);

        return back()->with('success', 'Estado del pedido actualizado.');
    }

    /**
     * Verifica si el pedido pertenece a la empresa (directamente o a través de una sucursal).
     */
    private function orderBelongsToCompany(Order $order, $company): bool
    {
        $restaurant = $order->restaurant;
        
        // Si el restaurante pertenece directamente a la empresa
        if ($restaurant->company_id === $company->id) {
            return true;
        }

        // Si el restaurante pertenece a una sucursal de la empresa
        $branch = $restaurant->branch;
        if ($branch && $branch->company_id === $company->id) {
            return true;
        }

        return false;
    }

    public function pending(Request $request): Response
    {
        $company = $request->current_company;
        $branch = $request->current_branch;

        // Si hay sucursal, usa el restaurante de la sucursal
        // Si no hay sucursal, usa el restaurante principal de la empresa
        $restaurant = $branch ? $branch->restaurant : $company->mainRestaurant;

        if (!$restaurant) {
            return Inertia::render('company/orders/pending', [
                'orders' => [],
                'statuses' => OrderStatus::cases(),
            ]);
        }

        $orders = Order::with(['user', 'restaurant'])
            ->where('restaurant_id', $restaurant->id)
            ->whereIn('status', ['pending', 'paid', 'preparing', 'ready'])
            ->latest()
            ->get();

        return Inertia::render('company/orders/pending', [
            'orders' => $orders,
            'statuses' => OrderStatus::cases(),
        ]);
    }
}
