<?php

namespace Tests\Unit;

use App\Models\Unit;
use App\Models\WorkOrder;
use App\Services\WorkOrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_prefix_for_all_seven_types(): void
    {
        $this->assertEquals('PLT/WO/PM/', WorkOrderService::getPrefixForType('PM - PREVENTIVE MAINTENANCE'));
        $this->assertEquals('PLT/WO/CM/', WorkOrderService::getPrefixForType('CM - CORRECTIVE MAINTENANCE'));
        $this->assertEquals('PLT/WO/OVH/', WorkOrderService::getPrefixForType('OVH - OVERHAUL'));
        $this->assertEquals('PLT/WO/REPL/', WorkOrderService::getPrefixForType('REPL - COMPONENT REPLACEMENT'));
        $this->assertEquals('PLT/WO/UC/', WorkOrderService::getPrefixForType('UC - UNDERCARRIAGE MAINTENANCE'));
        $this->assertEquals('PLT/WO/TYRE/', WorkOrderService::getPrefixForType('TYRE - TYRE REPLACEMENT'));
        $this->assertEquals('PLT/WO/SVC/', WorkOrderService::getPrefixForType('SVC - SERVICE MAINTENANCE'));

        // Short codes
        $this->assertEquals('PLT/WO/PM/', WorkOrderService::getPrefixForType('PM'));
        $this->assertEquals('PLT/WO/CM/', WorkOrderService::getPrefixForType('CM'));
        $this->assertEquals('PLT/WO/OVH/', WorkOrderService::getPrefixForType('OVH'));
        $this->assertEquals('PLT/WO/REPL/', WorkOrderService::getPrefixForType('REPL'));
        $this->assertEquals('PLT/WO/UC/', WorkOrderService::getPrefixForType('UC'));
        $this->assertEquals('PLT/WO/TYRE/', WorkOrderService::getPrefixForType('TYRE'));
        $this->assertEquals('PLT/WO/SVC/', WorkOrderService::getPrefixForType('SVC'));
    }

    public function test_get_all_suggested_numbers_contains_all_seven_keys(): void
    {
        $suggested = WorkOrderService::getAllSuggestedNumbers();

        $this->assertArrayHasKey('PM - PREVENTIVE MAINTENANCE', $suggested);
        $this->assertArrayHasKey('CM - CORRECTIVE MAINTENANCE', $suggested);
        $this->assertArrayHasKey('OVH - OVERHAUL', $suggested);
        $this->assertArrayHasKey('REPL - COMPONENT REPLACEMENT', $suggested);
        $this->assertArrayHasKey('UC - UNDERCARRIAGE MAINTENANCE', $suggested);
        $this->assertArrayHasKey('TYRE - TYRE REPLACEMENT', $suggested);
        $this->assertArrayHasKey('SVC - SERVICE MAINTENANCE', $suggested);

        $this->assertStringStartsWith('PLT/WO/PM/', $suggested['PM - PREVENTIVE MAINTENANCE']);
        $this->assertStringStartsWith('PLT/WO/CM/', $suggested['CM - CORRECTIVE MAINTENANCE']);
        $this->assertStringStartsWith('PLT/WO/OVH/', $suggested['OVH - OVERHAUL']);
        $this->assertStringStartsWith('PLT/WO/REPL/', $suggested['REPL - COMPONENT REPLACEMENT']);
        $this->assertStringStartsWith('PLT/WO/UC/', $suggested['UC - UNDERCARRIAGE MAINTENANCE']);
        $this->assertStringStartsWith('PLT/WO/TYRE/', $suggested['TYRE - TYRE REPLACEMENT']);
        $this->assertStringStartsWith('PLT/WO/SVC/', $suggested['SVC - SERVICE MAINTENANCE']);
    }

    public function test_work_order_numbers_increment_independently_per_type(): void
    {
        // Initial numbers
        $repl1 = WorkOrderService::generateWoNumber('REPL');
        $this->assertEquals('PLT/WO/REPL/001', $repl1);

        $uc1 = WorkOrderService::generateWoNumber('UC');
        $this->assertEquals('PLT/WO/UC/001', $uc1);

        $unit = Unit::create([
            'code_unit' => 'EX01',
            'model' => 'PC200',
            'type_unit' => 'EXCAVATOR',
        ]);

        // Save a mock REPL work order
        WorkOrder::forceCreate([
            'no_wo' => 'PLT/WO/REPL/001',
            'tipe_wo' => 'BREAKDOWN',
            'status_wo' => 'REPL - COMPONENT REPLACEMENT',
            'downtime_code' => 'Unschedule',
            'unit_id' => $unit->id,
            'site' => 'Lokal',
        ]);

        // Next REPL should be 002
        $repl2 = WorkOrderService::generateWoNumber('REPL');
        $this->assertEquals('PLT/WO/REPL/002', $repl2);

        // UC should still be 001
        $ucAgain = WorkOrderService::generateWoNumber('UC');
        $this->assertEquals('PLT/WO/UC/001', $ucAgain);
    }

    public function test_normalize_tipe_wo(): void
    {
        $this->assertEquals('PM - PREVENTIVE MAINTENANCE', WorkOrderService::normalizeTipeWo('PM - PREVENTIVE MAINTENANCE'));
        $this->assertEquals('PM - PREVENTIVE MAINTENANCE', WorkOrderService::normalizeTipeWo('PM'));
        $this->assertEquals('PM - PREVENTIVE MAINTENANCE', WorkOrderService::normalizeTipeWo('Preventive'));
        $this->assertEquals('CM - CORRECTIVE MAINTENANCE', WorkOrderService::normalizeTipeWo('CM - CORRECTIVE MAINTENANCE'));
        $this->assertEquals('CM - CORRECTIVE MAINTENANCE', WorkOrderService::normalizeTipeWo('CM'));
        $this->assertEquals('CM - CORRECTIVE MAINTENANCE', WorkOrderService::normalizeTipeWo('Breakdown'));
        $this->assertEquals('OVH - OVERHAUL', WorkOrderService::normalizeTipeWo('OVH - OVERHAUL'));
        $this->assertEquals('OVH - OVERHAUL', WorkOrderService::normalizeTipeWo('OVH'));
        $this->assertEquals('REPL - COMPONENT REPLACEMENT', WorkOrderService::normalizeTipeWo('REPL - COMPONENT REPLACEMENT'));
        $this->assertEquals('REPL - COMPONENT REPLACEMENT', WorkOrderService::normalizeTipeWo('REPL'));
        $this->assertEquals('UC - UNDERCARRIAGE MAINTENANCE', WorkOrderService::normalizeTipeWo('UC - UNDERCARRIAGE MAINTENANCE'));
        $this->assertEquals('UC - UNDERCARRIAGE MAINTENANCE', WorkOrderService::normalizeTipeWo('UC'));
        $this->assertEquals('TYRE - TYRE REPLACEMENT', WorkOrderService::normalizeTipeWo('TYRE - TYRE REPLACEMENT'));
        $this->assertEquals('TYRE - TYRE REPLACEMENT', WorkOrderService::normalizeTipeWo('TYRE'));
        $this->assertEquals('SVC - SERVICE MAINTENANCE', WorkOrderService::normalizeTipeWo('SVC - SERVICE MAINTENANCE'));
        $this->assertEquals('SVC - SERVICE MAINTENANCE', WorkOrderService::normalizeTipeWo('SVC'));
    }

    public function test_normalize_status_wo(): void
    {
        $this->assertEquals('PLANNING - PERENCANAAN PEKERJAAN', WorkOrderService::normalizeStatusWo('PLANNING - PERENCANAAN PEKERJAAN'));
        $this->assertEquals('PLANNING - PERENCANAAN PEKERJAAN', WorkOrderService::normalizeStatusWo('PLANNING'));
        $this->assertEquals('PLANNING - PERENCANAAN PEKERJAAN', WorkOrderService::normalizeStatusWo('OPEN'));
        $this->assertEquals('IN PROGRESS - SEDANG DIKERJAKAN', WorkOrderService::normalizeStatusWo('IN PROGRESS - SEDANG DIKERJAKAN'));
        $this->assertEquals('IN PROGRESS - SEDANG DIKERJAKAN', WorkOrderService::normalizeStatusWo('PROGRESS'));
        $this->assertEquals('IN PROGRESS - SEDANG DIKERJAKAN', WorkOrderService::normalizeStatusWo('PROCESS'));
        $this->assertEquals('COMPLETED - PEKERJAAN SELESAI', WorkOrderService::normalizeStatusWo('COMPLETED - PEKERJAAN SELESAI'));
        $this->assertEquals('COMPLETED - PEKERJAAN SELESAI', WorkOrderService::normalizeStatusWo('COMPLETED'));
        $this->assertEquals('COMPLETED - PEKERJAAN SELESAI', WorkOrderService::normalizeStatusWo('CLOSED'));

        // When status is empty but finish date exists
        $this->assertEquals('COMPLETED - PEKERJAAN SELESAI', WorkOrderService::normalizeStatusWo(null, true));
        $this->assertEquals('PLANNING - PERENCANAAN PEKERJAAN', WorkOrderService::normalizeStatusWo(null, false));
    }

    public function test_normalize_down_status(): void
    {
        $this->assertEquals('B0 - ON PROGRESS', WorkOrderService::normalizeDownStatus('B0 - ON PROGRESS'));
        $this->assertEquals('B0 - ON PROGRESS', WorkOrderService::normalizeDownStatus('B0'));
        $this->assertEquals('B1 - WAITING PARTS', WorkOrderService::normalizeDownStatus('B1 - WAITING PARTS'));
        $this->assertEquals('B1 - WAITING PARTS', WorkOrderService::normalizeDownStatus('B1'));
        $this->assertEquals('B2 - WAITING SARANA', WorkOrderService::normalizeDownStatus('B2 - WAITING SARANA'));
        $this->assertEquals('B2 - WAITING SARANA', WorkOrderService::normalizeDownStatus('B2'));
        $this->assertEquals('B3 - WAITING TOOLS', WorkOrderService::normalizeDownStatus('B3 - WAITING TOOLS'));
        $this->assertEquals('B3 - WAITING TOOLS', WorkOrderService::normalizeDownStatus('B3'));
        $this->assertEquals('B4 - WAITING MAN POWER', WorkOrderService::normalizeDownStatus('B4 - WAITING MAN POWER'));
        $this->assertEquals('B4 - WAITING MAN POWER', WorkOrderService::normalizeDownStatus('B4'));
        $this->assertEquals('B5 - OUTSIDE / DEALER', WorkOrderService::normalizeDownStatus('B5 - OUTSIDE / DEALER'));
        $this->assertEquals('B5 - OUTSIDE / DEALER', WorkOrderService::normalizeDownStatus('B5'));
        $this->assertEquals('B6 - PRODUCTION / ABUSE', WorkOrderService::normalizeDownStatus('B6 - PRODUCTION / ABUSE'));
        $this->assertEquals('B6 - PRODUCTION / ABUSE', WorkOrderService::normalizeDownStatus('B6'));
        $this->assertEquals('B7 - WAITING DECISION PLANT', WorkOrderService::normalizeDownStatus('B7 - WAITING DECISION PLANT'));
        $this->assertEquals('B7 - WAITING DECISION PLANT', WorkOrderService::normalizeDownStatus('B7'));
        $this->assertEquals('B8 - WAITING DECISION HO', WorkOrderService::normalizeDownStatus('B8 - WAITING DECISION HO'));
        $this->assertEquals('B8 - WAITING DECISION HO', WorkOrderService::normalizeDownStatus('B8'));
        $this->assertEquals('B9 - WAITING ACCESS', WorkOrderService::normalizeDownStatus('B9 - WAITING ACCESS'));
        $this->assertEquals('B9 - WAITING ACCESS', WorkOrderService::normalizeDownStatus('B9'));
        $this->assertEquals('B10 - WAITING RAIN / SLIPPERY CONDITION', WorkOrderService::normalizeDownStatus('B10 - WAITING RAIN / SLIPPERY CONDITION'));
        $this->assertEquals('B10 - WAITING RAIN / SLIPPERY CONDITION', WorkOrderService::normalizeDownStatus('B10'));
    }
}
