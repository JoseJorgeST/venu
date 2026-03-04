<?php

namespace App\Http\Controllers;

use App\Enums\ReservationStatus;
use App\Models\Reservation;
use App\Models\Restaurant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    /**
     * Display a listing of the user's reservations.
     */
    public function index(Request $request): Response
    {
        $reservations = Auth::user()
            ->reservations()
            ->with('restaurant')
            ->orderByDesc('date')
            ->orderByDesc('time')
            ->get();

        return Inertia::render('reservations/index', [
            'reservations' => $reservations,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Show the form for creating a new reservation.
     */
    public function create(Request $request): Response
    {
        $restaurantId = $request->query('restaurant_id');
        $restaurant = $restaurantId ? Restaurant::find($restaurantId) : null;

        return Inertia::render('reservations/create', [
            'restaurant' => $restaurant,
        ]);
    }

    /**
     * Store a newly created reservation in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'restaurant_id' => ['required', 'exists:restaurants,id'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['required', 'string', 'regex:/^\d{2}:\d{2}(?::\d{2})?$/'],
            'party_size' => ['required', 'integer', 'min:1', 'max:20'],
            'special_requests' => ['nullable', 'string', 'max:500'],
        ]);

        $validated['user_id'] = Auth::id();
        $validated['status'] = ReservationStatus::Pending;

        Reservation::create($validated);

        return redirect()->route('reservations.index')
            ->with('status', 'Reserva enviada. El restaurante confirmará tu reservación pronto.');
    }

    /**
     * Remove (cancel) the specified reservation.
     */
    public function destroy(string $reservation): RedirectResponse
    {
        $model = Reservation::where('user_id', Auth::id())->findOrFail($reservation);
        $model->update(['status' => ReservationStatus::Cancelled]);

        return redirect()->route('reservations.index')
            ->with('status', 'Reserva cancelada.');
    }
}
