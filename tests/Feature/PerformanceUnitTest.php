<?php

namespace Tests\Feature;

use App\Models\HourMeterLog;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerformanceUnitTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    public function test_performance_unit_index_screen_renders_successfully(): void
    {
        $this->withoutVite();
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'ME023',
            'type_unit' => 'EXCAVATOR',
            'model' => 'KOMATSU PC200',
            'location' => 'Harindo Wahana',
            'hm' => 1000.0,
        ]);

        $response = $this->actingAs($user)->get(route('performance-unit.index', [
            'month' => '2026-08',
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('PerformanceUnit/Index')
            ->has('data')
            ->has('filters')
            ->has('unitTypes')
            ->has('locations')
            ->where('data.month', '2026-08')
            ->where('data.days_in_period', 31)
            ->where('data.mohh_per_unit', 744)
        );
    }

    public function test_performance_unit_calculates_correct_kpis(): void
    {
        $this->withoutVite();
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'ME023',
            'type_unit' => 'EXCAVATOR',
            'model' => 'KOMATSU PC200',
            'location' => 'Harindo Wahana',
            'hm' => 1000.0,
        ]);

        // HM log in Aug 2026: start 19588, end 19621 -> WH = 33
        HourMeterLog::create([
            'unit_id' => $unit->id,
            'code_unit' => 'ME023',
            'log_date' => '2026-08-01',
            'hm_start' => 19588.0,
            'hm_end' => 19600.0,
            'hm_total' => 12.0,
        ]);

        HourMeterLog::create([
            'unit_id' => $unit->id,
            'code_unit' => 'ME023',
            'log_date' => '2026-08-31',
            'hm_start' => 19600.0,
            'hm_end' => 19621.0,
            'hm_total' => 21.0,
        ]);

        // Work order breakdown in Aug 2026: 2 hours total (1 hr SCH, 1 hr UNS)
        WorkOrder::create([
            'no_wo' => 'WO-ME023-001',
            'unit_id' => $unit->id,
            'site' => 'Harindo Wahana',
            'status_wo' => 'OPEN',
            'downtime_code' => 'Schedule',
            'tipe_wo' => 'PM',
            'durasi_hrs' => 1.0,
            'waktu_breakdown' => '2026-08-05 08:00:00',
            'request_date' => '2026-08-05',
        ]);

        WorkOrder::create([
            'no_wo' => 'WO-ME023-002',
            'unit_id' => $unit->id,
            'site' => 'Harindo Wahana',
            'status_wo' => 'OPEN',
            'downtime_code' => 'Unschedule',
            'tipe_wo' => 'CM',
            'durasi_hrs' => 1.0,
            'waktu_breakdown' => '2026-08-10 10:00:00',
            'request_date' => '2026-08-10',
        ]);

        $response = $this->actingAs($user)->get(route('performance-unit.index', [
            'month' => '2026-08',
        ]));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $data = $page->toArray()['props']['data'];
            $this->assertCount(1, $data['units']);

            $u = $data['units'][0];
            $this->assertEquals('ME023', $u['code_unit']);
            $this->assertEquals(744, $u['mohh']);
            $this->assertEquals(33.0, $u['wh']);
            $this->assertEquals(2.0, $u['total_bd']);
            $this->assertEquals(1.0, $u['sch']);
            $this->assertEquals(1.0, $u['uns']);
            // STB PLA = 744 - 33 - 2 = 709
            $this->assertEquals(709.0, $u['stb_pla']);
            // Budget PA for ME023 is 89% -> Target Down = (1 - 0.89) * 744 = 81.84 -> 81.8 or 82.0
            $this->assertEquals(89.0, $u['budget_pa']);
            // PA = round(((744 - 2) / 744) * 100, 1) = 99.7%
            $this->assertEquals(99.7, $u['pa']);
            // EU = round((33 / 744) * 100, 1) = 4.4%
            $this->assertEquals(4.4, $u['eu']);
            // MA = round((33 / (33 + 2)) * 100, 1) = round(33/35 * 100, 1) = 94.3%
            $this->assertEquals(94.3, $u['ma']);
            // BD Ratio SCH: 1/2 = 50%, UNS: 1/2 = 50%
            $this->assertEquals(50.0, $u['bd_ratio_sch']);
            $this->assertEquals(50.0, $u['bd_ratio_uns']);
        });
    }

    public function test_performance_unit_excel_export_returns_streamed_file(): void
    {
        $user = $this->createAdminUser();

        Unit::create([
            'code_unit' => 'ME048',
            'type_unit' => 'EXCAVATOR',
            'model' => 'KOMATSU PC200',
            'hm' => 500.0,
        ]);

        $response = $this->actingAs($user)->get(route('performance-unit.export.excel', [
            'period_mode' => 'monthly',
            'month' => '2026-08',
        ]));

        $response->assertOk();
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', (string) $response->headers->get('Content-Type'));
    }

    public function test_performance_unit_pdf_export_returns_pdf_response(): void
    {
        $user = $this->createAdminUser();

        Unit::create([
            'code_unit' => 'ME048',
            'type_unit' => 'EXCAVATOR',
            'model' => 'KOMATSU PC200',
            'hm' => 500.0,
        ]);

        $response = $this->actingAs($user)->get(route('performance-unit.export.pdf', [
            'period_mode' => 'monthly',
            'month' => '2026-08',
        ]));

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('Content-Type'));
    }

    public function test_performance_unit_filters_by_iso_week_period(): void
    {
        $this->withoutVite();
        $user = $this->createAdminUser();

        Unit::create([
            'code_unit' => 'ME023',
            'type_unit' => 'EXCAVATOR',
            'hm' => 1000.0,
        ]);

        $response = $this->actingAs($user)->get(route('performance-unit.index', [
            'period_mode' => 'iso_week',
            'year' => '2026',
            'iso_week' => '8',
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('PerformanceUnit/Index')
            ->where('data.period_mode', 'iso_week')
            ->where('data.iso_week', 8)
            ->where('data.days_in_period', 7)
            ->where('data.mohh_per_unit', 168)
            ->where('data.target_down_header', 'Weekly (W8)')
        );
    }

    public function test_performance_unit_filters_by_yearly_period(): void
    {
        $this->withoutVite();
        $user = $this->createAdminUser();

        Unit::create([
            'code_unit' => 'ME023',
            'type_unit' => 'EXCAVATOR',
            'hm' => 1000.0,
        ]);

        $response = $this->actingAs($user)->get(route('performance-unit.index', [
            'period_mode' => 'yearly',
            'year' => '2026',
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('PerformanceUnit/Index')
            ->where('data.period_mode', 'yearly')
            ->where('data.year', 2026)
            ->where('data.days_in_period', 365)
            ->where('data.mohh_per_unit', 8760)
            ->where('data.target_down_header', 'Yearly (2026)')
        );
    }

    public function test_performance_unit_scopes_to_pm_monitoring_units_and_excludes_non_equipment(): void
    {
        $this->withoutVite();
        $user = $this->createAdminUser();

        // Valid PM Monitoring units
        Unit::create([
            'code_unit' => 'ME049',
            'type_unit' => 'EXCAVATOR BIG DIGGER',
            'model' => 'CAT 374',
            'hm' => 2000.0,
        ]);
        Unit::create([
            'code_unit' => 'ME048',
            'type_unit' => 'EXCAVATOR SMALL DIGGER',
            'model' => 'KOMATSU PC200',
            'hm' => 1500.0,
        ]);

        // Excluded non-equipment units (like in PM Monitoring)
        Unit::create([
            'code_unit' => 'BOX KONTAINER 01',
            'type_unit' => 'CONTAINER',
            'hm' => 0.0,
        ]);
        Unit::create([
            'code_unit' => 'GORONG2 BESI',
            'type_unit' => 'INFRASTRUCTURE',
            'hm' => 0.0,
        ]);
        Unit::create([
            'code_unit' => 'Chainsaw 01',
            'type_unit' => 'CHAINSAW',
            'hm' => 0.0,
        ]);

        $response = $this->actingAs($user)->get(route('performance-unit.index'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $units = $page->toArray()['props']['data']['units'];
            $this->assertCount(2, $units);
            $codes = array_column($units, 'code_unit');
            $this->assertContains('ME049', $codes);
            $this->assertContains('ME048', $codes);
            $this->assertNotContains('BOX KONTAINER 01', $codes);
            $this->assertNotContains('GORONG2 BESI', $codes);
            $this->assertNotContains('Chainsaw 01', $codes);
        });
    }

    public function test_performance_unit_resolves_standard_types_like_excavator_big_digger_and_filters_correctly(): void
    {
        $this->withoutVite();
        $user = $this->createAdminUser();

        Unit::create([
            'code_unit' => 'ME049',
            'type_unit' => 'EXCAVATOR BIG DIGGER',
            'model' => 'CAT 374',
            'hm' => 2000.0,
        ]);
        Unit::create([
            'code_unit' => 'ME048',
            'type_unit' => 'EXCAVATOR SMALL DIGGER',
            'model' => 'KOMATSU PC200',
            'hm' => 1500.0,
        ]);

        $response = $this->actingAs($user)->get(route('performance-unit.index', [
            'type_unit' => 'EXCAVATOR BIG DIGGER',
        ]));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $units = $page->toArray()['props']['data']['units'];
            $this->assertCount(1, $units);
            $this->assertEquals('ME049', $units[0]['code_unit']);
            $this->assertEquals('EXCAVATOR BIG DIGGER', $units[0]['type_unit']);
        });
    }

    public function test_performance_unit_provides_iso_week_and_month_ranges(): void
    {
        $this->withoutVite();
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->get(route('performance-unit.index', [
            'period_mode' => 'iso_week',
            'year' => 2026,
            'iso_week' => 39,
        ]));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $data = $page->toArray()['props']['data'];
            $this->assertEquals('iso_week', $data['period_mode']);
            $this->assertEquals('W39 (21 Sep - 27 Sep 2026)', $data['period_label']);
            $this->assertNotEmpty($data['iso_weeks']);
            $this->assertEquals('W1 (29 Dec - 04 Jan 2026)', $data['iso_weeks'][0]['label']);
            $this->assertNotEmpty($data['months']);
            $this->assertCount(12, $data['months']);
            $this->assertEquals('Januari (01 Jan - 31 Jan 2026)', $data['months'][0]['label']);
            $this->assertEquals('September (01 Sep - 30 Sep 2026)', $data['months'][8]['label']);
        });

        $responseMonthly = $this->actingAs($user)->get(route('performance-unit.index', [
            'period_mode' => 'monthly',
            'month' => '2026-09',
        ]));

        $responseMonthly->assertOk();
        $responseMonthly->assertInertia(function ($page) {
            $data = $page->toArray()['props']['data'];
            $this->assertEquals('monthly', $data['period_mode']);
            $this->assertEquals('September (01 Sep - 30 Sep 2026)', $data['period_label']);
            $this->assertCount(12, $data['months']);
        });
    }
}
