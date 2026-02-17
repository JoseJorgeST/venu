<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $restaurantIds = Restaurant::pluck('id')->toArray();

        if (empty($restaurantIds)) {
            $this->command->warn('No hay restaurantes. Ejecuta RestaurantSeeder primero.');

            return;
        }

        $items = [
            // 4 items por restaurante (20 total)
            ['restaurant_index' => 0, 'name' => 'Spaghetti Carbonara', 'description' => 'Pasta con huevo, guanciale y pecorino', 'price' => 12.90, 'category' => 'Platos principales'],
            ['restaurant_index' => 0, 'name' => 'Pizza Margherita', 'description' => 'Tomate, mozzarella y albahaca fresca', 'price' => 11.50, 'category' => 'Pizzas'],
            ['restaurant_index' => 0, 'name' => 'Tiramisú', 'description' => 'Postre clásico con café y mascarpone', 'price' => 6.50, 'category' => 'Postres'],
            ['restaurant_index' => 0, 'name' => 'Bruschetta', 'description' => 'Pan tostado con tomate y albahaca', 'price' => 5.90, 'category' => 'Entrantes'],

            ['restaurant_index' => 1, 'name' => 'Sashimi Mixto', 'description' => 'Selección de pescado fresco (12 piezas)', 'price' => 18.00, 'category' => 'Sashimi'],
            ['restaurant_index' => 1, 'name' => 'Roll Philadelphia', 'description' => 'Salmón, queso crema y aguacate', 'price' => 9.50, 'category' => 'Sushi'],
            ['restaurant_index' => 1, 'name' => 'Ramen de Cerdo', 'description' => 'Caldo intenso, noodles y cerdo chashu', 'price' => 13.00, 'category' => 'Ramen'],
            ['restaurant_index' => 1, 'name' => 'Edamame', 'description' => 'Vainas de soja con sal marina', 'price' => 4.50, 'category' => 'Entrantes'],

            ['restaurant_index' => 2, 'name' => 'Tacos al Pastor', 'description' => 'Tres tacos de cerdo con piña y cilantro', 'price' => 8.90, 'category' => 'Tacos'],
            ['restaurant_index' => 2, 'name' => 'Burrito Grande', 'description' => 'Pollo, arroz, frijoles y guacamole', 'price' => 11.00, 'category' => 'Burritos'],
            ['restaurant_index' => 2, 'name' => 'Guacamole con Totopos', 'description' => 'Aguacate, lima, cebolla y cilantro', 'price' => 6.50, 'category' => 'Entrantes'],
            ['restaurant_index' => 2, 'name' => 'Churros con Chocolate', 'description' => 'Churros crujientes y chocolate caliente', 'price' => 5.00, 'category' => 'Postres'],

            ['restaurant_index' => 3, 'name' => 'Burger Clásica', 'description' => 'Carne de ternera, lechuga, tomate y salsa especial', 'price' => 10.50, 'category' => 'Hamburguesas'],
            ['restaurant_index' => 3, 'name' => 'Cheese Burger', 'description' => 'Doble carne con queso cheddar fundido', 'price' => 12.00, 'category' => 'Hamburguesas'],
            ['restaurant_index' => 3, 'name' => 'Patatas Fritas', 'description' => 'Porción grande con ketchup y mayonesa', 'price' => 4.00, 'category' => 'Acompañamientos'],
            ['restaurant_index' => 3, 'name' => 'Batido de Vainilla', 'description' => 'Batido cremoso con nata', 'price' => 4.50, 'category' => 'Bebidas'],

            ['restaurant_index' => 4, 'name' => 'Ensalada César', 'description' => 'Lechuga romana, parmesano y aderezo césar', 'price' => 8.50, 'category' => 'Ensaladas'],
            ['restaurant_index' => 4, 'name' => 'Pescado del Día', 'description' => 'Pescado fresco a la plancha con verduras', 'price' => 16.00, 'category' => 'Platos principales'],
            ['restaurant_index' => 4, 'name' => 'Hummus con Pan', 'description' => 'Garbanzos, tahini y aceite de oliva', 'price' => 5.50, 'category' => 'Entrantes'],
            ['restaurant_index' => 4, 'name' => 'Tarta de Santiago', 'description' => 'Tarta de almendra tradicional', 'price' => 6.00, 'category' => 'Postres'],
        ];

        foreach ($items as $data) {
            $restaurantId = $restaurantIds[$data['restaurant_index']] ?? $restaurantIds[0];

            MenuItem::create([
                'restaurant_id' => $restaurantId,
                'name' => $data['name'],
                'description' => $data['description'],
                'price' => $data['price'],
                'image_url' => null,
                'category' => $data['category'],
                'is_available' => true,
            ]);
        }
    }
}
