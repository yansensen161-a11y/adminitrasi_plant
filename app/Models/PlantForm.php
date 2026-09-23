<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PlantForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_type',
        'form_number',
        'project_id',
        'unit_id',
        'date',
        'shift',
        'smu',
        'service_type',
        'oil_samples',
        'items',
        'results_data',
        'notes',
        'mechanic_name',
        'supervisor_name',
        'status',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'smu' => 'float',
        'oil_samples' => 'array',
        'items' => 'array',
        'results_data' => 'array',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Generate safe atomic form number.
     */
    public static function generateFormNumber(string $formType = 'PM-773E'): string
    {
        $prefix = "PLT/FRM/{$formType}/";

        return DB::transaction(function () use ($prefix) {
            $query = self::where('form_number', 'like', $prefix.'%');

            if (DB::getDriverName() === 'sqlite') {
                $last = $query
                    ->lockForUpdate()
                    ->get()
                    ->sortByDesc(function ($item) {
                        $parts = explode('/', $item->form_number);

                        return (int) end($parts);
                    })
                    ->first();
            } else {
                $last = $query
                    ->lockForUpdate()
                    ->orderByRaw('CAST(SUBSTRING_INDEX(form_number, "/", -1) AS UNSIGNED) DESC')
                    ->first();
            }

            if (! $last) {
                return $prefix.'001';
            }

            $parts = explode('/', $last->form_number);
            $lastNum = (int) end($parts);

            return $prefix.str_pad($lastNum + 1, 3, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Generate safe atomic document number for Request Asset Disposed (DISPOSE/PLT/YYYY/XX).
     */
    public static function generateAssetDisposedNumber(): string
    {
        $year = date('Y');
        $prefix = "DISPOSE/PLT/{$year}/";

        return DB::transaction(function () use ($prefix) {
            $query = self::where('form_number', 'like', $prefix.'%');

            if (DB::getDriverName() === 'sqlite') {
                $last = $query
                    ->lockForUpdate()
                    ->get()
                    ->sortByDesc(function ($item) {
                        $parts = explode('/', $item->form_number);

                        return (int) end($parts);
                    })
                    ->first();
            } else {
                $last = $query
                    ->lockForUpdate()
                    ->orderByRaw('CAST(SUBSTRING_INDEX(form_number, "/", -1) AS UNSIGNED) DESC')
                    ->first();
            }

            if (! $last) {
                return $prefix.'01';
            }

            $parts = explode('/', $last->form_number);
            $lastNum = (int) end($parts);

            return $prefix.str_pad($lastNum + 1, 2, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Generate safe atomic document number for Surat Permintaan Komponen / Internal Memorandum.
     */
    public static function generateMemoKomponenNumber(): string
    {
        $year = date('Y');
        $prefix = "MEMO/PLT/{$year}/";

        return DB::transaction(function () use ($prefix) {
            $query = self::where('form_number', 'like', $prefix.'%');

            if (DB::getDriverName() === 'sqlite') {
                $last = $query
                    ->lockForUpdate()
                    ->get()
                    ->sortByDesc(function ($item) {
                        $parts = explode('/', $item->form_number);

                        return (int) end($parts);
                    })
                    ->first();
            } else {
                $last = $query
                    ->lockForUpdate()
                    ->orderByRaw('CAST(SUBSTRING_INDEX(form_number, "/", -1) AS UNSIGNED) DESC')
                    ->first();
            }

            if (! $last) {
                return $prefix.'001';
            }

            $parts = explode('/', $last->form_number);
            $lastNum = (int) end($parts);

            return $prefix.str_pad($lastNum + 1, 3, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Get default checklist template for Off Highway Truck 773E PM Service Sheet.
     */
    public static function getDefaultChecklistItems(): array
    {
        return [
            // ─── 1. ENGINE SYSTEM ───
            [
                'id' => 1,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Ambil data tattletale',
                'desc_en' => 'Down load Tattletale',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'special_type' => 'logged_event',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 2,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Test RPM pada Torque converter stall',
                'desc_en' => 'Test RPM at Torque converter stall',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'special_type' => 'result_rpm',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 3,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Menggoyang Machine dan periksa kelonggaran linkage, pin & bearing',
                'desc_en' => 'Shake Machine & Inspect linkage, pin & bearing for loose',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 4,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Periksa seluruh kebocoran pada saat repair atau back log',
                'desc_en' => 'Inspect All Leaking Condition for Repair or back log',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 5,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Ambil sampel dari oli engine',
                'desc_en' => 'Obtain engine oil sample',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 6,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Ganti oli engine dan filter-filter untuk oli engine',
                'desc_en' => 'Change engine oil and filters',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 7,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Periksa level oli untuk engine',
                'desc_en' => 'Check engine oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 8,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Periksa/ Kencangkan alternator/ fan belts dan ganti jika diperlukan',
                'desc_en' => 'Inspect/ Adjust alternator / fan belts & Replace if required',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 9,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Cek kelonggaran seluruh bearing pada fan drive dan pulley pengencang',
                'desc_en' => 'Check fan drive and belt tightener pulley bearings for loose',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 10,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Bersihkan breather untuk engine crankcase dan ganti jika diperlukan',
                'desc_en' => 'Clean engine crankcase breather & Replace if required',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 11,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Buang endapan air dalam fuel tank',
                'desc_en' => 'Drain water sadimen in the fuel tank',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 12,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Ganti elemen water separator untuk sistem bahan bakar',
                'desc_en' => 'Replace fuel system water separator element',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 13,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Ganti secondary filter untuk fuel system',
                'desc_en' => 'Replace fuel system secondary filter',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 14,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Bersihkan tutup untuk tangki solar dan strainer-nya, ganti jika diperlukan',
                'desc_en' => 'Clean fuel tank cap and strainer, Replace if required',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 15,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Periksa & bersihkan elemen outer pada filter udara / Ganti jika diperlukan',
                'desc_en' => 'Inspect & Clean air filter element outer / Replace if required',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 16,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Periksa & bersihkan elemen inner pada filter udara / Ganti jika diperlukan',
                'desc_en' => 'Inspect & Clean air filter element inner / Replace if required',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 17,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Bersihkan precleaner udara pada engine',
                'desc_en' => 'Clean engine air precleaner',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 18,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Periksa mounts pada engine',
                'desc_en' => 'Inspect engine mounts',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 19,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Periksa dan bersihkan core untuk radiator',
                'desc_en' => 'Inspect & Clean radiator core',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 20,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Memeriksa coolant additive (dengan memakai tool 1U7298)',
                'desc_en' => 'Check coolant additive, (use tool 1U7298)',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 21,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Mengganti coolant dan inhibitor',
                'desc_en' => 'Change coolant & Inhibitor',
                'types' => ['E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 22,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Memeriksa level coolant',
                'desc_en' => 'Check coolant level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 23,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Memeriksa/ Mengencangkan engine valve lash',
                'desc_en' => 'Check / adjust engine valve lash',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 24,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Bersihkan/ Ganti pressure relief valve untuk sistem pendingin',
                'desc_en' => 'Clean/ Replace cooling system pressure relief valve',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 25,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Periksa vibration damper untuk crankshaft',
                'desc_en' => 'Inspect crankshaft vibration damper',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 26,
                'section' => 'ENGINE SYSTEM',
                'desc_id' => 'Potong dan periksa filter bekas apakah ada serpihan partikel',
                'desc_en' => 'Cut and inspect a used filter for debris',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'special_type' => 'rating_result',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],

            // ─── 2. DIFFERENTIAL & FINAL DRIVE ───
            [
                'id' => 27,
                'section' => 'DIFFERENTIAL & FINAL DRIVE',
                'desc_id' => 'Ambil sampel oli dari differential dan final drive',
                'desc_en' => 'Obtain Differential and Final drives oil sample',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 28,
                'section' => 'DIFFERENTIAL & FINAL DRIVE',
                'desc_id' => 'Periksa dan bersihkan semua plug magnetik untuk differential',
                'desc_en' => 'Inspect & clean all Differentials magnetic plug',
                'types' => ['B', 'C', 'D', 'E'],
                'special_type' => 'rating_rr',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 29,
                'section' => 'DIFFERENTIAL & FINAL DRIVE',
                'desc_id' => 'Ganti oli untuk semua Differential dan Final drive',
                'desc_en' => 'Change all Differentials and Final drive oil',
                'types' => ['C', 'D', 'E'],
                'special_note' => 'DIFFERENTIAL CAPACITIES 120 L',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 30,
                'section' => 'DIFFERENTIAL & FINAL DRIVE',
                'desc_id' => 'Periksa level oli pada differential',
                'desc_en' => 'Inspect all differentials oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 31,
                'section' => 'DIFFERENTIAL & FINAL DRIVE',
                'desc_id' => 'Periksa dan bersihkan semua plug magnetik pada semua Final drive',
                'desc_en' => 'Inspect & clean all Final drives magnetic plug',
                'types' => ['B', 'C', 'D', 'E'],
                'special_type' => 'rating_rrlh_rrrh',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],

            // ─── 3. AXLE & FRONT WHEELS ───
            [
                'id' => 32,
                'section' => 'AXLE & FRONT WHEELS',
                'desc_id' => 'Ganti / bersihkan breather untuk rumah axle',
                'desc_en' => 'Replace / clean axle housing breather',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 33,
                'section' => 'AXLE & FRONT WHEELS',
                'desc_id' => 'Ganti oli semua Final Drive',
                'desc_en' => 'Change all Final drives oil',
                'types' => ['C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 34,
                'section' => 'AXLE & FRONT WHEELS',
                'desc_id' => 'Periksa semua level oli pada Final Drive',
                'desc_en' => 'Inspect all Final drives oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'special_type' => 'rating_frlh_frrh',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 35,
                'section' => 'AXLE & FRONT WHEELS',
                'desc_id' => 'Ambil sampel oli dari roda depan',
                'desc_en' => 'Obtain front wheel oil samples',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 36,
                'section' => 'AXLE & FRONT WHEELS',
                'desc_id' => 'Ganti / bersihkan hub breather untuk semua roda depan',
                'desc_en' => 'Replace / clean all front wheels hub breather',
                'types' => ['B', 'C', 'D', 'E'],
                'special_note' => 'WHEEL FRONT CAPACITIES 6.8 L',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 37,
                'section' => 'AXLE & FRONT WHEELS',
                'desc_id' => 'Ganti oli untuk roda depan',
                'desc_en' => 'Change all wheels oil',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 38,
                'section' => 'AXLE & FRONT WHEELS',
                'desc_id' => 'Periksa level oli pada roda depan',
                'desc_en' => 'Check front wheels oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 39,
                'section' => 'AXLE & FRONT WHEELS',
                'desc_id' => 'Ambil sampel oli dari torque converter dan transmission',
                'desc_en' => 'Obtain torque converter and transmission oil samples',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],

            // ─── 4. TRANSMISSION & TORQUE CONVERTER ───
            [
                'id' => 40,
                'section' => 'TRANSMISSION & TORQUE CONVERTER',
                'desc_id' => 'Periksa dan Bersihkan screen untuk transmission',
                'desc_en' => 'Inspect & Clean transmission screen',
                'types' => ['C', 'D', 'E'],
                'special_type' => 'rating_result',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 41,
                'section' => 'TRANSMISSION & TORQUE CONVERTER',
                'desc_id' => 'Periksa dan bersihkan screen (torque converter)',
                'desc_en' => 'Inspect & clean torque converter screen',
                'types' => ['C', 'D', 'E'],
                'special_type' => 'rating_result',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 42,
                'section' => 'TRANSMISSION & TORQUE CONVERTER',
                'desc_id' => 'Ganti / bersihkan breather pada torque converter / transmission',
                'desc_en' => 'Replace / clean torque converter / transmission breather',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 43,
                'section' => 'TRANSMISSION & TORQUE CONVERTER',
                'desc_id' => 'Ganti oli dan filter untuk system Torque converter / transmission',
                'desc_en' => 'Change torque converter / transmission oil and filter',
                'types' => ['C', 'D', 'E'],
                'special_note' => 'Transmission & TC 106 L',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 44,
                'section' => 'TRANSMISSION & TORQUE CONVERTER',
                'desc_id' => 'Periksa level oli pada torque converter dan transmission',
                'desc_en' => 'Check torque converter and transmission oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 45,
                'section' => 'TRANSMISSION & TORQUE CONVERTER',
                'desc_id' => 'Periksa bearing cross joint dan shaft',
                'desc_en' => 'Inspect all spider (cross joint) bearing and shaft',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 46,
                'section' => 'TRANSMISSION & TORQUE CONVERTER',
                'desc_id' => 'Periksa Clearance pada pin thrust untuk differential',
                'desc_en' => 'Check differential thrust pin clearance',
                'types' => ['D', 'E'],
                'special_type' => 'rating_result',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 47,
                'section' => 'TRANSMISSION & TORQUE CONVERTER',
                'desc_id' => 'Potong Periksa filter bekas dari Trans & TC apakah ada serpihan partikel',
                'desc_en' => 'Cut and inspect a used filter for debris Trans & TC',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'special_type' => 'rating_result',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],

            // ─── 5. BRAKE, HOIST & HYDRAULIC SYSTEM ───
            [
                'id' => 48,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Tes brake sistem engagement ( engine speed 1200 rpm )',
                'desc_en' => 'Test brake system engagement ( engine speed 1200 rpm )',
                'types' => ['B', 'C', 'D', 'E'],
                'special_type' => 'result_rpm',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 49,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Check cycle time steering ( 5-6 sec )',
                'desc_en' => 'Check steering cycle time ( 5-6 sec )',
                'types' => ['B', 'C', 'D', 'E'],
                'special_type' => 'result_sec',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 50,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Tes steering secondary',
                'desc_en' => 'Test secondary steering',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 51,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Check cycle time hoist ( 15 sec )',
                'desc_en' => 'Check hoist cycle time ( 15 sec )',
                'types' => ['B', 'C', 'D', 'E'],
                'special_type' => 'result_sec',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 52,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Ambil sampel oli pada hydraulic / hoist system',
                'desc_en' => 'Obtain hydraulic / hoist system oil sample',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 53,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Periksa dan Bersihkan screen untuk hydraulic / hoist system',
                'desc_en' => 'Inspect & Clean hydraulic / hoist system screen',
                'types' => ['C', 'D', 'E'],
                'special_type' => 'rating_result',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 54,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Ganti / bersihkan hydraulic / hoist oil tank breather',
                'desc_en' => 'Replace / clean hydraulic / hoist oil tank breather',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 55,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Ganti / bersihkan breather pada silinder udara / hydraulic',
                'desc_en' => 'Replace / clean air / hydraulic cylinder breather',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 56,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Ganti filter oli pada park brake release',
                'desc_en' => 'Replace park brake release oil filter',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 57,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Ganti oil untuk sistem hydraulic dan bersihkan strainer',
                'desc_en' => 'Change hydraulic system oil & clean strainer',
                'types' => ['D', 'E'],
                'special_note' => 'HYDRAULIC AND BRAKE CAPACITIES 121 L',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 58,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Periksa level oli pada tangki hoist and brake',
                'desc_en' => 'Check hoist and brake tank oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 59,
                'section' => 'BRAKE, HOIST & HYDRAULIC SYSTEM',
                'desc_id' => 'Ambil sampel oli dari sistem steering',
                'desc_en' => 'Obtain steering system oil sample',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],

            // ─── 6. STEERING SYSTEM ───
            [
                'id' => 60,
                'section' => 'STEERING SYSTEM',
                'desc_id' => 'Ganti filter oli pada steering',
                'desc_en' => 'Replace steering system oil filter',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 61,
                'section' => 'STEERING SYSTEM',
                'desc_id' => 'Ganti oli untuk sistem steering',
                'desc_en' => 'Replace steering system oil',
                'types' => ['C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 62,
                'section' => 'STEERING SYSTEM',
                'desc_id' => 'Periksa level oli pada sistem steering',
                'desc_en' => 'Check steering system oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 63,
                'section' => 'STEERING SYSTEM',
                'desc_id' => 'Periksa pin dan bearing pada steering linkage',
                'desc_en' => 'Inspect steering linkage pin and bearing',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 64,
                'section' => 'STEERING SYSTEM',
                'desc_id' => 'Ganti desiccant untuk pengering udara',
                'desc_en' => 'Replace air dryer desiccant',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 65,
                'section' => 'STEERING SYSTEM',
                'desc_id' => 'Periksa filter bekas apakah ada serpihan partikel',
                'desc_en' => 'Inspect a used filter for debris',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'special_type' => 'rating_result',
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],

            // ─── 7. LUBRICATION / GREASING ───
            [
                'id' => 66,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Melumasi fan drive bearing',
                'desc_en' => 'Lubricate fan drive bearing',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 67,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Periksa dan Tes autolub (bila dilengkapi)',
                'desc_en' => 'Inspect and Test autolube (if equipped)',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 68,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Periksa grease lines dan seluruh nipples',
                'desc_en' => 'Inspect grease lines and nipples',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 69,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Lumasi seluruh bearing pada silinder hoist',
                'desc_en' => 'Grease hoist cylinder bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 70,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Lumasi seluruh suspension bearing & seat',
                'desc_en' => 'Grease all suspensions cylinder bearings & seat',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 71,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Lumasi seluruh bearing pada silinder steering',
                'desc_en' => 'Grease steering cylinder bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 72,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Lumasi seluruh bearing pada body pivot',
                'desc_en' => 'Grease body pivot bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 73,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Lumasi seluruh bearing pada A-Frame axle belakang',
                'desc_en' => 'Grease rear axle A-Frame bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 74,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Lumasi seluruh bearing pada lateral control rod untuk housing axle belakang',
                'desc_en' => 'Grease rear axle housing lateral control rod bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 75,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Lumasi seluruh bearing pada tie rod dan pin untuk steering',
                'desc_en' => 'Grease steering tie rod and pin bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 76,
                'section' => 'LUBRICATION / GREASING',
                'desc_id' => 'Lumasi seluruh slip joint pada drive shaft',
                'desc_en' => 'Grease drive shaft slip joint',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],

            // ─── 8. BATTERY, SAFETY & WALK AROUND ───
            [
                'id' => 77,
                'section' => 'BATTERY, SAFETY & WALK AROUND',
                'desc_id' => 'Periksa level air baterai',
                'desc_en' => 'Check battery electrolyte level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 78,
                'section' => 'BATTERY, SAFETY & WALK AROUND',
                'desc_id' => 'Periksa dan bersihkan terminal batere beserta kablenya',
                'desc_en' => 'Inspect and clean battery terminal, cable & bracket',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 79,
                'section' => 'BATTERY, SAFETY & WALK AROUND',
                'desc_id' => 'Periksa tekanan fire extinguisher',
                'desc_en' => 'Inspect fire extinguisher pressure',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 80,
                'section' => 'BATTERY, SAFETY & WALK AROUND',
                'desc_id' => 'Periksa kondisi dan tekanan ban',
                'desc_en' => 'Inspect tire condition and pressure',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 81,
                'section' => 'BATTERY, SAFETY & WALK AROUND',
                'desc_id' => 'Periksa fire suppression dan hoist nya',
                'desc_en' => 'Inspect fire suppression and the hoist',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 82,
                'section' => 'BATTERY, SAFETY & WALK AROUND',
                'desc_id' => 'Periksa fungsi seat belt',
                'desc_en' => 'Inspect seat belt function',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 83,
                'section' => 'BATTERY, SAFETY & WALK AROUND',
                'desc_id' => 'Periksa fungsi backup alarm',
                'desc_en' => 'Inspect backup alarm function',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 84,
                'section' => 'BATTERY, SAFETY & WALK AROUND',
                'desc_id' => 'Periksa seluruh kondisi alat terhadap hal - hal yang tidak benar',
                'desc_en' => 'Walk around inspection for improper condition',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
        ];
    }

    /**
     * Get default checklist template for Dump Truck PM Service Sheet.
     */
    public static function getDumpTruckChecklistItems(): array
    {
        return [
            // ─── 1. ENGINE ───
            [
                'id' => 1,
                'section' => 'ENGINE',
                'desc_id' => 'Test RPM pada Torque converter stall',
                'desc_en' => 'Test RPM at Torque converter stall',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Result : RPM',
                'sn_inspect' => '',
                'has_rpm_result' => true,
            ],
            [
                'id' => 2,
                'section' => 'ENGINE',
                'desc_id' => 'Menggoyang Machine dan periksa kelonggaran linkage, pin & bearing',
                'desc_en' => 'Shake Machine & Inspect linkage, pin & bearing for loose',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 3,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa seluruh kebocoran pada saat repair atau back log',
                'desc_en' => 'Inspect All Leaking Condition for Repair or back log',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 4,
                'section' => 'ENGINE',
                'desc_id' => 'Ambil sampel dari oli engine',
                'desc_en' => 'Obtain engine oil sample',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 5,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti oli engine dan filter-filter untuk oli engine',
                'desc_en' => 'Change engine oil and filters',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'ENGINE CAPACITIES 76 L',
                'sn_inspect' => '',
            ],
            [
                'id' => 6,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa level oli untuk engine',
                'desc_en' => 'Check engine oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 7,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa/ Kencangkan alternator/ fan belts dan ganti jika diperlukan',
                'desc_en' => 'Inspect/ Adjust alternator / fan belts & Replace if required',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 8,
                'section' => 'ENGINE',
                'desc_id' => 'Cek kelonggaran seluruh bearing pada fan drive dan pulley pengencang',
                'desc_en' => 'Check fan drive and belt tightener pulley bearings for loose',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 9,
                'section' => 'ENGINE',
                'desc_id' => 'Bersihkan breather untuk engine crankcase dan ganti jika diperlukan',
                'desc_en' => 'Clean engine crankcase breather & Replace if required',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 10,
                'section' => 'ENGINE',
                'desc_id' => 'Buang endapan air dalam fuel tank',
                'desc_en' => 'Drain water sadimen in the fuel tank',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 11,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti elemen water separator untuk sistem bahan bakar',
                'desc_en' => 'Replace fuel system water separator element',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 12,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti secondary filter untuk fuel system',
                'desc_en' => 'Replace fuel system secondary filter',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 13,
                'section' => 'ENGINE',
                'desc_id' => 'Bersihkan tutup untuk tangki solar dan strainer-nya, ganti jika diperlukan',
                'desc_en' => 'Clean fuel tank cap and strainer, Replace if required',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 14,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa & bersihkan elemen outer pada filter udara / Ganti jika diperlukan',
                'desc_en' => 'Inspect & Clean air filter element outer / Replace if required',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 15,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa & bersihkan elemen inner pada filter udara / Ganti jika diperlukan',
                'desc_en' => 'Inspect & Clean air filter element inner / Replace if required',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 16,
                'section' => 'ENGINE',
                'desc_id' => 'Bersihkan precleaner udara pada engine',
                'desc_en' => 'Clean engine air precleaner',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 17,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa mounts pada engine',
                'desc_en' => 'Inspect engine mounts',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 18,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa dan bersihkan core untuk radiator',
                'desc_en' => 'Inspect & Clean radiator core',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 19,
                'section' => 'ENGINE',
                'desc_id' => 'Mengganti coolant dan inhibitor',
                'desc_en' => 'Change coolant & Inhibitor',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 20,
                'section' => 'ENGINE',
                'desc_id' => 'Memeriksa level coolant',
                'desc_en' => 'Check coolant level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 21,
                'section' => 'ENGINE',
                'desc_id' => 'Memeriksa/ Mengencangkan engine valve lash',
                'desc_en' => 'Check / adjust engine valve lash',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 22,
                'section' => 'ENGINE',
                'desc_id' => 'Bersihkan/ Ganti pressure relief valve untuk sistem pendingin',
                'desc_en' => 'Clean/ Replace cooling system pressure relief valve',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 23,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa vibration damper untuk crankshaft',
                'desc_en' => 'Inspect crankshaft vibration damper',
                'types' => ['E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 24,
                'section' => 'ENGINE',
                'desc_id' => 'Potong dan periksa filter bekas apakah ada serpihan partikel',
                'desc_en' => 'Cut and inspect a used filter for debris',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Rating Result :',
                'sn_inspect' => '',
                'has_rating_result' => true,
            ],

            // ─── 2. TRANSMISSION, DIFFERENTIAL & WHEEL ───
            [
                'id' => 25,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Ambil sampel oli dari differential dan final drive',
                'desc_en' => 'Obtain Differential and Final drives oil sample',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 26,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Periksa dan bersihkan semua plug magnetik untuk differential',
                'desc_en' => 'Inspect & clean all Differentials magnetic plug',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Rating Result : RR',
                'sn_inspect' => '',
                'has_rr_rating' => true,
            ],
            [
                'id' => 27,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Ganti oli untuk semua Differential dan Final drive',
                'desc_en' => 'Change all Differentials and Final drive oil',
                'types' => ['C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'DIFFERENTIAL CAPACITIES 120 L',
                'sn_inspect' => '',
            ],
            [
                'id' => 28,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Periksa level oli pada differential',
                'desc_en' => 'Inspect all differentials oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 29,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Periksa dan bersihkan semua plug magnetik pada semua Final drive',
                'desc_en' => 'Inspect & clean all Final drives magnetic plug',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Rating Result : RRLH / RRRH',
                'sn_inspect' => '',
                'has_rrlh_rrrh_rating' => true,
            ],
            [
                'id' => 30,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Ganti / bersihkan breather untuk rumah axle',
                'desc_en' => 'Replace / clean axle housing breather',
                'types' => ['C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 31,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Ganti oli semua Final Drive',
                'desc_en' => 'Change all Final drives oil',
                'types' => ['C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 32,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Periksa semua level oli pada Final Drive',
                'desc_en' => 'Inspect all Final drives oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Rating Result : FRLH / FRRH',
                'sn_inspect' => '',
                'has_frlh_frrh_rating' => true,
            ],
            [
                'id' => 33,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Ambil sampel oli dari roda depan',
                'desc_en' => 'Obtain Final Drive oil samples',
                'types' => ['C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 34,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Periksa level oli pada roda depan',
                'desc_en' => 'Check front wheels oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 35,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Ambil sampel oli dari torque converter dan transmission',
                'desc_en' => 'Obtain torque converter and transmission oil samples',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 36,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Periksa dan Bersihkan screen untuk transmission',
                'desc_en' => 'Inspect & Clean transmission screen',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Rating Result :',
                'sn_inspect' => '',
                'has_rating_result' => true,
            ],
            [
                'id' => 37,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Ganti / bersihkan breather pada torque converter / transmission',
                'desc_en' => 'Replace / clean torque converter / transmission breather',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 38,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Ganti oli dan filter untuk system Torque converter / transmission',
                'desc_en' => 'Change torque converter / transmission oil and filter',
                'types' => ['C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Transmission & TC 106 L',
                'sn_inspect' => '',
            ],
            [
                'id' => 39,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Periksa level oli pada transmission',
                'desc_en' => 'Check transmission oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 40,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Periksa bearing cross joint dan shaft',
                'desc_en' => 'Inspect all spider (cross joint) bearing and shaft',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 41,
                'section' => 'TRANSMISSION, DIFFERENTIAL & WHEEL',
                'desc_id' => 'Potong Periksa filter bekas dari Trans & TC apakah ada serpihan partikel',
                'desc_en' => 'Cut and inspect a used filter for debris Trans & TC',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Rating Result :',
                'sn_inspect' => '',
                'has_rating_result' => true,
            ],

            // ─── 3. HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM ───
            [
                'id' => 42,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Tes brake sistem engagement',
                'desc_en' => 'Test brake system engagement',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Result : RPM',
                'sn_inspect' => '',
                'has_rpm_result' => true,
            ],
            [
                'id' => 43,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Check cycle time steering ( 5-6 sec )',
                'desc_en' => 'Check steering cycle time ( 5-6 sec )',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Result : SEC',
                'sn_inspect' => '',
                'has_sec_result' => true,
            ],
            [
                'id' => 44,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Tes steering secondary',
                'desc_en' => 'Test secondary steering',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 45,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Check cycle time hoist ( 15 sec )',
                'desc_en' => 'Check hoist cycle time ( 15 sec )',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Result : SEC',
                'sn_inspect' => '',
                'has_sec_result' => true,
            ],
            [
                'id' => 46,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Ambil sampel oli pada hydraulic / hoist system',
                'desc_en' => 'Obtain hydraulic / hoist system oil sample',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 47,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Periksa dan Bersihkan screen untuk hydraulic / hoist system',
                'desc_en' => 'Inspect & Clean hydraulic / hoist system screen',
                'types' => ['C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Rating Result :',
                'sn_inspect' => '',
                'has_rating_result' => true,
            ],
            [
                'id' => 48,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Ganti / bersihkan hydraulic / hoist oil tank breather',
                'desc_en' => 'Replace / clean hydraulic / hoist oil tank breather',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 49,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Ganti / bersihkan breather pada silinder udara / hydraulic',
                'desc_en' => 'Replace / clean air / hydraulic cylinder breather',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 50,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Ganti filter oli pada park brake release',
                'desc_en' => 'Replace park brake release oil filter',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 51,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Ganti oil untuk sistem hydraulic dan bersihkan strainer',
                'desc_en' => 'Change hydraulic system oil & clean strainer',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => 'HYDRAULIC AND BRAKE CAPACITIES 121 L',
                'sn_inspect' => '',
            ],
            [
                'id' => 52,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Periksa level oli pada tangki hoist and brake',
                'desc_en' => 'Check hoist and brake tank oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 53,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Ganti filter oli pada steering',
                'desc_en' => 'Replace steering system oil filter',
                'types' => ['B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 54,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Ganti oli untuk sistem steering',
                'desc_en' => 'Replace steering system oil',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => 'STEERING SYSTEM CAPACITIES 38 L',
                'sn_inspect' => '',
            ],
            [
                'id' => 55,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Periksa level oli pada sistem steering',
                'desc_en' => 'Check steering system oil level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 56,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Periksa pin dan bearing pada steering linkage',
                'desc_en' => 'Inspect steering linkage pin and bearing',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 57,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Ganti desiccant untuk pengering udara',
                'desc_en' => 'Replace air dryer desiccant',
                'types' => ['D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 58,
                'section' => 'HYDRAULIC SYSTEM, STEERING & BRAKING SYSTEM',
                'desc_id' => 'Periksa filter bekas apakah ada serpihan partikel',
                'desc_en' => 'Inspect a used filter for debris',
                'types' => ['C', 'D', 'E'],
                'check_point' => '',
                'remarks' => 'Rating Result :',
                'sn_inspect' => '',
                'has_rating_result' => true,
            ],

            // ─── 4. LUBRICATION (GREASING) ───
            [
                'id' => 59,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Melumasi fan drive bearing',
                'desc_en' => 'Lubricate fan drive bearing',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 60,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Periksa dan Tes autolub (bila dilengkapi)',
                'desc_en' => 'Inspect and Test autolube (if equiped)',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 61,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Periksa grease lines dan seluruh nipples',
                'desc_en' => 'Inspect grease lines and nipples',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 62,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Lumasi seluruh bearing pada silinder hoist',
                'desc_en' => 'Grease hoist cylinder bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 63,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Lumasi seluruh suspension bearing & seat',
                'desc_en' => 'Grease all suspensions cylinder bearings & seat',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 64,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Lumasi seluruh bearing pada silinder steering',
                'desc_en' => 'Grease steering cylinder bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 65,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Lumasi seluruh bearing pada body pivot',
                'desc_en' => 'Grease body pivot bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 66,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Lumasi seluruh bearing pada A-Frame axle belakang',
                'desc_en' => 'Grease rear axle A-Frame bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 67,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Lumasi seluruh bearing pada lateral control rod untuk housing axle belakang',
                'desc_en' => 'Grease rear axle housing lateral control rod bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 68,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Lumasi seluruh bearing pada tie rod dan pin untuk steering',
                'desc_en' => 'Grease steering tie rod and pin bearings',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 69,
                'section' => 'LUBRICATION (GREASING)',
                'desc_id' => 'Lumasi seluruh slip joint pada drive shaft',
                'desc_en' => 'Grease drive shaft slip joint',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],

            // ─── 5. MISCELLANEOUS ───
            [
                'id' => 70,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa level air baterai',
                'desc_en' => 'Check battery electrolyte level',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 71,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa dan bersihkan terminal batere beserta kablenya.',
                'desc_en' => 'Inspect and clean battery terminal, cable & bracket',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 72,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa tekanan fire extinguiser',
                'desc_en' => 'Inspect fire extinguisher pressure',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 73,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa kondisi dan tekanan ban',
                'desc_en' => 'Inspect tire condition and pressure',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 74,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa fire suppression dan hoist nya',
                'desc_en' => 'Inspect fire suppression and the hoist',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 75,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa fungsi seat belt',
                'desc_en' => 'Inspect seat belt function',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 76,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa fungsi backup alarm',
                'desc_en' => 'Inspect backup alarm function',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 77,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa seluruh kondisi alat terhadap hal - hal yang tidak benar',
                'desc_en' => 'Walk around inspection for improper condition',
                'types' => ['A', 'B', 'C', 'D', 'E'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
        ];
    }

    /**
     * Get default checklist template for Generator Set PM Service Sheet.
     */
    public static function getGensetChecklistItems(): array
    {
        return [
            // ─── 1. ENGINE (Page 1) ───
            [
                'id' => 1,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa Level Oli Pada Engine',
                'desc_en' => 'Check Engine Oil Level',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 2,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti Oli Engine',
                'desc_en' => 'Change Engine Oil',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 3,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti Filter Untuk Oli Engine',
                'desc_en' => 'Change Engine Oil Filter',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 4,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti Filter Bahan Bakar Yang Primary & Sekondary',
                'desc_en' => 'Replace Primary & Secondary Fuel Filter',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 5,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa & Bersihkan Filter Udara Untuk Engine',
                'desc_en' => 'Check & Clean Engine Air Filter',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 6,
                'section' => 'ENGINE',
                'desc_id' => 'Bersihkan breather untuk engine crankcase dan ganti jika diperlukan',
                'desc_en' => 'Clean engine crankcase breather & Replace if required',
                'types' => ['B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 7,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti Filter Udara primary pada Engine',
                'desc_en' => 'Replace Engine Air Filter Primary',
                'types' => ['D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 8,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti Filter Udara secondary pada Engine jika dilengkapi',
                'desc_en' => 'Replace Engine Air Filter Secondary if equiped',
                'types' => ['D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 9,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti elemen water separator untuk sistem bahan bakar',
                'desc_en' => 'Replace fuel system water separator element',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 10,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa level bahan bakar pada day tank',
                'desc_en' => 'Check fuel level in day tank',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 11,
                'section' => 'ENGINE',
                'desc_id' => 'Buang endapan air dalam fuel tank',
                'desc_en' => 'Drain water fuel tank',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 12,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa Level Cairan Pendingin',
                'desc_en' => 'Check Coolant Level',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 13,
                'section' => 'ENGINE',
                'desc_id' => 'Ganti Coolant (Cairan Pendingin)',
                'desc_en' => 'Change Coolant',
                'types' => ['D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 14,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa mounts pada engine',
                'desc_en' => 'Inspect engine mounts',
                'types' => ['B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 15,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa / Kencangkan Valve Lash Dan Valve Rotator Untuk Engine',
                'desc_en' => 'Check / Adjust Engine Valve Lash & Valve Rotator',
                'types' => ['D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 16,
                'section' => 'ENGINE',
                'desc_id' => 'Bersihkan tutup untuk radiator, ganti jika diperlukan',
                'desc_en' => 'Clean radiator cap, Replace if required',
                'types' => ['B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 17,
                'section' => 'ENGINE',
                'desc_id' => 'Bersihkan Core Radiator',
                'desc_en' => 'Clean Radiator Core',
                'types' => ['B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 18,
                'section' => 'ENGINE',
                'desc_id' => 'Periksa/ atur / ganti alternator dan fan belts',
                'desc_en' => 'Check/ Adjust /Replace Alternator and fan belts',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],

            // ─── 2. MISCELLANEOUS (Page 2) ───
            [
                'id' => 19,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa/ Tes Indikator & Gauge',
                'desc_en' => 'Check / Test Indicator & Gauge',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 20,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa Level Air Baterai & Terminal Baterai',
                'desc_en' => 'Check Battery Level & Terminal',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 21,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Lubrikasi bearing pada generator',
                'desc_en' => 'Lubricate generator bearing',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 22,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Lubrikasi fan drive bearing',
                'desc_en' => 'Lubricate fan drive bearing',
                'types' => ['C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 23,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa fungsi shutoff controls',
                'desc_en' => 'Check shutoff controls function',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 24,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa Air Batere (Gunakan Tool 1U7298)',
                'desc_en' => 'Check Consentrate Battery Electrolite (Use Tool 1U7298)',
                'types' => ['B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 25,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa/ganti hoses dan clamps',
                'desc_en' => 'Check/Replace hoses and clamps',
                'types' => ['B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 26,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa Adanya Kebocoran fuel dan Oli',
                'desc_en' => 'Check Oil and fuel for Leakage',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
            [
                'id' => 27,
                'section' => 'MISCELLANEOUS',
                'desc_id' => 'Periksa Sekelliling Alat',
                'desc_en' => 'Walk Around Inspection',
                'types' => ['A', 'B', 'C', 'D'],
                'check_point' => '',
                'remarks' => '',
                'sn_inspect' => '',
            ],
        ];
    }

    /**
     * Get default checklist template for Washing Unit Tambang Check Sheet.
     */
    public static function getWashingChecklistItems(): array
    {
        return [
            // ─── A. PEMERIKSAAN SEBELUM WASHING ───
            [
                'id' => 1,
                'section' => 'A. PEMERIKSAAN SEBELUM WASHING',
                'item_no' => 1,
                'task' => 'Unit parkir di area washing yang ditentukan',
                'status' => '', // 'YA', 'TIDAK', 'NA'
                'keterangan' => '',
            ],
            [
                'id' => 2,
                'section' => 'A. PEMERIKSAAN SEBELUM WASHING',
                'item_no' => 2,
                'task' => 'Attachment diturunkan, parking brake aktif, unit dimatikan',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 3,
                'section' => 'A. PEMERIKSAAN SEBELUM WASHING',
                'item_no' => 3,
                'task' => 'Wheel chock / pengganjal roda terpasang bila diperlukan',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 4,
                'section' => 'A. PEMERIKSAAN SEBELUM WASHING',
                'item_no' => 4,
                'task' => 'Area aman, tidak ada personel di zona semprot',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 5,
                'section' => 'A. PEMERIKSAAN SEBELUM WASHING',
                'item_no' => 5,
                'task' => 'APD petugas lengkap (helm, sepatu, kacamata, sarung tangan)',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 6,
                'section' => 'A. PEMERIKSAAN SEBELUM WASHING',
                'item_no' => 6,
                'task' => 'Kabel listrik, panel, ECU, sensor, breather dan intake terlindung',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 7,
                'section' => 'A. PEMERIKSAAN SEBELUM WASHING',
                'item_no' => 7,
                'task' => 'Kebocoran oli / fuel / coolant diperiksa sebelum dicuci',
                'status' => '',
                'keterangan' => '',
            ],

            // ─── B. PELAKSANAAN WASHING ───
            [
                'id' => 8,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 1,
                'task' => 'Cabin, kaca, lampu dan handrail dibersihkan dengan aman',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 9,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 2,
                'task' => 'Body, frame, counterweight dan cover dibersihkan',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 10,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 3,
                'task' => 'Undercarriage / track / tyre dan wheel area dibersihkan',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 11,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 4,
                'task' => 'Bucket / blade / attachment dan pin area dibersihkan',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 12,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 5,
                'task' => 'Boom, arm, cylinder dan hose area dibersihkan',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 13,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 6,
                'task' => 'Radiator / oil cooler dibersihkan sesuai prosedur OEM',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 14,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 7,
                'task' => 'Engine compartment dibersihkan tanpa menyemprot konektor listrik',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 15,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 8,
                'task' => 'Area swing, final drive dan differential dibersihkan sesuai tipe unit',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 16,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 9,
                'task' => 'Lumpur / grease berlebih di titik inspeksi dibersihkan',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 17,
                'section' => 'B. PELAKSANAAN WASHING',
                'item_no' => 10,
                'task' => 'Limbah lumpur / oli ditangani sesuai prosedur lingkungan',
                'status' => '',
                'keterangan' => '',
            ],

            // ─── C. INSPEKSI SETELAH WASHING ───
            [
                'id' => 18,
                'section' => 'C. INSPEKSI SETELAH WASHING',
                'item_no' => 1,
                'task' => 'Tidak ada kebocoran oli, fuel, coolant atau hydraulic yang terlihat',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 19,
                'section' => 'C. INSPEKSI SETELAH WASHING',
                'item_no' => 2,
                'task' => 'Tidak ada hose / pipe / fitting yang rusak atau longgar',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 20,
                'section' => 'C. INSPEKSI SETELAH WASHING',
                'item_no' => 3,
                'task' => 'Tidak ada crack / kerusakan struktur yang terlihat',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 21,
                'section' => 'C. INSPEKSI SETELAH WASHING',
                'item_no' => 4,
                'task' => 'Tidak ada baut, pin, guard atau cover yang hilang / longgar',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 22,
                'section' => 'C. INSPEKSI SETELAH WASHING',
                'item_no' => 5,
                'task' => 'Lampu, kaca, mirror dan handrail dalam kondisi baik',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 23,
                'section' => 'C. INSPEKSI SETELAH WASHING',
                'item_no' => 6,
                'task' => 'Tidak ada air masuk ke intake, panel listrik atau konektor',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 24,
                'section' => 'C. INSPEKSI SETELAH WASHING',
                'item_no' => 7,
                'task' => 'Area kerja bersih, alat washing dikembalikan',
                'status' => '',
                'keterangan' => '',
            ],
            [
                'id' => 25,
                'section' => 'C. INSPEKSI SETELAH WASHING',
                'item_no' => 8,
                'task' => 'Unit siap diserahkan untuk inspeksi / service berikutnya',
                'status' => '',
                'keterangan' => '',
            ],
        ];
    }

    /**
     * Get default reasons for Service Postponement (Form Penundaan Service).
     */
    public static function getPenundaanAlasanOptions(): array
    {
        return [
            'Unit masih dibutuhkan untuk produksi',
            'Spare part belum tersedia',
            'Mekanik belum tersedia',
            'Service bay belum tersedia',
            'Unit sulit dijangkau',
            'Kondisi cuaca',
            'Menunggu persetujuan Operations',
            'Lainnya',
        ];
    }

    /**
     * Get default approval structure for Form Penundaan Service.
     */
    public static function getDefaultPenundaanApprovals(): array
    {
        return [
            [
                'jabatan' => 'Operations Supervisor / Superintendent',
                'nama' => '',
                'tanggal' => '',
                'tanda_tangan' => '',
                'keputusan' => '',
            ],
            [
                'jabatan' => 'Maintenance Planner',
                'nama' => '',
                'tanggal' => '',
                'tanda_tangan' => '',
                'keputusan' => '',
            ],
            [
                'jabatan' => 'Maintenance Supervisor',
                'nama' => '',
                'tanggal' => '',
                'tanda_tangan' => '',
                'keputusan' => '',
            ],
            [
                'jabatan' => 'Maintenance Superintendent',
                'nama' => '',
                'tanggal' => '',
                'tanda_tangan' => '',
                'keputusan' => '',
            ],
        ];
    }

    /**
     * Get default checklist items for Bucket Inspection & Monitoring Form.
     */
    public static function getBucketInspectionChecklistItems(): array
    {
        return [
            // ─── G E T (Ground Engaging Tools) ───
            [
                'id' => 1,
                'section' => 'GET',
                'sub_section' => null,
                'description' => 'BUCKET TOOTH',
                'std' => 'Standar Pabrik',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 2,
                'section' => 'GET',
                'sub_section' => null,
                'description' => 'LOCK, BUCKET TOOTH',
                'std' => 'Terpasang & Kencang',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 3,
                'section' => 'GET',
                'sub_section' => null,
                'description' => 'TOOTH ADAPTER',
                'std' => 'Tidak Retak / Aus Berlebih',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 4,
                'section' => 'GET',
                'sub_section' => null,
                'description' => 'TOPLOK / CUTTING EDGE SEGMENT',
                'std' => 'Toleransi Aus < 60%',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 5,
                'section' => 'GET',
                'sub_section' => null,
                'description' => 'BASE EDGE',
                'std' => 'Bebas Retak & Deformasi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 6,
                'section' => 'GET',
                'sub_section' => null,
                'description' => 'WING SHROUD',
                'std' => 'Terpasang Kuat',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 7,
                'section' => 'GET',
                'sub_section' => null,
                'description' => 'HEEL SHROUD',
                'std' => 'Toleransi Aus Normal',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],

            // ─── BODY ───
            // A. Bucket Skin
            [
                'id' => 8,
                'section' => 'BODY',
                'sub_section' => 'A. Bucket Skin',
                'description' => 'INNER WEAR PLATES',
                'std' => 'Ketebalan Normal',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 9,
                'section' => 'BODY',
                'sub_section' => 'A. Bucket Skin',
                'description' => 'BUCKET SKIN',
                'std' => 'Bebas Bocor / Lubang',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 10,
                'section' => 'BODY',
                'sub_section' => 'A. Bucket Skin',
                'description' => 'OUTER WEAR PLATES',
                'std' => 'Aus Merata',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],

            // B. Right Section
            [
                'id' => 11,
                'section' => 'BODY',
                'sub_section' => 'B. Right Section',
                'description' => 'INNER WEAR PLATES',
                'std' => 'Bebas Retak Lasan',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 12,
                'section' => 'BODY',
                'sub_section' => 'B. Right Section',
                'description' => 'OUTER WEAR PLATES',
                'std' => 'Aus Normal',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 13,
                'section' => 'BODY',
                'sub_section' => 'B. Right Section',
                'description' => 'SIDE PLATE',
                'std' => 'Lurus & Tidak Melengkung',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 14,
                'section' => 'BODY',
                'sub_section' => 'B. Right Section',
                'description' => 'SIDE CUTTER',
                'std' => 'Baut Pengencang Kuat',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],

            // C. Left Section
            [
                'id' => 15,
                'section' => 'BODY',
                'sub_section' => 'C. Left Section',
                'description' => 'INNER WEAR PLATES',
                'std' => 'Bebas Retak Lasan',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 16,
                'section' => 'BODY',
                'sub_section' => 'C. Left Section',
                'description' => 'OUTER WEAR PLATES',
                'std' => 'Aus Normal',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 17,
                'section' => 'BODY',
                'sub_section' => 'C. Left Section',
                'description' => 'SIDE PLATE',
                'std' => 'Lurus & Tidak Melengkung',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 18,
                'section' => 'BODY',
                'sub_section' => 'C. Left Section',
                'description' => 'SIDE CUTTER',
                'std' => 'Baut Pengencang Kuat',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],

            // ─── BRACKET ───
            // D. Bracket Structure
            [
                'id' => 19,
                'section' => 'BRACKET',
                'sub_section' => 'D. Bracket Structure',
                'description' => 'PLATE, BRACKET MOUNTING',
                'std' => 'Bebas Retak / Patah',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 20,
                'section' => 'BRACKET',
                'sub_section' => 'D. Bracket Structure',
                'description' => 'TOP BOX',
                'std' => 'Struktur Kokoh Bebas Crack',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],

            // E. Bracket
            [
                'id' => 21,
                'section' => 'BRACKET',
                'sub_section' => 'E. Bracket',
                'description' => 'FLANGE & BUSHING LINK BRACKET',
                'std' => 'Clearance Sesuai Toleransi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 22,
                'section' => 'BRACKET',
                'sub_section' => 'E. Bracket',
                'description' => 'FLANGE & BUSHING ARM BRACKET',
                'std' => 'Clearance Sesuai Toleransi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],

            // ─── LINK, PIN, LOCK ───
            // F. Bucket Mounting Pin
            [
                'id' => 23,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'F. Bucket Mounting Pin',
                'description' => 'PIN, BUCKET',
                'std' => 'Tidak Baret / Aus Berlebih',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 24,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'F. Bucket Mounting Pin',
                'description' => 'PIN COVER & SEAL',
                'std' => 'Rapat, Tidak Bocor Grease',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 25,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'F. Bucket Mounting Pin',
                'description' => 'BOLT & WASHER',
                'std' => 'Lengkap & Terkunci Torsi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],

            // G. Bucket Link
            [
                'id' => 26,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'G. Bucket Link',
                'description' => 'FLANGE LINK TO BUCKET CYLINDER',
                'std' => 'Bebas Retak',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 27,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'G. Bucket Link',
                'description' => 'BUSHING LINK TO BUCKET CYLINDER',
                'std' => 'Clearance Dalam Toleransi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 28,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'G. Bucket Link',
                'description' => 'FLANGE LINK TO BUCKET ROD',
                'std' => 'Bebas Retak',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 29,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'G. Bucket Link',
                'description' => 'BUSHING LINK TO BUCKET ROD',
                'std' => 'Clearance Dalam Toleransi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],

            // H. Bucket Cyl Pin
            [
                'id' => 30,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'H. Bucket Cyl Pin',
                'description' => 'PIN, LINK TO BUCKET CYL',
                'std' => 'Kondisi Halus & Terlumasi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 31,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'H. Bucket Cyl Pin',
                'description' => 'PIN COVER & SEAL',
                'std' => 'Seal Utuh & Elastis',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 32,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'H. Bucket Cyl Pin',
                'description' => 'BOLT & WASHER',
                'std' => 'Lengkap & Terkunci Torsi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],

            // I. Bucket Link Pin
            [
                'id' => 33,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'I. Bucket Link Pin',
                'description' => 'PIN, LINK TO BUCKET',
                'std' => 'Kondisi Halus & Terlumasi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 34,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'I. Bucket Link Pin',
                'description' => 'PIN COVER & SEAL',
                'std' => 'Seal Utuh & Elastis',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
            [
                'id' => 35,
                'section' => 'LINK_PIN_LOCK',
                'sub_section' => 'I. Bucket Link Pin',
                'description' => 'BOLT & WASHER',
                'std' => 'Lengkap & Terkunci Torsi',
                'act' => '',
                'mark' => '',
                'remark' => '',
            ],
        ];
    }

    /**
     * Check Sheet Service (Hauler / Dump Truck / General).
     */
    public static function getCheckSheetServiceItems(): array
    {
        return [
            // Oil Kompartemen
            ['id' => 1, 'section' => 'Oil Kompartemen', 'description' => 'Engine', 'action' => 'Ganti (Replace)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 2, 'section' => 'Oil Kompartemen', 'description' => 'Transmission/Brake Cooling', 'action' => 'Ganti (Replace / LGMG 500 H)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 3, 'section' => 'Oil Kompartemen', 'description' => 'Hydraulic', 'action' => 'Ganti pada PS 2000 / 4000 jam', 'intervals' => ['2000'], 'status' => '', 'name' => ''],
            ['id' => 4, 'section' => 'Oil Kompartemen', 'description' => 'Steering', 'action' => 'Ganti pada PS 1000 jam', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 5, 'section' => 'Oil Kompartemen', 'description' => 'Differential front, central & rear', 'action' => 'Ganti pada PS 1000 / 2000 jam', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 6, 'section' => 'Oil Kompartemen', 'description' => 'Final Drive LH/RH', 'action' => 'Ganti pada PS 2000 jam', 'intervals' => ['2000'], 'status' => '', 'name' => ''],
            ['id' => 7, 'section' => 'Oil Kompartemen', 'description' => 'Front wheel LH/RH', 'action' => 'Ganti pada PS 500 jam', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 8, 'section' => 'Oil Kompartemen', 'description' => 'Engine oil PTO (power transfer output)', 'action' => 'Ganti pada PS 250 jam', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Sample Oil
            ['id' => 9, 'section' => 'Sample Oil', 'description' => 'Engine', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 10, 'section' => 'Sample Oil', 'description' => 'Transmission', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 11, 'section' => 'Sample Oil', 'description' => 'Brake Cooling', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 12, 'section' => 'Sample Oil', 'description' => 'Hydraulic / Steering & Hoist', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 13, 'section' => 'Sample Oil', 'description' => 'Differential', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 14, 'section' => 'Sample Oil', 'description' => 'Final Drive LH/RH', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Filter
            ['id' => 15, 'section' => 'Filter', 'description' => 'Engine oil filter', 'action' => 'Ganti (Replace)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 16, 'section' => 'Filter', 'description' => 'Fuel prefilter', 'action' => 'Ganti (Replace)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 17, 'section' => 'Filter', 'description' => 'Secondary fuel filter', 'action' => 'Ganti (Replace)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 18, 'section' => 'Filter', 'description' => 'Transmission Filter', 'action' => 'Ganti (Replace / khusus LGMG 500 Hours)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 19, 'section' => 'Filter', 'description' => 'Hydraulic filter', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 20, 'section' => 'Filter', 'description' => 'Steering Filter', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 21, 'section' => 'Filter', 'description' => 'Air Dryer', 'action' => 'Ganti (Replace)', 'intervals' => ['2000'], 'status' => '', 'name' => ''],

            // Saringan Pernapasan (Breather)
            ['id' => 22, 'section' => 'Saringan Pernapasan', 'description' => 'Engine', 'action' => 'Bersihkan (cleaned)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 23, 'section' => 'Saringan Pernapasan', 'description' => 'Differential - Final Drive RH & LH', 'action' => 'Bersihkan (cleaned)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 24, 'section' => 'Saringan Pernapasan', 'description' => 'Hydraulic / Steering & Hoist', 'action' => 'Bersihkan (cleaned)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 25, 'section' => 'Saringan Pernapasan', 'description' => 'Transmission / Brake Cooling', 'action' => 'Bersihkan (cleaned)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Tangki (Tank)
            ['id' => 26, 'section' => 'Tangki', 'description' => 'Udara & Bahan Bakar (Air & Fuel Tank)', 'action' => 'Buang endapan air (drain water)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Lain - lain (Others)
            ['id' => 27, 'section' => 'Lain-lain', 'description' => 'Indikator Saringan Udara (Air Filter Indicators)', 'action' => 'Set Ulang (reset)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 28, 'section' => 'Lain-lain', 'description' => 'Saringan Udara (Air Filter)', 'action' => 'Bersihkan dan Ganti jika perlu', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 29, 'section' => 'Lain-lain', 'description' => 'Air Filter (AC)', 'action' => 'Ganti di 500 / 2000 hours', 'intervals' => ['500', '2000'], 'status' => '', 'name' => ''],
            ['id' => 30, 'section' => 'Lain-lain', 'description' => 'Air Radiator (Coolant)', 'action' => 'Uji & Penuhkan jika perlu (test & Top up) / Ganti', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Plug Magnet
            ['id' => 31, 'section' => 'Plug Magnet', 'description' => 'Differential, Final Drive RH/LH, Front Wheel RH/LH', 'action' => 'Periksa serpihan partikel & Catat', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 32, 'section' => 'Plug Magnet', 'description' => 'Transmission', 'action' => 'Periksa serpihan partikel & Catat', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Potong / Periksa Saringan
            ['id' => 33, 'section' => 'Potong Saringan', 'description' => 'Engine, Transmission, Hydraulic, Steering', 'action' => 'Cut filter & record if failure indicated', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Cylinder & Suspensi
            ['id' => 34, 'section' => 'Cylinder', 'description' => 'Hoist RH/LH, Front Strut RH/LH, Rear Strut RH/LH, Steering RH/LH', 'action' => 'Periksa & Catat Cylinder / Strut', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Pengambilan Data
            ['id' => 35, 'section' => 'Pengambilan Data', 'description' => 'Download Data ET, Service/Parking/Retarder Brake test, Cycle Time, High/Low Idle, Stall', 'action' => 'Pengambilan Data Elektronik & Testing', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Pelumasan (Grease)
            ['id' => 36, 'section' => 'Pelumasan Grease', 'description' => 'Penuhkan Tangki Grease (Top Up Grease Container)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 37, 'section' => 'Pelumasan Grease', 'description' => 'Shaft Penggerak & Sambungan Universal (Front Drive Line & U-Joints)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 38, 'section' => 'Pelumasan Grease', 'description' => 'Shaft Penggerak Pompa & Sambungan Universal (Rear Drive Shaft, Splines)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 39, 'section' => 'Pelumasan Grease', 'description' => 'Engsel Dump Body & Pin (Dump Body Hinge Pins)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Pengecekan Akhir
            ['id' => 40, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua level oli (Ensure all oil level)', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 41, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua plug pengisian & drain kencang', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 42, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua filter terpasang dan kencang', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
        ];
    }

    /**
     * Check Sheet Service Dozer.
     */
    public static function getCheckSheetDozerItems(): array
    {
        return [
            // Kompartemen
            ['id' => 1, 'section' => 'Kompartemen', 'description' => 'Engine', 'action' => 'Ganti (Replace)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 2, 'section' => 'Kompartemen', 'description' => 'Transmission', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 3, 'section' => 'Kompartemen', 'description' => 'Final Drive LH/RH', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 4, 'section' => 'Kompartemen', 'description' => 'Hydraulic', 'action' => 'Ganti pada PS 2000 jam - Sesuai Kondisi', 'intervals' => ['2000'], 'status' => '', 'name' => ''],
            ['id' => 5, 'section' => 'Kompartemen', 'description' => 'Pivot Bearing', 'action' => 'Periksa & tambah jika kurang pada PS 2000 jam', 'intervals' => ['2000'], 'status' => '', 'name' => ''],

            // Sample Oil
            ['id' => 6, 'section' => 'Sample Oil', 'description' => 'Engine', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 7, 'section' => 'Sample Oil', 'description' => 'Transmission (Power Train Case)', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 8, 'section' => 'Sample Oil', 'description' => 'Hydraulic', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 9, 'section' => 'Sample Oil', 'description' => 'Final Drive LH/RH', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Filter
            ['id' => 10, 'section' => 'Filter', 'description' => 'Engine oil & By Pass filter', 'action' => 'Ganti (Replace)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 11, 'section' => 'Filter', 'description' => 'Fuel Filter Cartridge', 'action' => 'Ganti (Replace)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 12, 'section' => 'Filter', 'description' => 'Transmission Filter Element', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 13, 'section' => 'Filter', 'description' => 'Torque Converter Filter Element', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 14, 'section' => 'Filter', 'description' => 'Hydraulic Filter Element', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 15, 'section' => 'Filter', 'description' => 'Power Train Case Strainers', 'action' => 'Bersihkan (Clean)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],

            // Saringan Pernapasan
            ['id' => 16, 'section' => 'Saringan Pernapasan', 'description' => 'Engine', 'action' => 'Bersihkan (cleaned)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 17, 'section' => 'Saringan Pernapasan', 'description' => 'Hydraulic', 'action' => 'Bersihkan (cleaned)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Tangki
            ['id' => 18, 'section' => 'Tangki', 'description' => 'Udara & Bahan Bakar (Air & Fuel Tank)', 'action' => 'Buang endapan air (drain water)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Lain - lain
            ['id' => 19, 'section' => 'Lain-lain', 'description' => 'Indikator Saringan Udara (Air Filter/Dust Indicators)', 'action' => 'Set Ulang (reset)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 20, 'section' => 'Lain-lain', 'description' => 'Belt Kipas Radiator (Radiator Fan Belt)', 'action' => 'Bersihkan dan Ganti jika perlu', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 21, 'section' => 'Lain-lain', 'description' => 'Saringan Udara (Air Filter)', 'action' => 'Bersihkan dan Ganti jika perlu', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 22, 'section' => 'Lain-lain', 'description' => 'Air Filter (AC)', 'action' => 'Bersihkan dan Ganti jika perlu', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 23, 'section' => 'Lain-lain', 'description' => 'Air Radiator (Coolant)', 'action' => 'Uji & Penuhkan jika perlu', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Plug Magnet
            ['id' => 24, 'section' => 'Plug Magnet', 'description' => 'Engine, Final Drive RH, Hydraulic', 'action' => 'Periksa serpihan partikel & Catat', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 25, 'section' => 'Plug Magnet', 'description' => 'Power Train Case Strainer, Final Drive LH', 'action' => 'Periksa serpihan partikel & Catat', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Potong Saringan
            ['id' => 26, 'section' => 'Potong Saringan', 'description' => 'Engine, Hydraulic', 'action' => 'Cut filter & record if failure indicated', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 27, 'section' => 'Potong Saringan', 'description' => 'Power Train Case', 'action' => 'Cut filter & record if failure indicated', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Cylinder
            ['id' => 28, 'section' => 'Cylinder', 'description' => 'Blade Lift RH, Blade Tilt LEFT, Ripper Lift LEFT, Ripper Tilt LEFT', 'action' => 'Periksa & Catat Cylinder', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 29, 'section' => 'Cylinder', 'description' => 'Blade Lift LH, Blade Tilt RIGHT, Ripper Lift RIGHT, Ripper Tilt RIGHT', 'action' => 'Periksa & Catat Cylinder', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Modul Elektronik
            ['id' => 30, 'section' => 'Pengambilan Data', 'description' => 'Download ET', 'action' => 'Download Electronic Technician Data', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Pelumasan
            ['id' => 31, 'section' => 'Pelumasan Grease', 'description' => 'Penuhkan Tangki Grease (Top Up Grease Container)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 32, 'section' => 'Pelumasan Grease', 'description' => 'Blade Lift Cylinder Support Yoke', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 33, 'section' => 'Pelumasan Grease', 'description' => 'Blade Lift Cylinder Support Shaft', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 34, 'section' => 'Pelumasan Grease', 'description' => 'Blade Arm Ball Joint', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 35, 'section' => 'Pelumasan Grease', 'description' => 'Track adjuster', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 36, 'section' => 'Pelumasan Grease', 'description' => 'Equalizer Bar Side Shaft', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 37, 'section' => 'Pelumasan Grease', 'description' => 'Equalizer Bar Center Shaft', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 38, 'section' => 'Pelumasan Grease', 'description' => 'Fan Pulley', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Pengecekan Akhir
            ['id' => 39, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua level oli', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 40, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua refill plug kencang', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 41, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua drain plug kencang', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 42, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua filter terpasang dan kencang', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
        ];
    }

    /**
     * Check Sheet Service Motorgrader.
     */
    public static function getCheckSheetMotorgraderItems(): array
    {
        return [
            // Kompartemen
            ['id' => 1, 'section' => 'Kompartemen', 'description' => 'Engine', 'action' => 'Ganti (SEM di ganti di 250 jam)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 2, 'section' => 'Kompartemen', 'description' => 'Front Spindle Bearing LH/RH', 'action' => 'Periksa level, Tambah/Ganti jika perlu', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 3, 'section' => 'Kompartemen', 'description' => 'Transmission/Differential', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 4, 'section' => 'Kompartemen', 'description' => 'Circle Drive Box', 'action' => 'Ganti pada PS 2000 jam', 'intervals' => ['2000'], 'status' => '', 'name' => ''],
            ['id' => 5, 'section' => 'Kompartemen', 'description' => 'Tandem Drive RH/LH', 'action' => 'Ganti pada PS 2000 jam', 'intervals' => ['2000'], 'status' => '', 'name' => ''],
            ['id' => 6, 'section' => 'Kompartemen', 'description' => 'Hydraulic', 'action' => 'Ganti pada PS 2000 jam', 'intervals' => ['2000'], 'status' => '', 'name' => ''],

            // Sample Oil
            ['id' => 7, 'section' => 'Sample Oil', 'description' => 'Engine', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 8, 'section' => 'Sample Oil', 'description' => 'Transmission-PS', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 9, 'section' => 'Sample Oil', 'description' => 'Circle Drive Box (MG Circle Drive)', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 10, 'section' => 'Sample Oil', 'description' => 'Hydraulic System', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 11, 'section' => 'Sample Oil', 'description' => 'Tandem Drive RH/LH', 'action' => 'Ambil sampel & periksa level', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Filter
            ['id' => 12, 'section' => 'Filter', 'description' => 'Engine', 'action' => 'Ganti (Replace)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 13, 'section' => 'Filter', 'description' => 'Fuel Primary Filter', 'action' => 'Bersihkan/Inspect/Ganti jika perlu', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 14, 'section' => 'Filter', 'description' => 'Fuel Secondary Filter', 'action' => 'Ganti (Replace)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 15, 'section' => 'Filter', 'description' => 'Hydraulic', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 16, 'section' => 'Filter', 'description' => 'Air Cleaner', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 17, 'section' => 'Filter', 'description' => 'Transmission/Differential', 'action' => 'Ganti (Replace)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 18, 'section' => 'Filter', 'description' => 'Transmission Screen', 'action' => 'Bersihkan (Clean)', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],

            // Saringan Pernapasan
            ['id' => 19, 'section' => 'Saringan Pernapasan', 'description' => 'Engine Crankcase', 'action' => 'Bersihkan (Clean)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 20, 'section' => 'Saringan Pernapasan', 'description' => 'Tandem Drive RH/LH', 'action' => 'Bersihkan (Clean)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 21, 'section' => 'Saringan Pernapasan', 'description' => 'Hydraulic', 'action' => 'Bersihkan (Clean)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Tangki
            ['id' => 22, 'section' => 'Tangki', 'description' => 'Udara & Bahan Bakar (Air & Fuel Tank)', 'action' => 'Buang endapan air (drain water)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 23, 'section' => 'Tangki', 'description' => 'Fuel Tank Cap & Strainer', 'action' => 'Bersihkan (Clean)', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Lain - lain
            ['id' => 24, 'section' => 'Lain-lain', 'description' => 'Indikator Saringan Udara (Air Filter Indicators)', 'action' => 'Set Ulang (reset)', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 25, 'section' => 'Lain-lain', 'description' => 'Engine Valve Lash & Rotator', 'action' => 'Periksa & adjust pada PS2000 Hrs', 'intervals' => ['2000'], 'status' => '', 'name' => ''],
            ['id' => 26, 'section' => 'Lain-lain', 'description' => 'Engine Vibration Damper', 'action' => 'Periksa pada PS2000 Hrs', 'intervals' => ['2000'], 'status' => '', 'name' => ''],
            ['id' => 27, 'section' => 'Lain-lain', 'description' => 'Air Filter (AC)', 'action' => 'Bersihkan dan Ganti jika perlu', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 28, 'section' => 'Lain-lain', 'description' => 'Air Dryer', 'action' => 'Ganti', 'intervals' => ['1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 29, 'section' => 'Lain-lain', 'description' => 'Water Temperature Regulator', 'action' => 'Periksa pada PS2000 Hrs/Ganti jika Perlu', 'intervals' => ['2000'], 'status' => '', 'name' => ''],
            ['id' => 30, 'section' => 'Lain-lain', 'description' => 'Air Radiator (Coolant)', 'action' => 'Uji & Penuhkan jika di butuhkan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Plug Magnet
            ['id' => 31, 'section' => 'Plug Magnet', 'description' => 'Engine', 'action' => 'Periksa serpihan partikel & Catat', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 32, 'section' => 'Plug Magnet', 'description' => 'Transmission', 'action' => 'Periksa serpihan partikel & Catat', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 33, 'section' => 'Plug Magnet', 'description' => 'Differential', 'action' => 'Periksa serpihan partikel & Catat', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Potong Saringan
            ['id' => 34, 'section' => 'Potong Saringan', 'description' => 'Engine, Hydraulic', 'action' => 'Cut filter & record if failure indicated', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 35, 'section' => 'Potong Saringan', 'description' => 'Transmission', 'action' => 'Cut filter & record if failure indicated', 'intervals' => ['500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Cylinder
            ['id' => 36, 'section' => 'Cylinder', 'description' => 'Cyl Artic RH, Steering RH, Blade Lift RH & LH, Blade Tilt, Cyl Wheel Lean', 'action' => 'Periksa & Catat Cylinder', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 37, 'section' => 'Cylinder', 'description' => 'Cyl Artic LH, Steering LH, Blade Tilt, Cyl Center Shift, Cyl Ripper', 'action' => 'Periksa & Catat Cylinder', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Modul Elektronik
            ['id' => 38, 'section' => 'Pengambilan Data', 'description' => 'Download ET', 'action' => 'Download Electronic Technician Data', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Pelumasan
            ['id' => 39, 'section' => 'Pelumasan Grease', 'description' => 'Penuhkan Tangki Grease (Top Up Grease Container)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 40, 'section' => 'Pelumasan Grease', 'description' => 'Shaft Penggerak & Sambungan Universal (Drive Line & U-Joints)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 41, 'section' => 'Pelumasan Grease', 'description' => 'Penggerak Pompa & Sambungan Universal (Pump Drive Shaft & Uni\'v Joint)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 42, 'section' => 'Pelumasan Grease', 'description' => 'Bantalan Axle Oscillation (Axle Oscillation Bearings)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 43, 'section' => 'Pelumasan Grease', 'description' => 'Centre Shift Lock Bar (Centre Shift Lock Bar)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 44, 'section' => 'Pelumasan Grease', 'description' => 'Drawbar Ball & Socket (Drawbar Ball & Socket)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 45, 'section' => 'Pelumasan Grease', 'description' => 'Kingpin Bearings (Bantalan Kingpin)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 46, 'section' => 'Pelumasan Grease', 'description' => 'Ripper Cylinder Bearings (Ripper Cylinder Bearings)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 47, 'section' => 'Pelumasan Grease', 'description' => 'Wheel Lean Bar, Cylinder, Pins & Bearings', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 48, 'section' => 'Pelumasan Grease', 'description' => 'Blade Lift Cylinder Socket (Blade Lift Cylinder Socket)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 49, 'section' => 'Pelumasan Grease', 'description' => 'Centre Shift Cylinder Socket (Centre Shift Cylinder Socket)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 50, 'section' => 'Pelumasan Grease', 'description' => 'Articulation Bearings (Articulation Bearings)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 51, 'section' => 'Pelumasan Grease', 'description' => 'Sambungan Kipas-Jockey Pulley (Fan Hub - Jockey Pulley)', 'action' => 'Pelumasan', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],

            // Pengecekan Akhir
            ['id' => 52, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua level oli pelumas (Ensure all oil level)', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 53, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua refill plug kencang (Ensure all refill plugs are tight)', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 54, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua drain plug kencang (Ensure all drain plugs are tight)', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
            ['id' => 55, 'section' => 'Pengecekan Akhir', 'description' => 'Pastikan semua filter terpasang dan kencang (Ensure all filters are fit & tight)', 'action' => 'Final Check', 'intervals' => ['250/750', '500', '1000', '2000'], 'status' => '', 'name' => ''],
        ];
    }

    /**
     * Pre Release Check List Report Track Unit.
     */
    public static function getPreReleaseTrackUnitItems(): array
    {
        return [
            // Operator Compartment, Electric, Cooling & AC
            ['id' => 1, 'section' => 'Operator Compartment & Cooling', 'dzr' => 1, 'hex' => 1, 'description' => 'DISCONECT SWITCH', 'status' => '', 'remarks' => ''],
            ['id' => 2, 'section' => 'Operator Compartment & Cooling', 'dzr' => 2, 'hex' => 15, 'description' => 'ENGINE OIL LEVEL', 'status' => '', 'remarks' => ''],
            ['id' => 3, 'section' => 'Operator Compartment & Cooling', 'dzr' => 3, 'hex' => 2, 'description' => 'PRE ,AIR CLEANER & LINES', 'status' => '', 'remarks' => ''],
            ['id' => 4, 'section' => 'Operator Compartment & Cooling', 'dzr' => 4, 'hex' => 16, 'description' => 'OIL & FUEL LEAKS ON ENGINE AREA', 'status' => '', 'remarks' => ''],
            ['id' => 5, 'section' => 'Operator Compartment & Cooling', 'dzr' => 5, 'hex' => 17, 'description' => 'WIRING HARNESS', 'status' => '', 'remarks' => ''],
            ['id' => 6, 'section' => 'Operator Compartment & Cooling', 'dzr' => 6, 'hex' => 18, 'description' => 'FAN Blade & Guards', 'status' => '', 'remarks' => ''],
            ['id' => 7, 'section' => 'Operator Compartment & Cooling', 'dzr' => 7, 'hex' => 19, 'description' => 'BELT TIGHTENER', 'status' => '', 'remarks' => ''],
            ['id' => 8, 'section' => 'Operator Compartment & Cooling', 'dzr' => 8, 'hex' => 20, 'description' => 'BELTS & FAN DRIVE', 'status' => '', 'remarks' => ''],
            ['id' => 9, 'section' => 'Operator Compartment & Cooling', 'dzr' => 9, 'hex' => 21, 'description' => 'BELTS & ALTERNATOR', 'status' => '', 'remarks' => ''],
            ['id' => 10, 'section' => 'Operator Compartment & Cooling', 'dzr' => 10, 'hex' => 22, 'description' => 'BELTS, AC COMPRESSOR & LINES', 'status' => '', 'remarks' => ''],
            ['id' => 11, 'section' => 'Operator Compartment & Cooling', 'dzr' => 11, 'hex' => 23, 'description' => 'CONDENSOR', 'status' => '', 'remarks' => ''],
            ['id' => 12, 'section' => 'Operator Compartment & Cooling', 'dzr' => 12, 'hex' => 24, 'description' => 'STARTER MOTOR', 'status' => '', 'remarks' => ''],
            ['id' => 13, 'section' => 'Operator Compartment & Cooling', 'dzr' => 13, 'hex' => 25, 'description' => 'INTAKE & EXHAUST AIR SYSTEM', 'status' => '', 'remarks' => ''],
            ['id' => 14, 'section' => 'Operator Compartment & Cooling', 'dzr' => 14, 'hex' => 26, 'description' => 'TURBOCHARGERS & LINES', 'status' => '', 'remarks' => ''],
            ['id' => 15, 'section' => 'Operator Compartment & Cooling', 'dzr' => 15, 'hex' => 27, 'description' => 'WATER PUMP & COOLING LINES', 'status' => '', 'remarks' => ''],
            ['id' => 16, 'section' => 'Operator Compartment & Cooling', 'dzr' => 16, 'hex' => 28, 'description' => 'RADIATOR & COOLING LEVEL', 'status' => '', 'remarks' => ''],
            ['id' => 17, 'section' => 'Operator Compartment & Cooling', 'dzr' => 17, 'hex' => 29, 'description' => 'FIRE EXTINGUISHER & FSI SYSTEM', 'status' => '', 'remarks' => ''],
            ['id' => 18, 'section' => 'Operator Compartment & Cooling', 'dzr' => 18, 'hex' => 3, 'description' => 'BATTERIES, Terminals & Electrolite', 'status' => '', 'remarks' => ''],
            ['id' => 19, 'section' => 'Operator Compartment & Cooling', 'dzr' => 19, 'hex' => 4, 'description' => 'STEPS & HAND RAIL', 'status' => '', 'remarks' => ''],
            ['id' => 20, 'section' => 'Operator Compartment & Cooling', 'dzr' => 20, 'hex' => 5, 'description' => 'CANOPY, CABIN & GLASSES', 'status' => '', 'remarks' => ''],
            ['id' => 21, 'section' => 'Operator Compartment & Cooling', 'dzr' => 21, 'hex' => 6, 'description' => 'SEAT AND SAFETY BELTS', 'status' => '', 'remarks' => ''],
            ['id' => 22, 'section' => 'Operator Compartment & Cooling', 'dzr' => 22, 'hex' => 7, 'description' => 'MIRRORS', 'status' => '', 'remarks' => ''],
            ['id' => 23, 'section' => 'Operator Compartment & Cooling', 'dzr' => 23, 'hex' => 8, 'description' => 'SWITCHES & CONTROLL FUNCTION', 'status' => '', 'remarks' => ''],
            ['id' => 24, 'section' => 'Operator Compartment & Cooling', 'dzr' => 24, 'hex' => 9, 'description' => 'LIGHTING', 'status' => '', 'remarks' => ''],
            ['id' => 25, 'section' => 'Operator Compartment & Cooling', 'dzr' => 25, 'hex' => 10, 'description' => 'HORN & BEACK UP ALARM', 'status' => '', 'remarks' => ''],
            ['id' => 26, 'section' => 'Operator Compartment & Cooling', 'dzr' => 26, 'hex' => 11, 'description' => 'GAUGES AND INDICATORS', 'status' => '', 'remarks' => ''],
            ['id' => 27, 'section' => 'Operator Compartment & Cooling', 'dzr' => 27, 'hex' => 12, 'description' => 'WIPER & WASHER', 'status' => '', 'remarks' => ''],
            ['id' => 28, 'section' => 'Operator Compartment & Cooling', 'dzr' => 28, 'hex' => 13, 'description' => 'AUTOLUBE / GREASE LINES', 'status' => '', 'remarks' => ''],
            ['id' => 29, 'section' => 'Operator Compartment & Cooling', 'dzr' => 29, 'hex' => 14, 'description' => 'DOORS', 'status' => '', 'remarks' => ''],
            ['id' => 30, 'section' => 'Operator Compartment & Cooling', 'dzr' => 30, 'hex' => null, 'description' => 'EQUALIZER BAR (with engine running)', 'status' => '', 'remarks' => ''],
            ['id' => 31, 'section' => 'Operator Compartment & Cooling', 'dzr' => 31, 'hex' => 30, 'description' => 'HYDRAULIC TANK & LEVEL', 'status' => '', 'remarks' => ''],
            ['id' => 32, 'section' => 'Operator Compartment & Cooling', 'dzr' => null, 'hex' => 31, 'description' => 'SWIVEL', 'status' => '', 'remarks' => ''],
            ['id' => 33, 'section' => 'Operator Compartment & Cooling', 'dzr' => null, 'hex' => 32, 'description' => 'SWING DRIVE', 'status' => '', 'remarks' => ''],
            ['id' => 34, 'section' => 'Operator Compartment & Cooling', 'dzr' => null, 'hex' => 33, 'description' => 'HYDRAULIC CONTROL VALVE', 'status' => '', 'remarks' => ''],

            // Front, Right, Rear, Left & Under Unit
            ['id' => 35, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 32, 'hex' => null, 'description' => 'LIFT BLADE CYLINDER', 'status' => '', 'remarks' => ''],
            ['id' => 36, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => null, 'hex' => 35, 'description' => 'BOOM CYLINDER', 'status' => '', 'remarks' => ''],
            ['id' => 37, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 33, 'hex' => 36, 'description' => 'BLADE / BUCKET', 'status' => '', 'remarks' => ''],
            ['id' => 38, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => null, 'hex' => 37, 'description' => 'BUCKET CYLINDER', 'status' => '', 'remarks' => ''],
            ['id' => 39, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => null, 'hex' => 38, 'description' => 'STICK CYLINDER', 'status' => '', 'remarks' => ''],
            ['id' => 40, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => null, 'hex' => 39, 'description' => 'BOOM & STICK ARM', 'status' => '', 'remarks' => ''],
            ['id' => 41, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 34, 'hex' => null, 'description' => 'TILT BLADE CYLINDER', 'status' => '', 'remarks' => ''],
            ['id' => 42, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 35, 'hex' => 40, 'description' => 'TRACK FRAME', 'status' => '', 'remarks' => ''],
            ['id' => 43, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 36, 'hex' => 41, 'description' => 'TRACK GP & ROLLER', 'status' => '', 'remarks' => ''],
            ['id' => 44, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 37, 'hex' => 42, 'description' => 'IDLER', 'status' => '', 'remarks' => ''],
            ['id' => 45, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 38, 'hex' => 43, 'description' => 'SEGMENT', 'status' => '', 'remarks' => ''],
            ['id' => 46, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 39, 'hex' => 44, 'description' => 'FINAL DRIVE', 'status' => '', 'remarks' => ''],
            ['id' => 47, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 40, 'hex' => null, 'description' => 'ARM BLADE', 'status' => '', 'remarks' => ''],
            ['id' => 48, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 41, 'hex' => null, 'description' => 'RIPPER FRAME', 'status' => '', 'remarks' => ''],
            ['id' => 49, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 42, 'hex' => null, 'description' => 'LIFT CYLINDER RIPPER', 'status' => '', 'remarks' => ''],
            ['id' => 50, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 43, 'hex' => null, 'description' => 'TILT CYLINDER RIPPER', 'status' => '', 'remarks' => ''],
            ['id' => 51, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 44, 'hex' => null, 'description' => 'PIN PULLER SANG RIPPER', 'status' => '', 'remarks' => ''],
            ['id' => 52, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 45, 'hex' => null, 'description' => 'TORQUE CONVERTER & LINES', 'status' => '', 'remarks' => ''],
            ['id' => 53, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 46, 'hex' => 34, 'description' => 'HYDRAULIC & LINES', 'status' => '', 'remarks' => ''],
            ['id' => 54, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 47, 'hex' => null, 'description' => 'TRANSMISSION & LINES', 'status' => '', 'remarks' => ''],
            ['id' => 55, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 48, 'hex' => null, 'description' => 'TRANSMISSION & BRAKE C. VALVE', 'status' => '', 'remarks' => ''],
            ['id' => 56, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 49, 'hex' => 45, 'description' => 'HYDRAULIC PUMP', 'status' => '', 'remarks' => ''],
            ['id' => 57, 'section' => 'Front, Right, Rear, Left & Under', 'dzr' => 50, 'hex' => 46, 'description' => 'MAIN FRAME', 'status' => '', 'remarks' => ''],
        ];
    }

    /**
     * Request Asset Disposed Form default asset rows.
     */
    public static function getRequestAssetDisposedItems(): array
    {
        $items = [];
        for ($i = 1; $i <= 8; $i++) {
            $items[] = [
                'id' => $i,
                'type_unit' => '',
                'description' => '',
                'manufacture' => '',
                'serial_number' => '',
                'part_number' => '',
                'qty' => '',
                'condition' => '',
                'status' => '',
                'remarks' => '',
            ];
        }

        return $items;
    }

    /**
     * Surat Permintaan Komponen / Internal Memorandum default items.
     */
    public static function getDefaultSuratPermintaanKomponenItems(): array
    {
        return [
            [
                'id' => 1,
                'component_name' => 'GAUGE PRESSURE SENSOR',
                'part_number' => '661-9873',
                'unit_request' => 'CAT 374 – ME056',
                'unit_source' => '395 -',
                'qty' => 1,
                'condition' => 'Part Bekas',
                'remarks' => 'Mendukung operasional unit ME056 (Cyl Arm)',
            ],
        ];
    }

    /**
     * Generate safe atomic document number for Form JSA (JSA/MAM-HSE/YYYY/001).
     */
    public static function generateJsaNumber(): string
    {
        $year = date('Y');
        $prefix = "JSA/MAM-HSE/{$year}/";

        return DB::transaction(function () use ($prefix) {
            $query = self::where('form_number', 'like', $prefix.'%');

            if (DB::getDriverName() === 'sqlite') {
                $last = $query
                    ->lockForUpdate()
                    ->get()
                    ->sortByDesc(function ($item) {
                        $parts = explode('/', $item->form_number);

                        return (int) end($parts);
                    })
                    ->first();
            } else {
                $last = $query
                    ->lockForUpdate()
                    ->orderByRaw('CAST(SUBSTRING_INDEX(form_number, "/", -1) AS UNSIGNED) DESC')
                    ->first();
            }

            if (! $last) {
                return $prefix.'001';
            }

            $parts = explode('/', $last->form_number);
            $lastNum = (int) end($parts);

            return $prefix.str_pad($lastNum + 1, 3, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Get preset data for Form JSA based on task slug (from official MAM-HSE-FORM-028 PDFs).
     */
    public static function getJsaPresetData(string $taskSlug): array
    {
        $commonAttendees = [
            ['no' => 1, 'name' => '', 'dept_position' => 'PLANT / MEKANIK', 'signature' => ''],
            ['no' => 2, 'name' => '', 'dept_position' => 'PLANT / MEKANIK', 'signature' => ''],
            ['no' => 3, 'name' => '', 'dept_position' => 'PLANT / HELPER', 'signature' => ''],
            ['no' => 4, 'name' => '', 'dept_position' => 'PLANT / WELDER', 'signature' => ''],
            ['no' => 5, 'name' => '', 'dept_position' => 'PLANT / MEKANIK', 'signature' => ''],
        ];

        switch ($taskSlug) {
            case 'overhaul-starting-motor':
                return [
                    'task_slug' => 'overhaul-starting-motor',
                    'task_name' => 'OVERHAUL STARTING MOTOR',
                    'form_code' => 'MAM-HSE-FORM-028',
                    'standard_form' => 'PT MITRA ABADI MAHAKAM',
                    'department' => 'PLANT',
                    'tools_needed' => "1. Toolbox\n2. Alvo",
                    'apd_needed' => '1. Helm, Safety Glass, Safety Shoes, sarung tangan',
                    'workers' => ['1' => '', '2' => '', '3' => '', '4' => ''],
                    'steps' => [
                        [
                            'no' => 1,
                            'step' => 'Menyiapkan peralatan',
                            'hazards' => "1.1 Cidera tulang punggung akibat salah posisi pengangkatan.\n2.1 Tergores peralatan kerja yang tajam.",
                            'controls' => "1.1.1 Perhitungkan beban yang diangkat ketika manual handling Max 18 kg.\n1.1.2 Posisikan pengangkatan harus benar pusatkan tumpuan pada kaki dan paha serta punggung harus tetap lurus.\n1.1.3 Minta bantuan rekan kerja atau gunakan alat bantu angkat jika tools /peralatan terlalu berat.\n1.1.4 Gunakan safety gloves.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 2,
                            'step' => 'Memposisikan starting motor pada meja kerja',
                            'hazards' => "2.1 Tergores bagian starting motor yang tajam.\n2.2 Jari tangan terjepit antara starting motor dan meja kerja.",
                            'controls' => "2.1.1 Gunakan safety gloves untuk mengurangi resiko tangan tergores.\n2.2.1 Perhatikan posisi tangan/jari saat pengangkatan starting motor pada meja kerja tangan /jari tidak berada pada bawah starting motor.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 3,
                            'step' => 'Melepaskan monting dan koneksi (relay dan magnetic switch)',
                            'hazards' => "3.1 Tergores bagian tools yang tajam\n3.2 Jari tangan terjepit antara tools dan magnetic switch.",
                            'controls' => "3.1.1 Gunakan safety gloves.\n3.1.2 Tools yang digunakan harus standart (tidak rusak dan tidak di modifikasi).\n3.1.3 Perhatikan posisi tangan jangan berada pada antara tools dan magnetic switch.\n3.1.4 Gunakan safety gloves.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 4,
                            'step' => 'Melepaskan cover brush, brus, armature, field coil dan over running clutch, serta membersihkannya',
                            'hazards' => "4.1 Tangan tergores bagian starting motor yang tajam.\n4.2 Mata terkena debu dan kotoran\n4.3 Terpapar debu.",
                            'controls' => "4.1.1 Gunakan safety gloves, gunakan tools yang standar (tidak rusak ataupun di modifikasi).\n4.2.1 Gunakan safety glass.\n4.2.2 Gunakan safety masker untuk mengurangi resiko masuknya debu pada alat pernapasan.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 5,
                            'step' => 'Memasang armature, brash dutch over running field coil dan cover',
                            'hazards' => "5.1 Tangan tergores bagian komponen starting yang tajam.\n5.2 Jari tangan terjepit antara kunci dan motor starting.",
                            'controls' => "5.1.1 Gunakan safety gloves untuk mengurangi jari tangan tergores.\n5.1.2 Jangan posisikan tangan antara kunci dan komponen starting motor.\n5.1.3 Gunakan safety gloves.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 6,
                            'step' => 'Memasang bolt pengikat relay dan magnetic switch, serta conectionnya',
                            'hazards' => "6.1 Jari tangan terjepit antara kunci dan komponen starting motor.\n6.2 Tangan tergores bagian tools yang tajam.",
                            'controls' => "6.2.1 Gunakan safety gloves.\n6.2.2 Tools yang digunakan harus standart (tidak rusak ataupun tidak dimodifikasi).",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 7,
                            'step' => 'Merapikan dan mengembalikan peralatan kerja',
                            'hazards' => "7.1 Jari tangan tergores peralatan kerja yang tajam.\n7.2 Cidera tulang punggung akibat salah dalam posisi pengangkatan",
                            'controls' => "7.2.1 Lakukan manual handling jika berat beban yang diangkat sekitar 18 kg.\n7.2.2 Posisikan kaki dan paha sebagai tumpuan serta punggung harus dalam keadaan lurus.\n7.2.3 Minta bantuan teman atau gunakan alat angkat jika peralatan terlalu berat.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 8,
                            'step' => 'Membersihkan area pekerjaan',
                            'hazards' => "8.1 Terpapar debu dan material kecil lainnya.\n8.2 Kontaminasi lingkungan.\n8.3 Kontaminasi lingkungan.",
                            'controls' => "8.2.1 Gunakan safety mask saat proses pembersihan area kerja agar mengurangi resiko masuknya debu pada alat pernapasan.\n8.2.2 Gunakan safety glass agar mata terlindung dari masuknya material kecil.\n8.2.3 Buanglah sampah sisa pekerjaan sesuai dengan pengelompokannya.",
                            'pic' => 'Mekanik',
                        ],
                    ],
                    'attendees' => $commonAttendees,
                    'known_by_mam' => 'Ambo Mai (Superintendent Plant)',
                    'approved_by_bbe' => 'Subani (PJO)',
                ];

            case 'maintenance-ac-dump-truck':
                return [
                    'task_slug' => 'maintenance-ac-dump-truck',
                    'task_name' => 'MAINTENANCE AC SYSTEM DUMP TRUCK',
                    'form_code' => 'MAM-HSE-FORM-028',
                    'standard_form' => 'PT MITRA ABADI MAHAKAM',
                    'department' => 'PLANT',
                    'tools_needed' => "1. Manifold Gauge AC & Selang R134a\n2. Tangga lipat portable standar\n3. Tool box standar\n4. Oil tray / wadah penampung\n5. Kain absorber / majun",
                    'apd_needed' => '1. Safety helmet, Safety shoes, Safety glasses, Sarung tangan, Masker, Ear muff',
                    'workers' => ['1' => '', '2' => '', '3' => '', '4' => ''],
                    'steps' => [
                        [
                            'no' => 1,
                            'step' => 'Memarkir unit pada tempat yang aman dan tempat yang datar',
                            'hazards' => "1.1 Terpeleset dan terjatuh..\n1.2 Terlindas atau tertabrak",
                            'controls' => "1.1.1 Perhatikan kondisi area jalan/area kerja.\n1.1.2 Hindari area basah dan licin.\n1.1.3 Gunakan safety shoes.\n1.2.1 Orang yang mengoperasikan unit adalah orang yg sudah memiliki Simper.\n1.2.2 Operator unit wajib membunyikan klakson sebelum unit bergerak, klakson 2x saat unit maju dan klakson 3x saat unit mundur.\n1.2.3 Operator wajib memperhatikan kaca spion (mirror kiri dan kanan) saat unit bergerak maju atau mundur.\n1.2.4 Operator wajib mengikuti arahan dari spotter.\n1.2.5 Jika unit bergerak mundur Spotter sebaiknya berada pada sisi kiri belakang unit agar terlihat operator dan menjaga jarak aman dgn unit.\n1.2.6 Jika unit bergerak maju, spotter sebaiknya berada di depan unit dgn jarak yg terlihat jelas oleh operator.",
                            'pic' => 'Operator / Mekanik',
                        ],
                        [
                            'no' => 2,
                            'step' => 'Memasang service tag, LOTTO & Wheel Chock',
                            'hazards' => "2.1 Terpeleset dan terjatuh.\n2.2 Tangan terkilir dan cidera pada punggung.",
                            'controls' => "2.1.1 Perhatikan kondisi jalan atau kondisi area kerja.\n2.1.2 Hindari berjalan pada area yang basah dan licin.\n2.1.3 Gunakan safety shoes, safety helmet, safety glasses dan sarung tangan.\n2.2.1 Jika berat ganjal melebihi standard yg di ijinkan, gunakan alat bantu untuk mengangkat.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 3,
                            'step' => 'Pemeriksaan kebocoran system, tekanan refrigerant, clutch AC compressor',
                            'hazards' => "3.1 Terpeleset dan terjatuh dari unit.\n3.2 Jari/tangan tergores terkena bagian plate/bracket compressor AC yg panas dan tajam.\n3.3 Kepala terbentur bagian benda yg keras dan tajam.\n3.4 Terpapar gas refrigerant R 134.\n3.5 Jari atau tangan terjepit diantara v-belt/terkena bagian benda yg berputar.",
                            'controls' => "3.3.1 Perhatikan kondisi jalan/area kerja.\n3.3.2 Hindari berjalan pada area basah/licin.\n3.3.3 Jauhkan benda-benda yg menghambat aktifitas berjalan saat pekerjaan berlangsung.\n3.3.4 Naik/turun tangga unit harus menggunakan tiga titik tumpu.\n3.3.5 Naik/turun unit, tangan dilarang membawa/memegang hand tools.\n3.3.6 Pemeriksaan area engine (AC compressor) gunakan tangga lipat portable yg masih standart.\n3.3.7 Posisikan tangga portable pada bidang yg rata/datar.\n3.3.8 Gunakan safety shoes, safety helmet, safety glasses dan sarung tangan.\n3.3.9 Konsentrasi dan fokus terhadap pekerjaan yg dihadapi.\n3.3.10 Hindari prilaku kerja yg buruk.\n3.3.11 Gunakan tools yg sesuai dgn pekerjaan tersebut.\n3.3.12 Perhatikan bagian benda yg panas dan tajam.\n3.3.13 Lapisi bagian benda yg tajam/panas dgn kain/absorber.\n3.3.14 Pasang manifold gauge AC dengan baik dan benar.\n3.3.15 Perhatikan perubahan posisi tubuh, pergerakan jari/tangan saat pekerjaan berlangsung.\n3.3.16 Gunakan sarung tangan, safety helmet, safety glasses, safety shoes.\n3.3.17 Periksa kondisi/area kerja terhadap kemungkinan adanya benturan kepala dgn bagian benda yg keras, panas dan tajam.\n3.3.18 Lapisi bagian benda yg keras atau tajam dgn kain/absorber.\n3.3.19 Sebisa mungkin hindari posisi kepala dgn bagian benda yg keras, panas dan tajam.\n3.3.20 Perhatikan perubahan posisi tubuh, dan kepala saat pekerjaan berlangsung..\n3.3.21 Pasang manifold gauge AC dgn baik dan benar.\n3.4.1 Periksa tidak ada kebocoran pada valve, hose manifold AC.\n3.4.2 Gunakan safety helmet, safety glasses, masker, sarung tangan, dan safety shoes.\n3.5.1 Bangun komunikasi searah dgn rekan kerja.\n3.5.2 Komunikasi dua arah harus saling dipahami dan dimengerti.\n3.5.3 Periksa guard/ Pelindung bagian benda berputar terpasang dgn baik.\n3.5.4 Hindari/jangan letakan jari pd celah atau ram benda yg berputar.\n3.5.5 Fokus dan konsentrasi karena berhadapan dgn benda yg berputar.\n3.5.6 Gunakan sarung tangan, safety helmet, safety glasses, safety shoes, dan ear muff.",
                            'pic' => 'Mekanik AC',
                        ],
                        [
                            'no' => 4,
                            'step' => 'Melepas service tag, LOTTO, JSAP dan ganjal',
                            'hazards' => "4.1 Terpeleset dan terjatuh.\n4.2 Tangan terkilir dan cidera pada punggung.",
                            'controls' => "2.1.1 Perhatikan kondisi jalan atau kondisi area kerja.\n2.1.2 Hindari berjalan pada area yang basah dan licin.\n2.1.3 Gunakan safety shoes, safety helmet, safety glasses dan sarung tangan.\n2.2.1 Jika berat ganjal melebihi standard yg di ijinkan, gunakan alat bantu untuk mengangkat.\n2.2.2 Jika berat ganjal masuk spec diangkat oleh manusia, angkat ganjal tersebut dengan benar dan perhatikan berat titik tumpu.\n2.2.3 Sebaiknya gunakan tali pembantu yang diikat pada pemegang ganjal agar mudah ditarik atau dipindahkan.\n2.2.4 Gunakan sarung tangan, safety helmet, safety glasses dan safety shoes.",
                            'pic' => 'Mekanik',
                        ],
                    ],
                    'attendees' => $commonAttendees,
                    'known_by_mam' => 'Ambo Mai (Superintendent Plant)',
                    'approved_by_bbe' => 'Subani (PJO)',
                ];

            case 'radiator-medium-truck':
                return [
                    'task_slug' => 'radiator-medium-truck',
                    'task_name' => 'MELEPAS DAN MEMASANG RADIATOR MEDIUM TRUCK',
                    'form_code' => 'MAM-HSE-FORM-028',
                    'standard_form' => 'PT MITRA ABADI MAHAKAM',
                    'department' => 'PLANT',
                    'tools_needed' => 'chain block, chain slink, slink belt, eye ball, suckle, crane truck, tool box, lube truck, stand portable, bak penampung air, trash bag',
                    'apd_needed' => 'Safety Shoes, Sarung Tangan, Helmet, Kacamata',
                    'workers' => ['1' => '', '2' => '', '3' => '', '4' => '', '5' => '', '6' => '', '7' => '', '8' => '', '9' => '', '10' => ''],
                    'steps' => [
                        [
                            'no' => 1,
                            'step' => 'Menyiapkan dan mengembalikan peralatan kerja',
                            'hazards' => "1.1 Cidera tulang punggung karena salah cara mengangkat tools\n1.2 Cidera tulang punggung karena salah cara mengangkat tools (lanjutan)\n1.3 Kaki Kejatuhan tool box saat mengangkat",
                            'controls' => "1.3.1 Lakukan pengangkutan secara manual (Manual handling) dengan benar.\n1.3.2 Saat pengangkatan pastikan tulang punggung tetap lurus dan pusatkan tumpuan beban pada kaki.\n1.3.3 Memastikan bantuan teman jika mengangkat beban yang terlalu berat (Cont) (melebihi standart 18 Kg untuk 1 orang) atau gunakan peralatan tambahan seperti trolly, forklift, atau crane.\n1.3.4 Alat dan peralatan atau komponen yang dibawa diusahakan diletakkan dalam toolbox atau kotak orisinal.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 2,
                            'step' => 'Memarkir unit.',
                            'hazards' => '2.1 Tertabrak unit yang sedang akan diposisikan.',
                            'controls' => '2.1.1 Pekerjaan ini hanya boleh dilakukan oleh operator yang berwenang. Pilih lokasi kerja yang sesuai, cukup luas dan ground stabil.',
                            'pic' => 'Operator / Mekanik',
                        ],
                        [
                            'no' => 3,
                            'step' => 'Memasang lotto',
                            'hazards' => '3.1 Jari tangan Terjepit pada waktu mengangkat',
                            'controls' => "3.1.1 Idle 5 menit, matikan mesin kemudian gerak-gerakkan lever control beberapa kali unstuck menghilangkan tekanan hidrolik, pasang 'danger tag' serta lock out difungsikan.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 4,
                            'step' => 'Membuka terminal baterai',
                            'hazards' => '4.1 Jari tangan Terjepit pada waktu mengangkat',
                            'controls' => '4.1.1 Pasangkan kait pada titik angkat, lakukan dengan hati-hati, perhatikan posisi tangan. Sebelumnya periksa dulu kondisi chain dan kaitnya.',
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 5,
                            'step' => 'Melakukan drain air radiator dan oli hidrolik.',
                            'hazards' => "5.1 Tersembur air panas dari radiator ke tangan, muka atau tubuh\n5.2 Pencemaran lingkungan dari oli yang berceceran dipermukaan tanah",
                            'controls' => "5.1.1 Pastikan temperatur air radiator benar benar dingin dan tidak membuka Cap radiator dalam kondisi panas (overheat).\n5.1.2 Release tekanan dalam radiator.\n5.1.3 Perhatikan posisi tubuh/tangan saat membuka drain plug.\n5.2.1 Tempatkan penampungan oli yang sesuai.\n5.2.2 Bebaskan tekanan oli dalam mesin yang tersisa dan gunakan oil tray.\n5.2.3 Pastikan oli yang keluar dari mesin ditampung dan cegah terbuangnya oli ke lingkungan.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 6,
                            'step' => 'Melepas Radiator',
                            'hazards' => '8.1 Jari terjepit diantara kunci dan benda kerja (tool slip)',
                            'controls' => "8.1.1 Gunakan alat sesuai dengan peruntukannya.\n8.1.2 Pastikan alat dalam kondisi baik.\n8.2.2 Perhatikan titik seimbang pada saat mengangkat beban.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 7,
                            'step' => 'Memasang Radiator New',
                            'hazards' => '9.1 Jari terjepit diantara kunci dan benda kerja (tool slip)',
                            'controls' => "9.1.1 Gunakan alat sesuai dengan peruntukannya.\n9.1.2 Pastikan alat dalam kondisi baik.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 8,
                            'step' => 'Memasang hose radiator dan hose oil cooler',
                            'hazards' => '10.1 Jari terjepit diantara kunci dan benda kerja (tool slip).',
                            'controls' => "10.1.1 Gunakan alat sesuai dengan peruntukannya.\n10.1.2 Pastikan alat dalam kondisi baik.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 9,
                            'step' => 'Mengisi air radiator',
                            'hazards' => '11.1 Pencemaran lingkungan dari oli yang berceceran dipermukaan tanah.',
                            'controls' => "11.1.1 Tempatkan penampungan oli yang sesuai.\n11.1.2 Bebaskan tekanan oli dalam mesin yang tersisa dan gunakan oil tray.\n11.1.3 Pastikan oli yang keluar dari mesin ditampung dan cegah terbuangnya oli ke lingkungan.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 10,
                            'step' => 'Melakukan cek kebocoran pada radiator',
                            'hazards' => '12.1 Pencemaran lingkungan dari oli yang berceceran dipermukaan tanah',
                            'controls' => "12.1.1 Tempatkan penampungan oli yang sesuai.\n12.1.2 Bebaskan tekanan oli dalam mesin yang tersisa dan gunakan oil tray.\n12.1.3 Pastikan oli yang keluar dari mesin ditampung dan cegah terbuangnya oli ke lingkungan.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 11,
                            'step' => 'Mengembalikan alat dan peralatan kerja',
                            'hazards' => '13.1 Cidera punggung karena mengangkat berat beban',
                            'controls' => "13.1.13 Lakukan pengangkatan dengan teknik memakai tenaga paha, bukan tenaga punggung (kalau belum bisa, hubungi atasan untuk dilatih).\n13.1.14 Angkat dengan minimal 2 orang, salah satu pemberi komando, dan mengangkat dengan tenaga paha bukan tenaga punggung secara bersama - sama mengikuti aba-aba.\n13.1.15 Mengangkat barang rapat ke tubuh. Tidak memutar tubuh waktu membawa barang berat.",
                            'pic' => 'Mekanik',
                        ],
                        [
                            'no' => 12,
                            'step' => 'Melepas Isolasi unit',
                            'hazards' => '14.1 Terpeleset ketika menaiki unit',
                            'controls' => "14.1.1 Bersihkan anak tangga dan pegangan tangga dari lumpur pelumas, air dan bahan penyebab licin lainnya.\n14.1.2 Gunakan teknik kontak 3 titik saat naik / turun, gunakan tangga, jangan melompat.",
                            'pic' => 'Mekanik',
                        ],
                    ],
                    'attendees' => $commonAttendees,
                    'known_by_mam' => 'Ambo Mai (Superintendent Plant)',
                    'approved_by_bbe' => 'Subani (PJO)',
                ];

            case 'welding-chasis-medium-truck':
            default:
                return [
                    'task_slug' => 'welding-chasis-medium-truck',
                    'task_name' => 'WELDING CHASIS MEDIUM TRUCK',
                    'form_code' => 'MAM-HSE-FORM-028',
                    'standard_form' => 'PT MITRA ABADI MAHAKAM',
                    'department' => 'PLANT',
                    'tools_needed' => "1. Mesin las & OAW tools\n2. Kabel las, stang las & earth clamp\n3. Mesin gerinda & batu gerinda standar\n4. Tangga portable\n5. Lock dump vessel bracket\n6. Tabir pelindung pengelasan",
                    'apd_needed' => "1. Apron jacket las, Sarung tangan kulit, Topeng las (kaca min no 10)\n2. Face shield / kacamata khusus gerinda\n3. Safety helmet, Safety shoes, Masker",
                    'workers' => ['1' => '', '2' => '', '3' => '', '4' => ''],
                    'steps' => [
                        [
                            'no' => 1,
                            'step' => 'Menyiapkan peralatan',
                            'hazards' => "1.1. Terpeleset\n1.2. Cidera punggung saat memindahkan mesin las / OAW tools",
                            'controls' => "1.1.1. Area kerja harus bersih dan tidak basah.\n1.1.2. Saat membawa atau mengangkat peralatan yang beratnya >18 kg angkat dengan dua orang atau gunakan alat bantu.",
                            'pic' => 'Welder / Mekanik',
                        ],
                        [
                            'no' => 2,
                            'step' => 'Melakukan Proses Isolasi',
                            'hazards' => '2.1 Terjatuh saat naik ke atas unit untuk menguji potensi energi Nol',
                            'controls' => '2.1.1 Menaiki tangga unit dengan menggunakan tiga titik tumpu.',
                            'pic' => 'Welder / Mekanik',
                        ],
                        [
                            'no' => 3,
                            'step' => 'Menyiapkan Tangga portable',
                            'hazards' => "3.1. Terjatuh saat memindahkan tangga\n3.2. Tangan tergores tepi tangga\n3.3. Cidera punggung",
                            'controls' => "3.1.1. Area kerja harus bersih dari genangan air dan tidak licin.\n3.2.1. Gunakan sarung tangan saat memindahkan atau mengangkat tangga.\n3.2.2. Saat membawa atau mengangkat peralatan yang beratnya >18 kg angkat dengan dua orang atau gunakan alat bantu.",
                            'pic' => 'Welder / Mekanik',
                        ],
                        [
                            'no' => 4,
                            'step' => 'Memulai pekerjaan dengan memotong matrial chasis yang rusak',
                            'hazards' => "4.1. Terbakar akibat panas api las\n4.2. Terpercik api las pada kulit\n4.3. Tabung OAW terbakar / meledak\n4.4. Mata perih akibat sinar las\n4.5. Terjepit dan tertimpa vessel Dump truck (Pada pekerjaan vessel dumping / terangkat)",
                            'controls' => "4.1.1. Jauhkan barang yang mudah terbakar dari area kerja.\n4.2.1. Gunakan sarung tangan kulit dan apron.\n4.3.1. Periksa dengan teliti agar tidak ada kebocoran gas dari Peralatan OAW, Atur jarak tabung OAW dari area kerja minimal 6 meter.\n4.3.2. Saat di gunakan atur jarak antara nozzle dengan benda kerja, jangan terlalu rapat ke benda kerja yang kana di potong karna nozzletersebut dapat tersumbat (atur jarak noozle ke benda kerja kira-kira 3mm)\n4.3.3. Gunakan APD kaca mata atau Face shield.\n4.3.4. Pasang lock dump vessel dengan tepat pada bracket dan tidak longgar.",
                            'pic' => 'Welder',
                        ],
                        [
                            'no' => 5,
                            'step' => 'Menggerinda bekas potongan matrial',
                            'hazards' => "5.1. Batu gerinda pecah mengenai anggota badan\n5.2. Terkena percikan gram pada mata\n5.3. Tersayat batu gerinda\n5.4. Tersengat aliran listrik\n5.5. Percikan gram gerinda mengenai orang di sekitarnya",
                            'controls' => "5.1.1. Periksa Rpm batu gerinda dan pastikan lebih besar dari Rpm mesin gerinda dan covernya terpasang.\n5.2.1. Gunakan face shield , topeng las atau kaca mata khusus menggerinda.\n5.3.1. Gunakan sarung tangan dan perhatikan posisi tangan saat menggerinda tidak terlalu dekat dengan putaran batu gurinda.\n5.4.1. Sarung tangan dan peralatan lainnya tidak basah ,tidak ada kabel yang terkelupas isolasinya.\n5.4.2. Gunakan tabir di sekitar area penggerindaan dan pastikan arah percikan tidak mengenai orang di sekitarnya.",
                            'pic' => 'Welder',
                        ],
                        [
                            'no' => 6,
                            'step' => 'Setting matrial pengganti chasis yang baru',
                            'hazards' => '6.1. Terjepit matrial',
                            'controls' => '6.1.1. Pegang dan Angkat matrial dengan kuat ,apabila beban lebih dari 18 kg gunakan alat bantu atau minimal angkat matrial dengan bantuan satu orang untuk setting matrial.',
                            'pic' => 'Welder',
                        ],
                        [
                            'no' => 7,
                            'step' => 'Menghidupkan mesin las',
                            'hazards' => '7.1 Mesin las Short',
                            'controls' => '7.1.2 Sebelum menghidupkan pisahkan earth clamp kabel dan stang las agar tidak menyatu.',
                            'pic' => 'Welder',
                        ],
                        [
                            'no' => 8,
                            'step' => 'Memulai proses pengelasan',
                            'hazards' => "8.1. Terbakar pada kulit\n8.2. Mata perih akibat sinar las\n8.3. Sesak napas akibat asap las dan gas Buang Mesin Diesel\n8.4. Terbakar pada benda kerja atau peralatan",
                            'controls' => "8.1.1. Gunakan Apron jacket saat pengelasan.\n8.2.1. Gunakan topeng las dengan kaca las yang sesuai mata minimal no 10.\n8.3.1. Gunakan Masker dan pastikan arah pengelasan tidak searah dengan arah angin atau tidak dekat dengan gas buang mesin kalau menggunakan mesin las diesel).\n8.3.2. Pindahkan atau jauhkan benda yang mudah terbakar di sekitar area pengelasan.",
                            'pic' => 'Welder',
                        ],
                        [
                            'no' => 9,
                            'step' => 'Menggerinda dan merapikan hasil pengelasan',
                            'hazards' => "9.1. Batu gerinda pecah mengenai anggota badan\n9.2. Terkena percikan gram pada mata\n9.3. Tersayat batu gerinda\n9.4. Tersengat aliran listrik\nPercikan gram gerinda mengenai orang di sekitarnya",
                            'controls' => "8.1.1. Periksa Rpm batu gerinda dan pastikan lebih besar dari Rpm mesin gerinda dan covernya terpasang.\n9.2.1. Gunakan face shield , topeng las atau kaca mata khusus menggerinda.\n9.3.1. Gunakan sarung tangan dan perhatikan posisi tangan saat menggerinda tidak terlalu dekat dengan putaran batu gurinda.\n9.4.1. Sarung tangan dan peralatan lainnya tidak basah ,kabel tidak ada yang terkelupas.\nGunakan tabir di sekitar area penggerindaan dan pastikan arah percikan tidak mengenai orang di sekitarnya.",
                            'pic' => 'Welder',
                        ],
                        [
                            'no' => 10,
                            'step' => 'Mematikan mesin las',
                            'hazards' => '10.1 Bahaya sengatan listrik / short circuit',
                            'controls' => '10.1.1 Matikan switch mesin las, rapikan kabel dan matikan sumber listrik / engine.',
                            'pic' => 'Welder',
                        ],
                        [
                            'no' => 11,
                            'step' => 'Mengembalikan dan merapikan peralatan.',
                            'hazards' => "11.1. Terpeleset\n11.2. Kejatuhan peralatan",
                            'controls' => "11.2.1. Area kerja bersih dan tidak basah, hindari melewati area kerja yang licin.\n11.2.2. Gulung kabel las dengan baik hindarkan dari minyak, panas dan kemungkinan terjepit.",
                            'pic' => 'Welder',
                        ],
                        [
                            'no' => 12,
                            'step' => 'Membersihkan area kerja',
                            'hazards' => '12.1 Terpeleset',
                            'controls' => '12.1.1 Hindari berjalan atau menginjak area licin atau kondisi yang dapat menyebabkan terpeleset.',
                            'pic' => 'Welder',
                        ],
                        [
                            'no' => 13,
                            'step' => 'Melepas Isolasi (Lock out &Tag out)',
                            'hazards' => '13.1 Pekerja terjatuh disaat memasang LOTO pada unit (posisi lock box tinggi)',
                            'controls' => "13.1.1 Gunakan tiga titik kontak saat naik turun unit.\n13.1.2 Pastikan area berpijak tidak licin.",
                            'pic' => 'Welder / Mekanik',
                        ],
                    ],
                    'attendees' => $commonAttendees,
                    'known_by_mam' => 'Ambo Mai (Superintendent Plant)',
                    'approved_by_bbe' => 'Subani (PJO)',
                ];
        }
    }
}
