<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderTask;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderDeleteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'super-admin']);
        Role::firstOrCreate(['name' => 'mechanic']);
    }

    public function test_authorized_user_can_delete_work_order_and_cascade_tasks(): void
    {
        $user = User::factory()->create();
        $user->assignRole('super-admin');

        $unit = Unit::create([
            'code_unit' => 'ME099',
            'model' => 'SY500H',
            'type_unit' => 'EXCAVATOR',
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/BD/999',
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $unit->id,
            'downtime_code' => 'UNP',
            'site' => 'Lokal',
            'status_wo' => 'OPEN',
            'problem' => 'Testing delete feature',
        ]);

        $task = WorkOrderTask::create([
            'work_order_id' => $wo->id,
            'group_component' => 'ENGINE',
            'component' => 'Fan Belt',
            'mechanic' => 'John Doe',
            'task_description' => 'Replace belt',
        ]);

        $this->assertDatabaseHas('work_orders', ['id' => $wo->id]);
        $this->assertDatabaseHas('work_order_tasks', ['id' => $task->id]);

        $response = $this->actingAs($user)->delete(route('work-orders.destroy', $wo->id));

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('work_orders', ['id' => $wo->id]);
        $this->assertDatabaseMissing('work_order_tasks', ['id' => $task->id]);
    }

    public function test_unauthorized_user_cannot_delete_work_order(): void
    {
        $user = User::factory()->create();
        $user->assignRole('mechanic');

        $unit = Unit::create([
            'code_unit' => 'ME100',
            'model' => 'SY500H',
            'type_unit' => 'EXCAVATOR',
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/BD/100',
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $unit->id,
            'downtime_code' => 'UNP',
            'site' => 'Lokal',
            'status_wo' => 'OPEN',
        ]);

        $response = $this->actingAs($user)->delete(route('work-orders.destroy', $wo->id));

        $response->assertStatus(403);
        $this->assertDatabaseHas('work_orders', ['id' => $wo->id]);
    }
}
