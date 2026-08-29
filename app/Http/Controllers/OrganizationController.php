<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrganizationNode;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function index()
    {
        // Fetch all nodes
        $nodes = OrganizationNode::all();

        // Convert to hierarchical structure for the frontend
        $tree = $this->buildTree($nodes);

        return Inertia::render('Organization/Index', [
            'organizationTree' => $tree
        ]);
    }

    private function buildTree($elements, $parentId = null) {
        $branch = array();
    
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
