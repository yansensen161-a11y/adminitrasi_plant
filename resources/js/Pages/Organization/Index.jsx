import React, { useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Chart from 'chart.js/auto';

export default function Index({ auth }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        if (chartRef.current) {
            chartInstance.current = new Chart(chartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Staff', 'Non Staff', 'Kontrak / Outsource'],
                    datasets: [{
                        data: [28, 88, 12],
                        backgroundColor: ['#00a65a', '#0073b7', '#f56954'],
                        borderWidth: 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: { 
                        legend: { display: false },
                        tooltip: { enabled: true }
                    }
                }
            });
        }

        return () => {
            if (chartInstance.current) chartInstance.current.destroy();
        };
    }, []);

    // SVG Line connector component
    const HLine = ({ width = "100%", top = "0" }) => (
        <div className="absolute border-t-2 border-gray-800" style={{ width, top, left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}></div>
    );
    const VLine = ({ height = "20px", top = "0" }) => (
        <div className="absolute border-l-2 border-gray-800" style={{ height, top, left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}></div>
    );

    // Node Component
    const NodeItem = ({ title, count, staff = 0, nonStaff = 0, kontrak = 0, bgClass = "bg-white", textClass = "text-gray-800", isHeader = false, icon = null }) => (
        <div className={`relative z-10 rounded-md shadow-md border border-gray-300 p-2.5 w-full flex items-center gap-3 ${bgClass}`}>
            {icon ? (
                <div className="bg-white/20 p-2 rounded-full shrink-0 text-white">
                    {icon}
                </div>
            ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isHeader ? 'bg-white/20 text-white' : 'bg-white text-gray-400'}`}>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className={`text-xs font-black uppercase truncate ${textClass}`}>{title}</div>
                <div className={`text-sm font-bold ${textClass}`}>{count} Orang</div>
                <div className={`text-[8.5px] mt-0.5 opacity-90 ${textClass}`}>Staff: {staff} | Non Staff: {nonStaff} | Kontrak: {kontak}</div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Struktur Organisasi" />
            
            <div className="bg-gray-100 dark:bg-transparent min-h-screen pb-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', backgroundSize: '200px' }}>
                {/* Header Section */}
                <div className="bg-white/90 backdrop-blur-sm border-b border-gray-300 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                    <div className="flex flex-col items-center flex-1">
                        <h1 className="text-3xl font-black text-[#042f2e] tracking-tight uppercase">Struktur Organisasi</h1>
                        <h2 className="text-lg font-bold text-[#0f766e]">PLANT MAINTENANCE DEPARTMENT</h2>
                        <p className="text-sm font-semibold text-gray-500">Berdasarkan Data Manpower Plant (Total 128 Orang)</p>
                    </div>
                    <div className="absolute right-6 text-right">
                        <div className="text-sm text-gray-500 font-bold mb-1">Rabu, 03 September 2026</div>
                        <div className="text-xs text-[#00a65a] font-bold flex items-center gap-1 justify-end">
                            <span className="w-2 h-2 rounded-full bg-[#00a65a]"></span>
                            Data Terupdate dari Sistem
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative max-w-[1300px] mx-auto px-4 mt-6 overflow-x-auto pb-10">
                    
                    {/* Top Left KPI Box */}
                    <div className="absolute left-4 top-0 bg-white rounded-lg shadow-md border border-gray-200 p-4 w-[280px] z-20">
                        <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-3">
                            <div className="bg-[#042f2e] text-white p-2 rounded-lg">
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                            </div>
                            <div>
                                <div className="text-sm font-black text-gray-800">TOTAL MANPOWER</div>
                                <div className="text-3xl font-black text-[#042f2e] leading-none">128 <span className="text-[12px] text-gray-500 font-bold">Orang</span></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-[#e6f4ea] text-center p-1.5 rounded border border-[#a8dfb9]">
                                <div className="text-[9px] font-bold text-[#00a65a] flex items-center justify-center gap-1"><svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/></svg> Staff</div>
                                <div className="font-black text-gray-800 text-sm">28</div>
                                <div className="text-[8px] text-gray-500 font-bold">(21.9%)</div>
                            </div>
                            <div className="bg-[#e8f4fd] text-center p-1.5 rounded border border-[#a2cff0]">
                                <div className="text-[9px] font-bold text-[#0073b7] flex items-center justify-center gap-1"><svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/></svg> Non Staff</div>
                                <div className="font-black text-gray-800 text-sm">88</div>
                                <div className="text-[8px] text-gray-500 font-bold">(68.8%)</div>
                            </div>
                            <div className="bg-[#fcebe8] text-center p-1.5 rounded border border-[#f5b3a9]">
                                <div className="text-[9px] font-bold text-[#f56954] flex items-center justify-center gap-1"><svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/></svg> Kontrak</div>
                                <div className="font-black text-gray-800 text-sm">12</div>
                                <div className="text-[8px] text-gray-500 font-bold">(9.4%)</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Right Label */}
                    <div className="absolute right-4 top-4 text-right text-sm font-bold text-gray-500">
                        Reliable Equipment<br/>Higher Productivity
                    </div>

                    {/* Hierarchy Tree */}
                    <div className="flex flex-col items-center pt-8 mt-12 relative min-w-[1000px]">
                        
                        {/* L1: Superintendent */}
                        <div className="w-[300px] relative z-10">
                            <NodeItem title="SUPERINTENDENT PLANT" count={1} staff={1} nonStaff={0} kontrak={0} bgClass="bg-[#004731]" textClass="text-white" isHeader={true} />
                        </div>
                        <VLine height="30px" top="65px" />

                        {/* L2: Supervisor Maintenance & Staff */}
                        <div className="relative mt-[30px] flex justify-center w-full">
                            <div className="w-[300px] relative z-10">
                                <NodeItem title="SUPERVISOR MAINTENANCE" count={1} staff={1} nonStaff={0} kontrak={0} bgClass="bg-[#00685e]" textClass="text-white" isHeader={true} />
                            </div>
                            
                            {/* Horizontal connector to Admin and Office */}
                            <div className="absolute top-[35px] left-[50%] w-[400px] border-t-2 border-gray-800 z-0 transform -translate-x-[200px]"></div>
                            
                            {/* Admin Plant Node (Left) */}
                            <div className="absolute left-[calc(50%-450px)] top-[35px] w-[250px] z-10 flex">
                                <div className="border-t-2 border-gray-800 w-[150px] mt-[30px]"></div>
                                <div className="w-full">
                                    <NodeItem title="ADMIN PLANT" count={2} staff={2} nonStaff={0} kontrak={0} bgClass="bg-[#475569]" textClass="text-white" isHeader={true} />
                                </div>
                            </div>

                            {/* Office Plant Node (Right) */}
                            <div className="absolute right-[calc(50%-450px)] top-[35px] w-[250px] z-10 flex">
                                <div className="w-full">
                                    <NodeItem title="OFFICE PLANT" count={2} staff={2} nonStaff={0} kontrak={0} bgClass="bg-[#475569]" textClass="text-white" isHeader={true} />
                                </div>
                                <div className="border-t-2 border-gray-800 w-[150px] mt-[30px]"></div>
                            </div>
                        </div>

                        <VLine height="40px" top="165px" />
                        
                        {/* Huge Horizontal Line for Columns */}
                        <div className="relative mt-[40px] w-[1100px]">
                            <HLine width="880px" />
                            
                            {/* 5 Columns Container */}
                            <div className="flex justify-between w-full mt-0 relative">
                                
                                {/* COL 1: MECHANIC */}
                                <div className="w-[210px] flex flex-col items-center relative">
                                    <VLine height="20px" top="0px" />
                                    <div className="w-full mt-[20px] relative z-10 mb-3">
                                        <NodeItem title="SUPERVISOR MECHANIC" count={1} staff={1} nonStaff={0} kontrak={0} bgClass="bg-[#059669]" textClass="text-white" isHeader={true} />
                                    </div>
                                    <div className="bg-[#dcfce7] w-full p-3 rounded-lg border border-[#86efac] flex flex-col gap-2 relative">
                                        <div className="absolute left-4 top-0 bottom-6 border-l-2 border-[#16a34a] z-0"></div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#16a34a]"></div>
                                            <NodeItem title="MEKANIK I" count={12} staff={0} nonStaff={11} kontrak={1} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#16a34a]"></div>
                                            <NodeItem title="MEKANIK II" count={15} staff={0} nonStaff={14} kontrak={1} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#16a34a]"></div>
                                            <NodeItem title="MEKANIK III" count={8} staff={0} nonStaff={8} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#16a34a]"></div>
                                            <NodeItem title="HELPER" count={6} staff={0} nonStaff={6} kontrak={0} bgClass="bg-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* COL 2: ELECTRICAL */}
                                <div className="w-[210px] flex flex-col items-center relative">
                                    <VLine height="20px" top="0px" />
                                    <div className="w-full mt-[20px] relative z-10 mb-3">
                                        <NodeItem title="SUPERVISOR ELECTRICAL" count={1} staff={1} nonStaff={0} kontrak={0} bgClass="bg-[#0284c7]" textClass="text-white" isHeader={true} />
                                    </div>
                                    <div className="bg-[#e0f2fe] w-full p-3 rounded-lg border border-[#7dd3fc] flex flex-col gap-2 relative">
                                        <div className="absolute left-4 top-0 bottom-6 border-l-2 border-[#0284c7] z-0"></div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#0284c7]"></div>
                                            <NodeItem title="ELECTRICAL I" count={6} staff={0} nonStaff={5} kontrak={1} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#0284c7]"></div>
                                            <NodeItem title="ELECTRICAL II" count={5} staff={0} nonStaff={5} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#0284c7]"></div>
                                            <NodeItem title="ELECTRICAL III" count={3} staff={0} nonStaff={3} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#0284c7]"></div>
                                            <NodeItem title="INSTRUMENT" count={2} staff={0} nonStaff={2} kontrak={0} bgClass="bg-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* COL 3: TYRE */}
                                <div className="w-[210px] flex flex-col items-center relative">
                                    <VLine height="20px" top="0px" />
                                    <div className="w-full mt-[20px] relative z-10 mb-3">
                                        <NodeItem title="SUPERVISOR TYRE" count={1} staff={1} nonStaff={0} kontrak={0} bgClass="bg-[#ea580c]" textClass="text-white" isHeader={true} />
                                    </div>
                                    <div className="bg-[#ffedd5] w-full p-3 rounded-lg border border-[#fdba74] flex flex-col gap-2 relative">
                                        <div className="absolute left-4 top-0 bottom-6 border-l-2 border-[#ea580c] z-0"></div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#ea580c]"></div>
                                            <NodeItem title="TYREMAN I" count={4} staff={0} nonStaff={4} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#ea580c]"></div>
                                            <NodeItem title="TYREMAN II" count={4} staff={0} nonStaff={4} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#ea580c]"></div>
                                            <NodeItem title="TYREMAN III" count={3} staff={0} nonStaff={3} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#ea580c]"></div>
                                            <NodeItem title="TYRE SERVICE" count={2} staff={0} nonStaff={2} kontrak={0} bgClass="bg-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* COL 4: PLANNER */}
                                <div className="w-[210px] flex flex-col items-center relative">
                                    <VLine height="20px" top="0px" />
                                    <div className="w-full mt-[20px] relative z-10 mb-3">
                                        <NodeItem title="SENIOR PLANNER (PLANT)" count={1} staff={1} nonStaff={0} kontrak={0} bgClass="bg-[#7e22ce]" textClass="text-white" isHeader={true} />
                                    </div>
                                    <div className="bg-[#f3e8ff] w-full p-3 rounded-lg border border-[#d8b4fe] flex flex-col gap-2 relative">
                                        <div className="absolute left-4 top-0 bottom-6 border-l-2 border-[#7e22ce] z-0"></div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#7e22ce]"></div>
                                            <NodeItem title="MAINTENANCE PLANNER" count={3} staff={3} nonStaff={0} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#7e22ce]"></div>
                                            <NodeItem title="PLANNER SOS" count={2} staff={2} nonStaff={0} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#7e22ce]"></div>
                                            <NodeItem title="PLANNER COMPONENT" count={2} staff={2} nonStaff={0} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#7e22ce]"></div>
                                            <NodeItem title="PLANNER BUDGET" count={1} staff={1} nonStaff={0} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#7e22ce]"></div>
                                            <NodeItem title="DATA ANALYST" count={1} staff={1} nonStaff={0} kontrak={0} bgClass="bg-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* COL 5: SUPPORT */}
                                <div className="w-[210px] flex flex-col items-center relative">
                                    <VLine height="20px" top="0px" />
                                    <div className="w-full mt-[20px] relative z-10 mb-3">
                                        <NodeItem title="SUPERVISOR SUPPORT" count={1} staff={1} nonStaff={0} kontrak={0} bgClass="bg-[#334155]" textClass="text-white" isHeader={true} />
                                    </div>
                                    <div className="bg-[#f1f5f9] w-full p-3 rounded-lg border border-[#cbd5e1] flex flex-col gap-2 relative">
                                        <div className="absolute left-4 top-0 bottom-6 border-l-2 border-[#334155] z-0"></div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#334155]"></div>
                                            <NodeItem title="TOOLROOM" count={4} staff={0} nonStaff={4} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#334155]"></div>
                                            <NodeItem title="DISPATCHER" count={2} staff={0} nonStaff={2} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#334155]"></div>
                                            <NodeItem title="WELDING" count={3} staff={0} nonStaff={3} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#334155]"></div>
                                            <NodeItem title="GENSET & COMPRESSOR" count={2} staff={0} nonStaff={2} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#334155]"></div>
                                            <NodeItem title="CRANE & HEAVY EQUIPMENT" count={2} staff={0} nonStaff={2} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#334155]"></div>
                                            <NodeItem title="COMPACT & AUX EQUIPMENT" count={2} staff={0} nonStaff={2} kontrak={0} bgClass="bg-white" />
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-0 top-1/2 w-4 border-t-2 border-[#334155]"></div>
                                            <NodeItem title="FUEL & LUBRICATION" count={2} staff={0} nonStaff={2} kontrak={0} bgClass="bg-white" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Summary */}
                <div className="max-w-[1300px] mx-auto px-4 mt-8 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Table Rekap */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Rekapitulasi Manpower per Jenis</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="border-b-2 border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="py-2 px-2 font-bold text-gray-700">Jenis Manpower</th>
                                        <th className="py-2 px-2 font-bold text-gray-700 text-center">Jumlah</th>
                                        <th className="py-2 px-2 font-bold text-gray-700 text-center">Persentase</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-2 px-2">Staff</td>
                                        <td className="py-2 px-2 text-center">28</td>
                                        <td className="py-2 px-2 text-center">21.9%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-2">Non Staff</td>
                                        <td className="py-2 px-2 text-center">88</td>
                                        <td className="py-2 px-2 text-center">68.8%</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-2">Kontrak / Outsource</td>
                                        <td className="py-2 px-2 text-center">12</td>
                                        <td className="py-2 px-2 text-center">9.4%</td>
                                    </tr>
                                </tbody>
                                <tfoot className="border-t-2 border-gray-200 font-bold bg-gray-50">
                                    <tr>
                                        <td className="py-2 px-2">Total</td>
                                        <td className="py-2 px-2 text-center">128</td>
                                        <td className="py-2 px-2 text-center">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Chart Komposisi */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Komposisi Manpower</h3>
                            <div className="flex-1 flex items-center gap-4 px-2">
                                <div className="h-28 w-28 relative shrink-0">
                                    <canvas ref={chartRef}></canvas>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-lg font-black text-gray-800">128</span>
                                        <span className="text-[8px] text-gray-500 font-bold">Orang</span>
                                    </div>
                                    <div className="absolute top-0 right-0 text-[8px] font-bold text-white z-10">21.9%</div>
                                    <div className="absolute bottom-4 left-0 text-[8px] font-bold text-white z-10">68.8%</div>
                                    <div className="absolute top-2 left-4 text-[8px] font-bold text-white z-10">9.4%</div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-gray-600"><span className="w-3 h-3 rounded bg-[#00a65a]"></span>Staff</div>
                                        <div className="font-bold text-gray-800">28 <span className="text-gray-400 font-normal">(21.9%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-gray-600"><span className="w-3 h-3 rounded bg-[#0073b7]"></span>Non Staff</div>
                                        <div className="font-bold text-gray-800">88 <span className="text-gray-400 font-normal">(68.8%)</span></div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-gray-600"><span className="w-3 h-3 rounded bg-[#f56954]"></span>Kontrak</div>
                                        <div className="font-bold text-gray-800">12 <span className="text-gray-400 font-normal">(9.4%)</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Keterangan */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Keterangan</h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 fill-[#00a65a] mt-0.5 shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Data diambil langsung dari menu Data Manpower Plant
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 fill-[#00a65a] mt-0.5 shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Jumlah manpower pada setiap posisi terupdate otomatis
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 fill-[#00a65a] mt-0.5 shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Perubahan data karyawan akan langsung menyesuaikan struktur organisasi
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 fill-[#00a65a] mt-0.5 shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    Klik pada posisi untuk melihat daftar nama karyawan
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
