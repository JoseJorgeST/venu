<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\TableLocation;
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

        // Si hay sucursal, usa el restaurante de la sucursal
        // Si no hay sucursal, usa el restaurante principal de la empresa
        $restaurant = $branch ? $branch->restaurant : $company->mainRestaurant;

        if (!$restaurant) {
            return Inertia::render('company/reservations/index', [
                'reservations' => ['data' => [], 'links' => [], 'current_page' => 1, 'last_page' => 1],
                'filters' => [],
                'tableLocations' => [],
            ]);
        }

        $query = Reservation::with(['user', 'restaurant'])
            ->where('restaurant_id', $restaurant->id);

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

        $tableLocations = TableLocation::where('company_id', $company->id)
            ->active()
            ->ordered()
            ->get(['id', 'name', 'description']);

        return Inertia::render('company/reservations/index', [
            'reservations' => $reservations,
            'filters' => $request->only(['status', 'search', 'date']),
            'tableLocations' => $tableLocations,
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
            'table_number' => ['nullable', 'string', 'max:20'],
            'table_location' => ['nullable', 'string', 'max:50'],
            'rejection_reason' => ['nullable', 'string', 'max:100'],
            'admin_message' => ['nullable', 'string', 'max:2000'],
            'alternative_date' => ['nullable', 'date'],
            'alternative_time' => ['nullable', 'string'],
        ]);

        $updateData = ['status' => $validated['status']];

        if (!empty($validated['table_number'])) {
            $updateData['table_number'] = $validated['table_number'];
        }

        if (!empty($validated['table_location'])) {
            $updateData['table_location'] = $validated['table_location'];
        }

        if (!empty($validated['rejection_reason'])) {
            $updateData['rejection_reason'] = $validated['rejection_reason'];
        }

        if (!empty($validated['admin_message'])) {
            $updateData['admin_message'] = $validated['admin_message'];
        }

        if (!empty($validated['alternative_date'])) {
            $updateData['alternative_date'] = $validated['alternative_date'];
        }

        if (!empty($validated['alternative_time'])) {
            $updateData['alternative_time'] = $validated['alternative_time'];
        }

        if (in_array($validated['status'], ['confirmed', 'cancelled'])) {
            $updateData['responded_at'] = now();
        }

        $reservation->update($updateData);

        $statusMessages = [
            'confirmed' => 'Reservación confirmada exitosamente.',
            'cancelled' => 'Reservación rechazada. Se ha notificado al cliente.',
            'completed' => 'Reservación marcada como completada.',
            'no_show' => 'Reservación marcada como no asistió.',
        ];

        return back()->with('success', $statusMessages[$validated['status']] ?? 'Estado actualizado.');
    }
}
