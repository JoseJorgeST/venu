<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RestaurantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $restaurants = [
            [
                'name' => 'La Trattoria del Centro',
                'category' => 'Italiana',
                'description' => 'Auténtica cocina italiana con pasta fresca y pizzas al horno de leña. Ambiente acogedor en el corazón de la ciudad.',
                'rating' => 4.5,
                'latitude' => 40.416775,
                'longitude' => -3.703790,
            ],
            [
                'name' => 'Sakura Sushi Bar',
                'category' => 'Japonesa',
                'description' => 'Sushi y sashimi de primera calidad. Experiencia japonesa con ingredientes frescos y presentación impecable.',
                'rating' => 4.8,
                'latitude' => 40.418010,
                'longitude' => -3.699430,
            ],
            [
                'name' => 'El Rincón del Taco',
                'category' => 'Mexicana',
                'description' => 'Sabores de México: tacos, burritos, guacamole y margaritas. Fiesta en cada bocado.',
                'rating' => 4.3,
                'latitude' => 40.415210,
                'longitude' => -3.707120,
            ],
            [
                'name' => 'The Burger House',
                'category' => 'Americana',
                'description' => 'Hamburguesas artesanales, patatas fritas y batidos. El clásico americano con un toque gourmet.',
                'rating' => 4.6,
                'latitude' => 40.419550,
                'longitude' => -3.701890,
            ],
            [
                'name' => 'Mar & Tierra Mediterráneo',
                'category' => 'Mediterránea',
                'description' => 'Pescados frescos, ensaladas y platos al estilo mediterráneo. Aceite de oliva y productos de temporada.',
                'rating' => 4.7,
                'latitude' => 40.417320,
                'longitude' => -3.704560,
            ],
        ];

        foreach ($restaurants as $data) {
            Restaurant::create([
                'name' => $data['name'],
                'slug' => Str::slug($data['name']),
                'category' => $data['category'],
                'image_url' => null,
                'description' => $data['description'],
                'rating' => $data['rating'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'is_active' => true,
            ]);
        }
    }
}
