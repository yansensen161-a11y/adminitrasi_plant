<?php

namespace Database\Seeders;

use App\Models\UnitApl;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class UnitAplSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('seeders/data/unit_apls.json');
        if (! File::exists($jsonPath)) {
            return;
        }

        $records = json_decode(File::get($jsonPath), true);
        if (! is_array($records)) {
            return;
        }

        foreach (array_chunk($records, 100) as $chunk) {
            foreach ($chunk as $row) {
                unset($row['total_price']);
                UnitApl::updateOrCreate(
                    [
                        'id' => $row['id'],
                    ],
                    $row
                );
            }
        }
    }
}
