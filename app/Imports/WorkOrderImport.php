<?php

namespace App\Imports;

use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Model;
use Maatwebsite\Excel\Concerns\ToModel;

class WorkOrderImport implements ToModel
{
    public function model(array $row): Model|null
    {
        return new WorkOrder([
            //
        ]);
    }
}
