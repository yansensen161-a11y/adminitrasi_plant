<?php

namespace Database\Seeders;

use App\Models\Breakdown;
use App\Models\BreakdownTask;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BreakdownSeeder extends Seeder
{
    public function run()
    {
        $data = [
            [
                'name' => 'A.1 EXCAVATOR CRUSHER',
                'units' => [],
            ],
            [
                'name' => 'A.2 EXCAVATOR BIGMALL',
                'units' => [
                    [
                        'unit_no' => 'ME056', 'model' => 'CAT 374', 'hm' => '16672', 'loc' => 'HW', 'est_finish' => '2026-05-03', 'aging' => 121, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Oring Main Pump Hyd leak', 'activity' => '1,1 Replace Oring Main Pump Hyd', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00411', 'pr' => 'PR.HW.2026.03.00018', 'po' => 'PO.MAM.2026.05.02996', 'eta' => '2026-05-07'],
                            ['task_no' => '2', 'problem' => 'Bucket Crack', 'activity' => '1,2 Repair Bucket By ATE', 'status' => 'Done', 'remarks' => 'ATE', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Rebushing End Arm & Link H', 'activity' => '1,3 Rebushing End Arm & Link H', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00703', 'pr' => 'PR.HW.2026.05.00040', 'po' => 'PO.MAM.2026.05.03503', 'eta' => '2026-06-02'],
                            ['task_no' => '4', 'problem' => 'Fabrikasi Pin Link H', 'activity' => '1,4 Fabrikasi Pin Link H to ( PT.ATE)', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'JWO 0175', 'pr' => 'PR.HW.2026.05.00209', 'po' => '', 'eta' => '2026-06-02'],
                            ['task_no' => '5', 'problem' => 'BCM', 'activity' => '1,5 Replace BCM', 'status' => 'Waiting Part', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00920', 'pr' => 'PR.HW.2026.06.00094', 'po' => '', 'eta' => null],
                            ['task_no' => '6', 'problem' => 'ECM Swap from ME055', 'activity' => '1,5 Replace ECM', 'status' => 'Waiting Part', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00918', 'pr' => 'PR.HW.2026.06.00095', 'po' => '', 'eta' => null],
                            ['task_no' => '7', 'problem' => 'Top Roller 2 Swap to ME055', 'activity' => '1,6 Replace Top Roller 2 pcs', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00962', 'pr' => 'PR.HW.2026.06.00158', 'po' => 'PO.MAM.2026.06.04005', 'eta' => '2026-06-24'],
                            ['task_no' => '8', 'problem' => 'Main Pump Leak', 'activity' => '1,7 Reoring Main Pump', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00959', 'pr' => 'PR.HW.2026.06.00156', 'po' => 'PO.MAM.2026.06.04136', 'eta' => '2026-06-29'],
                            ['task_no' => '9', 'problem' => 'Antena Radio Swap to MDT036', 'activity' => '1,8 Replace Antena Radio', 'status' => 'Waiting Part', 'remarks' => 'SHE', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'ME049', 'model' => 'CAT 374', 'hm' => '17393', 'loc' => 'HW', 'est_finish' => '2026-07-19', 'aging' => 44, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'ECM Malfunction (Ex ME055)', 'activity' => '1,1 Replace ECM', 'status' => 'Waiting Parts', 'remarks' => 'Fendi', 'mol' => 'MOL 01132', 'pr' => 'PR.HW.2026.07.00178', 'po' => '', 'eta' => null],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'A.3 EXCAVATOR SMALL',
                'units' => [
                    [
                        'unit_no' => 'ME052', 'model' => 'SY500', 'hm' => '12563.7', 'loc' => 'HW', 'est_finish' => '2026-06-30', 'aging' => 63, 'status' => 'ANC',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Unit Rebah', 'activity' => '1,1 Investigasi & Moving Unit to safe are', 'status' => 'On Progress', 'remarks' => 'Fendi', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => '', 'activity' => '1,2 Assuransi', 'status' => 'Waiting Part', 'remarks' => 'Assuransi', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'ME067', 'model' => 'DEVELON DX530LC 7M', 'hm' => '6477', 'loc' => 'HW', 'est_finish' => '2026-08-18', 'aging' => 14, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Bucket Crack', 'activity' => '1,1 Repair Bucket To ATE', 'status' => 'Done', 'remarks' => 'ATE', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Battery Swap to ME066', 'activity' => '1,2 Replace Battery', 'status' => 'Done', 'remarks' => 'Fendi', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Swing Abnormal', 'activity' => '1,3 Inspect Swing LH-RH', 'status' => 'Done', 'remarks' => 'Fendi', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '4', 'problem' => 'Instal Adaptor tooth bucket', 'activity' => '1,4 Instal Adaptor tooth bucket', 'status' => 'On Progres', 'remarks' => 'Erawan', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '5', 'problem' => 'Complated & Final Check', 'activity' => '1.5 Complated & Final Check', 'status' => 'On Progres', 'remarks' => 'Ambo', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'A.4 BULLDOZER',
                'units' => [
                    [
                        'unit_no' => 'MD037', 'model' => 'KOMATSU D85ESS', 'hm' => '14991', 'loc' => 'HW', 'est_finish' => '2026-07-29', 'aging' => 34, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Line Boring Equalizer Bar & Pivot shaft', 'activity' => '1 Line Boring Equalizer Bar & Pivot shaft', 'status' => 'On Progress', 'remarks' => 'ATE', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => '2026-08-15'],
                            ['task_no' => '2', 'problem' => 'Replace Bushing Equalizer Bar', 'activity' => '2 Replace Bushing Equalizer Bar', 'status' => 'Waiting Part', 'remarks' => 'ATE', 'mol' => 'MOL 01136', 'pr' => 'PR.HW.2026.07.00189', 'po' => 'PO.MAM.2026.08.05397', 'eta' => '2026-08-27'],
                            ['task_no' => '3', 'problem' => 'Instal Equlizer bar & Pivot Shaft', 'activity' => '3 Instal Equlizer bar & Pivot Shaft', 'status' => 'Waiting Part', 'remarks' => 'MAM', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MD048', 'model' => 'KOMATSU D85ESS', 'hm' => '7010.8', 'loc' => 'HW', 'est_finish' => '2026-08-26', 'aging' => 6, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Radiator Leak', 'activity' => '1,1 Repair & Flushing Radiator', 'status' => 'Waiting Parts', 'remarks' => 'HO', 'mol' => 'JWO 0355', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MD042', 'model' => 'KOMATSU D85ESS', 'hm' => '8052.2', 'loc' => 'HW', 'est_finish' => '2026-08-30', 'aging' => 2, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Radiator Leak', 'activity' => '1,1 Repair & Flushing Radiator', 'status' => 'Waiting Parts', 'remarks' => 'HO', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'A.5 HAULER',
                'units' => [
                    [
                        'unit_no' => 'OHT070', 'model' => 'CAT 773E', 'hm' => '16796.5', 'loc' => 'HW', 'est_finish' => '2026-04-04', 'aging' => 150, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Fuel Dilution', 'activity' => '1,1 Repace Trasnfer Pump', 'status' => 'Done', 'remarks' => 'Trakindo', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,2 Remove Cyl Head', 'status' => 'Done', 'remarks' => 'MAM', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,3 Instal Cyl Head', 'status' => 'Done', 'remarks' => 'MAM', 'mol' => 'MOL 00807', 'pr' => 'PR.HW.2026.05.00189', 'po' => 'PO.MAM.2026.06.04141', 'eta' => '2026-07-15'],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,4 Replace Fan Pully', 'status' => 'Done', 'remarks' => 'MAM', 'mol' => 'MOL 00668', 'pr' => 'PR.HW.2026.04.00279', 'po' => 'PO.MAM.2026.05.03109', 'eta' => '2026-05-14'],
                            ['task_no' => '2', 'problem' => 'Guide Valve Damage', 'activity' => '1,5 Replace Guide Valve', 'status' => 'Done', 'remarks' => 'TU', 'mol' => 'MOL 01186', 'pr' => 'PR.HW.2026.08.00013', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Sensor Temprature Swap to OHT115 Mulfunction', 'activity' => '1,6 Replace Sensor Temprature', 'status' => 'Done', 'remarks' => 'Rusli', 'mol' => 'MOL 01189', 'pr' => 'PR.HW.2026.08.00018', 'po' => 'PO.MAM.2026.08.05027', 'eta' => '2026-08-13'],
                            ['task_no' => '4', 'problem' => 'Sensor TCS Mulfunction Swap OHT115', 'activity' => '1,7 Replace Sensor Tcs', 'status' => 'Done', 'remarks' => 'Anggie', 'mol' => 'MOL 01176', 'pr' => 'PR.HW.2026.08.00048', 'po' => 'PO.MAM.2026.08.05125', 'eta' => '2026-08-14'],
                            ['task_no' => '5', 'problem' => 'Flange Power Train', 'activity' => '1,8 Replac Flange Power Train', 'status' => 'Waiting Parts', 'remarks' => 'Tondok', 'mol' => 'MOL 01266', 'pr' => 'PR.HW.2026.08.00157', 'po' => '', 'eta' => null],
                            ['task_no' => '6', 'problem' => 'Hose Hoist Dump Leak', 'activity' => '1,9 Replace Hose Cyl Dump ( Buat di barong )', 'status' => 'On Progres', 'remarks' => 'Dodik', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '7', 'problem' => 'V-belt AC Broken', 'activity' => '2.1 Replace V-belt AC', 'status' => 'Waiting Parts', 'remarks' => 'Tondok', 'mol' => 'MOL 01343', 'pr' => 'PR.HW.2026.08.00271', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'OHT072', 'model' => 'CAT 773E', 'hm' => '16638.4', 'loc' => 'HW', 'est_finish' => '2026-08-21', 'aging' => 11, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Suspension Keras', 'activity' => '1,1 Check and repair', 'status' => 'Waiting Parts', 'remarks' => 'Trakindo', 'mol' => 'JWO 0348', 'pr' => 'PR.HW.2026.08.00225', 'po' => 'PO.MAM.2026.08.05445', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'OHT073', 'model' => 'CAT 773E', 'hm' => '17018.7', 'loc' => 'HW', 'est_finish' => '2026-08-31', 'aging' => 1, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'AC hot', 'activity' => '1,1 Check and repair', 'status' => 'Waiting Parts', 'remarks' => 'MAM', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'OHT068', 'model' => 'CAT 773E', 'hm' => '17230.3', 'loc' => 'HW', 'est_finish' => '2026-08-31', 'aging' => 1, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'PS 250 H', 'activity' => '1,1 Do PS 250', 'status' => 'On Progres', 'remarks' => 'Sutopo', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Final Drive LH-RH Rating X', 'activity' => '1,2 Plan Remove & Inspect Final Drive', 'status' => 'On Progres', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'A.6. Motorgrader',
                'units' => [
                    [
                        'unit_no' => 'MG021', 'model' => 'CAT 14', 'hm' => '14698.5', 'loc' => 'HW', 'est_finish' => '2026-07-12', 'aging' => 51, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Masuk Speed 1, clutch di lepas unti langsung Engine Shutdown', 'activity' => '1,1 Troublehooting ( Open Job To Trakindo Utama )', 'status' => 'Done', 'remarks' => 'Trakindo', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Found Material Cluth Transmission', 'activity' => '1,2 Remove Transmission', 'status' => 'Done', 'remarks' => 'MAM', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,3 Send Transmission to HO', 'status' => 'Done', 'remarks' => 'MAM', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,4 Recondisi Transmission', 'status' => 'Waiting Part', 'remarks' => 'Trakindo', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'A.7. DUMP TRUCK OB',
                'units' => [
                    [
                        'unit_no' => 'MDT030', 'model' => 'MERCY 2528 AXOR', 'hm' => '10005', 'loc' => 'HW', 'est_finish' => '2025-12-26', 'aging' => 249, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Perseneling Speed tidak bisa masuk speed 1,3,5,7', 'activity' => '1,1 Waiting Transmission From BBE', 'status' => 'Done', 'remarks' => 'Hery Susanto', 'mol' => 'MOL 00295', 'pr' => 'PR.HW.2026.02.00090', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Inspect Transmission', 'activity' => '1,2 Inspect Transmission', 'status' => 'Done', 'remarks' => 'Hery Susanto', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Chamber Brake Leak', 'activity' => '1,3 Replace Chamber Brake', 'status' => 'Done', 'remarks' => 'Hery Susanto', 'mol' => 'MOL 0087', 'pr' => 'PR.HW.2026.01.00065', 'po' => 'PO.MAM.2026.01.00258', 'eta' => '2026-02-02'],
                            ['task_no' => '4', 'problem' => 'Turbo Swap to MDT043', 'activity' => '1,4 Replace Turbo Charger', 'status' => 'Done', 'remarks' => 'Hery Susanto', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '5', 'problem' => 'Mounting Engine Swap to MDT017', 'activity' => '1,5 Replace Mounting Engine', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 0088', 'pr' => 'PR.HW.2026.01.00062', 'po' => 'PO.MAM.2026.01.00373', 'eta' => '2026-02-07'],
                            ['task_no' => '6', 'problem' => 'Sensor Boost Pressure Swap to MDT028', 'activity' => '1,6 Replace Sensor Boost Pressure', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00116', 'pr' => 'PR.HW.2026.01.00113', 'po' => 'PO.MAM.2026.01.00352', 'eta' => '2026-01-19'],
                            ['task_no' => '7', 'problem' => 'Water Pump Swap To MDT022', 'activity' => '1,7 Replace Water Pump', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00142', 'pr' => 'PR.HW.2026.01.00186', 'po' => 'PO.MAM.2026.02.00959', 'eta' => '2026-02-27'],
                            ['task_no' => '8', 'problem' => 'Suction Thermostart Assy Swap MDT028', 'activity' => '1,8 Replace Suction Thermostart', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00116', 'pr' => 'PR.HW.2026.01.00113', 'po' => 'PO.MAM.2026.01.00352', 'eta' => '2026-01-19'],
                            ['task_no' => '9', 'problem' => 'Bracket Engine Mounting Swap to MDT017', 'activity' => '1,9 Replace Bracket Engine Mounting', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00166', 'pr' => 'PR.HW.2026.01.00160', 'po' => 'PO.MAM.2026.01.00546', 'eta' => '2026-01-29'],
                            ['task_no' => '10', 'problem' => 'Chamber Brake Rear Leak Swap to MDT017', 'activity' => '2 Replace Chamber Brake Rear', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 0087', 'pr' => 'PR.HW.2026.01.00065', 'po' => 'PO.MAM.2026.01.00258', 'eta' => '2026-01-22'],
                            ['task_no' => '11', 'problem' => 'Viscouns Fan Swap to MDT028', 'activity' => '2,1 Replace Viscouns Fan', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00166', 'pr' => 'PR.HW.2026.01.00160', 'po' => 'PO.MAM.2026.01.00546', 'eta' => '2026-01-29'],
                            ['task_no' => '12', 'problem' => 'Starting Motor Swap to MDT036', 'activity' => '2,2 Replace Starting Motor', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 0057', 'pr' => 'PR.HW.2026.01.00009', 'po' => 'PO.MAM.2026.01.00255', 'eta' => '2026-01-19'],
                            ['task_no' => '13', 'problem' => 'Hose Booster Cltuch Swap to MDT036', 'activity' => '2,3 Replace Hose Booster Clutch', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 0060', 'pr' => 'PR.HW.2026.01.00033', 'po' => 'PO.MAM.2026.01.00341', 'eta' => '2026-02-04'],
                            ['task_no' => '14', 'problem' => 'Tank Reservoir Radiator Swap to MDT043', 'activity' => '2,4 Replace Tank Reservoir Radiator', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00127', 'pr' => 'PR.HW.2026.01.00120', 'po' => 'PO.MAM.2026.01.00395', 'eta' => '2026-02-09'],
                            ['task_no' => '15', 'problem' => 'Tuas Dump Swap to MDT039', 'activity' => '2,5 Replace Tuas Dump', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00166', 'pr' => 'PR.HW.2026.01.00160', 'po' => 'PO.MAM.2026.01.00546', 'eta' => '2026-01-29'],
                            ['task_no' => '16', 'problem' => 'V-Belt Radiator Swap to MDT022', 'activity' => '2,6 Replace V-Belt Radiator', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00142', 'pr' => 'PR.HW.2026.01.00186', 'po' => 'PO.MAM.2026.02.00959', 'eta' => '2026-02-27'],
                            ['task_no' => '17', 'problem' => 'Tensioner Swap to MDT022', 'activity' => '2,7 Replace Tensioner', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00142', 'pr' => 'PR.HW.2026.01.00186', 'po' => 'PO.MAM.2026.02.00959', 'eta' => '2026-02-27'],
                            ['task_no' => '18', 'problem' => 'Recommended part SWAP', 'activity' => '2,8 Recommended Part', 'status' => 'On Progress', 'remarks' => 'Heri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT022', 'model' => 'MERCY 2528 AXOR', 'hm' => '8563', 'loc' => 'HW', 'est_finish' => '2026-01-27', 'aging' => 217, 'status' => 'ACD',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Engine Block Broken', 'activity' => '1,1 Investigasi Unit', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,2 Remove Engine Send to MRC BBE', 'status' => 'On Progress', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,3 Replace Reman Engine', 'status' => 'Waiting Parts', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00294', 'pr' => 'PR.HW.2026.02.00089', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Spindle Swap To MDT043', 'activity' => '1,4 Repair Spindle to ATE', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => 'JWO 0209', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Transmission Swap to MDT039', 'activity' => '1,5 Replace Transmission', 'status' => 'Waiting Parts', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '4', 'problem' => 'Silincer Air Drier Swap to MDT027', 'activity' => '1,6 Replace Silincer Air Drier', 'status' => 'Waiting Parts', 'remarks' => 'Romi akbar', 'mol' => 'MOL 01213', 'pr' => 'PR.HW.2026.08.00066', 'po' => 'PO.MAM.2026.08.05072', 'eta' => '2026-08-14'],
                            ['task_no' => '5', 'problem' => 'Front Spring Assy RH Swap to MDT012', 'activity' => '1,7 Replace Spring Front RH', 'status' => 'Waiting Parts', 'remarks' => 'Heri Susanto', 'mol' => 'MOL 01088', 'pr' => 'PR.HW.2026.07.00108', 'po' => 'PO.MAM.2026.08.04942', 'eta' => '2026-08-05'],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT035', 'model' => 'MERCY 2528 AXOR', 'hm' => '10826', 'loc' => 'HW', 'est_finish' => '2026-02-09', 'aging' => 204, 'status' => 'ACD',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Firecase', 'activity' => '1,1 Investigasi Unit', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Final Drive Bearing Swap to MDT029', 'activity' => '1,2 Recommended Part', 'status' => 'Waiting Parts', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,3 Replace Air Cleaner', 'status' => 'Waiting Parts', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00297', 'pr' => 'PR.HW.2026.02.00096', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,4 Replace Cover Engine', 'status' => 'Waiting Parts', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,5 Replace all hose', 'status' => 'Waiting Parts', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,6 Reiwring Harness', 'status' => 'Waiting Parts', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Engine Swap to MDT039', 'activity' => '1,7 Remove Engine', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,8 Waiting Engine Repair MDT039', 'status' => 'On Progress', 'remarks' => 'Ambo Mai', 'mol' => 'MOL 00316', 'pr' => 'PR.HW.2026.02.00123', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,8 Repair Liner Engine to ATE', 'status' => 'Waiting Parts', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '4', 'problem' => 'Replay 24 V 5 Kaki Swap to MDT041', 'activity' => '1,9 Replay Relay', 'status' => 'Waiting Parts', 'remarks' => 'Rusli', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT020', 'model' => 'MERCY 2528 AXOR', 'hm' => '9643', 'loc' => 'HW', 'est_finish' => '2026-05-04', 'aging' => 51, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'White Smoke', 'activity' => '1,1 Remove Cyl Head', 'status' => 'Done', 'remarks' => 'Henri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,4 inspect Cyl Head', 'status' => 'Done', 'remarks' => 'Henri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,2 Inspect Injector Post 6', 'status' => 'Done', 'remarks' => 'Henri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,3 Skir Cyl head', 'status' => 'Done', 'remarks' => 'Henri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,4 Regasket Cylinder Head', 'status' => 'Done', 'remarks' => 'Henri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Ground Test 1 hari ( Engine Noise )', 'activity' => '1,5 Overhaul Engine', 'status' => 'Waiting Parts', 'remarks' => 'Henri', 'mol' => 'MOL 01015', 'pr' => 'PR.HW.2026.07.00056', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Expansion Valve Swap to MDT019', 'activity' => '1,6 Replace Expansion Valve', 'status' => 'Done', 'remarks' => 'Putra', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '4', 'problem' => 'Altenator Swap to MDT016', 'activity' => '1,7 Replace Altenator', 'status' => 'On Progress', 'remarks' => 'Rusli', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '5', 'problem' => 'Water Pump Swap to MDT025', 'activity' => '1,8 Replace Water Pump', 'status' => 'Waiting Parts', 'remarks' => 'Natalindo/ Musmuliadi', 'mol' => 'MOL 01032', 'pr' => 'PR.HW.2026.07.00015', 'po' => '', 'eta' => null],
                            ['task_no' => '6', 'problem' => 'Compressor ac Swap to MDT016', 'activity' => '1,9 Replace Compressor AC', 'status' => 'Waiting Parts', 'remarks' => 'Rusli', 'mol' => 'MOL 01119', 'pr' => 'PR.HW.2026.07.00169', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT023', 'model' => 'MERCY 2528 AXOR', 'hm' => '10709', 'loc' => 'HW', 'est_finish' => '2026-05-07', 'aging' => 117, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Top Overhaul Engine', 'activity' => '1,1 Overhaul Engine', 'status' => 'Waiting Manpower', 'remarks' => 'Hendri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT051', 'model' => 'QUESTER CWE 280', 'hm' => '6483.3', 'loc' => 'HW', 'est_finish' => '2026-06-17', 'aging' => 76, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Bolt Transmission Broken', 'activity' => '1,1 Repair hole bolt Housing Transmission to ATE', 'status' => 'Waiting Parts', 'remarks' => 'PT ATE', 'mol' => 'JWO 0218', 'pr' => 'PR.HW.2026.06.00207', 'po' => 'PO.MAM.2026.07.04399', 'eta' => '2026-07-17'],
                            ['task_no' => '2', 'problem' => 'V- Stay Swap to MDT048', 'activity' => '1,2 Replace V-Stay', 'status' => 'Waiting Parts', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Torque Rod Swap To MDT048', 'activity' => '1,3 Replace Torque Rod', 'status' => 'Waiting Parts', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '4', 'problem' => 'Rubber Spring LH Rear Swap to MDT048', 'activity' => '1,4 Replace Rubber Spring LH Rear', 'status' => 'Waiting Parts', 'remarks' => 'Romi akbar', 'mol' => 'MOL 01150', 'pr' => 'PR.HW.2026.07.00233', 'po' => '', 'eta' => null],
                            ['task_no' => '5', 'problem' => 'Sensor Cassis Swap to MDT047', 'activity' => '1,5 Replace Sensor Chassis', 'status' => 'Waiting Parts', 'remarks' => 'Romi akbar', 'mol' => 'MOL 01150', 'pr' => 'PR.HW.2026.07.00233', 'po' => '', 'eta' => null],
                            ['task_no' => '6', 'problem' => 'Housing Fuel Filter Swap to MDT047', 'activity' => '1,6 Replace Housing Fuel Filter', 'status' => 'Waiting Parts', 'remarks' => 'Romi akbar', 'mol' => 'MOL 01150', 'pr' => 'PR.HW.2026.07.00233', 'po' => '', 'eta' => null],
                            ['task_no' => '7', 'problem' => 'Sensing Valve Swap to MDT047', 'activity' => '1,7 Replace Sensing Valve', 'status' => 'Waiting Parts', 'remarks' => 'Romi akbar', 'mol' => 'MOL 01150', 'pr' => 'PR.HW.2026.07.00233', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT021', 'model' => 'MERCY 2528 AXOR', 'hm' => '9390', 'loc' => 'HW', 'est_finish' => '2026-06-27', 'aging' => 66, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Top Overhaul Engine', 'activity' => '1,1 Overhaul Engine', 'status' => 'Waiting Manpower', 'remarks' => 'Henry', 'mol' => 'MOL 01012', 'pr' => 'PR.HW.2026.06.00242', 'po' => 'PO.MAM.2026.07.04541', 'eta' => '2026-07-16'],
                            ['task_no' => '2', 'problem' => 'Radio Swap to MDT041', 'activity' => '1,2 Replace Radio', 'status' => 'On Progress', 'remarks' => 'Rusli', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Expansion Valve Swap to MDT026', 'activity' => '1,3 Replace Expansion Valve', 'status' => 'On Progress', 'remarks' => 'Julianto', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT048', 'model' => 'QUESTER CWE 280', 'hm' => '8418.7', 'loc' => 'HW', 'est_finish' => '2026-06-28', 'aging' => 65, 'status' => 'ACD',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Unit Rebah', 'activity' => '1,1 Investigasi Unit, Moving Unit to Safe Area', 'status' => 'Done', 'remarks' => 'Asuransi', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'V- Stay Swap Dari MDT051', 'activity' => '1,2 Replace V-Stay', 'status' => 'Done', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Torque Rod Swap Dari MDT051', 'activity' => '1,3 Replace Torque Rod', 'status' => 'Done', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '4', 'problem' => 'Rubber Spring LH Rear Swap Dari MDT051', 'activity' => '1,4 Replace Rubber Spring LH Rear', 'status' => 'Done', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,5 Assuransi Unit', 'status' => 'Waiting Parts', 'remarks' => 'Asuransi', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '5', 'problem' => 'Cable Antena Radio Swap to MDT026', 'activity' => '1,6 Replace Cable Antena Radio', 'status' => 'Waiting Parts', 'remarks' => 'Rusli', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '6', 'problem' => 'Battery Swap to MDT019', 'activity' => '1,7 Replace Battery', 'status' => 'Waiting Parts', 'remarks' => 'Rusli', 'mol' => 'MOL 00940', 'pr' => 'PR.HW.2026.07.00021', 'po' => '', 'eta' => null],
                            ['task_no' => '7', 'problem' => 'Repair Body & Painting Body', 'activity' => '1,8 Repair Body & Painting Body', 'status' => 'On Progress', 'remarks' => 'Hafara', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => '2026-08-31'],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT015', 'model' => 'MERCY 2528 AXOR', 'hm' => '11408', 'loc' => 'HW', 'est_finish' => '2026-07-14', 'aging' => 49, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Bolt Transmission Broken', 'activity' => '1,1 Repair Hole Bolt Transmission', 'status' => 'Done', 'remarks' => 'Musmuliadi', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Housing Transmission Swap From MDT041', 'activity' => '1,2 Replace Housing Transmission', 'status' => 'Waiting Manpower', 'remarks' => 'Musmuliadi', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Transmision Swap to MDT041', 'activity' => '1,3 Inspect & Recommended Transmissiion Part', 'status' => 'Waiting Manpower', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '4', 'problem' => 'Battery Swap to MD046', 'activity' => '1,4 Replace Battery', 'status' => 'On Progress', 'remarks' => 'Julianto', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT039', 'model' => 'MERCY 2528 AXOR', 'hm' => '10826', 'loc' => 'HW', 'est_finish' => '2026-07-12', 'aging' => 51, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Engine Noise', 'activity' => '1,1 Towing Unit to Safe AREA', 'status' => 'Done', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,2 Download Data ET', 'status' => 'On Progress', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '1,3 Remove Engine', 'status' => 'Waiting Manpower', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT046', 'model' => 'QUESTER CWE 280', 'hm' => '8116.6', 'loc' => 'HW', 'est_finish' => '2026-07-12', 'aging' => 51, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Engine Noise', 'activity' => '1,1 Replace Engine Swap From Engine di BBE', 'status' => 'Done', 'remarks' => 'Heri Susanto', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Supply Pump cant supply to common rail', 'activity' => '1,2 Remove Supply pump & Inspect', 'status' => 'On Progress', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT025', 'model' => 'MERCY 2528 AXOR', 'hm' => '10082', 'loc' => 'HW', 'est_finish' => '2026-08-10', 'aging' => 22, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Wiring Harnes Short', 'activity' => '1,1 Repair Wiring Harnes', 'status' => 'Done', 'remarks' => 'Putra', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Battery Swap to MDT027', 'activity' => '2,1 Replace Battery', 'status' => 'Waiting Recommended Part', 'remarks' => '', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'sensor valve swap to MDT027', 'activity' => '3,1 Replace sensor valve', 'status' => 'Waiting Recommended Part', 'remarks' => '', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT047', 'model' => 'QUESTER CWE 280', 'hm' => '8524.4', 'loc' => 'HW', 'est_finish' => '2026-08-15', 'aging' => 17, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Engine Noise & Found Particel', 'activity' => '1,1 Inspect & Recommended Part', 'status' => 'Waiting Manpower', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT052', 'model' => 'QUESTER CWE 280', 'hm' => '8566.7', 'loc' => 'HW', 'est_finish' => '2026-08-24', 'aging' => 8, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Spring no 3,4 Broken', 'activity' => '1,1 Replace Spring', 'status' => 'Waiting Parts', 'remarks' => 'Romi akbar', 'mol' => 'MOL 01332', 'pr' => 'PR.HW.2026.08.00244', 'po' => 'PO.MAM.2026.08.05504', 'eta' => '2026-11-27'],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT043', 'model' => 'MERCY 2528 AXOR', 'hm' => '12009', 'loc' => 'HW', 'est_finish' => '2026-08-26', 'aging' => 6, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Torque Rod Broken', 'activity' => '1,1 Check and Repair', 'status' => 'On Progress', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT027', 'model' => 'MERCY 2528 AXOR', 'hm' => '10087', 'loc' => 'HW', 'est_finish' => '2026-08-27', 'aging' => 5, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Gasket cylinder head Leak', 'activity' => '1,1 Remove and inspect', 'status' => 'On Progress', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MDT012', 'model' => 'MERCY 2528 AXOR', 'hm' => '14187', 'loc' => 'HW', 'est_finish' => '2026-08-30', 'aging' => 2, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Spring Post 1 & 4 Broken', 'activity' => '1,1 Replace Spring', 'status' => 'Waiting Parts', 'remarks' => 'Romi akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'A.8 Dump Truck Coal',
                'units' => [],
            ],
            [
                'name' => 'A.9 Compactor',
                'units' => [
                    [
                        'unit_no' => 'MCP003', 'model' => 'SSR220C-8H', 'hm' => '5318', 'loc' => 'HW', 'est_finish' => '2026-08-18', 'aging' => 14, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Cant Running', 'activity' => '1,1 Replace Injector', 'status' => 'On Progress', 'remarks' => 'Kendri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => '2026-08-29'],
                            ['task_no' => '2', 'problem' => 'V-belt Engine Swap to MCP006', 'activity' => '1,2 Replace V-belt Engine', 'status' => 'Done', 'remarks' => 'Martin', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                    [
                        'unit_no' => 'MCP006', 'model' => 'SSR220C-8H', 'hm' => '4445.7', 'loc' => 'HW', 'est_finish' => '2026-08-30', 'aging' => 2, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Engine Noise', 'activity' => '1,1 Remove & Inspect Engine', 'status' => 'On Progress', 'remarks' => 'Kendri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'A.10. MAINHAUL',
                'units' => [
                    [
                        'unit_no' => 'MB001', 'model' => 'Hino', 'hm' => '-', 'loc' => 'HW', 'est_finish' => '2026-01-17', 'aging' => 227, 'status' => 'Unsch',
                        'tasks' => [
                            ['task_no' => '1', 'problem' => 'Injector/Nozzle Fuel problem', 'activity' => '1,1 Repair Injector Nozzle Fuel', 'status' => 'Done', 'remarks' => 'Romi Akbar', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '2', 'problem' => 'Transmission Speed Abnormal', 'activity' => '1,2 Remove Transmission', 'status' => 'Done', 'remarks' => 'Ambo Mai', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '3', 'problem' => 'Output Putaran T/M Problem', 'activity' => '1,3 Replace Release Bearing', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '4', 'problem' => 'Pipe Master Coupling Leak', 'activity' => '1,4 Replace Disc Clutch ( Beli By Contoh)', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '5', 'problem' => 'Battery Low Voltage', 'activity' => '1,5 Instal Pedal Coupling Spring', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '6', 'problem' => 'Transmission Abnormal', 'activity' => '1,6 Rewiring to Starting Motor', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '7', 'problem' => 'Seal Master Clutch Upper', 'activity' => '1,7 Replace Master Coupling', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => 'MOL 00444', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '8', 'problem' => 'Hand Brake Worn Out', 'activity' => '1,8 Jumper Battery', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '9', 'problem' => 'Fip Worn Out', 'activity' => '1,9 Replace Starting Motor Repair', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '10', 'problem' => '4 Nozzle Fuel', 'activity' => '1,2 Trooubleshooring Wiring Short', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '11', 'problem' => 'Transmission Abnormal', 'activity' => '1,9 Bleeding Clutch', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '12', 'problem' => 'Handle T/m Abnormal', 'activity' => '2 Replace Pipe Master Coupling', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '13', 'problem' => 'Overhaul T/M ( Recommended Part)', 'activity' => '2,1 Replace Battery', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => 'MOL 00418', 'pr' => 'PR.HW.2026.03.00028', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '2,2 Troubleshooting Transmisison', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => 'MOL 00418', 'pr' => 'PR.HW.2026.03.00028', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '2,3 Replace Seal Master Clutch', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => 'MOL 00455', 'pr' => 'PR.HW.2026.03.00095', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '2,4 Replace Hand Brake Pad', 'status' => 'Done', 'remarks' => 'Andri', 'mol' => '', 'pr' => '', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '2,5 Calibrasi FIP TO ATE', 'status' => 'Done', 'remarks' => 'PT ATE', 'mol' => 'JWO 078', 'pr' => 'PR.HW.2026.03.00162', 'po' => '', 'eta' => null],
                            ['task_no' => '', 'problem' => '', 'activity' => '2,6 Calibrasi Nozzle TO ATE', 'status' => 'Done', 'remarks' => 'PT ATE', 'mol' => 'JWO 078', 'pr' => 'PR.HW.2026.03.00162', 'po' => '', 'eta' => null],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($data as $category) {
            $groupName = $category['name'];

            foreach ($category['units'] as $unitData) {
                // Find or create Unit
                $unit = Unit::where('code_unit', $unitData['unit_no'])->first();
                if (! $unit) {
                    $unit = Unit::create([
                        'code_unit' => $unitData['unit_no'],
                        'model' => $unitData['model'],
                        'status' => 'Active',
                    ]);
                }

                $breakdown = Breakdown::create([
                    'unit_id' => $unit->id,
                    'equipment_group' => $groupName,
                    'loc' => $unitData['loc'],
                    'hm' => $unitData['hm'],
                    'est_finish' => $unitData['est_finish'],
                    'aging' => $unitData['aging'],
                    'status' => $unitData['status'],
                    'date' => Carbon::now()->format('Y-m-d'),
                ]);

                foreach ($unitData['tasks'] as $taskData) {
                    BreakdownTask::create([
                        'breakdown_id' => $breakdown->id,
                        'task_no' => $taskData['task_no'] ?: null,
                        'problem' => $taskData['problem'],
                        'activity' => $taskData['activity'],
                        'status' => $taskData['status'],
                        'remarks' => $taskData['remarks'],
                        'mol' => $taskData['mol'],
                        'pr' => $taskData['pr'],
                        'po' => $taskData['po'],
                        'eta' => $taskData['eta'],
                    ]);
                }
            }
        }
    }
}
