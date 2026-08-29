<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ManpowerBudget;
use Inertia\Inertia;

class ManpowerBudgetController extends Controller
{
    public function index()
    {
        $budgets = ManpowerBudget::orderBy('id', 'asc')->get();

        $staffBudgets = $budgets->where('category', 'Staff')->values();
        $nonStaffBudgets = $budgets->where('category', 'Non Staff')->values();

        return Inertia::render('ManpowerBudget/Index', [
            'staffBudgets' => $staffBudgets,
            'nonStaffBudgets' => $nonStaffBudgets,
        ]);
    }
}
