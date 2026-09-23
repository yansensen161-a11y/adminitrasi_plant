<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            RolePermissionSeeder::class,
            OrgAndManpowerSeeder::class,
            UnitSeeder::class,
            HourMeterSeeder::class,
            BreakdownSeeder::class,
            AbrSeeder::class,
            TyreDataSeeder::class,
            UnitAplSeeder::class,
            UnitGetSeeder::class,
        ]);
    }
}
