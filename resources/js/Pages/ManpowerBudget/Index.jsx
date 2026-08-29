import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth, staffBudgets, nonStaffBudgets }) {
    
    const calculateTotals = (budgets) => {
        return budgets.reduce((acc, curr) => {
            acc.plan += curr.plan_mp;
            acc.tersedia += curr.tersedia;
            acc.deviasi += curr.deviasi;
            return acc;
        }, { plan: 0, tersedia: 0, deviasi: 0 });
    };

    const staffTotals = calculateTotals(staffBudgets);
    const nonStaffTotals = calculateTotals(nonStaffBudgets);
    const grandTotals = {
        plan: staffTotals.plan + nonStaffTotals.plan,
        tersedia: staffTotals.tersedia + nonStaffTotals.tersedia,
        deviasi: staffTotals.deviasi + nonStaffTotals.deviasi,
    };

    const mpRatioData = {
        subTotal: 120, // Example from PDF
        ratio07: 84,   // Non Staff
        ratio25: 21,   // Staff
        total: 104
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manpower Budget</h2>}
        >
            <Head title="Manpower Budget" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-xl font-bold text-center mb-4 bg-amber-400 py-2 text-black rounded">MANPOWER PLANT DEPARTMENT SITE HARINDO WAHANA</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-800 dark:text-gray-200 border-collapse border border-gray-400">
                                <thead className="bg-gray-200 dark:bg-gray-700">
                                    <tr>
                                        <th className="border border-gray-400 px-3 py-2 text-center w-12">NO</th>
                                        <th className="border border-gray-400 px-3 py-2">JOB POSITION</th>
                                        <th className="border border-gray-400 px-3 py-2 text-center">PLAN M.P</th>
                                        <th className="border border-gray-400 px-3 py-2 text-center" colSpan="2">MANPOWER</th>
                                        <th className="border border-gray-400 px-3 py-2 text-center">REMARKS</th>
                                    </tr>
                                    <tr className="bg-gray-100 dark:bg-gray-600">
                                        <th className="border border-gray-400 px-3 py-1"></th>
                                        <th className="border border-gray-400 px-3 py-1"></th>
                                        <th className="border border-gray-400 px-3 py-1"></th>
                                        <th className="border border-gray-400 px-3 py-1 text-center">TERSEDIA</th>
                                        <th className="border border-gray-400 px-3 py-1 text-center">DEVIASI</th>
                                        <th className="border border-gray-400 px-3 py-1"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                                        <td className="border border-gray-400 px-3 py-1" colSpan="6">PLANT STAFF</td>
                                    </tr>
                                    {staffBudgets.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                            <td className="border border-gray-400 px-3 py-1 text-center">{index + 1}</td>
                                            <td className="border border-gray-400 px-3 py-1">{item.job_position}</td>
                                            <td className="border border-gray-400 px-3 py-1 text-center">{item.plan_mp || ''}</td>
                                            <td className="border border-gray-400 px-3 py-1 text-center">{item.tersedia || ''}</td>
                                            <td className={`border border-gray-400 px-3 py-1 text-center ${item.deviasi < 0 ? 'text-red-500 font-bold' : ''}`}>
                                                {item.deviasi === 0 ? '-' : (item.deviasi < 0 ? `(${Math.abs(item.deviasi)})` : item.deviasi)}
                                            </td>
                                            <td className="border border-gray-400 px-3 py-1">{item.remarks}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-blue-100 dark:bg-blue-900/40 font-bold">
                                        <td className="border border-gray-400 px-3 py-2 text-center" colSpan="2">SUB TOTAL</td>
                                        <td className="border border-gray-400 px-3 py-2 text-center">{staffTotals.plan}</td>
                                        <td className="border border-gray-400 px-3 py-2 text-center">{staffTotals.tersedia}</td>
                                        <td className="border border-gray-400 px-3 py-2 text-center text-red-600 dark:text-red-400">({Math.abs(staffTotals.deviasi)})</td>
                                        <td className="border border-gray-400 px-3 py-2"></td>
                                    </tr>

                                    <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                                        <td className="border border-gray-400 px-3 py-1" colSpan="6">PLANT NON STAFF</td>
                                    </tr>
                                    {nonStaffBudgets.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                            <td className="border border-gray-400 px-3 py-1 text-center">{index + 11}</td>
                                            <td className="border border-gray-400 px-3 py-1">{item.job_position}</td>
                                            <td className="border border-gray-400 px-3 py-1 text-center">{item.plan_mp || ''}</td>
                                            <td className="border border-gray-400 px-3 py-1 text-center">{item.tersedia || ''}</td>
                                            <td className={`border border-gray-400 px-3 py-1 text-center ${item.deviasi < 0 ? 'text-red-500 font-bold' : ''}`}>
                                                {item.deviasi === 0 ? '-' : (item.deviasi < 0 ? `(${Math.abs(item.deviasi)})` : item.deviasi)}
                                            </td>
                                            <td className="border border-gray-400 px-3 py-1">{item.remarks}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-blue-100 dark:bg-blue-900/40 font-bold">
                                        <td className="border border-gray-400 px-3 py-2 text-center" colSpan="2">SUB TOTAL</td>
                                        <td className="border border-gray-400 px-3 py-2 text-center">{nonStaffTotals.plan}</td>
                                        <td className="border border-gray-400 px-3 py-2 text-center">{nonStaffTotals.tersedia}</td>
                                        <td className="border border-gray-400 px-3 py-2 text-center text-red-600 dark:text-red-400">({Math.abs(nonStaffTotals.deviasi)})</td>
                                        <td className="border border-gray-400 px-3 py-2"></td>
                                    </tr>
                                    <tr className="bg-orange-400 text-black font-bold">
                                        <td className="border border-gray-600 px-3 py-2 text-center" colSpan="2">GRAND TOTAL</td>
                                        <td className="border border-gray-600 px-3 py-2 text-center">{grandTotals.plan}</td>
                                        <td className="border border-gray-600 px-3 py-2 text-center">{grandTotals.tersedia}</td>
                                        <td className="border border-gray-600 px-3 py-2 text-center">({Math.abs(grandTotals.deviasi)})</td>
                                        <td className="border border-gray-600 px-3 py-2"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                    {/* MP UNIT RATIO TABLE */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                            <h4 className="font-bold mb-4 dark:text-white">Ratio MP Plant</h4>
                            <div className="flex gap-8">
                                <table className="text-sm text-left border-collapse border border-gray-400">
                                    <thead>
                                        <tr className="bg-gray-200 dark:bg-gray-700">
                                            <th className="border border-gray-400 px-3 py-1">Unit</th>
                                            <th className="border border-gray-400 px-3 py-1">MP Unit 6 Fleet</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border border-gray-400 px-3 py-1">Excavator</td><td className="border border-gray-400 px-3 py-1 text-center">13</td></tr>
                                        <tr><td className="border border-gray-400 px-3 py-1">Truck Heavy Duty</td><td className="border border-gray-400 px-3 py-1 text-center">16</td></tr>
                                        <tr><td className="border border-gray-400 px-3 py-1">Truck Dump</td><td className="border border-gray-400 px-3 py-1 text-center">27</td></tr>
                                        <tr><td className="border border-gray-400 px-3 py-1">Motor Grader</td><td className="border border-gray-400 px-3 py-1 text-center">3</td></tr>
                                        <tr><td className="border border-gray-400 px-3 py-1">Bulldozer</td><td className="border border-gray-400 px-3 py-1 text-center">9</td></tr>
                                        <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
                                            <td className="border border-gray-400 px-3 py-1">Sub Total</td>
                                            <td className="border border-gray-400 px-3 py-1 text-center">{mpRatioData.subTotal}</td>
                                        </tr>
                                        <tr className="font-bold">
                                            <td className="border border-gray-400 px-3 py-1">Ratio 0.7 x Sub Total</td>
                                            <td className="border border-gray-400 px-3 py-1 text-center bg-gray-300 dark:bg-gray-600">{mpRatioData.ratio07}</td>
                                        </tr>
                                        <tr className="font-bold">
                                            <td className="border border-gray-400 px-3 py-1">Rasio 25%</td>
                                            <td className="border border-gray-400 px-3 py-1 text-center bg-gray-300 dark:bg-gray-600">{mpRatioData.ratio25}</td>
                                        </tr>
                                        <tr className="font-bold">
                                            <td className="border border-gray-400 px-3 py-1"></td>
                                            <td className="border border-gray-400 px-3 py-1 text-center bg-green-500 text-white">{mpRatioData.total}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <table className="text-sm text-left border-collapse border border-gray-400 h-fit">
                                    <thead>
                                        <tr className="bg-amber-400 text-black">
                                            <th className="border border-gray-400 px-3 py-1" colSpan="2">RASIO MP PLANT NON STAFF</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border border-gray-400 px-3 py-1 bg-amber-100 text-black">0 - 4000 hrs</td><td className="border border-gray-400 px-3 py-1 text-center bg-amber-200 text-black">0,6</td></tr>
                                        <tr><td className="border border-gray-400 px-3 py-1 bg-amber-100 text-black">4000 - 8000 hrs</td><td className="border border-gray-400 px-3 py-1 text-center bg-amber-200 text-black">0,7</td></tr>
                                        <tr><td className="border border-gray-400 px-3 py-1 bg-amber-100 text-black">8000 - 12000 hrs</td><td className="border border-gray-400 px-3 py-1 text-center bg-amber-200 text-black">0,8</td></tr>
                                        <tr><td className="border border-gray-400 px-3 py-1 bg-amber-100 text-black">12000 hrs Up</td><td className="border border-gray-400 px-3 py-1 text-center bg-amber-200 text-black">0,9</td></tr>
                                        <tr>
                                            <td colSpan="2" className="border border-gray-400 px-3 py-1 bg-amber-400 font-bold text-center text-black">RASIO MP PLANT STAFF <br/> 25%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
