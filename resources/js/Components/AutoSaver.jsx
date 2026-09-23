import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Cloud, CheckCircle2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default function AutoSaver() {
    const [lastSavedTime, setLastSavedTime] = useState(null);
    const [savedDraftCount, setSavedDraftCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [restoredNotice, setRestoredNotice] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const lastSaveRef = useRef(Date.now());

    // ─── 1. FORM AUTO-SAVE ENGINE ───
    const getStorageKey = () => `plant_autosave_${window.location.pathname}`;

    // Collect and save all current form data
    const saveCurrentFormData = () => {
        try {
            if (typeof window !== 'undefined' && window.location.pathname.includes('/create')) {
                return;
            }
            const forms = document.querySelectorAll('form');
            if (!forms || forms.length === 0) return;

            const drafts = [];
            forms.forEach((form, formIndex) => {
                const formData = {};
                let hasValue = false;

                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach((input) => {
                    const name = input.name || input.id;
                    if (!name) return;

                    // Skip sensitive or transient fields
                    const type = (input.type || '').toLowerCase();
                    if (type === 'password' || type === 'hidden' || type === 'file') return;

                    if (type === 'checkbox') {
                        formData[name] = input.checked;
                        if (input.checked) hasValue = true;
                    } else if (type === 'radio') {
                        if (input.checked) {
                            formData[name] = input.value;
                            hasValue = true;
                        }
                    } else {
                        const val = input.value;
                        if (val && val.trim() !== '') {
                            formData[name] = val;
                            hasValue = true;
                        }
                    }
                });

                if (hasValue) {
                    drafts.push({ formIndex, data: formData, savedAt: new Date().toISOString() });
                }
            });

            if (drafts.length > 0) {
                localStorage.setItem(getStorageKey(), JSON.stringify(drafts));
                setSavedDraftCount(drafts.length);
                const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                setLastSavedTime(timeStr);
                lastSaveRef.current = Date.now();
            }
        } catch (e) {
            console.debug('AutoSaver form save error:', e);
        }
    };

    // Restore saved form data if available
    const restoreSavedFormData = () => {
        try {
            if (typeof window !== 'undefined' && window.location.pathname.includes('/create')) {
                try {
                    localStorage.removeItem(getStorageKey());
                    localStorage.removeItem('plant_autosave_/work-orders/create');
                    localStorage.removeItem('wo_create_draft');
                } catch(e) {}
                return;
            }
            const raw = localStorage.getItem(getStorageKey());
            if (!raw) return;

            const drafts = JSON.parse(raw);
            if (!Array.isArray(drafts) || drafts.length === 0) return;

            const forms = document.querySelectorAll('form');
            let restoredAny = false;

            drafts.forEach((draft) => {
                const form = forms[draft.formIndex] || forms[0];
                if (!form) return;

                Object.entries(draft.data || {}).forEach(([name, value]) => {
                    const input = form.querySelector(`[name="${name}"], #${name}`);
                    if (!input) return;

                    const type = (input.type || '').toLowerCase();
                    if (type === 'checkbox') {
                        if (input.checked !== Boolean(value)) {
                            input.checked = Boolean(value);
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            restoredAny = true;
                        }
                    } else if (type === 'radio') {
                        if (input.value === value) {
                            input.checked = true;
                            input.dispatchEvent(new Event('change', { bubbles: true }));
                            restoredAny = true;
                        }
                    } else if (!input.value || input.value.trim() === '') {
                        input.value = value;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        restoredAny = true;
                    }
                });
            });

            if (restoredAny) {
                setRestoredNotice(true);
                setTimeout(() => setRestoredNotice(false), 6000);
            }
        } catch (e) {
            console.debug('AutoSaver restore error:', e);
        }
    };

    // ─── 2. SESSION KEEP-ALIVE (Every 5 minutes / 300,000ms) ───
    const triggerHeartbeat = async () => {
        try {
            setIsSaving(true);
            // Also run a form save
            saveCurrentFormData();

            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/session-keepalive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'Accept': 'application/json',
                },
            });

            if (res.ok) {
                const data = await res.json();
                const timeStr = data.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                setLastSavedTime(timeStr);

                // Update CSRF token if updated
                if (data.csrf_token && document.querySelector('meta[name="csrf-token"]')) {
                    document.querySelector('meta[name="csrf-token"]').setAttribute('content', data.csrf_token);
                }
            }
        } catch (err) {
            console.debug('Heartbeat error:', err);
        } finally {
            setTimeout(() => setIsSaving(false), 800);
        }
    };

    useEffect(() => {
        // If on a create page, immediately purge any stale draft
        if (typeof window !== 'undefined' && window.location.pathname.includes('/create')) {
            try {
                localStorage.removeItem(getStorageKey());
                localStorage.removeItem('plant_autosave_/work-orders/create');
                localStorage.removeItem('wo_create_draft');
            } catch(e) {}
        }

        // Initial heartbeat and restore check
        triggerHeartbeat();
        const restoreTimeout = setTimeout(restoreSavedFormData, 800);

        // Heartbeat interval every 5 minutes (300,000 ms)
        const heartbeatInterval = setInterval(() => {
            triggerHeartbeat();
        }, 5 * 60 * 1000);

        // Listen for form input changes (debounced)
        let inputTimeout;
        const handleInput = () => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                saveCurrentFormData();
            }, 2500);
        };

        // Listen for successful form submission to clear draft
        const handleSubmit = () => {
            try {
                localStorage.removeItem(getStorageKey());
                setSavedDraftCount(0);
            } catch (e) {}
        };

        document.addEventListener('input', handleInput);
        document.addEventListener('change', handleInput);
        document.addEventListener('submit', handleSubmit);

        return () => {
            clearTimeout(restoreTimeout);
            clearTimeout(inputTimeout);
            clearInterval(heartbeatInterval);
            document.removeEventListener('input', handleInput);
            document.removeEventListener('change', handleInput);
            document.removeEventListener('submit', handleSubmit);
        };
    }, []);

    const clearDraftManually = () => {
        try {
            localStorage.removeItem(getStorageKey());
            setSavedDraftCount(0);
            setRestoredNotice(false);
        } catch (e) {}
    };

    return (
        <div className="fixed bottom-4 right-4 z-40 select-none font-sans text-xs">
            {/* Restored notification banner */}
            {restoredNotice && (
                <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 shadow-lg backdrop-blur-md animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Draft input otomatis dipulihkan!</span>
                    <button
                        onClick={clearDraftManually}
                        className="ml-2 text-[10px] text-emerald-400 hover:text-emerald-200 underline"
                    >
                        Hapus draft
                    </button>
                </div>
            )}

            {/* Main Auto-Save Pill */}
            <div className="flex flex-col items-end">
                <div
                    onClick={() => setExpanded(!expanded)}
                    className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800/95 border border-slate-700/60 shadow-xl backdrop-blur-md transition-all duration-200"
                >
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSaving ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isSaving ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    </span>

                    <span className="font-mono text-[11px] text-slate-300 group-hover:text-white transition-colors">
                        Auto-Save: {lastSavedTime ? `Tersimpan ${lastSavedTime}` : 'Aktif'}
                    </span>

                    {expanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    )}
                </div>

                {/* Expanded details card */}
                {expanded && (
                    <div className="mt-2 w-72 p-3.5 rounded-xl bg-slate-950/95 border border-slate-800 text-slate-300 shadow-2xl backdrop-blur-lg animate-fade-in space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Perlindungan Data Aktif</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-mono">
                                5 MENIT AUTO-SYNC
                            </span>
                        </div>

                        <div className="space-y-1.5 text-[11px] text-slate-300">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span><strong>Sesi Anti-Timeout:</strong> Halaman tetap aktif dan tidak logout saat ditinggal diam.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Cloud className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                <span><strong>Auto-Draft Input:</strong> Form yang sedang diisi otomatis tersimpan agar data tidak hilang.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <RotateCcw className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                <span><strong>Auto-Backup Sistem:</strong> Backup database terjadwal berjalan setiap 5 menit.</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                            <button
                                onClick={triggerHeartbeat}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono font-medium transition-colors"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Sekarang'}
                            </button>
                            <span className="text-slate-400 font-mono">Status: Aman</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
