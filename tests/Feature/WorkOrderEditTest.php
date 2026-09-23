<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderTask;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WorkOrderEditTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_can_view_edit_work_order_page_with_props(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'ME052',
            'model' => 'HYUNDAI R220-9SH',
            'type_unit' => 'EXCAVATOR',
            'hm' => 8500,
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/CM/001',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'OPEN',
            'status_pengerjaan' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'unit_id' => $unit->id,
            'site' => 'Harindo Wahana',
            'waktu_breakdown' => '2026-09-21 08:00:00',
        ]);

        WorkOrderTask::create([
            'work_order_id' => $wo->id,
            'group_component' => 'HYDRAULIC SYSTEM',
            'component' => 'Control Valve',
            'task_description' => 'Main Valve O-ring Leak',
            'problem' => 'Kebocoran pada control valve',
            'activity_progress' => 'Penggantian seal kit',
            'mechanic' => 'John Doe',
            'status' => 'B0 - On Progress',
        ]);

        $response = $this->actingAs($user)->get(route('work-orders.edit', $wo->id));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('WorkOrder/Edit')
            ->has('workOrder')
            ->has('units')
            ->has('manpowers')
            ->has('tools')
            ->where('workOrder.id', $wo->id)
            ->where('workOrder.no_wo', 'PLT/WO/CM/001')
        );
    }

    public function test_can_update_work_order_and_tasks(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'ME052',
            'model' => 'HYUNDAI R220-9SH',
            'type_unit' => 'EXCAVATOR',
            'hm' => 8500,
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/CM/001',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'OPEN',
            'status_pengerjaan' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'unit_id' => $unit->id,
            'site' => 'Harindo Wahana',
            'waktu_breakdown' => '2026-09-21 08:00:00',
        ]);

        $task = WorkOrderTask::create([
            'work_order_id' => $wo->id,
            'group_component' => 'HYDRAULIC SYSTEM',
            'component' => 'Control Valve',
            'task_description' => 'Initial Task',
            'problem' => 'Old Problem',
            'activity_progress' => 'Old Activity',
            'mechanic' => 'John Doe',
            'status' => 'B0 - On Progress',
        ]);

        $updateData = [
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $unit->id,
            'status_wo' => 'OPEN',
            'status_pengerjaan' => 'OPEN',
            'site' => 'Harindo Wahana',
            'waktu_breakdown' => '2026-09-21 08:00:00',
            'tasks' => [
                [
                    'id' => $task->id,
                    'group_component' => 'HYDRAULIC SYSTEM',
                    'component' => 'Main Valve',
                    'task_description' => 'Updated Task',
                    'problem' => 'Kebocoran parah pada O-ring',
                    'activity_progress' => 'Part sudah dibongkar dan diganti baru',
                    'est_finish' => '2026-09-22 17:00:00',
                    'mechanic' => 'Budi Santoso',
                    'status' => 'B0 - On Progress',
                ],
            ],
        ];

        $response = $this->actingAs($user)->put(route('work-orders.update', $wo->id), $updateData);

        $response->assertRedirect();

        $this->assertDatabaseHas('work_order_tasks', [
            'id' => $task->id,
            'problem' => 'Kebocoran parah pada O-ring',
            'activity_progress' => 'Part sudah dibongkar dan diganti baru',
            'mechanic' => 'Budi Santoso',
        ]);
    }
}
