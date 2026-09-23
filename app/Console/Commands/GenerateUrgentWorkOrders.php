<?php

namespace App\Console\Commands;

use App\Models\Unit;
use App\Models\WorkOrder;
use App\Services\WorkOrderService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateUrgentWorkOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wo:generate-urgent';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate OPEN BREAKDOWN Work Orders for units that are OVERDUE, TODAY, or TOMORROW for their next service.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting generation of urgent work orders...');

        $ignoredUnits = [
            'GORONG2 BESI',
            'MACHINE WELDING +PEMANAS hdpe', 'MFS001', 'MFS009',
            'MFS010', 'MFS011', 'MFS012', 'PIPE HDPE',
        ];

        $units = Unit::with(['lastService', 'nextService'])
            ->where('code_unit', 'not like', 'BOX KONTAINER%')
            ->where('code_unit', 'not like', 'BOX %')
            ->where('code_unit', 'not like', 'Chainsaw%')
            ->whereNotIn('code_unit', $ignoredUnits)
            ->get();

        $generatedCount = 0;

        foreach ($units as $unit) {
            $statusData = $this->calculateStatusForUnit($unit);

            if (in_array($statusData['label'], ['OVERDUE', 'TODAY', 'TOMORROW'])) {

                // Check if a work order already exists to prevent duplicates
                $problemDesc = "Auto-generated: Unit is {$statusData['label']} for {$statusData['serviceType']}";

                $exists = WorkOrder::where('unit_id', $unit->id)
                    ->where('tipe_wo', 'BREAKDOWN')
                    ->where('status_wo', 'OPEN')
                    ->where('problem', $problemDesc)
                    ->exists();

                if (! $exists) {
                    try {
                        WorkOrderService::createWorkOrder([
                            'tipe_wo' => 'BREAKDOWN',
                            'unit_id' => $unit->id,
                            'status_wo' => 'OPEN',
                            'problem' => $problemDesc,
                            'hm_unit' => $unit->hm ?? 0,
                            'request_by' => 'System Scheduler',
                            'request_date' => now(),
                            'priority' => 'HIGH',
                            'downtime_code' => '',
                            'site' => '',
                        ]);
                        $this->line("Created Work Order for Unit: {$unit->code_unit} ({$statusData['label']})");
                        $generatedCount++;
                    } catch (\Exception $e) {
                        $this->error("Failed to create WO for Unit {$unit->code_unit}: {$e->getMessage()}");
                        Log::error("Failed to create WO for Unit {$unit->code_unit}", ['error' => $e]);
                    }
                }
            }
        }

        $this->info("Completed! Generated {$generatedCount} new Work Orders.");
    }

    private function getCategory($codeUnit)
    {
        $lightVehicles = [
            'B-02', 'B-10', 'T-02', 'A-07', 'A-08', 'B-16', 'G-03', 'D-09',
            'D-21', 'D-20', 'E-02', 'F-05', 'G-05', 'D-19', 'H-02', 'HO-06',
        ];

        if (in_array($codeUnit, $lightVehicles)) {
            return 'Light Vehicle';
        }

        return 'Other';
    }

    private function calculateStatusForUnit($unit)
    {
        $codeUnit = $unit->code_unit;
        $category = $this->getCategory($codeUnit);

        $nextService = $unit->nextService;
        $lastService = $unit->lastService;
        $currentHm = $unit->hm ?? 0;

        $targetValue = null;
        $serviceType = '';
        $metricLabel = 'HM';

        if ($codeUnit === 'MSC001') {
            return ['label' => 'NEXT SERVICE', 'targetValue' => null, 'serviceType' => 'Service 1 Bulan'];
        } elseif ($category === 'Light Vehicle') {
            $metricLabel = 'KM';
            $interval = 5000;
            if ($nextService && $nextService->target_hm) {
                $targetValue = $nextService->target_hm;
            } elseif ($lastService && $lastService->target_hm) {
                $targetValue = $lastService->target_hm + $interval;
            } else {
                $targetValue = round($currentHm / $interval) * $interval;
                if ($targetValue == 0) {
                    $targetValue = $interval;
                }
            }
            $serviceType = $nextService->service_type ?? "Service {$targetValue} KM";
        } else {
            $metricLabel = 'HM';
            $interval = 250;
            if ($nextService && $nextService->target_hm) {
                $targetValue = $nextService->target_hm;
            } elseif ($lastService && $lastService->target_hm) {
                $targetValue = $lastService->target_hm + $interval;
            } else {
                $targetValue = round($currentHm / $interval) * $interval;
                if ($targetValue == 0) {
                    $targetValue = $interval;
                }
            }

            if ($nextService && $nextService->service_type) {
                $serviceType = "PS {$nextService->service_type} H";
            } elseif ($targetValue % 2000 == 0) {
                $serviceType = 'PS 2000 H';
            } elseif ($targetValue % 1000 == 0) {
                $serviceType = 'PS 1000 H';
            } elseif ($targetValue % 500 == 0) {
                $serviceType = 'PS 500 H';
            } else {
                $serviceType = 'PS 250 H';
            }
        }

        if ($targetValue === null) {
            return ['label' => 'NEXT SERVICE', 'targetValue' => null, 'serviceType' => $serviceType];
        }

        $diff = $targetValue - $currentHm;

        if ($diff < 0) {
            return ['label' => 'OVERDUE', 'targetValue' => $targetValue, 'serviceType' => $serviceType];
        }

        if ($metricLabel === 'HM') {
            if ($diff <= 24) {
                return ['label' => 'TODAY', 'targetValue' => $targetValue, 'serviceType' => $serviceType];
            }
            if ($diff <= 48) {
                return ['label' => 'TOMORROW', 'targetValue' => $targetValue, 'serviceType' => $serviceType];
            }
        } else {
            if ($diff <= 500) {
                return ['label' => 'TODAY', 'targetValue' => $targetValue, 'serviceType' => $serviceType];
            }
            if ($diff <= 1000) {
                return ['label' => 'TOMORROW', 'targetValue' => $targetValue, 'serviceType' => $serviceType];
            }
        }

        return ['label' => 'NEXT SERVICE', 'targetValue' => $targetValue, 'serviceType' => $serviceType];
    }
}
