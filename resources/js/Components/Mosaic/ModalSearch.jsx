import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import Transition from '@/utils/Transition';

const SYSTEM_NAV_ITEMS = [
  { name: 'Central Command Deck Portal', category: 'Core', href: '/portal', desc: 'Enterprise Mining & Fleet Engineering Hub (V3.0 COMMAND DECK)' },
  { name: 'Key Performance Index (KPI)', category: 'Core', href: '/kpi', desc: 'Analisa performa operasional plant' },
  { name: 'Hour Meter Unit', category: 'Core', href: '/hour-meters', desc: 'Pencatatan HM harian unit plant' },
  { name: 'Populasi Unit', category: 'Asset Management', href: '/units', desc: 'Daftar master seluruh unit alat berat' },
  { name: 'Gatepass Unit', category: 'Asset Management', href: '/gatepass-unit', desc: 'Izin keluar masuk unit operasional' },
  { name: 'Monitoring Tool & Toolroom', category: 'Asset Management', href: '/toolroom', desc: 'Inventory, peminjaman, dan inspeksi tool' },
  { name: 'Master Data Hub', category: 'Master Data', href: '/master-data', desc: 'Sentralisasi data referensi sistem' },
  { name: 'Master Form', category: 'Master Data', href: '/form-oht773', desc: 'Sentralisasi form PM service sheet & digital checklist plant' },
  { name: 'Form Penundaan Service', category: 'Master Data', href: '/form-penundaan-service', desc: 'Formulir Penundaan Service Unit Tambang & Mitigasi Risiko' },
  { name: 'Form Washing Unit', category: 'Master Data', href: '/form-washing-unit', desc: 'Digitalisasi Cleaning Check Sheet & Washing Unit Tambang' },
  { name: 'Form Service Genset', category: 'Master Data', href: '/form-service-genset', desc: 'Digitalisasi Form PM Service Sheet Generator Set' },
  { name: 'Form Service Dump Truck', category: 'Master Data', href: '/form-service-dump-truck', desc: 'Digitalisasi Form PM Service Sheet Dump Truck' },
  { name: 'Form OHT 773', category: 'Master Data', href: '/form-oht773', desc: 'Digitalisasi Form PM Service Sheet Off Highway Truck 773E' },
  { name: 'Form Inspection Bucket', category: 'Master Data', href: '/form-inspection-bucket', desc: 'Bucket Inspection & Monitoring Check Sheet (Body, Bushing, Teeth)' },
  { name: 'Check Sheet Service', category: 'Master Data', href: '/form-check-sheet-service', desc: 'Digitalisasi Form Check Sheet Service Hauler / DT / General' },
  { name: 'Check Sheet Service Dozer', category: 'Master Data', href: '/form-check-sheet-dozer', desc: 'Digitalisasi Form Check Sheet Service Dozer Track' },
  { name: 'Check Sheet Service Motorgrader', category: 'Master Data', href: '/form-check-sheet-motorgrader', desc: 'Digitalisasi Form Check Sheet Service Motorgrader' },
  { name: 'Pre Release Check List Track Unit', category: 'Master Data', href: '/form-pre-release-track-unit', desc: 'Digitalisasi Pre Release Check List Report Track Unit (DZR & HEX)' },
  { name: 'Request Asset Disposed Form', category: 'Master Data', href: '/form-request-asset-disposed', desc: 'Formulir Pengajuan Penghapusan / Disposed Aset Komponen Alat Berat' },
  { name: 'Surat Permintaan Komponen', category: 'Master Data', href: '/form-surat-permintaan-komponen', desc: 'Internal Memorandum / Surat Permintaan & Transfer Part Bekas Antar Site' },
  { name: 'Portal Form JSA (Card Hub)', category: 'Master Data', href: '/form-jsa/portal', desc: 'Portal Card Sentralisasi SOP & Analisis Keselamatan Kerja (MAM-HSE-FORM-028)' },
  { name: 'Form JSA (Job Safety Analysis)', category: 'Master Data', href: '/form-jsa', desc: 'Sistem Analisis Keselamatan Kerja & Lingkungan (MAM-HSE-FORM-028)' },
  { name: 'JSA Overhaul Starting Motor', category: 'Master Data', href: '/form-jsa/overhaul-starting-motor', desc: 'Job Safety Analysis Overhaul Starting Motor MAM-HSE-FORM-028' },
  { name: 'JSA Maintenance AC System DT', category: 'Master Data', href: '/form-jsa/maintenance-ac-dump-truck', desc: 'Job Safety Analysis Maintenance AC System Dump Truck MAM-HSE-FORM-028' },
  { name: 'JSA Radiator Medium Truck', category: 'Master Data', href: '/form-jsa/radiator-medium-truck', desc: 'Job Safety Analysis Melepas & Memasang Radiator Medium Truck' },
  { name: 'JSA Welding Chasis Medium Truck', category: 'Master Data', href: '/form-jsa/welding-chasis-medium-truck', desc: 'Job Safety Analysis Welding Chasis Medium Truck MAM-HSE-FORM-028' },
  { name: 'PM Monitoring', category: 'Preventive Maintenance', href: '/pm-monitoring', desc: 'Monitoring jadwal jatuh tempo service unit' },
  { name: 'Inspection Unit (P2H)', category: 'Preventive Maintenance', href: '/inspection-unit', desc: 'Pemeriksaan harian kelayakan unit' },
  { name: 'Daily Maintenance Achievement', category: 'Preventive Maintenance', href: '/plan-inspections', desc: 'Pencapaian target pemeliharaan harian' },
  { name: 'Plan PCR Undercarriage', category: 'Preventive Maintenance', href: '/pcr-uc', desc: 'Program Penggantian Komponen Undercarriage' },
  { name: 'Plan PCR Component', category: 'Preventive Maintenance', href: '/pcr-component', desc: 'Program Penggantian Komponen Major' },
  { name: 'Analisa Biaya Repair (ABR)', category: 'Preventive Maintenance', href: '/abr', desc: 'Analisa kalkulasi biaya perbaikan alat' },
  { name: 'Work Order Management', category: 'Maintenance Control', href: '/work-orders', desc: 'Pembuatan dan penelusuran Work Order' },
  { name: 'Monitoring Breakdown', category: 'Maintenance Control', href: '/work-orders?tab=breakdown', desc: 'Monitoring unit yang sedang breakdown' },
  { name: 'Monitoring Order List', category: 'Maintenance Control', href: '/monitoring-orderan', desc: 'Pelacakan status pemesanan sparepart' },
  { name: 'Part Order & Lifetime Monitoring', category: 'Maintenance Control', href: '/part-order-lifetime', desc: 'Smart order tracking & lifetime management komponen sparepart' },
  { name: 'Failure Analysis (FAR)', category: 'Maintenance Control', href: '/failure-analysis', desc: 'Analisa investigasi kerusakan unit' },
  { name: 'Forecast Budget Monthly', category: 'Maintenance Control', href: '/forecast-budget-monthly', desc: 'Perkiraan anggaran bulanan plant' },
  { name: 'Conditions Component Report (CCR)', category: 'Condition Monitoring', href: '/ccr', desc: 'Laporan kondisi fisik komponen' },
  { name: 'Monitoring Part Canibal', category: 'Condition Monitoring', href: '/part-canibals', desc: 'Pencatatan kanibalisasi komponen antar unit' },
  { name: 'Monitoring Replace Battery', category: 'Condition Monitoring', href: '/repair/battery', desc: 'Pencatatan dan penggantian baterai' },
  { name: 'Tyre Management', category: 'Condition Monitoring', href: '/tyres', desc: 'Vault manajemen posisi & kondisi ban' },
  { name: 'WO Outside Repair', category: 'Condition Monitoring', href: '/repair/job-outside', desc: 'Pekerjaan perbaikan ke vendor luar' },
  { name: 'Magnetic Plug', category: 'Condition Monitoring', href: '/repair/magnetic-plug', desc: 'Inspeksi serpihan metal magnetic plug' },
  { name: 'Oil Consumption', category: 'Condition Monitoring', href: '/oil-consumption', desc: 'Monitoring konsumsi pelumas mesin' },
  { name: 'Data Manpower Plant', category: 'Manpower & Organization', href: '/manpower', desc: 'Daftar mekanik dan personil plant' },
  { name: 'Perhitungan Manpower', category: 'Manpower & Organization', href: '/manpower/perhitungan', desc: 'Kalkulasi kebutuhan manpower plant' },
  { name: 'Struktur Organisasi', category: 'Manpower & Organization', href: '/organization', desc: 'Hierarki tim maintenance' },
  { name: 'Roster Plant', category: 'Manpower & Organization', href: '/roster', desc: 'Jadwal shift dan rotasi kerja' },
  { name: 'Pengajuan Cuti', category: 'Manpower & Organization', href: '/cuti/pengajuan', desc: 'Formulir permohonan cuti personil' },
  { name: 'User Management', category: 'System', href: '/users', desc: 'Kelola pengguna dan otorisasi login' },
  { name: 'Roles & Peran', category: 'System', href: '/roles', desc: 'Konfigurasi hak akses berdasarkan role' },
  { name: 'Hak Akses (Permissions)', category: 'System', href: '/permissions', desc: 'Daftar izin operasional modul sistem' },
  { name: 'Pengaturan Sistem', category: 'System', href: '/settings/mail', desc: 'Konfigurasi SMTP dan parameter sistem' },
  { name: 'Activity Logs', category: 'System', href: '/activity-logs', desc: 'Audit trail riwayat aktivitas pengguna' },
  { name: 'Database Relasi 3D', category: 'System', href: '/database-schema', desc: 'Visualisasi 3D interaktif skema database' },
];

function ModalSearch({
  id,
  searchId,
  modalOpen,
  setModalOpen
}) {
  const [query, setQuery] = useState('');
  const modalContent = useRef(null);
  const searchInput = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!modalOpen || modalContent.current?.contains(target)) return;
      setModalOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [modalOpen, setModalOpen]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!modalOpen || keyCode !== 27) return;
      setModalOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [modalOpen, setModalOpen]);

  useEffect(() => {
    if (modalOpen) {
      setQuery('');
      setTimeout(() => searchInput.current?.focus(), 50);
    }
  }, [modalOpen]);

  const filteredItems = query.trim() === ''
    ? SYSTEM_NAV_ITEMS.slice(0, 8)
    : SYSTEM_NAV_ITEMS.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.href.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <>
      {/* Modal backdrop */}
      <Transition
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity"
        show={modalOpen}
        enter="transition ease-out duration-200"
        enterStart="opacity-0"
        enterEnd="opacity-100"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
        aria-hidden="true"
      />
      {/* Modal dialog */}
      <Transition
        id={id}
        className="fixed inset-0 z-50 overflow-hidden flex items-start top-20 mb-4 justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
        show={modalOpen}
        enter="transition ease-in-out duration-200"
        enterStart="opacity-0 translate-y-4"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-200"
        leaveStart="opacity-100 translate-y-0"
        leaveEnd="opacity-0 translate-y-4"
      >
        <div
          ref={modalContent}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-2xl w-full rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
        >
          {/* Search form */}
          <form className="border-b border-gray-200 dark:border-gray-800" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex items-center">
              <label htmlFor={searchId} className="sr-only">
                Cari Menu Sistem
              </label>
              <svg
                className="shrink-0 fill-current text-emerald-500 dark:text-emerald-400 ml-5 mr-3 w-5 h-5"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
              </svg>
              <input
                id={searchId}
                className="w-full text-gray-900 dark:text-white bg-transparent border-0 focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 py-4 pr-12 text-base font-medium"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik nama menu, modul, atau kata kunci..."
                ref={searchInput}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded hover:text-gray-900 dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Results list */}
          <div className="py-3 px-3 overflow-y-auto custom-scrollbar flex-1">
            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase px-3 mb-2 tracking-wider">
              {query.trim() === '' ? '⚡ Akses Cepat Populer' : `Ditemukan ${filteredItems.length} menu`}
            </div>

            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Tidak ada menu yang sesuai dengan kata kunci <span className="font-semibold text-emerald-500">"{query}"</span>
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredItems.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      className="flex items-center justify-between p-3 text-gray-800 dark:text-gray-100 hover:bg-emerald-50/70 dark:hover:bg-emerald-500/10 rounded-xl transition-all duration-200 group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30"
                      href={item.href}
                      onClick={() => setModalOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold group-hover:scale-110 transition-transform">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {item.category}
                        </span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="py-2.5 px-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Tekan <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[10px]">ESC</kbd> untuk menutup</span>
            <span>Total {SYSTEM_NAV_ITEMS.length} Modul Terintegrasi</span>
          </div>
        </div>
      </Transition>
    </>
  );
}

export default ModalSearch;
