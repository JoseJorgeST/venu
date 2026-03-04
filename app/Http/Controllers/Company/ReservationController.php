<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    public function index(Request $request): Response
    {
        $company = $request->current_company;
        $branch = $request->current_branch;

        if (!$company) {
            return Inertia::render('company/no-company');
        }

        $query = Reservation::with(['user', 'restaurant'])
            ->whereHas('restaurant', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            });

        if ($branch && $branch->restaurant_id) {
            $query->where('restaurant_id', $branch->restaurant_id);
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        if ($date = $request->input('date')) {
            $query->whereDate('date', $date);
        }

        $reservations = $query->orderByDesc('date')
            ->orderByDesc('time')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('company/reservations/index', [
            'reservations' => $reservations,
            'filters' => $request->only(['status', 'search', 'date']),
        ]);
    }

    public function show(Request $request, Reservation $reservation): Response
    {
        $company = $request->current_company;

        if (!$company) {
            abort(403);
        }

        $reservation->load(['user', 'restaurant']);

        if ($reservation->restaurant->company_id !== $company->id) {
            abort(403);
        }

        return Inertia::render('company/reservations/show', [
            'reservation' => $reservation,
        ]);
    }

    public function updateStatus(Request $request, Reservation $reservation): RedirectResponse
    {
        $company = $request->current_company;

        if (!$company || $reservation->restaurant->company_id !== $company->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,cancelled,completed,no_show'],
        ]);

        $reservation->update(['status' => $validated['status']]);

        return back()->with('success', 'Estado de la reservación actualizado.');
    }
}
