<?php

namespace Tests\Feature;

use App\Exports\BreakdownWorkOrderExport;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderTask;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderBreakdownExportTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_user_can_export_breakdown_excel_via_dedicated_route(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'ME052',
            'model' => 'SY500',
            'type_unit' => 'EXCAVATOR SMALL DIGGER',
            'hm' => 12563.7,
            'status' => 'Operational',
            'location' => 'HW',
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/CM/001',
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $unit->id,
            'hm_unit' => 12563.7,
            'hm_bd' => 12563.7,
            'site' => 'Harindo Wahana',
            'downtime_code' => 'Accident',
            'status_wo' => 'OPEN',
            'status_pengerjaan' => 'OPEN',
            'waktu_breakdown' => now()->subDays(10),
            'problem' => 'Unit Rebah',
        ]);

        WorkOrderTask::create([
            'work_order_id' => $wo->id,
            'group_component' => 'ATTACHMENT',
            'component' => 'BUCKET',
            'task_description' => 'Investigasi & Moving Unit to safe are',
            'problem' => 'Unit Rebah',
            'activity_progress' => 'Investigasi & Moving Unit to safe are',
            'status' => 'Done',
            'mechanic' => 'Fendi',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('work-orders.export-breakdown'));

        $response->assertOk();
        $this->assertSame(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            $response->headers->get('Content-Type')
        );
        $this->assertStringContainsString('Daily_Breakdown_Status', $response->headers->get('Content-Disposition') ?? '');
    }

    public function test_export_via_tab_parameter_redirects_to_breakdown_export(): void
    {
        $user = $this->createAdminUser();

        $response = $this
            ->actingAs($user)
            ->get('/work-orders/export?tab=breakdown');

        $response->assertOk();
        $this->assertSame(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            $response->headers->get('Content-Type')
        );
        $this->assertStringContainsString('Daily_Breakdown_Status', $response->headers->get('Content-Disposition') ?? '');
    }

    public function test_spreadsheet_generator_structures_open_data_properly(): void
    {
        $unit = Unit::create([
            'code_unit' => 'MD041',
            'model' => 'KOMATSU D85ESS',
            'type_unit' => 'BULLDOZER',
            'hm' => 7379.8,
            'status' => 'Operational',
            'location' => 'HW',
        ]);

        $wo = WorkOrder::create([
            'no_wo' => 'PLT/WO/CM/002',
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $unit->id,
            'hm_unit' => 7379.8,
            'site' => 'HW',
            'downtime_code' => 'Unschedule',
            'status_wo' => 'PROCESS',
            'status_pengerjaan' => 'OPEN',
            'waktu_breakdown' => now()->subDays(5),
            'problem' => 'Floating Seal Final Drive LH Leak',
        ]);

        WorkOrderTask::create([
            'work_order_id' => $wo->id,
            'group_component' => 'FINAL DRIVE',
            'component' => 'FLOATING SEAL',
            'task_description' => 'Replace Floating Seal Final Drive',
            'problem' => 'Floating Seal Final Drive LH Leak',
            'activity_progress' => 'Replace Floating Seal Final Drive',
            'status' => 'B0 - On Progress',
            'mechanic' => 'Tondok',
        ]);

        // Closed WO that should be EXCLUDED
        $closedUnit = Unit::create([
            'code_unit' => 'MD099',
            'model' => 'KOMATSU D85ESS',
            'type_unit' => 'BULLDOZER',
            'hm' => 5000,
        ]);

        WorkOrder::create([
            'no_wo' => 'PLT/WO/CM/999',
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $closedUnit->id,
            'downtime_code' => 'Unschedule',
            'site' => 'HW',
            'status_wo' => 'CLOSED',
            'status_pengerjaan' => 'CLOSED',
            'waktu_breakdown' => now()->subDays(20),
            'problem' => 'Old Fixed Issue',
        ]);

        $export = new BreakdownWorkOrderExport;
        $spreadsheet = $export->generateSpreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Check Header Titles at Row 1 and Row 2
        $this->assertSame('No', $sheet->getCell('A1')->getValue());
        $this->assertSame('Unit ID', $sheet->getCell('B1')->getValue());
        $this->assertSame('MODEL', $sheet->getCell('C1')->getValue());
        $this->assertSame('HM', $sheet->getCell('D1')->getValue());
        $this->assertSame('Detail of Problem', $sheet->getCell('I1')->getValue());
        $this->assertSame('Parts status ( Purchasing Logistic )', $sheet->getCell('P1')->getValue());
        $this->assertSame('Problem description', $sheet->getCell('J2')->getValue());
        $this->assertSame('MOL', $sheet->getCell('P2')->getValue());

        // Check that closed unit MD099 is NOT present anywhere in the sheet
        $allValues = [];
        foreach ($sheet->getRowIterator() as $row) {
            foreach ($row->getCellIterator() as $cell) {
                $allValues[] = (string) $cell->getValue();
            }
        }

        $this->assertContains('MD041', $allValues);
        $this->assertNotContains('MD099', $allValues);
    }

    public function test_only_open_status_work_orders_are_exported(): void
    {
        $unitOpen = Unit::create([
            'code_unit' => 'ME052',
            'model' => 'SY500',
            'type_unit' => 'EXCAVATOR',
            'hm' => 12563.7,
            'status' => 'Operational',
            'location' => 'HW',
        ]);

        $woOpen = WorkOrder::create([
            'no_wo' => 'PLT/WO/OPEN/001',
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $unitOpen->id,
            'hm_unit' => 12563.7,
            'site' => 'HW',
            'downtime_code' => 'Accident',
            'status_wo' => 'OPEN',
            'status_pengerjaan' => 'OPEN',
            'problem' => 'Unit Rebah',
        ]);

        WorkOrderTask::create([
            'work_order_id' => $woOpen->id,
            'group_component' => 'ATTACHMENT',
            'component' => 'PARTS',
            'task_description' => 'Rekondisi Unit',
            'problem' => 'Remove all component',
            'activity_progress' => 'Rekondisi Unit',
            'status' => 'Waiting Parts',
            'mechanic' => 'Hafara',
        ]);

        $unitCompleted = Unit::create([
            'code_unit' => 'ME099',
            'model' => 'SY500',
            'type_unit' => 'EXCAVATOR',
            'hm' => 8000,
        ]);

        WorkOrder::create([
            'no_wo' => 'PLT/WO/CLOSED/001',
            'tipe_wo' => 'BREAKDOWN',
            'unit_id' => $unitCompleted->id,
            'hm_unit' => 8000,
            'site' => 'HW',
            'downtime_code' => 'Unschedule',
            'status_wo' => 'COMPLETED',
            'status_pengerjaan' => 'CLOSED',
            'problem' => 'Already fixed',
        ]);

        $export = new BreakdownWorkOrderExport;
        $sheet = $export->generateSpreadsheet()->getActiveSheet();

        $values = [];
        foreach ($sheet->getRowIterator() as $row) {
            foreach ($row->getCellIterator() as $cell) {
                $v = $cell->getValue();
                if ($v !== null && $v !== '') {
                    $values[] = (string) $v;
                }
            }
        }

        $this->assertContains('ME052', $values);
        $this->assertNotContains('ME099', $values);

        // ME052 starts at row 3 (no category header above ME052)
        $this->assertSame('1', (string) $sheet->getCell('A3')->getValue());
        $this->assertSame('ME052', (string) $sheet->getCell('B3')->getValue());
        $this->assertSame('ANC', (string) $sheet->getCell('H3')->getValue());

        // Check service type background color (peach FFFABF8F)
        $this->assertSame('FFFABF8F', $sheet->getStyle('H3')->getFill()->getStartColor()->getARGB());

        // Check waiting parts yellow highlight (FFFFFF00)
        $this->assertSame('FFFFFF00', $sheet->getStyle('N3')->getFill()->getStartColor()->getARGB());
    }
}
