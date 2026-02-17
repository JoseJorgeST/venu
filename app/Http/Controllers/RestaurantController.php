<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantController extends Controller
{
    /**
     * Display a listing of the restaurants.
     */
    public function index(): Response
    {
        return Inertia::render('restaurants/index', [
            'restaurants' => Inertia::lazy(fn () => Restaurant::all()),
        ]);
    }

    /**
     * Display the restaurant detail with menu items grouped by category.
     */
    public function show(string $slug): Response
    {
        $restaurant = Restaurant::where('slug', $slug)->with('menuItems')->firstOrFail();

        $menuItemsByCategory = $restaurant->menuItems
            ->groupBy('category')
            ->map(fn ($items, $category) => [
                'category' => $category,
                'items' => $items->values()->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('restaurants/show', [
            'restaurant' => $restaurant,
            'menuItemsByCategory' => $menuItemsByCategory,
        ]);
    }
}
