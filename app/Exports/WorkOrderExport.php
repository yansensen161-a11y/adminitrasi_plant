<?php

namespace App\Exports;

use App\Models\WorkOrder;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;

class WorkOrderExport implements FromCollection
{
    public function collection(): Collection
    {
        return WorkOrder::all();
    }
}
