<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderSchedulePlanInspectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'super-admin']);
    }

    public function test_creating_schedule_work_order_with_plan_inspection_categories_creates_entries(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'ME049',
            'model' => 'PC2000',
            'type_unit' => 'EXCAVATOR BIG DIGGER',
        ]);

        $dateStr = '2026-09-20';

        $response = $this->actingAs($user)->post(route('work-orders.store'), [
            'tipe_wo' => 'SCHEDULE',
            'status_wo' => 'OPEN',
            'downtime_code' => 'Schedule',
            'site' => 'Harindo Wahana',
            'unit_id' => $unit->id,
            'waktu_breakdown' => $dateStr.' 08:00:00',
            'plan_inspection_date' => $dateStr,
            'plan_inspection_categories' => ['washing', 'inspection', 'greasing', 'cleaning_track'],
            'plan_inspection_shift' => 'all',
        ]);

        $response->assertRedirect(route('work-orders.index', ['tab' => 'schedule']));

        // Check washing
        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => $dateStr,
            'category' => 'washing',
            'shift' => 'all',
            'is_completed' => true,
        ]);

        // Check inspection
        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => $dateStr,
            'category' => 'inspection',
            'shift' => 'all',
            'is_completed' => true,
        ]);

        // Check cleaning_track
        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => $dateStr,
            'category' => 'cleaning_track',
            'shift' => 'all',
            'is_completed' => true,
        ]);

        // Check greasing (ME049 is EXCAVATOR BIG DIGGER which is in 4ShiftCategories)
        // With shift='all', shift_1 and shift_2 should be generated
        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => $dateStr,
            'category' => 'greasing',
            'shift' => 'shift_1',
            'is_completed' => true,
        ]);

        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => $dateStr,
            'category' => 'greasing',
            'shift' => 'shift_2',
            'is_completed' => true,
        ]);
    }

    public function test_creating_breakdown_work_order_does_not_create_plan_inspections(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'ME048',
            'model' => 'PC400',
            'type_unit' => 'EXCAVATOR SMALL DIGGER',
        ]);

        $dateStr = '2026-09-21';

        $response = $this->actingAs($user)->post(route('work-orders.store'), [
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'site' => 'Harindo Wahana',
            'unit_id' => $unit->id,
            'waktu_breakdown' => $dateStr.' 10:00:00',
            'plan_inspection_categories' => ['washing'],
        ]);

        $response->assertRedirect(route('work-orders.index', ['tab' => 'breakdown']));

        $this->assertDatabaseMissing('plan_inspections', [
            'unit_id' => $unit->id,
            'category' => 'washing',
        ]);
    }
}
