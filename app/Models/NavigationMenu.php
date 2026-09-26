<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NavigationMenu extends Model
{
    use HasFactory;

    protected $fillable = [
        'portal_id',
        'section_label',
        'parent_id',
        'name',
        'href',
        'icon_key',
        'permission',
        'order',
        'is_active',
        'badge',
        'target',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
        'parent_id' => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function subMenus(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('order');
    }

    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByPortal($query, string $portalId)
    {
        return $query->where('portal_id', $portalId);
    }
}
