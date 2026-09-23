<?php

namespace App\Exports;

use App\Models\WorkOrder;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;

class WorkOrderExport implements FromCollection
{
    public function __construct(protected ?string $tab = null) {}

    public function collection(): Collection
    {
        $query = WorkOrder::query();

        if ($this->tab === 'schedule') {
            $query->where('tipe_wo', 'SCHEDULE');
        } elseif ($this->tab === 'breakdown') {
            $query->where('tipe_wo', 'BREAKDOWN');
        }

        // Strictly only OPEN work orders
        $query->where(function ($q) {
            $q->where('status_wo', 'OPEN')
                ->orWhere('status_pengerjaan', 'OPEN');
        })->whereNotIn('status_wo', ['COMPLETED', 'CLOSED'])
            ->where('status_pengerjaan', '!=', 'CLOSED');

        return $query->get();
    }
}
