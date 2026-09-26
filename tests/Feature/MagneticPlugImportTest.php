<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class MagneticPlugImportTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(['name' => 'super-admin']);
        $user->assignRole($role);

        return $user;
    }

    public function test_can_download_template(): void
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)->get(route('repair.magnetic-plug.download-template'));

        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'attachment; filename="template_magnetic_plug.xlsx"');
    }

    public function test_can_import_excel_file_safely(): void
    {
        $user = $this->createAdminUser();

        $unit = Unit::create([
            'code_unit' => 'EX999',
            'model' => 'PC200-8',
            'type_unit' => 'EXCAVATOR',
            'hm' => 5000,
        ]);

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $headers = ['Code Unit', 'HM', 'Date', 'Metode', 'Component', 'Picture', 'RATING', 'Remarks'];
        $sheet->fromArray([$headers], null, 'A1');
        $sheet->fromArray([
            ['EX999', 5100, '2026-09-25', 'MAGNETIC PLUG', 'FINAL DRIVE', '', 'A', 'Normal test'],
        ], null, 'A2');

        $tempFile = tempnam(sys_get_temp_dir(), 'test_mag_').'.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);

        $uploadedFile = new UploadedFile(
            $tempFile,
            'test_mag.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->actingAs($user)->post(route('repair.magnetic-plug.import'), [
            'file' => $uploadedFile,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('magnetic_plugs', [
            'unit_id' => $unit->id,
            'hm' => 5100,
            'component' => 'FINAL DRIVE',
            'rating' => 'Rating A',
        ]);

        @unlink($tempFile);
    }
}
