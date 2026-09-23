<?php

namespace App\Http\Controllers;

use App\Models\FailureAnalysis;
use App\Models\FailureAnalysisPhoto;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FailureAnalysisController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $query = FailureAnalysis::with(['pelapor', 'unit'])->orderBy('created_at', 'desc');

        if ($search) {
            $query->where('no_far', 'like', "%{$search}%")
                ->orWhereHas('unit', function ($q) use ($search) {
                    $q->where('code_unit', 'like', "%{$search}%");
                });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $fars = $query->paginate(10)->withQueryString();

        return Inertia::render('FailureAnalysis/Index', [
            'fars' => $fars,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $units = Unit::orderBy('code_unit', 'asc')->get();

        return Inertia::render('FailureAnalysis/Create', [
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'tgl_kejadian' => 'required|date',
            'tgl_lapor' => 'required|date',
            'status' => 'required|in:Draft,Final',
            'photos' => 'nullable|array|max:20',
            'photos.*.file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'photos.*.komponen_bagian' => 'nullable|string|max:255',
            'photos.*.observasi' => 'nullable|string|max:1000',
            'return_to' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Generate NO_FAR (FAR-YYMM-XXXX)
            $yearMonth = date('ym', strtotime($request->tgl_lapor));
            $latestFar = FailureAnalysis::where('no_far', 'like', "FAR-{$yearMonth}-%")->orderBy('no_far', 'desc')->first();
            $nextSequence = 1;
            if ($latestFar) {
                $lastSequence = (int) substr($latestFar->no_far, -4);
                $nextSequence = $lastSequence + 1;
            }
            $noFar = "FAR-{$yearMonth}-".str_pad($nextSequence, 4, '0', STR_PAD_LEFT);

            $far = FailureAnalysis::create([
                'no_far' => $noFar,
                'status' => $request->status,
                'tgl_kejadian' => $request->tgl_kejadian,
                'tgl_lapor' => $request->tgl_lapor,
                'pelapor_id' => auth()->id(),

                'unit_id' => $request->unit_id,
                'site_project' => $request->site_project,
                'smu_failure' => $request->smu_failure,

                'part_no' => $request->part_no,
                'nama_komp' => $request->nama_komp,
                'pn' => $request->pn,
                'penyebab' => $request->penyebab,
                'engine_model' => $request->engine_model,
                'engine_sn' => $request->engine_sn,

                'comp_installed' => $request->comp_installed,
                'comp_hours' => $request->comp_hours,
                'oil_sampled' => $request->oil_sampled,
                'oil_eval' => $request->oil_eval,

                'failure_outline' => $request->failure_outline,
                'background' => $request->background,
                'failure_analysis' => $request->failure_analysis,
                'conclusion' => $request->conclusion,

                'prepared_by' => $request->prepared_by,
                'reviewed_by' => $request->reviewed_by,
                'approved_by' => $request->approved_by,
            ]);

            // Handle Photos
            if ($request->has('photos')) {
                foreach ($request->photos as $photoData) {
                    if (isset($photoData['file'])) {
                        $path = $photoData['file']->store('failure_analysis_photos', 'public');
                        FailureAnalysisPhoto::create([
                            'failure_analysis_id' => $far->id,
                            'komponen_bagian' => $photoData['komponen_bagian'] ?? '-',
                            'observasi' => $photoData['observasi'] ?? '-',
                            'foto_path' => $path,
                        ]);
                    }
                }
            }

            DB::commit();

            if ($request->filled('return_to')) {
                return redirect($request->return_to)->with('success', 'Failure Analysis Report ('.$far->no_far.') berhasil dibuat untuk Work Order.');
            }

            return redirect()->route('failure-analysis.index')->with('success', 'Failure Analysis Report berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Terjadi kesalahan: '.$e->getMessage());
        }
    }

    public function show(FailureAnalysis $failure_analysis)
    {
        $failure_analysis->load(['unit', 'pelapor', 'photos']);

        return Inertia::render('FailureAnalysis/Show', [
            'far' => $failure_analysis,
        ]);
    }

    public function edit(FailureAnalysis $failure_analysis)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $failure_analysis->load(['unit', 'pelapor', 'photos']);
        $units = Unit::orderBy('code_unit', 'asc')->get();

        return Inertia::render('FailureAnalysis/Edit', [
            'far' => $failure_analysis,
            'units' => $units,
        ]);
    }

    public function update(Request $request, FailureAnalysis $failure_analysis)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin.');

        $request->validate([
            'unit_id' => 'required|exists:units,id',
            'tgl_kejadian' => 'required|date',
            'tgl_lapor' => 'required|date',
            'status' => 'required|in:Draft,Final',
            'new_photos' => 'nullable|array|max:20',
            'new_photos.*.file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'new_photos.*.komponen_bagian' => 'nullable|string|max:255',
            'new_photos.*.observasi' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $failure_analysis->update([
                'status' => $request->status,
                'tgl_kejadian' => $request->tgl_kejadian,
                'tgl_lapor' => $request->tgl_lapor,

                'unit_id' => $request->unit_id,
                'site_project' => $request->site_project,
                'smu_failure' => $request->smu_failure,

                'part_no' => $request->part_no,
                'nama_komp' => $request->nama_komp,
                'pn' => $request->pn,
                'penyebab' => $request->penyebab,
                'engine_model' => $request->engine_model,
                'engine_sn' => $request->engine_sn,

                'comp_installed' => $request->comp_installed,
                'comp_hours' => $request->comp_hours,
                'oil_sampled' => $request->oil_sampled,
                'oil_eval' => $request->oil_eval,

                'failure_outline' => $request->failure_outline,
                'background' => $request->background,
                'failure_analysis' => $request->failure_analysis,
                'conclusion' => $request->conclusion,

                'prepared_by' => $request->prepared_by,
                'reviewed_by' => $request->reviewed_by,
                'approved_by' => $request->approved_by,
            ]);

            // Handle Photos Deletions (Scoped to this FAR to prevent IDOR)
            if ($request->has('deleted_photos') && is_array($request->deleted_photos)) {
                $failure_analysis->photos()->whereIn('id', $request->deleted_photos)->get()->each(function ($photo) {
                    Storage::disk('public')->delete($photo->foto_path);
                    $photo->delete();
                });
            }

            // Handle New Photos
            if ($request->has('new_photos')) {
                foreach ($request->new_photos as $photoData) {
                    if (isset($photoData['file'])) {
                        $path = $photoData['file']->store('failure_analysis_photos', 'public');
                        FailureAnalysisPhoto::create([
                            'failure_analysis_id' => $failure_analysis->id,
                            'komponen_bagian' => $photoData['komponen_bagian'] ?? '-',
                            'observasi' => $photoData['observasi'] ?? '-',
                            'foto_path' => $path,
                        ]);
                    }
                }
            }

            // Handle Photo Updates (komponen_bagian & observasi for existing photos)
            if ($request->has('existing_photos')) {
                foreach ($request->existing_photos as $photoData) {
                    $photo = FailureAnalysisPhoto::find($photoData['id']);
                    if ($photo) {
                        $photo->update([
                            'komponen_bagian' => $photoData['komponen_bagian'] ?? '-',
                            'observasi' => $photoData['observasi'] ?? '-',
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()->route('failure-analysis.index')->with('success', 'Failure Analysis Report berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Terjadi kesalahan: '.$e->getMessage());
        }
    }

    public function destroy(FailureAnalysis $failure_analysis)
    {
        abort_if(! auth()->user()?->hasAnyRole(['super-admin', 'admin', 'planner']), 403, 'Akses ditolak: Anda tidak memiliki izin untuk menghapus data.');

        foreach ($failure_analysis->photos as $photo) {
            Storage::disk('public')->delete($photo->foto_path);
        }
        $failure_analysis->delete();

        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }

    public function exportPdf(FailureAnalysis $failure_analysis)
    {
        $failure_analysis->load(['unit', 'pelapor', 'photos']);

        $pdf = Pdf::loadView('pdf.far', [
            'far' => $failure_analysis,
        ]);

        return $pdf->stream("FAR_{$failure_analysis->no_far}.pdf");
    }
}
