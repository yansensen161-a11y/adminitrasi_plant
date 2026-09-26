<?php

namespace App\Services;

use App\Models\Tyre;
use App\Models\TyreHistory;
use App\Models\Unit;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TyreWorkOrderSyncService
{
    /**
     * Process tyre replacements submitted with a Work Order.
     *
     * @return array Summary of actions performed
     */
    public static function syncTyreReplacements(WorkOrder $wo, array $replacements = []): array
    {
        if (empty($replacements) || ! $wo->unit_id) {
            return [
                'installed_count' => 0,
                'removed_count' => 0,
                'details' => [],
            ];
        }

        $unit = $wo->unit ?: Unit::find($wo->unit_id);
        $eventDate = $wo->waktu_breakdown
            ? Carbon::parse($wo->waktu_breakdown)->toDateString()
            : ($wo->request_date ? Carbon::parse($wo->request_date)->toDateString() : now()->toDateString());
        $eventHm = (float) ($wo->hm_unit ?: ($wo->hm_bd ?: ($unit?->hm ?? 0)));
        $userName = auth()->user()?->name ?? 'Work Order System';

        $installedCount = 0;
        $removedCount = 0;
        $details = [];

        DB::transaction(function () use ($wo, $unit, $replacements, $eventDate, $eventHm, $userName, &$installedCount, &$removedCount, &$details) {
            foreach ($replacements as $item) {
                $position = ! empty($item['position']) ? trim((string) $item['position']) : null;
                if (! $position) {
                    continue;
                }

                $newSerialNumber = ! empty($item['new_serial_number'])
                    ? trim((string) $item['new_serial_number'])
                    : (! empty($item['new_tyre_serial']) ? trim((string) $item['new_tyre_serial']) : null);

                $newTyreId = $item['stock_tyre_id'] ?? ($item['new_tyre_id'] ?? null);
                if (! $newSerialNumber && $newTyreId) {
                    $stockFound = Tyre::find($newTyreId);
                    if ($stockFound) {
                        $newSerialNumber = $stockFound->serial_number;
                    }
                }

                $oldSerialNumber = ! empty($item['old_serial_number'])
                    ? trim((string) $item['old_serial_number'])
                    : (! empty($item['old_tyre_serial']) ? trim((string) $item['old_tyre_serial']) : null);

                $oldTyreId = $item['old_tyre_id'] ?? null;

                $oldCondition = ! empty($item['old_condition'])
                    ? strtoupper(trim((string) $item['old_condition']))
                    : (! empty($item['old_tyre_disposition']) ? strtoupper(trim((string) $item['old_tyre_disposition'])) : 'SCRAP');

                if (! in_array($oldCondition, ['SCRAP', 'REPAIR', 'STOCK'])) {
                    $oldCondition = 'SCRAP';
                }

                $oldRtd = ! empty($item['old_rtd'])
                    ? (string) $item['old_rtd']
                    : (! empty($item['old_tyre_rtd']) ? (string) $item['old_tyre_rtd'] : null);

                $oldNotesVal = ! empty($item['old_notes'])
                    ? (string) $item['old_notes']
                    : (! empty($item['removal_reason']) ? (string) $item['removal_reason'] : null);

                // 1. Find and process old tyre if present at this position or explicitly referenced
                $oldTyre = null;
                if ($oldTyreId) {
                    $oldTyre = Tyre::find($oldTyreId);
                } elseif ($oldSerialNumber) {
                    $oldTyre = Tyre::where('serial_number', $oldSerialNumber)->first();
                } else {
                    // Find active tyre on this unit & position
                    $oldTyre = Tyre::where('unit_id', $wo->unit_id)
                        ->where('position', $position)
                        ->where('condition', 'ACTIVE')
                        ->first();
                }

                if ($oldTyre && (! $newSerialNumber || $oldTyre->serial_number !== $newSerialNumber)) {
                    $installedHm = (float) ($oldTyre->installed_hm ?? 0);
                    $accumulatedHm = ($installedHm > 0 && $eventHm > $installedHm)
                        ? ($eventHm - $installedHm)
                        : 0;

                    $newTotalHm = (float) ($oldTyre->total_hm ?? 0) + $accumulatedHm;
                    $oldFromPos = $oldTyre->position ?: $position;

                    $oldNotes = "Dilepas via WO {$wo->no_wo}";
                    if ($oldNotesVal) {
                        $oldNotes .= ' - '.$oldNotesVal;
                    }

                    $oldTyre->update([
                        'condition' => $oldCondition,
                        'unit_id' => null,
                        'position' => null,
                        'installed_hm' => 0,
                        'total_hm' => $newTotalHm,
                        'rtd' => $oldRtd ?: $oldTyre->rtd,
                        'notes' => $oldNotes,
                    ]);

                    TyreHistory::create([
                        'tyre_id' => $oldTyre->id,
                        'unit_id' => $wo->unit_id,
                        'event_type' => in_array($oldCondition, ['STOCK', 'REPAIR', 'SCRAP']) ? $oldCondition : 'REMOVE',
                        'from_position' => $oldFromPos,
                        'to_position' => null,
                        'hm_at_event' => $eventHm,
                        'event_date' => $eventDate,
                        'performed_by' => $userName,
                        'notes' => "Dilepas pada WO {$wo->no_wo}".($newSerialNumber ? " (digantikan oleh {$newSerialNumber})" : '').($oldNotesVal ? " - {$oldNotesVal}" : ''),
                    ]);

                    $removedCount++;
                }

                // 2. Process new tyre installation
                if ($newSerialNumber) {
                    $brand = ! empty($item['brand']) ? trim((string) $item['brand']) : 'TRIANGLE';
                    $typeSize = ! empty($item['type_size'])
                        ? trim((string) $item['type_size'])
                        : (! empty($item['size']) ? trim((string) $item['size']) : null);
                    $pattern = ! empty($item['pattern']) ? trim((string) $item['pattern']) : null;
                    $psi = ! empty($item['psi'])
                        ? (int) $item['psi']
                        : (! empty($item['pressure']) ? (int) $item['pressure'] : null);
                    $otd = ! empty($item['otd']) ? (string) $item['otd'] : null;
                    $rtd = ! empty($item['rtd']) ? (string) $item['rtd'] : null;
                    $newNotes = "Dipasang via WO {$wo->no_wo}";
                    if (! empty($item['notes'])) {
                        $newNotes .= ' - '.$item['notes'];
                    }

                    $existingTyre = $newTyreId ? Tyre::find($newTyreId) : Tyre::where('serial_number', $newSerialNumber)->first();

                    if ($existingTyre) {
                        // Update existing tyre from STOCK / existing
                        $prevPos = $existingTyre->position;

                        $existingTyre->update([
                            'unit_id' => $wo->unit_id,
                            'position' => $position,
                            'condition' => 'ACTIVE',
                            'installed_hm' => $eventHm,
                            'brand' => $brand ?: $existingTyre->brand,
                            'type_size' => $typeSize ?: $existingTyre->type_size,
                            'pattern' => $pattern ?: $existingTyre->pattern,
                            'psi' => $psi ?: $existingTyre->psi,
                            'otd' => $otd ?: $existingTyre->otd,
                            'rtd' => $rtd ?: $existingTyre->rtd,
                            'notes' => $newNotes,
                        ]);

                        TyreHistory::create([
                            'tyre_id' => $existingTyre->id,
                            'unit_id' => $wo->unit_id,
                            'event_type' => 'INSTALL',
                            'from_position' => $prevPos,
                            'to_position' => $position,
                            'hm_at_event' => $eventHm,
                            'event_date' => $eventDate,
                            'performed_by' => $userName,
                            'notes' => "Dipasang pada unit {$unit?->code_unit} posisi {$position} via WO {$wo->no_wo}",
                        ]);

                        $installedCount++;
                        $details[] = "Posisi {$position}: Ban {$newSerialNumber} ({$brand}) aktif terpasang.";
                    } else {
                        // Register new tyre record
                        $newTyre = Tyre::create([
                            'serial_number' => $newSerialNumber,
                            'brand' => $brand,
                            'type_size' => $typeSize ?: self::getDefaultTypeSizeForUnit($unit?->type_unit),
                            'pattern' => $pattern,
                            'psi' => $psi,
                            'otd' => $otd,
                            'rtd' => $rtd,
                            'condition' => 'ACTIVE',
                            'unit_id' => $wo->unit_id,
                            'position' => $position,
                            'installed_hm' => $eventHm,
                            'total_hm' => 0,
                            'purchase_date' => $eventDate,
                            'notes' => $newNotes,
                        ]);

                        TyreHistory::create([
                            'tyre_id' => $newTyre->id,
                            'unit_id' => $wo->unit_id,
                            'event_type' => 'INSTALL',
                            'from_position' => null,
                            'to_position' => $position,
                            'hm_at_event' => $eventHm,
                            'event_date' => $eventDate,
                            'performed_by' => $userName,
                            'notes' => "Registrasi dan instalasi awal via WO {$wo->no_wo}",
                        ]);

                        $installedCount++;
                        $details[] = "Posisi {$position}: Ban Baru {$newSerialNumber} ({$brand}) didaftarkan & aktif terpasang.";
                    }
                }
            }
        });

        return [
            'installed_count' => $installedCount,
            'removed_count' => $removedCount,
            'details' => $details,
        ];
    }

    /**
     * Helper to get sensible default tyre size by unit type.
     */
    public static function getDefaultTypeSizeForUnit(?string $typeUnit): string
    {
        $upper = strtoupper(trim((string) $typeUnit));
        if (str_contains($upper, 'MOTORGRADER') || str_contains($upper, 'GRADER')) {
            return '14.00R24';
        }
        if (str_contains($upper, 'MAINHAUL') || str_contains($upper, 'DUMP TRUCK') || str_contains($upper, 'FUEL') || str_contains($upper, 'WATER')) {
            return '12.00R20';
        }
        if (str_contains($upper, 'HAULER') || str_contains($upper, 'OHT')) {
            return '24.00R35';
        }
        if (str_contains($upper, 'LV') || str_contains($upper, 'LIGHT VEHICLE')) {
            return '265/65R17';
        }

        return '24.00R35';
    }
}
