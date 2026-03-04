<?php

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Restaurant;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateRestaurantForCompany extends Command
{
    protected $signature = 'company:create-restaurant {company_id} {name} {--category=General}';

    protected $description = 'Create a restaurant for a company';

    public function handle(): int
    {
        $companyId = $this->argument('company_id');
        $name = $this->argument('name');
        $category = $this->option('category');

        $company = Company::find($companyId);

        if (!$company) {
            $this->error("Company with ID {$companyId} not found.");
            return 1;
        }

        $restaurant = Restaurant::create([
            'company_id' => $company->id,
            'name' => $name,
            'slug' => Str::slug($name),
            'category' => $category,
            'is_active' => true,
        ]);

        Branch::create([
            'company_id' => $company->id,
            'restaurant_id' => $restaurant->id,
            'name' => 'Principal',
            'is_main' => true,
            'is_active' => true,
        ]);

        $this->info("Restaurant '{$name}' created with ID {$restaurant->id}");
        $this->info("Main branch 'Principal' created for the restaurant.");

        return 0;
    }
}
