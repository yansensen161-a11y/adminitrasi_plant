<?php

namespace Tests\Feature;

use App\Models\HourMeterLog;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HourMeterTest extends TestCase
{
    use RefreshDatabase;

    public function test_hour_meters_index_screen_renders_successfully(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'code_unit' => 'ME023',
            'type_unit' => 'CRUSHER',
            'model' => 'SANY 365',
            'hm' => 1000.0,
        ]);

        HourMeterLog::create([
            'unit_id' => $unit->id,
            'code_unit' => 'ME023',
            'log_date' => '2026-08-08',
            'shift' => 'DS',
            'hm_start' => 1000.0,
            'hm_end' => 1008.0,
            'hm_total' => 8.0,
        ]);

        $response = $this->actingAs($user)->get(route('hour-meters.index', [
            'date_from' => '2026-08-07',
            'date_to' => '2026-08-09',
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('HourMeter/Index')
            ->has('units')
            ->has('groupedLogs')
            ->has('dates')
        );
    }

    public function test_quick_save_updates_hour_meter_and_cleans_conflicting_duplicates(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'code_unit' => 'OHT075',
            'type_unit' => 'HAULER TRUCK',
            'model' => 'CAT 777D',
            'hm' => 16000.0,
        ]);

        // Create initial log
        $log1 = HourMeterLog::create([
            'unit_id' => $unit->id,
            'code_unit' => 'OHT075',
            'log_date' => '2026-08-09',
            'shift' => 'DS',
            'hm_start' => 16299.7,
            'hm_end' => 16727.6, // Old bogus/error value
            'hm_total' => 427.9,
        ]);

        // Create an accidental duplicate for same unit, date, and shift
        $log2 = HourMeterLog::create([
            'unit_id' => $unit->id,
            'code_unit' => 'OHT075',
            'log_date' => '2026-08-09',
            'shift' => 'DS',
            'hm_start' => 16299.7,
            'hm_end' => 16727.6,
            'hm_total' => 427.9,
        ]);

        // Submit quick save with corrected HM value
        $response = $this->actingAs($user)->postJson(route('hour-meters.quick-save'), [
            'log_id' => $log1->id,
            'unit_id' => $unit->id,
            'code_unit' => 'OHT075',
            'log_date' => '2026-08-09',
            'hm_start' => 16299.7,
            'hm_end' => 16303.5,
            'shift' => 'DS',
            'remarks' => 'Koreksi HM valid',
        ]);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        // Verify duplicate was removed and only the updated record remains
        $remainingLogs = HourMeterLog::where('unit_id', $unit->id)
            ->where('log_date', '2026-08-09')
            ->where('shift', 'DS')
            ->get();

        $this->assertCount(1, $remainingLogs);
        $this->assertEquals(16303.5, (float) $remainingLogs->first()->hm_end);
        $this->assertEquals(3.8, (float) $remainingLogs->first()->hm_total);
    }

    public function test_quick_save_requires_authorization(): void
    {
        $userWithoutRole = User::factory()->create();

        $unit = Unit::create([
            'code_unit' => 'OHT075',
            'type_unit' => 'HAULER TRUCK',
            'hm' => 16000.0,
        ]);

        $response = $this->actingAs($userWithoutRole)->post(route('hour-meters.quick-save'), [
            'unit_id' => $unit->id,
            'code_unit' => 'OHT075',
            'log_date' => '2026-08-09',
            'hm_start' => 16299.7,
            'hm_end' => 16303.5,
        ]);

        $response->assertForbidden();
    }

    public function test_user_can_export_all_hour_meter_data_to_excel(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'code_unit' => 'ME023',
            'type_unit' => 'EXCAVATOR',
            'model' => 'SANY 365',
            'location' => 'Pit 1',
            'status' => 'Running',
            'hm' => 1050.0,
        ]);

        HourMeterLog::create([
            'unit_id' => $unit->id,
            'code_unit' => 'ME023',
            'log_date' => '2026-08-10',
            'shift' => 'DS',
            'hm_start' => 1000.0,
            'hm_end' => 1008.0,
            'hm_total' => 8.0,
            'operator_name' => 'John Doe',
            'location' => 'Pit 1',
        ]);

        $response = $this->actingAs($user)->get(route('hour-meters.export.excel', [
            'scope' => 'all',
        ]));

        $response->assertOk();
        $this->assertTrue(str_contains(
            $response->headers->get('content-disposition', ''),
            'Data_Hour_Meter_Semua_'
        ));
    }

    public function test_user_can_export_filtered_hour_meter_data_to_excel(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create([
            'code_unit' => 'ME023',
            'type_unit' => 'EXCAVATOR',
            'model' => 'SANY 365',
            'hm' => 1050.0,
        ]);

        HourMeterLog::create([
            'unit_id' => $unit->id,
            'code_unit' => 'ME023',
            'log_date' => '2026-08-10',
            'shift' => 'DS',
            'hm_start' => 1000.0,
            'hm_end' => 1008.0,
            'hm_total' => 8.0,
        ]);

        $response = $this->actingAs($user)->get(route('hour-meters.export.excel', [
            'scope' => 'filtered',
            'date_from' => '2026-08-01',
            'date_to' => '2026-08-10',
            'code_unit' => 'ME023',
        ]));

        $response->assertOk();
        $this->assertTrue(str_contains(
            $response->headers->get('content-disposition', ''),
            'Data_Hour_Meter_2026-08-01_sd_2026-08-10_'
        ));
    }
}
