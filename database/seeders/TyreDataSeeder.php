<?php

namespace Database\Seeders;

use App\Models\Tyre;
use App\Models\TyreHistory;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class TyreDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rawData = '[
  { "unit_code": "OHT066", "curr_smu": 16090.3, "pos": "Pos 2", "serial_number": "24111217101", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 62, "remain_tread": 62, "wear_percentage": 0.0, "date_install": "2025-09-04", "smu_fitment": 16090.3, "prev_life": 0, "current_life_time": 2373, "total_lifetime_hm": 2373, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": 627, "plan_rotation_date": "2026-10-13", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "NEW TYRE ORI OHT066" },
  { "unit_code": "CAT773", "curr_smu": 17296.9, "pos": "Pos 4", "serial_number": "DA124065016060", "brand": "TECHKING", "size": "24.00R35", "pattern": "SUPER TRAC", "otd": 65, "remain_tread": 55, "wear_percentage": 15.4, "date_install": "2025-04-05", "smu_fitment": 14423.1, "prev_life": 2151, "current_life_time": 1166, "total_lifetime_hm": 4040, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "EKS OHT095#2" },
  { "unit_code": "CAT773", "curr_smu": 17296.9, "pos": "Pos 5", "serial_number": "1361978100", "brand": "TECHKING", "size": "24.00R35", "pattern": "FORT ROT", "otd": 65, "remain_tread": 44, "wear_percentage": 32.3, "date_install": "2025-09-17", "smu_fitment": 16240.3, "prev_life": 0, "current_life_time": 2223, "total_lifetime_hm": 2223, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "REPAIR", "remarks": "REP OHT066 EKS REPAIR TJM" },
  { "unit_code": "OHT067", "curr_smu": 16310.8, "pos": "Pos 2", "serial_number": "24301217401", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 62, "remain_tread": 62, "wear_percentage": 0.0, "date_install": "2025-09-04", "smu_fitment": 14883.0, "prev_life": 0, "current_life_time": 1428, "total_lifetime_hm": 1428, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": 1572, "plan_rotation_date": "2026-11-25", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "NEW ORI OHT067" },
  { "unit_code": "OHT067", "curr_smu": 16310.8, "pos": "Pos 4", "serial_number": "24101027002", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 62, "remain_tread": 55, "wear_percentage": 11.3, "date_install": "2025-11-09", "smu_fitment": 15506.0, "prev_life": 2969.6, "current_life_time": 805, "total_lifetime_hm": 3774, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT067 EKS OHT059#1" },
  { "unit_code": "OHT067", "curr_smu": 16310.8, "pos": "Pos 5", "serial_number": "460255131201", "brand": "MAXAM", "size": "24.00R35", "pattern": "MS401", "otd": 89, "remain_tread": 55, "wear_percentage": 38.2, "date_install": "2025-11-26", "smu_fitment": 15718.6, "prev_life": 2962.8, "current_life_time": 592, "total_lifetime_hm": 3555, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT067 EKS OHT088#1" },
  { "unit_code": "OHT067", "curr_smu": 16310.8, "pos": "Pos 6", "serial_number": "DA124095073410", "brand": "TECHKING", "size": "24.00R35", "pattern": "SUPER TRAC", "otd": 68, "remain_tread": 52, "wear_percentage": 23.5, "date_install": "2025-08-01", "smu_fitment": 14576.0, "prev_life": 3398.0, "current_life_time": 1795, "total_lifetime_hm": 5132, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT067 EKS OHT068#6" },
  { "unit_code": "OHT068", "curr_smu": 17167.7, "pos": "Pos 2", "serial_number": "KA240594409", "brand": "AEOLUS", "size": "24.00R35", "pattern": "AE415", "otd": 71, "remain_tread": 63, "wear_percentage": 11.3, "date_install": "2025-09-03", "smu_fitment": 15154.3, "prev_life": 0, "current_life_time": 2013, "total_lifetime_hm": 2013, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": 987, "plan_rotation_date": "2026-12-06", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "NEW ORI OHT068" },
  { "unit_code": "OHT068", "curr_smu": 17167.7, "pos": "Pos 4", "serial_number": "24061417601", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 71, "remain_tread": 53, "wear_percentage": 25.4, "date_install": "2025-11-19", "smu_fitment": 15621.1, "prev_life": 3920.7, "current_life_time": 1547, "total_lifetime_hm": 5467, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT068 EKS OHT094#2" },
  { "unit_code": "OHT068", "curr_smu": 17167.7, "pos": "Pos 5", "serial_number": "53X07CF94", "brand": "WINDA", "size": "24.00R35", "pattern": "WDAZ", "otd": 62, "remain_tread": 51, "wear_percentage": 17.7, "date_install": "2025-07-14", "smu_fitment": 15174.5, "prev_life": 1035.0, "current_life_time": 1993, "total_lifetime_hm": 3028, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT068 EKS OHT061#1" },
  { "unit_code": "OHT068", "curr_smu": 17167.7, "pos": "Pos 6", "serial_number": "53X056F9A", "brand": "WINDA", "size": "24.00R35", "pattern": "WDAZ", "otd": 62, "remain_tread": 48, "wear_percentage": 22.6, "date_install": "2025-10-14", "smu_fitment": 15174.5, "prev_life": 2992.5, "current_life_time": 1993, "total_lifetime_hm": 4986, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT068 EKS OHT061#2" },
  { "unit_code": "OHT069", "curr_smu": 18155.1, "pos": "Pos 3", "serial_number": "DA12506503796D", "brand": "TECHKING", "size": "24.00R35", "pattern": "FORT ROT", "otd": 65, "remain_tread": 46, "wear_percentage": 29.2, "date_install": "2025-11-14", "smu_fitment": 15962.1, "prev_life": 0, "current_life_time": 2193, "total_lifetime_hm": 2193, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": 868, "plan_rotation_date": "2026-12-08", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "ORI OHT069 EKS REPAIR TJM" },
  { "unit_code": "OHT069", "curr_smu": 18155.1, "pos": "Pos 4", "serial_number": "1210201011", "brand": "MAXAM", "size": "24.00R35", "pattern": "MS401", "otd": 89, "remain_tread": 55, "wear_percentage": 38.2, "date_install": "2025-11-16", "smu_fitment": 15969.4, "prev_life": 2536.0, "current_life_time": 2186, "total_lifetime_hm": 4722, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT069 EKS OHT085#6" },
  { "unit_code": "OHT069", "curr_smu": 18155.1, "pos": "Pos 5", "serial_number": "DA123115022410", "brand": "TECHKING", "size": "24.00R35", "pattern": "SUPER TRAC", "otd": 65, "remain_tread": 46, "wear_percentage": 29.2, "date_install": "2025-11-13", "smu_fitment": 15962.1, "prev_life": 0, "current_life_time": 2193, "total_lifetime_hm": 2193, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "REPAIR", "remarks": "REP OHT069 EKS REPAIR TJM" },
  { "unit_code": "OHT069", "curr_smu": 18155.1, "pos": "Pos 6", "serial_number": "24080437601", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 65, "remain_tread": 53, "wear_percentage": 21.5, "date_install": "2026-04-07", "smu_fitment": 17141.0, "prev_life": 5253.0, "current_life_time": 1014, "total_lifetime_hm": 6267, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT069 EKS OHT074#6" },
  { "unit_code": "OHT070", "curr_smu": 16796.5, "pos": "Pos 1", "serial_number": "24101237801", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 62, "remain_tread": 62, "wear_percentage": 0.0, "date_install": "2025-09-18", "smu_fitment": 15446.0, "prev_life": 0, "current_life_time": 1351, "total_lifetime_hm": 1351, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": 1650, "plan_rotation_date": "2026-11-28", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "NEW TYRE ORI OHT070" },
  { "unit_code": "OHT070", "curr_smu": 16796.5, "pos": "Pos 3", "serial_number": "DA124035021400", "brand": "TECHKING", "size": "24.00R35", "pattern": "SUPER TRAC", "otd": 62, "remain_tread": 43, "wear_percentage": 30.6, "date_install": "2025-05-01", "smu_fitment": 16657.1, "prev_life": 5973.0, "current_life_time": 139, "total_lifetime_hm": 6112, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT070 EKS OHT100#3" },
  { "unit_code": "OHT071", "curr_smu": 17531.8, "pos": "Pos 2", "serial_number": "24111327101", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 60, "remain_tread": 60, "wear_percentage": 0.0, "date_install": "2025-08-27", "smu_fitment": 14884.0, "prev_life": 0, "current_life_time": 2648, "total_lifetime_hm": 2648, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": 352, "plan_rotation_date": "2026-10-01", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "NEW ORI OHT071" },
  { "unit_code": "OHT071", "curr_smu": 17531.8, "pos": "Pos 3", "serial_number": "DA124065083140", "brand": "TECHKING", "size": "24.00R35", "pattern": "SUPER TRAC", "otd": 65, "remain_tread": 56, "wear_percentage": 13.8, "date_install": "2025-07-19", "smu_fitment": 14242.9, "prev_life": 2699.0, "current_life_time": 3289, "total_lifetime_hm": 5988, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT071 EKS OHT092#4" },
  { "unit_code": "OHT072", "curr_smu": 16638.4, "pos": "Pos 2", "serial_number": "53927AF9B", "brand": "WINDA", "size": "24.00R35", "pattern": "WDAZ", "otd": 65, "remain_tread": 65, "wear_percentage": 0.0, "date_install": "2025-07-31", "smu_fitment": 14131.3, "prev_life": 0, "current_life_time": 2507, "total_lifetime_hm": 2507, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": 493, "plan_rotation_date": "2026-10-07", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "NEW ORI OHT072" },
  { "unit_code": "OHT072", "curr_smu": 16638.4, "pos": "Pos 3", "serial_number": "KA240554568", "brand": "AEOLUS", "size": "24.00R35", "pattern": "AE419", "otd": 89, "remain_tread": 33, "wear_percentage": 62.9, "date_install": "2025-12-09", "smu_fitment": 15921.2, "prev_life": 3019.4, "current_life_time": 717, "total_lifetime_hm": 3737, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT072 EKS OHT093#1" },
  { "unit_code": "OHT073", "curr_smu": 16705.0, "pos": "Pos 2", "serial_number": "KB240592720", "brand": "AEOLUS", "size": "24.00R35", "pattern": "AE415", "otd": 66, "remain_tread": 66, "wear_percentage": 0.0, "date_install": "2026-04-20", "smu_fitment": 16705.0, "prev_life": 0, "current_life_time": 282, "total_lifetime_hm": 282, "cph": 19.38, "plan_target_hm": 3000, "remain_lt_rotation": 2718, "plan_rotation_date": "2027-01-16", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "NEW ORI OHT073" },
  { "unit_code": "OHT073", "curr_smu": 16705.0, "pos": "Pos 5", "serial_number": "DA123123088100", "brand": "TECHKING", "size": "24.00R35", "pattern": "SUPER TRAC", "otd": 65, "remain_tread": 47, "wear_percentage": 27.7, "date_install": "2025-08-27", "smu_fitment": 14602.0, "prev_life": 3040.4, "current_life_time": 2385, "total_lifetime_hm": 5425, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT073 EKS OHT095#2" },
  { "unit_code": "OHT074", "curr_smu": 16751.0, "pos": "Pos 2", "serial_number": "22051037201", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 60, "remain_tread": 55, "wear_percentage": 8.3, "date_install": "2025-08-26", "smu_fitment": 14627.4, "prev_life": 2342.9, "current_life_time": 2124, "total_lifetime_hm": 4467, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": 1913, "plan_rotation_date": "2026-12-10", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "ORI OHT074 EKS OHT057#1" },
  { "unit_code": "OHT074", "curr_smu": 16751.0, "pos": "Pos 5", "serial_number": "480455131203", "brand": "MAXAM", "size": "24.00R35", "pattern": "M5401", "otd": 89, "remain_tread": 53, "wear_percentage": 40.4, "date_install": "2026-08-16", "smu_fitment": 16661.0, "prev_life": 3759.2, "current_life_time": 90, "total_lifetime_hm": 3849, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT074 EKS OHT073#1" },
  { "unit_code": "OHT075", "curr_smu": 16508.7, "pos": "Pos 2", "serial_number": "361730201140", "brand": "MAXAM", "size": "24.00R35", "pattern": "M5401", "otd": 60, "remain_tread": 58, "wear_percentage": 3.3, "date_install": "2025-08-26", "smu_fitment": 13692.3, "prev_life": 2360.4, "current_life_time": 2816, "total_lifetime_hm": 5177, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": 184, "plan_rotation_date": "2026-09-23", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "ORI OHT075 EKS OHT075#2" },
  { "unit_code": "OHT075", "curr_smu": 16508.7, "pos": "Pos 5", "serial_number": "53R002559", "brand": "BRIDGESTONE", "size": "24.00R35", "pattern": "VMTP", "otd": 68, "remain_tread": 45, "wear_percentage": 33.8, "date_install": "2025-07-04", "smu_fitment": 12869.3, "prev_life": 10437.0, "current_life_time": 3639, "total_lifetime_hm": 14076, "cph": 28680.28, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORI OHT075 EKS OHT074#3" },
  { "unit_code": "OHT115", "curr_smu": 6269.0, "pos": "Pos 3", "serial_number": "08231CU14", "brand": "GOOD YEAR", "size": "24.00R35", "pattern": "RT-4A", "otd": 65, "remain_tread": 65, "wear_percentage": 0.0, "date_install": "2026-01-13", "smu_fitment": 4407.9, "prev_life": 0, "current_life_time": 1861, "total_lifetime_hm": 6269, "cph": 2.94, "plan_target_hm": 3000, "remain_lt_rotation": 1139, "plan_rotation_date": "2026-11-05", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "ORIGINAL BY UNIT ORI OHT115" },
  { "unit_code": "OHT115", "curr_smu": 6269.0, "pos": "Pos 5", "serial_number": "0423KASB", "brand": "GOOD YEAR", "size": "24.00R35", "pattern": "RT-4A", "otd": 65, "remain_tread": 61, "wear_percentage": 6.2, "date_install": "2026-06-27", "smu_fitment": 5952.0, "prev_life": 0, "current_life_time": 317, "total_lifetime_hm": 6269, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORIGINAL BY UNIT ORI OHT115" },
  { "unit_code": "OHT116", "curr_smu": 6936.5, "pos": "Pos 2", "serial_number": "DA125065086060", "brand": "TECHKING", "size": "24.00R35", "pattern": "ETDT", "otd": 65, "remain_tread": 65, "wear_percentage": 0.0, "date_install": "2026-01-14", "smu_fitment": 4392.9, "prev_life": 0, "current_life_time": 2544, "total_lifetime_hm": 2544, "cph": 2.15, "plan_target_hm": 3000, "remain_lt_rotation": 456, "plan_rotation_date": "2026-10-05", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "NEW ORI OHT116" },
  { "unit_code": "OHT116", "curr_smu": 6936.5, "pos": "Pos 5", "serial_number": "012330487", "brand": "GOOD YEAR", "size": "24.00R35", "pattern": "KT-4A", "otd": 65, "remain_tread": 65, "wear_percentage": 0.0, "date_install": "2026-01-14", "smu_fitment": 0.0, "prev_life": 0, "current_life_time": 6937, "total_lifetime_hm": 6937, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORIGINAL BY UNIT ORI OHT116" },
  { "unit_code": "OHT117", "curr_smu": 6856.7, "pos": "Pos 2", "serial_number": "KB240590377", "brand": "AEOLUS", "size": "24.00R35", "pattern": "AE415", "otd": 62, "remain_tread": 62, "wear_percentage": 0.0, "date_install": "2025-11-12", "smu_fitment": 3466.6, "prev_life": 5033.0, "current_life_time": 3390, "total_lifetime_hm": 6857, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": -390, "plan_rotation_date": "2026-08-28", "plan_action_remark": "please rotate to rear position", "status": "ACTIVE", "remarks": "NEW ORI OHT117" },
  { "unit_code": "OHT117", "curr_smu": 6856.7, "pos": "Pos 4", "serial_number": "04231001", "brand": "GOOD YEAR", "size": "24.00R35", "pattern": "RT-4B", "otd": 62, "remain_tread": 62, "wear_percentage": 0.0, "date_install": "2025-11-12", "smu_fitment": 0.0, "prev_life": 0, "current_life_time": 1824, "total_lifetime_hm": 6857, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "TYRE SPARE EKS ORI OHT117" },
  { "unit_code": "OHT118", "curr_smu": 7050.7, "pos": "Pos 1", "serial_number": "24101227401", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 62, "remain_tread": 62, "wear_percentage": 0.0, "date_install": "2025-12-09", "smu_fitment": 3932.2, "prev_life": 0, "current_life_time": 3119, "total_lifetime_hm": 3119, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": -119, "plan_rotation_date": "2026-09-09", "plan_action_remark": "please rotate to rear position", "status": "ACTIVE", "remarks": "NEW ORI OHT118" },
  { "unit_code": "OHT118", "curr_smu": 7050.7, "pos": "Pos 3", "serial_number": "0423JCD04", "brand": "GOOD YEAR", "size": "24.00R35", "pattern": "RT-4A", "otd": 62, "remain_tread": 62, "wear_percentage": 0.0, "date_install": "2025-12-09", "smu_fitment": 0.0, "prev_life": 0, "current_life_time": 7051, "total_lifetime_hm": 7051, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORIGINAL BY UNIT ORI OHT118" },
  { "unit_code": "OHT119", "curr_smu": 6811.8, "pos": "Pos 1", "serial_number": "DA12506S08604D", "brand": "TECHKING", "size": "24.00R35", "pattern": "ETDT", "otd": 65, "remain_tread": 65, "wear_percentage": 0.0, "date_install": "2026-01-14", "smu_fitment": 4410.2, "prev_life": 0, "current_life_time": 2402, "total_lifetime_hm": 2402, "cph": 2.28, "plan_target_hm": 3000, "remain_lt_rotation": 598, "plan_rotation_date": "2026-10-12", "plan_action_remark": "Next time", "status": "ACTIVE", "remarks": "NEW ORI OHT119" },
  { "unit_code": "OHT119", "curr_smu": 6811.8, "pos": "Pos 3", "serial_number": "0723JCF92", "brand": "GOOD YEAR", "size": "24.00R35", "pattern": "RT-4A", "otd": 65, "remain_tread": 65, "wear_percentage": 0.0, "date_install": "2026-01-14", "smu_fitment": 0.0, "prev_life": 0, "current_life_time": 6812, "total_lifetime_hm": 6812, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORIGINAL BY UNIT ORI OHT119" },
  { "unit_code": "OHT120", "curr_smu": 6908.4, "pos": "Pos 1", "serial_number": "24100527301", "brand": "TRIANGLE", "size": "24.00R35", "pattern": "TB526S", "otd": 62, "remain_tread": 62, "wear_percentage": 0.0, "date_install": "2025-10-10", "smu_fitment": 3210.1, "prev_life": 0, "current_life_time": 3698, "total_lifetime_hm": 3698, "cph": null, "plan_target_hm": 3000, "remain_lt_rotation": -698, "plan_rotation_date": "2026-08-14", "plan_action_remark": "please rotate to rear position", "status": "ACTIVE", "remarks": "NEW ORI OHT120" },
  { "unit_code": "OHT120", "curr_smu": 6908.4, "pos": "Pos 3", "serial_number": "0523JCA70", "brand": "GOOD YEAR", "size": "24.00R35", "pattern": "RT-4A", "otd": 62, "remain_tread": 62, "wear_percentage": 0.0, "date_install": "2025-10-10", "smu_fitment": 0.0, "prev_life": 0, "current_life_time": 6908, "total_lifetime_hm": 6908, "cph": null, "plan_target_hm": null, "remain_lt_rotation": null, "plan_rotation_date": null, "plan_action_remark": null, "status": "ACTIVE", "remarks": "ORIGINAL BY UNIT ORI OHT120" }
]';

        $records = json_decode($rawData, true);

        foreach ($records as $item) {
            // Check if Unit exists, if not, create it
            $unit = Unit::firstOrCreate(
                ['code_unit' => $item['unit_code']],
                [
                    'type_unit' => 'DUMP TRUCK',
                    'hm' => $item['curr_smu'],
                ]
            );

            // Update HM Unit to match the data if it differs
            if ($unit->hm != $item['curr_smu']) {
                $unit->update(['hm' => $item['curr_smu']]);
            }

            // Combine remarks
            $notes = $item['remarks'];
            if (! empty($item['plan_action_remark'])) {
                $notes .= ' | '.$item['plan_action_remark'];
            }

            // Parse Pos
            $pos = $item['pos'];
            if (is_numeric($pos)) {
                $pos = 'Pos '.$pos;
            }

            // If condition is REPAIR, we might not set it to unit_id / pos as per logic,
            // but the JSON states they have pos and unit_code. Our logic says REPAIR unassigns.
            // Let's follow the JSON strictly but ensure our application logic holds up.
            // Actually, we can assign them unit and pos, our model allows it, even if it is REPAIR.
            $tyre = Tyre::updateOrCreate(
                ['serial_number' => $item['serial_number']],
                [
                    'brand' => $item['brand'],
                    'type_size' => $item['size'],
                    'pattern' => $item['pattern'],
                    'otd' => $item['otd'],
                    'rtd' => $item['remain_tread'],
                    'condition' => $item['status'],
                    'unit_id' => $unit->id,
                    'position' => $pos,
                    'installed_hm' => $item['smu_fitment'],
                    'total_hm' => $item['prev_life'],
                    'plan_rotary_target' => $item['plan_target_hm'] ?? 3000,
                    'notes' => $notes,
                    'purchase_date' => $item['date_install'],
                ]
            );

            // Seed a history record as well to mark the install/current state
            TyreHistory::firstOrCreate([
                'tyre_id' => $tyre->id,
                'unit_id' => $unit->id,
                'event_type' => 'INSTALL',
                'hm_at_event' => $item['smu_fitment'],
                'event_date' => $item['date_install'],
            ], [
                'to_position' => $pos,
                'notes' => 'Seeded from JSON Import',
            ]);
        }
    }
}
