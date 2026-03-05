<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Company;
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
        // Obtener empresas destacadas con sus restaurantes principales
        $featuredCompanies = Company::where('is_featured', true)
            ->where('is_active', true)
            ->with('mainRestaurant')
            ->orderBy('featured_order')
            ->get();

        // Obtener sucursales destacadas con sus restaurantes
        $featuredBranches = Branch::where('is_featured', true)
            ->where('is_active', true)
            ->with('restaurant')
            ->orderBy('featured_order')
            ->get();

        // Combinar restaurantes destacados
        $featuredRestaurants = collect();
        
        foreach ($featuredCompanies as $company) {
            if ($company->mainRestaurant && $company->mainRestaurant->is_active) {
                $restaurant = $company->mainRestaurant;
                $restaurant->featured_type = 'company';
                $restaurant->featured_order = $company->featured_order;
                $featuredRestaurants->push($restaurant);
            }
        }

        foreach ($featuredBranches as $branch) {
            if ($branch->restaurant && $branch->restaurant->is_active) {
                $restaurant = $branch->restaurant;
                $restaurant->featured_type = 'branch';
                $restaurant->featured_order = $branch->featured_order;
                $featuredRestaurants->push($restaurant);
            }
        }

        // Ordenar por featured_order
        $featuredRestaurants = $featuredRestaurants->sortBy('featured_order')->values();

        // Obtener IDs de restaurantes destacados para excluirlos de la lista general
        $featuredIds = $featuredRestaurants->pluck('id')->toArray();

        // Obtener todos los restaurantes activos (excluyendo destacados)
        $restaurants = Restaurant::where('is_active', true)
            ->whereNotIn('id', $featuredIds)
            ->orderBy('name')
            ->get();

        return Inertia::render('restaurants/index', [
            'restaurants' => $restaurants,
            'featuredRestaurants' => $featuredRestaurants,
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
