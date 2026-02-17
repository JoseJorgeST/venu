<?php

use App\Http\Controllers\LoyaltyController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RestaurantController;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'restaurants' => Restaurant::where('is_active', true)->limit(6)->get(),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard', [
        'restaurants' => Restaurant::where('is_active', true)->limit(6)->get(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/restaurants', [RestaurantController::class, 'index'])->name('restaurants.index');
Route::get('/restaurants/{slug}', [RestaurantController::class, 'show'])->name('restaurants.show');

Route::get('/cart', fn () => Inertia::render('cart/index'))->name('cart.index');

Route::get('/checkout', function () {
    $user = request()->user();
    return Inertia::render('checkout/index', [
        'wallet_points' => $user ? (int) $user->wallet_points : 0,
    ]);
})->middleware('auth')->name('checkout.index');

Route::get('/orders/confirmation', function () {
    return Inertia::render('orders/confirmation', [
        'points_earned' => (int) request()->query('points_earned', 0),
    ]);
})->middleware('auth')->name('orders.confirmation');

Route::middleware('auth')->prefix('loyalty')->group(function () {
    Route::get('/balance', [LoyaltyController::class, 'balance'])->name('loyalty.balance');
    Route::get('/history', [LoyaltyController::class, 'history'])->name('loyalty.history');
    Route::get('/wallet', [LoyaltyController::class, 'wallet'])->name('loyalty.wallet');
});

Route::resource('reservations', ReservationController::class)->middleware('auth');

Route::post('otp/send', [OtpController::class, 'send'])->name('otp.send');
Route::post('otp/verify', [OtpController::class, 'verify'])->name('otp.verify');
Route::get('auth/verify-otp', function () {
    return Inertia::render('auth/verify-otp', [
        'phone' => request()->query('phone', ''),
    ]);
})->name('verify-otp');

Route::get('auth/google/redirect', function () {
    return redirect()->route('login')->with('status', 'Inicia sesión con Google próximamente. Usa email o teléfono.');
})->name('login.google');

require __DIR__.'/settings.php';
