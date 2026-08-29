<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ManpowerBudget;
use App\Models\OrganizationNode;
use Illuminate\Support\Facades\DB;

class OrgAndManpowerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Manpower Budget Seeder
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        ManpowerBudget::truncate();
        OrganizationNode::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $staffs = [
            ['Superintendent Plant', 1, 1],
            ['Maintenance Planner', 2, 2],
            ['Supervisor Plant', 4, 3],
            ['Supervisor Tyre', 1, 1],
            ['Supervisor Electric', 1, 0],
            ['Foreman Mechanic', 5, 5],
            ['Foreman Service', 2, 1],
            ['Foreman Welder', 2, 1],
            ['Foreman Electric', 2, 1],
            ['Foreman Tyre', 1, 1],
        ];

        foreach ($staffs as $staff) {
            ManpowerBudget::create([
                'category' => 'Staff',
                'job_position' => $staff[0],
                'plan_mp' => $staff[1],
                'tersedia' => $staff[2]
            ]);
        }

        $nonStaffs = [
            ['Inspection', 2, 0],
            ['Operator Lubecar', 2, 2],
            ['Greasing & Autolube', 4, 0],
            ['Operator Washing Truck', 2, 1],
            ['Washing Man', 4, 4],
            ['Serviceman I', 2, 0],
            ['Serviceman II', 3, 2],
            ['Serviceman III', 5, 4],
            ['Helper Service', 3, 3],
            ['Mechanic I', 4, 3],
            ['Mechanic II', 7, 6],
            ['Mechanic III', 8, 8],
            ['Helper Mekanik', 3, 2],
            ['Welder I', 2, 0],
            ['Welder II', 3, 3],
            ['Welder III', 3, 0],
            ['Helper Welder', 1, 0],
            ['Electrician I', 4, 4],
            ['Electrician II', 2, 0],
            ['Electrician III', 2, 0],
            ['Tyreman I', 2, 0],
            ['Tyreman II', 2, 1],
            ['Tyreman III', 3, 2],
            ['Helper Tyreman', 2, 0],
            ['Operator Crane', 2, 0],
            ['Rigger', 2, 0],
            ['Toolskeeper & Dispacher', 2, 2],
            ['Officer Plant', 1, 1],
            ['Administrasi', 1, 1],
        ];

        foreach ($nonStaffs as $nonStaff) {
            ManpowerBudget::create([
                'category' => 'Non Staff',
                'job_position' => $nonStaff[0],
                'plan_mp' => $nonStaff[1],
                'tersedia' => $nonStaff[2]
            ]);
        }

        // 2. Organization Node Seeder
        $pm = OrganizationNode::create(['jabatan' => 'PROJECT MANAGER', 'name' => 'Supardi Halim']);
        $plantMgr = OrganizationNode::create(['jabatan' => 'PLANT MANAGER (HO)', 'name' => 'DADANG PRAYOGO']);
        
        $supt = OrganizationNode::create(['parent_id' => $pm->id, 'jabatan' => 'Superintendent', 'name' => 'Ambo Mai']);

        // Supervisors
        $spvPlanner = OrganizationNode::create(['parent_id' => $supt->id, 'jabatan' => 'Supervisor Planner', 'name' => 'Mukti Alie']);
        $spvPrev = OrganizationNode::create(['parent_id' => $supt->id, 'jabatan' => 'Supervisor Preventive & Predictive maintenance', 'name' => 'Sutopo']);
        $spvCorr = OrganizationNode::create(['parent_id' => $supt->id, 'jabatan' => 'Supervisor Corrective Maintenance']);
        
        // Add SPV Corr members (since there are 3 positions, we'll just assign them as children of the SPV role, or just list the SPVs)
        // Wait, the PDF shows Supervisor Corrective Maintenance has 1. Romy Akbar, 2. Fendi Fratama, 3. Vacant.
        // It's a single box with 3 people. For simplicity, we can create a node for each person, or a node for the position and children for the people.
        // Let's create the position node, and the people as children with same jabatan but different names.
        // Actually, the box says "Supervisor Corrective Maintenance", so they are all Supervisors.
        $spvCorr1 = OrganizationNode::create(['parent_id' => $supt->id, 'jabatan' => 'Supervisor Corrective Maintenance', 'name' => 'Romy Akbar']);
        $spvCorr2 = OrganizationNode::create(['parent_id' => $supt->id, 'jabatan' => 'Supervisor Corrective Maintenance', 'name' => 'Fendi Fratama']);
        $spvCorr3 = OrganizationNode::create(['parent_id' => $supt->id, 'jabatan' => 'Supervisor Corrective Maintenance', 'name' => 'Vacant', 'is_vacant' => true]);

        $spvElec = OrganizationNode::create(['parent_id' => $supt->id, 'jabatan' => 'Supervisor Electrical', 'name' => 'Vacant', 'is_vacant' => true]);
        $spvTyre = OrganizationNode::create(['parent_id' => $supt->id, 'jabatan' => 'Supervisor Tyre', 'name' => 'Imam Moedji Santoso']);

        // --- Planner Branch ---
        $fmPlanner = OrganizationNode::create(['parent_id' => $spvPlanner->id, 'jabatan' => 'Foreman Planner', 'name' => 'Yansen']);
        OrganizationNode::create(['parent_id' => $fmPlanner->id, 'jabatan' => 'OFFICE PLANT', 'name' => 'Andika Rukmono']);
        OrganizationNode::create(['parent_id' => $fmPlanner->id, 'jabatan' => 'ADMIN PLANT', 'name' => 'Nur Dwi Hidayanti']);
        
        $tkd = OrganizationNode::create(['parent_id' => $fmPlanner->id, 'jabatan' => 'TOOLSKEEPERT & DISPACHER']);
        OrganizationNode::create(['parent_id' => $tkd->id, 'jabatan' => 'Toolskeeper & Dispacher', 'name' => 'Ignasius Fredy']);
        OrganizationNode::create(['parent_id' => $tkd->id, 'jabatan' => 'Toolskeeper & Dispacher', 'name' => 'Herdi Chandra (Helper)']);

        // --- Preventive Branch ---
        $fmPrev = OrganizationNode::create(['parent_id' => $spvPrev->id, 'jabatan' => 'Foreman Preventive & Predictive maintenance']);
        OrganizationNode::create(['parent_id' => $fmPrev->id, 'jabatan' => 'Foreman', 'name' => 'Ichsan Kholif Arrahman']);
        OrganizationNode::create(['parent_id' => $fmPrev->id, 'jabatan' => 'Foreman', 'name' => 'Vacant', 'is_vacant' => true]);

        $inspector = OrganizationNode::create(['parent_id' => $spvPrev->id, 'jabatan' => 'INSPECTOR']);
        OrganizationNode::create(['parent_id' => $inspector->id, 'jabatan' => 'Inspector', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $inspector->id, 'jabatan' => 'Inspector', 'name' => 'Vacant', 'is_vacant' => true]);

        $lubecar = OrganizationNode::create(['parent_id' => $spvPrev->id, 'jabatan' => 'OPERATOR LUBECAR']);
        OrganizationNode::create(['parent_id' => $lubecar->id, 'jabatan' => 'Operator Lubecar', 'name' => 'M. Abbas']);
        OrganizationNode::create(['parent_id' => $lubecar->id, 'jabatan' => 'Operator Lubecar', 'name' => 'Hamka']);

        $greasing = OrganizationNode::create(['parent_id' => $lubecar->id, 'jabatan' => 'GREASING & AUTOLUBE']);
        OrganizationNode::create(['parent_id' => $greasing->id, 'jabatan' => 'Greasing', 'name' => 'Rahmat Hidayat']);
        OrganizationNode::create(['parent_id' => $greasing->id, 'jabatan' => 'Greasing', 'name' => 'Chandra Kristian']);
        OrganizationNode::create(['parent_id' => $greasing->id, 'jabatan' => 'Greasing', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $greasing->id, 'jabatan' => 'Greasing', 'name' => 'Vacant', 'is_vacant' => true]);

        $washing = OrganizationNode::create(['parent_id' => $greasing->id, 'jabatan' => 'WASHINGMAN']);
        OrganizationNode::create(['parent_id' => $washing->id, 'jabatan' => 'Washingman', 'name' => 'Ardian Effendi (Driver WT)']);
        OrganizationNode::create(['parent_id' => $washing->id, 'jabatan' => 'Washingman', 'name' => 'Daniel Alexander']);
        OrganizationNode::create(['parent_id' => $washing->id, 'jabatan' => 'Washingman', 'name' => 'Iwan Hendra K.']);
        OrganizationNode::create(['parent_id' => $washing->id, 'jabatan' => 'Washingman', 'name' => 'Abisai']);
        OrganizationNode::create(['parent_id' => $washing->id, 'jabatan' => 'Washingman', 'name' => 'Alon Kmino']);

        // --- Preventive Services ---
        $sv1 = OrganizationNode::create(['parent_id' => $fmPrev->id, 'jabatan' => 'SERVICEMAN I']);
        OrganizationNode::create(['parent_id' => $sv1->id, 'jabatan' => 'Serviceman I', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $sv1->id, 'jabatan' => 'Serviceman I', 'name' => 'Vacant', 'is_vacant' => true]);

        $sv2 = OrganizationNode::create(['parent_id' => $sv1->id, 'jabatan' => 'SERVICEMAN II']);
        OrganizationNode::create(['parent_id' => $sv2->id, 'jabatan' => 'Serviceman II', 'name' => 'Abdilah']);
        OrganizationNode::create(['parent_id' => $sv2->id, 'jabatan' => 'Serviceman II', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $sv2->id, 'jabatan' => 'Serviceman II', 'name' => 'Vacant', 'is_vacant' => true]);

        $sv3 = OrganizationNode::create(['parent_id' => $sv2->id, 'jabatan' => 'SERVICEMAN III']);
        OrganizationNode::create(['parent_id' => $sv3->id, 'jabatan' => 'Serviceman III', 'name' => 'Fransiskus Haris']);
        OrganizationNode::create(['parent_id' => $sv3->id, 'jabatan' => 'Serviceman III', 'name' => 'Vinsen Labunga']);
        OrganizationNode::create(['parent_id' => $sv3->id, 'jabatan' => 'Serviceman III', 'name' => 'Yonathan']);
        OrganizationNode::create(['parent_id' => $sv3->id, 'jabatan' => 'Serviceman III', 'name' => 'Markus Tingang M.']);
        OrganizationNode::create(['parent_id' => $sv3->id, 'jabatan' => 'Serviceman III', 'name' => 'Vacant', 'is_vacant' => true]);

        $hsv = OrganizationNode::create(['parent_id' => $sv3->id, 'jabatan' => 'HELPER SERVICEMAN']);
        OrganizationNode::create(['parent_id' => $hsv->id, 'jabatan' => 'Helper', 'name' => 'Khairul Asriyadi']);
        OrganizationNode::create(['parent_id' => $hsv->id, 'jabatan' => 'Helper', 'name' => 'Agus Supriyanto']);
        OrganizationNode::create(['parent_id' => $hsv->id, 'jabatan' => 'Helper', 'name' => 'Sipriano Agung O.']);


        // --- Corrective Branch ---
        $fmCorr = OrganizationNode::create(['parent_id' => $spvCorr1->id, 'jabatan' => 'Foreman Corrective Maintenance']);
        OrganizationNode::create(['parent_id' => $fmCorr->id, 'jabatan' => 'Foreman', 'name' => 'Musmuliadi']);
        OrganizationNode::create(['parent_id' => $fmCorr->id, 'jabatan' => 'Foreman', 'name' => 'Hary Susanto']);
        OrganizationNode::create(['parent_id' => $fmCorr->id, 'jabatan' => 'Foreman', 'name' => 'Andri Susanto (FM Support)']);
        OrganizationNode::create(['parent_id' => $fmCorr->id, 'jabatan' => 'Foreman', 'name' => 'Herianto Sampe Tondok']);
        OrganizationNode::create(['parent_id' => $fmCorr->id, 'jabatan' => 'Foreman', 'name' => 'Gito Efendi']);

        $mech1 = OrganizationNode::create(['parent_id' => $fmCorr->id, 'jabatan' => 'MECHANIC I']);
        OrganizationNode::create(['parent_id' => $mech1->id, 'jabatan' => 'Mechanic I', 'name' => 'Jimmy Calter']);
        OrganizationNode::create(['parent_id' => $mech1->id, 'jabatan' => 'Mechanic I', 'name' => 'Agus Muliyansah']);
        OrganizationNode::create(['parent_id' => $mech1->id, 'jabatan' => 'Mechanic I', 'name' => 'Yustinus Herdianto']);
        OrganizationNode::create(['parent_id' => $mech1->id, 'jabatan' => 'Mechanic I', 'name' => 'Vacant', 'is_vacant' => true]);

        $mech2 = OrganizationNode::create(['parent_id' => $mech1->id, 'jabatan' => 'MECHANIC II']);
        OrganizationNode::create(['parent_id' => $mech2->id, 'jabatan' => 'Mechanic II', 'name' => 'Henry Heryanto']);
        OrganizationNode::create(['parent_id' => $mech2->id, 'jabatan' => 'Mechanic II', 'name' => 'Sarliwahyudi']);
        OrganizationNode::create(['parent_id' => $mech2->id, 'jabatan' => 'Mechanic II', 'name' => 'Natalindo']);
        OrganizationNode::create(['parent_id' => $mech2->id, 'jabatan' => 'Mechanic II', 'name' => 'Aldi Saputra']);
        OrganizationNode::create(['parent_id' => $mech2->id, 'jabatan' => 'Mechanic II', 'name' => 'Yosias']);
        OrganizationNode::create(['parent_id' => $mech2->id, 'jabatan' => 'Mechanic II', 'name' => 'Vacant', 'is_vacant' => true]);

        $mech3 = OrganizationNode::create(['parent_id' => $mech2->id, 'jabatan' => 'MECHANIC III']);
        OrganizationNode::create(['parent_id' => $mech3->id, 'jabatan' => 'Mechanic III', 'name' => 'Kenri Belu']);
        OrganizationNode::create(['parent_id' => $mech3->id, 'jabatan' => 'Mechanic III', 'name' => 'Saldin']);
        OrganizationNode::create(['parent_id' => $mech3->id, 'jabatan' => 'Mechanic III', 'name' => 'Hardirianto']);
        OrganizationNode::create(['parent_id' => $mech3->id, 'jabatan' => 'Mechanic III', 'name' => 'Muhammad Khoirul']);
        OrganizationNode::create(['parent_id' => $mech3->id, 'jabatan' => 'Mechanic III', 'name' => 'Ayomi Nugroho']);
        OrganizationNode::create(['parent_id' => $mech3->id, 'jabatan' => 'Mechanic III', 'name' => 'Romi Jun Hizkia']);
        OrganizationNode::create(['parent_id' => $mech3->id, 'jabatan' => 'Mechanic III', 'name' => 'Dicky Eka Saputra']);
        OrganizationNode::create(['parent_id' => $mech3->id, 'jabatan' => 'Mechanic III', 'name' => 'Rino Charles']);

        $hmech = OrganizationNode::create(['parent_id' => $mech3->id, 'jabatan' => 'HELPER MECHANIC']);
        OrganizationNode::create(['parent_id' => $hmech->id, 'jabatan' => 'Helper Mechanic', 'name' => 'Baso Sahrul']);
        OrganizationNode::create(['parent_id' => $hmech->id, 'jabatan' => 'Helper Mechanic', 'name' => 'Miko Yusmael']);
        OrganizationNode::create(['parent_id' => $hmech->id, 'jabatan' => 'Helper Mechanic', 'name' => 'Vacant', 'is_vacant' => true]);

        $fmWelder = OrganizationNode::create(['parent_id' => $spvCorr1->id, 'jabatan' => 'FOREMAN WELDER']);
        OrganizationNode::create(['parent_id' => $fmWelder->id, 'jabatan' => 'Foreman Welder', 'name' => 'Gugun Gunawan']);
        OrganizationNode::create(['parent_id' => $fmWelder->id, 'jabatan' => 'Foreman Welder', 'name' => 'Vacant', 'is_vacant' => true]);

        $weld1 = OrganizationNode::create(['parent_id' => $fmWelder->id, 'jabatan' => 'WELDER I']);
        OrganizationNode::create(['parent_id' => $weld1->id, 'jabatan' => 'Welder I', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $weld1->id, 'jabatan' => 'Welder I', 'name' => 'Vacant', 'is_vacant' => true]);

        $weld2 = OrganizationNode::create(['parent_id' => $weld1->id, 'jabatan' => 'WELDER II']);
        OrganizationNode::create(['parent_id' => $weld2->id, 'jabatan' => 'Welder II', 'name' => 'Akmal Fitri']);
        OrganizationNode::create(['parent_id' => $weld2->id, 'jabatan' => 'Welder II', 'name' => 'Dedi Lesmana']);
        OrganizationNode::create(['parent_id' => $weld2->id, 'jabatan' => 'Welder II', 'name' => 'Erwan Hermawan (Body Repair)']);

        $weld3 = OrganizationNode::create(['parent_id' => $weld2->id, 'jabatan' => 'WELDER III']);
        OrganizationNode::create(['parent_id' => $weld3->id, 'jabatan' => 'Welder III', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $weld3->id, 'jabatan' => 'Welder III', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $weld3->id, 'jabatan' => 'Welder III', 'name' => 'Vacant', 'is_vacant' => true]);

        $hweld = OrganizationNode::create(['parent_id' => $weld3->id, 'jabatan' => 'HELPER WELDER']);
        OrganizationNode::create(['parent_id' => $hweld->id, 'jabatan' => 'Helper Welder', 'name' => 'Vacant', 'is_vacant' => true]);

        // --- Electric Branch ---
        $fmElec = OrganizationNode::create(['parent_id' => $spvElec->id, 'jabatan' => 'FOREMAN ELEKTRIK']);
        OrganizationNode::create(['parent_id' => $fmElec->id, 'jabatan' => 'Foreman Elektrik', 'name' => 'Rusli']);
        OrganizationNode::create(['parent_id' => $fmElec->id, 'jabatan' => 'Foreman Elektrik', 'name' => 'Vacant', 'is_vacant' => true]);

        $elec1 = OrganizationNode::create(['parent_id' => $fmElec->id, 'jabatan' => 'ELECTRIC I']);
        OrganizationNode::create(['parent_id' => $elec1->id, 'jabatan' => 'Electric I', 'name' => 'Marthen Podang']);
        OrganizationNode::create(['parent_id' => $elec1->id, 'jabatan' => 'Electric I', 'name' => 'Fernandes Anggi Saprian']);
        OrganizationNode::create(['parent_id' => $elec1->id, 'jabatan' => 'Electric I', 'name' => 'Artia Purwanto Putro']);
        OrganizationNode::create(['parent_id' => $elec1->id, 'jabatan' => 'Electric I', 'name' => 'Julianto']);

        $elec2 = OrganizationNode::create(['parent_id' => $elec1->id, 'jabatan' => 'ELECTRIC II']);
        OrganizationNode::create(['parent_id' => $elec2->id, 'jabatan' => 'Electric II', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $elec2->id, 'jabatan' => 'Electric II', 'name' => 'Vacant', 'is_vacant' => true]);

        $elec3 = OrganizationNode::create(['parent_id' => $elec2->id, 'jabatan' => 'ELECTRIC III']);
        OrganizationNode::create(['parent_id' => $elec3->id, 'jabatan' => 'Electric III', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $elec3->id, 'jabatan' => 'Electric III', 'name' => 'Vacant', 'is_vacant' => true]);

        // --- Tyre Branch ---
        $fmTyre = OrganizationNode::create(['parent_id' => $spvTyre->id, 'jabatan' => 'FOREMAN TYRE']);
        OrganizationNode::create(['parent_id' => $fmTyre->id, 'jabatan' => 'Foreman Tyre', 'name' => 'Lasarus Sanggola']);
        OrganizationNode::create(['parent_id' => $fmTyre->id, 'jabatan' => 'Foreman Tyre', 'name' => 'Vacant', 'is_vacant' => true]);

        $tyre1 = OrganizationNode::create(['parent_id' => $fmTyre->id, 'jabatan' => 'TYREMAN I']);
        OrganizationNode::create(['parent_id' => $tyre1->id, 'jabatan' => 'Tyreman I', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $tyre1->id, 'jabatan' => 'Tyreman I', 'name' => 'Vacant', 'is_vacant' => true]);

        $tyre2 = OrganizationNode::create(['parent_id' => $tyre1->id, 'jabatan' => 'TYREMAN II']);
        OrganizationNode::create(['parent_id' => $tyre2->id, 'jabatan' => 'Tyreman II', 'name' => 'Suwarman']);
        OrganizationNode::create(['parent_id' => $tyre2->id, 'jabatan' => 'Tyreman II', 'name' => 'Rudi Suardi']);

        $tyre3 = OrganizationNode::create(['parent_id' => $tyre2->id, 'jabatan' => 'TYREMAN III']);
        OrganizationNode::create(['parent_id' => $tyre3->id, 'jabatan' => 'Tyreman III', 'name' => 'Dani Yandra']);
        OrganizationNode::create(['parent_id' => $tyre3->id, 'jabatan' => 'Tyreman III', 'name' => 'Muhammad Juber']);
        OrganizationNode::create(['parent_id' => $tyre3->id, 'jabatan' => 'Tyreman III', 'name' => 'Vacant', 'is_vacant' => true]);

        $htyre = OrganizationNode::create(['parent_id' => $tyre3->id, 'jabatan' => 'HELPER TYREMAN']);
        OrganizationNode::create(['parent_id' => $htyre->id, 'jabatan' => 'Helper Tyreman', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $htyre->id, 'jabatan' => 'Helper Tyreman', 'name' => 'Vacant', 'is_vacant' => true]);

        // Crane / Rigger (Looks like it branches from FM Tyre based on visual flow, or it's separate)
        $crane = OrganizationNode::create(['parent_id' => $spvTyre->id, 'jabatan' => 'OPERATOR CRANE']);
        OrganizationNode::create(['parent_id' => $crane->id, 'jabatan' => 'Operator Crane', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $crane->id, 'jabatan' => 'Operator Crane', 'name' => 'Vacant', 'is_vacant' => true]);

        $rigger = OrganizationNode::create(['parent_id' => $crane->id, 'jabatan' => 'Rigger']);
        OrganizationNode::create(['parent_id' => $rigger->id, 'jabatan' => 'Rigger', 'name' => 'Vacant', 'is_vacant' => true]);
        OrganizationNode::create(['parent_id' => $rigger->id, 'jabatan' => 'Rigger', 'name' => 'Vacant', 'is_vacant' => true]);

    }
}
