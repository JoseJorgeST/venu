<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateSuperAdmin extends Command
{
    protected $signature = 'app:create-super-admin {email=admin@bevenut.com} {password=password123}';

    protected $description = 'Crea un usuario super administrador';

    public function handle(): int
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'Super Admin',
                'password' => bcrypt($password),
            ]
        );

        $user->assignRole('super_admin');

        $this->info("Super Admin creado/actualizado:");
        $this->table(
            ['Email', 'Password', 'Rol'],
            [[$email, $password, 'super_admin']]
        );

        return Command::SUCCESS;
    }
}
