<?php

namespace Database\Seeders;

use App\Models\Abr;
use App\Models\AbrItem;
use App\Models\Unit;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class AbrSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $units = Unit::all();

        if ($units->isEmpty()) {
            $this->command->warn('No units found! Please run UnitSeeder first.');

            return;
        }

        $categories = ['repair', 'manpower', 'sparepart', 'evakuasi', 'disassembly'];
        $incidents = [
            'Overhaul Engine',
            'Replace Hydraulic Pump',
            'Repair Steering Cylinder',
            'Final Drive Repair',
            'Overhaul Transmission',
            'Replace Radiator',
            'Repair Electrical System',
            'Replace Alternator',
            'Overhaul Vibration Motor',
            'Replace Boom Cylinder',
        ];

        // Seed 40 ABRs over the last 6 months
        for ($i = 1; $i <= 40; $i++) {
            $date = Carbon::now()->subDays(rand(1, 180));
            $unit = $units->random();

            // Generate ABR number
            $romanMonth = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][$date->format('n') - 1];
            $no_abr = sprintf('PT-MAM/%03d/ABR/%s/%s', $i, $romanMonth, $date->format('Y'));

            $abr = Abr::create([
                'no_abr' => $no_abr,
                'tanggal' => $date->format('Y-m-d'),
                'unit_id' => $unit->id,
                'lokasi_site' => $faker->city,
                'lokasi_perbaikan' => 'Workshop '.$faker->word,
                'hm' => rand(1000, 20000),
                'inspected_by' => $faker->name,
                'incident_description' => $faker->randomElement($incidents),
                'dibuat_oleh' => $faker->name,
                'dibuat_jabatan' => 'Mekanik',
                'status' => $faker->randomElement(['Open', 'Close']),
                'created_at' => $date,
                'updated_at' => $date,
            ]);

            $total_biaya = 0;

            // Generate 2-5 items per ABR
            $itemCount = rand(2, 5);
            for ($j = 0; $j < $itemCount; $j++) {
                $category = $faker->randomElement($categories);
                $qty = rand(1, 4);
                $price = rand(10, 500) * 10000; // Between 100,000 and 5,000,000
                $amount = $qty * $price;

                AbrItem::create([
                    'abr_id' => $abr->id,
                    'category' => $category,
                    'part_number' => $category === 'sparepart' ? strtoupper($faker->bothify('???-##-####')) : null,
                    'description' => $category === 'sparepart' ? 'Sparepart '.$faker->word : 'Jasa '.$faker->word,
                    'price' => $price,
                    'qty' => $qty,
                    'satuan' => $category === 'sparepart' ? 'Pcs' : 'Jam',
                    'amount' => $amount,
                ]);

                $total_biaya += $amount;
            }

            $tax_amount = $total_biaya * 0.11; // 11% PPN
            $grand_total = $total_biaya + $tax_amount;

            $abr->update([
                'total_biaya' => $total_biaya,
                'tax_amount' => $tax_amount,
                'grand_total' => $grand_total,
            ]);
        }
    }
}
