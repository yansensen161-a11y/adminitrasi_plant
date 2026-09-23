<?php

namespace Tests\Feature;

use App\Http\Controllers\PlanInspectionController;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class PlanInspectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_ordered_unit_specs_has_exact_17_categories_and_125_units(): void
    {
        $specs = PlanInspectionController::getOrderedUnitSpecs();

        $expectedCategories = [
            'CRUSHER',
            'EXCAVATOR BIG DIGGER',
            'EXCAVATOR SMALL DIGGER',
            'BULLDOZER',
            'HAULER TRUCK',
            'DUMP TRUCK',
            'MOTOR GRADER',
            'COMPACTOR',
            'TOWER LAMP',
            'SERVICE TRUCK',
            'FUEL TRUCK',
            'WATER TRUCK',
            'CRANE TRUCK & LOWBOY',
            'DEWATERING PUMP',
            'SARANA BUS',
            'GENSET - COMPRESSOR - WELDING MACHINE',
            'LIGHT VEHICLE',
        ];

        $this->assertSame($expectedCategories, array_keys($specs));

        $totalUnits = 0;
        foreach ($specs as $category => $units) {
            $totalUnits += count($units);
        }

        $this->assertSame(125, $totalUnits);
        $this->assertSame(['ME023', 'ME053', 'MSC001'], $specs['CRUSHER']);
        $this->assertSame(['ME049', 'ME055', 'ME056'], $specs['EXCAVATOR BIG DIGGER']);
        $this->assertCount(10, $specs['EXCAVATOR SMALL DIGGER']);
        $this->assertCount(9, $specs['BULLDOZER']);
        $this->assertCount(16, $specs['HAULER TRUCK']);
        $this->assertCount(30, $specs['DUMP TRUCK']);
        $this->assertCount(3, $specs['MOTOR GRADER']);
        $this->assertCount(2, $specs['COMPACTOR']);
        $this->assertCount(10, $specs['TOWER LAMP']);
        $this->assertCount(2, $specs['SERVICE TRUCK']);
        $this->assertCount(2, $specs['FUEL TRUCK']);
        $this->assertCount(2, $specs['WATER TRUCK']);
        $this->assertCount(2, $specs['CRANE TRUCK & LOWBOY']);
        $this->assertCount(4, $specs['DEWATERING PUMP']);
        $this->assertCount(3, $specs['SARANA BUS']);
        $this->assertCount(10, $specs['GENSET - COMPRESSOR - WELDING MACHINE']);
        $this->assertCount(14, $specs['LIGHT VEHICLE']);
    }

    public function test_store_entry_supports_multiple_units_dates_and_categories(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit1 = Unit::create(['code_unit' => 'ME023', 'model' => 'SANY 365', 'type_unit' => 'CRUSHER']);
        $unit2 = Unit::create(['code_unit' => 'ME053', 'model' => 'SY500H', 'type_unit' => 'CRUSHER']);

        $dates = ['2026-09-05', '2026-09-12'];
        $categories = ['washing', 'inspection'];

        $response = $this->actingAs($user)->postJson(route('plan-inspections.store-entry'), [
            'unit_ids' => [$unit1->id, $unit2->id],
            'inspection_dates' => $dates,
            'categories' => $categories,
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['status', 'message', 'entries']);

        // 2 units * 2 dates * 2 categories = 8 entries
        $this->assertCount(8, $response->json('entries'));

        foreach ([$unit1->id, $unit2->id] as $uId) {
            foreach ($dates as $d) {
                foreach ($categories as $cat) {
                    $this->assertDatabaseHas('plan_inspections', [
                        'unit_id' => $uId,
                        'inspection_date' => $d,
                        'category' => $cat,
                    ]);
                }
            }
        }
    }

    public function test_download_template_returns_excel_attachment(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        Unit::create(['code_unit' => 'ME023', 'model' => 'SANY 365', 'type_unit' => 'CRUSHER']);

        $response = $this->actingAs($user)->get(route('plan-inspections.download-template', [
            'month' => 9,
            'year' => 2026,
        ]));

        $response->assertOk();
        $this->assertTrue(
            str_contains($response->headers->get('content-disposition') ?? '', 'Template_Plan_Inspection')
        );
    }

    public function test_import_excel_stores_inspections_from_spreadsheet(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $unit = Unit::create(['code_unit' => 'ME023', 'model' => 'SANY 365', 'type_unit' => 'CRUSHER']);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Washing');
        $sheet->setCellValue('A4', 'NO');
        $sheet->setCellValue('B4', 'KATEGORI');
        $sheet->setCellValue('C4', 'MODEL');
        $sheet->setCellValue('D4', 'KODE UNIT');
        $sheet->setCellValue('E4', 1);
        $sheet->setCellValue('F4', 15);

        $sheet->setCellValue('D5', 'ME023');
        $sheet->setCellValue('E5', 1);
        $sheet->setCellValue('F5', 'X');

        $tempPath = tempnam(sys_get_temp_dir(), 'test_excel_').'.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        $file = new UploadedFile(
            $tempPath,
            'Template_Filled.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->actingAs($user)->postJson(route('plan-inspections.import-excel'), [
            'file' => $file,
            'month' => 9,
            'year' => 2026,
        ]);

        $response->assertOk();
        $response->assertJson([
            'status' => 'success',
            'imported_count' => 2,
        ]);

        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => '2026-09-01',
            'category' => 'washing',
        ]);

        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => '2026-09-15',
            'category' => 'washing',
        ]);

        @unlink($tempPath);
    }

    public function test_4_shift_categories_contains_exact_specified_units(): void
    {
        $cats = PlanInspectionController::get4ShiftCategories();

        $expected = [
            'CRUSHER',
            'EXCAVATOR BIG DIGGER',
            'EXCAVATOR SMALL DIGGER',
            'BULLDOZER',
            'MOTOR GRADER',
            'CRANE TRUCK & LOWBOY',
        ];

        $this->assertSame($expected, $cats);
    }

    public function test_toggle_greasing_shifts_for_4_shift_units(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        // Crusher is in 4-shift categories
        $unit = Unit::create(['code_unit' => 'ME023', 'model' => 'SANY 365', 'type_unit' => 'CRUSHER']);

        // Toggle Shift 1
        $resShift1 = $this->actingAs($user)->postJson(route('plan-inspections.toggle'), [
            'unit_id' => $unit->id,
            'day' => 1,
            'month' => 9,
            'year' => 2026,
            'category' => 'greasing',
            'shift' => 'shift_1',
        ]);
        $resShift1->assertOk();
        $resShift1->assertJson(['status' => 'added', 'entry' => ['shift' => 'shift_1']]);

        // Toggle Shift 2
        $resShift2 = $this->actingAs($user)->postJson(route('plan-inspections.toggle'), [
            'unit_id' => $unit->id,
            'day' => 1,
            'month' => 9,
            'year' => 2026,
            'category' => 'greasing',
            'shift' => 'shift_2',
        ]);
        $resShift2->assertOk();
        $resShift2->assertJson(['status' => 'added', 'entry' => ['shift' => 'shift_2']]);

        // Both shifts exist independently on the same day
        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => '2026-09-01',
            'category' => 'greasing',
            'shift' => 'shift_1',
        ]);
        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => '2026-09-01',
            'category' => 'greasing',
            'shift' => 'shift_2',
        ]);

        // Untoggle Shift 1
        $resUntoggle = $this->actingAs($user)->postJson(route('plan-inspections.toggle'), [
            'unit_id' => $unit->id,
            'day' => 1,
            'month' => 9,
            'year' => 2026,
            'category' => 'greasing',
            'shift' => 'shift_1',
        ]);
        $resUntoggle->assertOk();
        $resUntoggle->assertJson(['status' => 'removed', 'shift' => 'shift_1']);

        // Shift 1 is deleted, Shift 2 still remains
        $this->assertDatabaseMissing('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => '2026-09-01',
            'category' => 'greasing',
            'shift' => 'shift_1',
        ]);
        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $unit->id,
            'inspection_date' => '2026-09-01',
            'category' => 'greasing',
            'shift' => 'shift_2',
        ]);
    }

    public function test_single_column_unit_in_greasing_toggles_as_all(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        // Hauler Truck is a 1-column unit in Greasing (not 4-shift / multi-shift)
        $hauler = Unit::create(['code_unit' => 'OHT066', 'model' => 'CAT 777D', 'type_unit' => 'HAULER TRUCK']);

        $res = $this->actingAs($user)->postJson(route('plan-inspections.toggle'), [
            'unit_id' => $hauler->id,
            'day' => 5,
            'month' => 9,
            'year' => 2026,
            'category' => 'greasing',
        ]);
        $res->assertOk();
        $res->assertJson(['status' => 'added', 'entry' => ['shift' => 'all']]);

        $this->assertDatabaseHas('plan_inspections', [
            'unit_id' => $hauler->id,
            'inspection_date' => '2026-09-05',
            'category' => 'greasing',
            'shift' => 'all',
        ]);
    }

    public function test_cleaning_track_and_non_greasing_categories_in_dashboard(): void
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $crusher = Unit::create(['code_unit' => 'ME023', 'model' => 'SANY 365', 'type_unit' => 'CRUSHER']);
        $hauler = Unit::create(['code_unit' => 'OHT066', 'model' => 'CAT 777D', 'type_unit' => 'HAULER TRUCK']);
        $pump = Unit::create(['code_unit' => 'PUMP01', 'model' => 'PUMP', 'type_unit' => 'DEWATERING PUMP']);

        $res = $this->actingAs($user)->getJson(route('plan-inspections.dashboard', [
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-30',
        ]));

        $res->assertOk();
        $rekap = collect($res->json('rekap'))->keyBy('type');

        // Crusher has both greasing and cleaning track applicable
        $this->assertTrue($rekap['CRUSHER']['cleaning_track']['applicable']);
        $this->assertTrue($rekap['CRUSHER']['greasing']['applicable']);

        // Hauler Truck has greasing, but NOT cleaning track
        $this->assertFalse($rekap['HAULER TRUCK']['cleaning_track']['applicable']);
        $this->assertNull($rekap['HAULER TRUCK']['cleaning_track']['plan']);
        $this->assertTrue($rekap['HAULER TRUCK']['greasing']['applicable']);

        // Dewatering Pump has NEITHER cleaning track NOR greasing
        $this->assertFalse($rekap['DEWATERING PUMP']['cleaning_track']['applicable']);
        $this->assertNull($rekap['DEWATERING PUMP']['cleaning_track']['plan']);
        $this->assertFalse($rekap['DEWATERING PUMP']['greasing']['applicable']);
        $this->assertNull($rekap['DEWATERING PUMP']['greasing']['plan']);
    }
}
