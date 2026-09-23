<?php

namespace Tests\Feature;

use App\Models\MonthlyBudgetForecast;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PdfForecastTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_can_view_forecast_budget_monthly_page_and_auto_seed(): void
    {
        $user = $this->createAdminUser();

        $this->assertEquals(0, MonthlyBudgetForecast::count());

        $response = $this->actingAs($user)->get(route('forecast-budget-monthly.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('PdfForecast/Index')
            ->has('kpiBudget')
            ->has('chartForecastRealisasi')
            ->has('chartDistribusiKategori')
            ->has('chartTopUnit')
            ->has('tableDetailForecast')
            ->has('rekapDepartment')
            ->has('rekapKategori')
            ->has('pdfTabs')
            ->has('pdfData')
            ->has('unitsMaster')
            ->where('pdfTabs.0', 'BULLDOZER')
            ->where('pdfTabs.1', 'EXCAVATOR')
            ->where('pdfTabs.2', 'DUMP TRUCK')
            ->where('pdfTabs.3', 'DEWATERING')
            ->where('pdfTabs.4', 'OHT')
        );

        $this->assertGreaterThan(0, MonthlyBudgetForecast::count());
    }

    public function test_can_store_new_forecast_budget_entry(): void
    {
        $user = $this->createAdminUser();

        $payload = [
            'tab' => 'TOOLS',
            'code_unit' => 'TOOLS',
            'type_unit' => 'TOOLS',
            'hm' => '',
            'code_budget' => '3.0.13',
            'cost_element' => 'Tools',
            'code_depart' => '110999',
            'uraian' => 'Kunci Momen Digital 1/2 Inch',
            'std_qty' => '1',
            'forecast_qty' => '2',
            'satuan' => 'Pcs',
            'unit_rate' => 1500000,
            'amount' => 3000000,
        ];

        $response = $this->actingAs($user)->post(route('forecast-budget-monthly.store'), $payload);

        $response->assertRedirect();

        $this->assertDatabaseHas('monthly_budget_forecasts', [
            'tab' => 'TOOLS',
            'code_unit' => 'TOOLS',
            'uraian' => 'Kunci Momen Digital 1/2 Inch',
            'forecast_qty' => '2',
            'amount' => 3000000,
        ]);
    }

    public function test_can_update_forecast_budget_entry(): void
    {
        $user = $this->createAdminUser();

        $item = MonthlyBudgetForecast::create([
            'year' => 2026,
            'tab' => 'TOOLS',
            'code_unit' => 'TOOLS',
            'code_budget' => '3.0.13',
            'cost_element' => 'Tools',
            'uraian' => 'Item Lama',
            'forecast_qty' => '1',
            'unit_rate' => 500000,
            'amount' => 500000,
        ]);

        $updatePayload = [
            'tab' => 'TOOLS',
            'code_unit' => 'TOOLS',
            'code_budget' => '3.0.13',
            'cost_element' => 'Tools',
            'uraian' => 'Item Sudah Diperbarui',
            'forecast_qty' => '3',
            'satuan' => 'Set',
            'unit_rate' => 600000,
            'amount' => 1800000,
        ];

        $response = $this->actingAs($user)->put(route('forecast-budget-monthly.update', $item->id), $updatePayload);

        $response->assertRedirect();

        $this->assertDatabaseHas('monthly_budget_forecasts', [
            'id' => $item->id,
            'uraian' => 'Item Sudah Diperbarui',
            'forecast_qty' => '3',
            'amount' => 1800000,
        ]);
    }

    public function test_can_delete_forecast_budget_entry(): void
    {
        $user = $this->createAdminUser();

        $item = MonthlyBudgetForecast::create([
            'year' => 2026,
            'tab' => 'TOOLS',
            'code_unit' => 'TOOLS',
            'uraian' => 'Item Mau Dihapus',
            'forecast_qty' => '1',
            'unit_rate' => 100000,
            'amount' => 100000,
        ]);

        $response = $this->actingAs($user)->delete(route('forecast-budget-monthly.destroy', $item->id));

        $response->assertRedirect();

        $this->assertDatabaseMissing('monthly_budget_forecasts', [
            'id' => $item->id,
        ]);
    }
}
