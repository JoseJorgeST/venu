<?php

use App\Http\Controllers\Admin\CompanyController as AdminCompanyController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ReportsController as AdminReportsController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Company\BranchController;
use App\Http\Controllers\Company\DashboardController as CompanyDashboardController;
use App\Http\Controllers\Company\MenuItemController;
use App\Http\Controllers\Company\OrderController as CompanyOrderController;
use App\Http\Controllers\Company\ReportsController as CompanyReportsController;
use App\Http\Controllers\ContextController;
use App\Http\Controllers\GoogleAuthController;
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
    $user = request()->user();
    
    if ($user->hasRole('super_admin')) {
        return redirect('/admin');
    }
    
    if ($user->hasRole('admin')) {
        return redirect('/company');
    }
    
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

Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('login.google');
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('login.google.callback');

Route::middleware('auth')->group(function () {
    Route::post('/context/company', [ContextController::class, 'switchCompany'])->name('context.switch-company');
    Route::post('/context/branch', [ContextController::class, 'switchBranch'])->name('context.switch-branch');
});

Route::prefix('admin')->name('admin.')->middleware(['auth', 'super_admin'])->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::resource('companies', AdminCompanyController::class);
    Route::post('companies/{company}/toggle-status', [AdminCompanyController::class, 'toggleStatus'])->name('companies.toggle-status');

    Route::get('companies/{company}/branches/create', [App\Http\Controllers\Admin\BranchController::class, 'create'])->name('companies.branches.create');
    Route::post('companies/{company}/branches', [App\Http\Controllers\Admin\BranchController::class, 'store'])->name('companies.branches.store');
    Route::get('companies/{company}/branches/{branch}', [App\Http\Controllers\Admin\BranchController::class, 'show'])->name('companies.branches.show');
    Route::get('companies/{company}/branches/{branch}/edit', [App\Http\Controllers\Admin\BranchController::class, 'edit'])->name('companies.branches.edit');
    Route::put('companies/{company}/branches/{branch}', [App\Http\Controllers\Admin\BranchController::class, 'update'])->name('companies.branches.update');
    Route::delete('companies/{company}/branches/{branch}', [App\Http\Controllers\Admin\BranchController::class, 'destroy'])->name('companies.branches.destroy');

    Route::get('companies/{company}/branches/{branch}/menu', [App\Http\Controllers\Admin\BranchController::class, 'menu'])->name('companies.branches.menu');
    Route::post('companies/{company}/branches/{branch}/menu', [App\Http\Controllers\Admin\BranchController::class, 'storeMenuItem'])->name('companies.branches.menu.store');
    Route::put('companies/{company}/branches/{branch}/menu/{menuItem}', [App\Http\Controllers\Admin\BranchController::class, 'updateMenuItem'])->name('companies.branches.menu.update');
    Route::delete('companies/{company}/branches/{branch}/menu/{menuItem}', [App\Http\Controllers\Admin\BranchController::class, 'destroyMenuItem'])->name('companies.branches.menu.destroy');

    Route::resource('users', AdminUserController::class);
    Route::post('users/{user}/assign-role', [AdminUserController::class, 'assignRole'])->name('users.assign-role');

    Route::get('reports', [AdminReportsController::class, 'index'])->name('reports.index');
    Route::get('reports/{company}', [AdminReportsController::class, 'show'])->name('reports.show');
    Route::get('reports/{company}/orders', [AdminReportsController::class, 'orders'])->name('reports.orders');
});

Route::prefix('company')->name('company.')->middleware(['auth', 'company_access'])->group(function () {
    Route::get('/', [CompanyDashboardController::class, 'index'])->name('dashboard');

    Route::resource('branches', BranchController::class);
    Route::post('branches/{branch}/toggle-status', [BranchController::class, 'toggleStatus'])->name('branches.toggle-status');

    Route::get('branches/{branch}/menu-items', [MenuItemController::class, 'index'])->name('branches.menu-items.index');
    Route::get('branches/{branch}/menu-items/create', [MenuItemController::class, 'create'])->name('branches.menu-items.create');
    Route::post('branches/{branch}/menu-items', [MenuItemController::class, 'store'])->name('branches.menu-items.store');
    Route::get('branches/{branch}/menu-items/{menuItem}/edit', [MenuItemController::class, 'edit'])->name('branches.menu-items.edit');
    Route::put('branches/{branch}/menu-items/{menuItem}', [MenuItemController::class, 'update'])->name('branches.menu-items.update');
    Route::delete('branches/{branch}/menu-items/{menuItem}', [MenuItemController::class, 'destroy'])->name('branches.menu-items.destroy');
    Route::post('branches/{branch}/menu-items/{menuItem}/toggle-availability', [MenuItemController::class, 'toggleAvailability'])->name('branches.menu-items.toggle-availability');

    Route::get('orders', [CompanyOrderController::class, 'index'])->name('orders.index');
    Route::get('orders/pending', [CompanyOrderController::class, 'pending'])->name('orders.pending');
    Route::get('orders/{order}', [CompanyOrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}/status', [CompanyOrderController::class, 'updateStatus'])->name('orders.update-status');

    Route::get('reports', [CompanyReportsController::class, 'index'])->name('reports.index');

    Route::get('reservations', [App\Http\Controllers\Company\ReservationController::class, 'index'])->name('reservations.index');
    Route::get('reservations/{reservation}', [App\Http\Controllers\Company\ReservationController::class, 'show'])->name('reservations.show');
    Route::patch('reservations/{reservation}/status', [App\Http\Controllers\Company\ReservationController::class, 'updateStatus'])->name('reservations.update-status');
});

require __DIR__.'/settings.php';
