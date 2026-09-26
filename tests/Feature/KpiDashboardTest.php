<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KpiDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_kpi_page_renders_with_all_reference_datasets(): void
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->get(route('kpi.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Kpi/Index')
            ->has('paUnitMatrix')
            ->has('breakdownSummary')
            ->has('mtbfBulldozer')
            ->has('mttrBulldozer')
            ->has('paretoDuration')
            ->has('paretoEvent')
            ->has('klasifikasiBreakdown')
            // Modul 1: PA Unit Matrix
            ->where('paUnitMatrix.summary.category', 'PA UNIT')
            ->has('paUnitMatrix.categories', 12)
            ->where('paUnitMatrix.categories.0.category', 'EXCAVATOR SMALLER')
            // Modul 2: Breakdown Type BD & Down Status
            ->where('breakdownSummary.equipment_title', 'EXCAVATOR')
            ->where('breakdownSummary.type_bd.total_hrs', 337)
            ->where('breakdownSummary.down_status.total_hrs', 336)
            ->has('breakdownSummary.down_status.items', 9)
            // Modul 3: MTBF Bulldozer
            ->where('mtbfBulldozer.title', 'MTBF BULLDOZER')
            ->where('mtbfBulldozer.target', 80)
            ->has('mtbfBulldozer.items', 17)
            // Modul 4: MTTR Bulldozer
            ->where('mttrBulldozer.title', 'MTTR BULLDOZER')
            ->where('mttrBulldozer.target', 15)
            ->has('mttrBulldozer.items', 27)
            // Modul 5: Pareto Excavator Big Digger Duration
            ->where('paretoDuration.equipment', 'EXCAVATOR BIG DIGGER')
            ->has('paretoDuration.items', 39)
            // Modul 6: Pareto Excavator Big Digger Event
            ->where('paretoEvent.title', 'Pareto berdasarkan Event Excavator Big Digger')
            ->has('paretoEvent.items', 44)
            // Modul 7: Klasifikasi Breakdown
            ->where('klasifikasiBreakdown.title', 'Klasifikasi Unit Breakdown Excavator Big Digger')
            ->has('klasifikasiBreakdown.items', 8)
        );
    }
}
