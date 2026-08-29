<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganizationNode extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'jabatan',
        'name',
        'is_vacant',
    ];

    public function parent()
    {
        return $this->belongsTo(OrganizationNode::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(OrganizationNode::class, 'parent_id');
    }
}
