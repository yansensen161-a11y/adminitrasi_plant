<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DatabaseSchemaController extends Controller
{
    public function index()
    {
        return Inertia::render('DatabaseSchema/Index');
    }

    public function getSchema()
    {
        $databaseName = DB::connection()->getDatabaseName();

        // 1. Get Tables
        $tablesQuery = DB::select('SHOW TABLES');
        $tables = [];

        foreach ($tablesQuery as $tableObj) {
            $tableName = array_values((array)$tableObj)[0];
            $tables[] = $tableName;
        }

        // 2. Get Columns and Foreign Keys
        $nodes = [];
        $links = [];
        
        foreach ($tables as $table) {
            $columnsQuery = DB::select("SHOW COLUMNS FROM `$table`");
            $columns = array_map(function($col) {
                return [
                    'name' => $col->Field,
                    'type' => $col->Type,
                    'key' => $col->Key, // PRI, MUL, etc
                ];
            }, $columnsQuery);
            
            $nodes[] = [
                'id' => $table,
                'name' => $table,
                'columns' => $columns
            ];
        }

        // Fetch all foreign keys for the database
        $fkQuery = DB::select("
            SELECT 
                TABLE_NAME, 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM 
                information_schema.KEY_COLUMN_USAGE
            WHERE 
                REFERENCED_TABLE_SCHEMA = ?
                AND REFERENCED_TABLE_NAME IS NOT NULL
        ", [$databaseName]);

        foreach ($fkQuery as $fk) {
            if (in_array($fk->TABLE_NAME, $tables) && in_array($fk->REFERENCED_TABLE_NAME, $tables)) {
                $links[] = [
                    'source' => $fk->TABLE_NAME,
                    'target' => $fk->REFERENCED_TABLE_NAME,
                    'sourceCol' => $fk->COLUMN_NAME,
                    'targetCol' => $fk->REFERENCED_COLUMN_NAME
                ];
            }
        }

        return response()->json([
            'nodes' => $nodes,
            'links' => $links,
        ]);
    }
}
