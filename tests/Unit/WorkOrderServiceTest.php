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
        $this->assertEquals('PLT/WO/INSP/', WorkOrderService::getPrefixForType('INS - INSPECTION'));
        $this->assertEquals('PLT/WO/OVH/', WorkOrderService::getPrefixForType('OVH - OVERHAUL'));
        $this->assertEquals('PLT/WO/REPL/', WorkOrderService::getPrefixForType('REPL - COMPONENT REPLACEMENT'));
        $this->assertEquals('PLT/WO/UC/', WorkOrderService::getPrefixForType('UC - UNDERCARRIAGE MAINTENANCE'));
        $this->assertEquals('PLT/WO/TYRE/', WorkOrderService::getPrefixForType('TYRE - Tyre Management'));

        // Short codes
        $this->assertEquals('PLT/WO/PM/', WorkOrderService::getPrefixForType('PM'));
        $this->assertEquals('PLT/WO/CM/', WorkOrderService::getPrefixForType('CM'));
        $this->assertEquals('PLT/WO/INSP/', WorkOrderService::getPrefixForType('INS'));
        $this->assertEquals('PLT/WO/INSP/', WorkOrderService::getPrefixForType('INSP'));
        $this->assertEquals('PLT/WO/OVH/', WorkOrderService::getPrefixForType('OVH'));
        $this->assertEquals('PLT/WO/REPL/', WorkOrderService::getPrefixForType('REPL'));
        $this->assertEquals('PLT/WO/UC/', WorkOrderService::getPrefixForType('UC'));
        $this->assertEquals('PLT/WO/TYRE/', WorkOrderService::getPrefixForType('TYRE'));
    }

    public function test_get_all_suggested_numbers_contains_all_seven_keys(): void
    {
        $suggested = WorkOrderService::getAllSuggestedNumbers();

        $this->assertArrayHasKey('PM - PREVENTIVE MAINTENANCE', $suggested);
        $this->assertArrayHasKey('CM - CORRECTIVE MAINTENANCE', $suggested);
        $this->assertArrayHasKey('INS - INSPECTION', $suggested);
        $this->assertArrayHasKey('OVH - OVERHAUL', $suggested);
        $this->assertArrayHasKey('REPL - COMPONENT REPLACEMENT', $suggested);
        $this->assertArrayHasKey('UC - UNDERCARRIAGE MAINTENANCE', $suggested);
        $this->assertArrayHasKey('TYRE - Tyre Management', $suggested);

        $this->assertStringStartsWith('PLT/WO/PM/', $suggested['PM - PREVENTIVE MAINTENANCE']);
        $this->assertStringStartsWith('PLT/WO/CM/', $suggested['CM - CORRECTIVE MAINTENANCE']);
        $this->assertStringStartsWith('PLT/WO/INSP/', $suggested['INS - INSPECTION']);
        $this->assertStringStartsWith('PLT/WO/OVH/', $suggested['OVH - OVERHAUL']);
        $this->assertStringStartsWith('PLT/WO/REPL/', $suggested['REPL - COMPONENT REPLACEMENT']);
        $this->assertStringStartsWith('PLT/WO/UC/', $suggested['UC - UNDERCARRIAGE MAINTENANCE']);
        $this->assertStringStartsWith('PLT/WO/TYRE/', $suggested['TYRE - Tyre Management']);
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
}
