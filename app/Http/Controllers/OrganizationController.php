<?php

namespace App\Http\Controllers;

use App\Models\OrganizationNode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function index()
    {
        // Fetch all nodes ordered by order_index
        $nodes = OrganizationNode::orderBy('order_index')->orderBy('id')->get();

        // Convert to hierarchical structure for the frontend
        $tree = $this->buildTree($nodes);

        return Inertia::render('Organization/Index', [
            'organizationTree' => $tree,
            'flatNodes' => $nodes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'jabatan' => 'required|string|max:255',
            'name' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:organization_nodes,id',
            'is_vacant' => 'boolean',
            'members' => 'nullable|array',
            'section' => 'nullable|string|max:100',
            'order_index' => 'nullable|integer',
        ]);

        if ($request->has('members') && is_array($request->members)) {
            $validated['members'] = array_map(function ($m) {
                $isVacant = ! empty($m['is_vacant']);

                return [
                    'name' => $isVacant ? 'Vacant' : ($m['name'] ?? ''),
                    'is_vacant' => $isVacant,
                ];
            }, $request->members);

            $allVacant = count($validated['members']) > 0 && collect($validated['members'])->every(fn ($m) => ! empty($m['is_vacant']));
            $validated['is_vacant'] = $allVacant;
            $firstName = $validated['members'][0]['name'] ?? '';
            $validated['name'] = $allVacant ? 'Vacant' : $firstName;
        }

        OrganizationNode::create($validated);

        return redirect()->back()->with('success', 'Struktur organisasi berhasil ditambahkan.');
    }

    public function update(Request $request, OrganizationNode $organization)
    {
        $validated = $request->validate([
            'jabatan' => 'required|string|max:255',
            'name' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:organization_nodes,id',
            'is_vacant' => 'boolean',
            'members' => 'nullable|array',
            'section' => 'nullable|string|max:100',
            'order_index' => 'nullable|integer',
        ]);

        // Prevent circular reference
        if ($validated['parent_id'] == $organization->id) {
            return redirect()->back()->withErrors(['parent_id' => 'Tidak bisa menjadi parent untuk dirinya sendiri.']);
        }

        if ($request->has('members') && is_array($request->members)) {
            $validated['members'] = array_map(function ($m) {
                $isVacant = ! empty($m['is_vacant']);

                return [
                    'name' => $isVacant ? 'Vacant' : ($m['name'] ?? ''),
                    'is_vacant' => $isVacant,
                ];
            }, $request->members);

            $allVacant = count($validated['members']) > 0 && collect($validated['members'])->every(fn ($m) => ! empty($m['is_vacant']));
            $validated['is_vacant'] = $allVacant;
            $firstName = $validated['members'][0]['name'] ?? '';
            $validated['name'] = $allVacant ? 'Vacant' : $firstName;
        }

        $organization->update($validated);

        return redirect()->back()->with('success', 'Struktur organisasi berhasil diperbarui.');
    }

    public function destroy(OrganizationNode $organization)
    {
        $organization->delete();

        return redirect()->back()->with('success', 'Struktur organisasi berhasil dihapus.');
    }

    private function buildTree($elements, $parentId = null)
    {
        $branch = [];

        foreach ($elements as $element) {
            if ($element->parent_id == $parentId) {
                $children = $this->buildTree($elements, $element->id);
                if ($children) {
                    $element->children = $children;
                }
                $branch[] = $element;
            }
        }

        return $branch;
    }
}
