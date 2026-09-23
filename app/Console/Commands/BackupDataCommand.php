<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class BackupDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backup-data 
                            {--only-db : Hanya backup database}
                            {--only-files : Hanya backup file storage}
                            {--keep=24 : Jumlah backup terakhir yang disimpan}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup semua data database MySQL dan file upload storage ke direktori backups/';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $timestamp = now()->format('Y-m-d_His');
        $this->info("=== [SYSTEM PLANT] MEMULAI PROSES BACKUP ({$timestamp}) ===");

        $backupBaseDir = base_path('backups');
        $dbBackupDir = $backupBaseDir.DIRECTORY_SEPARATOR.'database';
        $storageBackupDir = $backupBaseDir.DIRECTORY_SEPARATOR.'storage';

        if (! File::exists($dbBackupDir)) {
            File::makeDirectory($dbBackupDir, 0755, true);
        }
        if (! File::exists($storageBackupDir)) {
            File::makeDirectory($storageBackupDir, 0755, true);
        }

        $onlyFiles = (bool) $this->option('only-files');
        $onlyDb = (bool) $this->option('only-db');
        $keep = (int) $this->option('keep') ?: 24;

        $dbSuccess = true;
        $filesSuccess = true;
        $createdFiles = [];

        // 1. BACKUP DATABASE
        if (! $onlyFiles) {
            $dbSuccess = $this->backupDatabase($dbBackupDir, $timestamp, $createdFiles);
        }

        // 2. BACKUP STORAGE FILES
        if (! $onlyDb) {
            $filesSuccess = $this->backupStorageFiles($storageBackupDir, $timestamp, $createdFiles);
        }

        // 3. PRUNE OLD BACKUPS
        $this->pruneOldBackups($dbBackupDir, $storageBackupDir, $keep);

        // 4. WRITE MANIFEST
        $this->updateManifest($backupBaseDir, $createdFiles, $timestamp);

        $this->newLine();
        if ($dbSuccess && $filesSuccess) {
            $this->info('✓ SEMUA DATA BERHASIL DI-BACKUP DENGAN SUKSES!');

            return Command::SUCCESS;
        }

        $this->warn('! Backup selesai dengan beberapa catatan atau peringatan.');

        return Command::FAILURE;
    }

    /**
     * Backup MySQL Database using mysqldump with auto-detection.
     */
    protected function backupDatabase(string $targetDir, string $timestamp, array &$createdFiles): bool
    {
        $this->line('-> Memproses backup database MySQL...');

        $host = config('database.connections.mysql.host', '127.0.0.1');
        $port = config('database.connections.mysql.port', '3306');
        $database = config('database.connections.mysql.database', 'project_system_plant');
        $username = config('database.connections.mysql.username', 'root');
        $password = config('database.connections.mysql.password', '');

        $sqlFilename = "backup_{$database}_{$timestamp}.sql";
        $sqlPath = $targetDir.DIRECTORY_SEPARATOR.$sqlFilename;

        $mysqldumpPath = $this->findMysqldumpBinary();

        if ($mysqldumpPath) {
            $this->comment("   Menggunakan binary: {$mysqldumpPath}");

            // Password parameter handling
            $passwordParam = ! empty($password) ? '--password='.escapeshellarg($password) : '';

            $cmd = sprintf(
                '"%s" --host=%s --port=%s --user=%s %s --single-transaction --quick --routines --triggers %s > "%s"',
                $mysqldumpPath,
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                $passwordParam,
                escapeshellarg($database),
                $sqlPath
            );

            exec($cmd, $output, $returnCode);

            if ($returnCode === 0 && file_exists($sqlPath) && filesize($sqlPath) > 0) {
                $sizeMb = round(filesize($sqlPath) / (1024 * 1024), 2);
                $this->info("   [OK] Database dump berhasil: {$sqlFilename} ({$sizeMb} MB)");
                $createdFiles['database'] = [
                    'file' => $sqlFilename,
                    'path' => $sqlPath,
                    'size' => filesize($sqlPath),
                    'size_formatted' => "{$sizeMb} MB",
                ];

                return true;
            }
        }

        $this->warn('   mysqldump tidak merespon, beralih ke fallback PHP PDO dump...');

        return $this->fallbackPhpDump($sqlPath, $sqlFilename, $createdFiles);
    }

    /**
     * Fallback database dumper using PDO when mysqldump is not directly invokable.
     */
    protected function fallbackPhpDump(string $sqlPath, string $sqlFilename, array &$createdFiles): bool
    {
        try {
            $pdo = DB::connection()->getPdo();
            $tables = DB::select('SHOW TABLES');
            $dbName = config('database.connections.mysql.database');
            $tableKey = "Tables_in_{$dbName}";

            $handle = fopen($sqlPath, 'w');
            if (! $handle) {
                $this->error("   [FAIL] Tidak dapat membuat file {$sqlPath}");

                return false;
            }

            fwrite($handle, "-- System Plant Database Backup\n");
            fwrite($handle, '-- Generated: '.now()->toDateTimeString()."\n");
            fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n\n");

            foreach ($tables as $t) {
                $table = $t->$tableKey ?? current((array) $t);
                $createTable = DB::select("SHOW CREATE TABLE `{$table}`");
                $createSql = $createTable[0]->{'Create Table'} ?? '';

                fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");
                fwrite($handle, $createSql.";\n\n");

                $rows = DB::table($table)->cursor();
                foreach ($rows as $row) {
                    $values = array_map(function ($val) use ($pdo) {
                        return is_null($val) ? 'NULL' : $pdo->quote((string) $val);
                    }, (array) $row);

                    $insert = "INSERT INTO `{$table}` VALUES (".implode(', ', $values).");\n";
                    fwrite($handle, $insert);
                }
                fwrite($handle, "\n");
            }

            fwrite($handle, "SET FOREIGN_KEY_CHECKS=1;\n");
            fclose($handle);

            $sizeMb = round(filesize($sqlPath) / (1024 * 1024), 2);
            $this->info("   [OK] PHP PDO dump berhasil: {$sqlFilename} ({$sizeMb} MB)");
            $createdFiles['database'] = [
                'file' => $sqlFilename,
                'path' => $sqlPath,
                'size' => filesize($sqlPath),
                'size_formatted' => "{$sizeMb} MB",
            ];

            return true;
        } catch (\Throwable $e) {
            $this->error('   [ERROR] Gagal dump database via PHP: '.$e->getMessage());
            Log::error('Backup PHP Dump Failed: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Backup Storage uploaded files to ZIP.
     */
    protected function backupStorageFiles(string $targetDir, string $timestamp, array &$createdFiles): bool
    {
        $this->line('-> Memproses backup file uploads storage...');

        $sourceDir = storage_path('app/public');
        if (! File::isDirectory($sourceDir)) {
            $this->line('   Direktori storage/app/public tidak ditemukan, melewati.');

            return true;
        }

        $zipFilename = "storage_uploads_{$timestamp}.zip";
        $zipPath = $targetDir.DIRECTORY_SEPARATOR.$zipFilename;

        if (! class_exists('ZipArchive')) {
            $this->warn('   PHP ZipArchive extension tidak tersedia.');

            return false;
        }

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            $this->error("   [FAIL] Tidak dapat membuat file ZIP di {$zipPath}");

            return false;
        }

        $files = File::allFiles($sourceDir);
        $count = 0;

        foreach ($files as $file) {
            $relativePath = $file->getRelativePathname();
            $zip->addFile($file->getRealPath(), $relativePath);
            $count++;
        }

        $zip->close();

        if (file_exists($zipPath) && filesize($zipPath) > 0) {
            $sizeMb = round(filesize($zipPath) / (1024 * 1024), 2);
            $this->info("   [OK] Storage zip berhasil ({$count} files): {$zipFilename} ({$sizeMb} MB)");
            $createdFiles['storage'] = [
                'file' => $zipFilename,
                'path' => $zipPath,
                'size' => filesize($zipPath),
                'size_formatted' => "{$sizeMb} MB",
                'total_files' => $count,
            ];

            return true;
        }

        $this->warn('   Tidak ada file di storage atau zip kosong.');

        return true;
    }

    /**
     * Find mysqldump binary on system.
     */
    protected function findMysqldumpBinary(): ?string
    {
        $candidates = [
            'D:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe',
            'C:\\laragon\\bin\\mysql\\mysql-8.4.3-winx64\\bin\\mysqldump.exe',
            'C:\\xampp\\mysql\\bin\\mysqldump.exe',
            'D:\\xampp\\mysql\\bin\\mysqldump.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
        ];

        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                return $candidate;
            }
        }

        // Check if mysqldump is in system PATH
        $pathCheck = shell_exec('where mysqldump 2>NUL');
        if ($pathCheck && file_exists(trim(explode("\n", $pathCheck)[0]))) {
            return trim(explode("\n", $pathCheck)[0]);
        }

        return null;
    }

    /**
     * Prune old backup files to keep storage clean.
     */
    protected function pruneOldBackups(string $dbDir, string $storageDir, int $keep): void
    {
        $this->pruneDirectory($dbDir, $keep, 'Database');
        $this->pruneDirectory($storageDir, $keep, 'Storage');
    }

    protected function pruneDirectory(string $dir, int $keep, string $label): void
    {
        if (! File::isDirectory($dir)) {
            return;
        }

        $files = collect(File::files($dir))
            ->sortByDesc(fn ($f) => $f->getMTime())
            ->values();

        if ($files->count() > $keep) {
            $toDelete = $files->slice($keep);
            foreach ($toDelete as $f) {
                File::delete($f->getRealPath());
                $this->line("   [PRUNE] Menghapus {$label} backup lama: ".$f->getFilename());
            }
        }
    }

    /**
     * Update backup manifest JSON file.
     */
    protected function updateManifest(string $baseDir, array $createdFiles, string $timestamp): void
    {
        $manifestPath = $baseDir.DIRECTORY_SEPARATOR.'backup_manifest.json';
        $manifest = [];

        if (File::exists($manifestPath)) {
            $manifest = json_decode(File::get($manifestPath), true) ?: [];
        }

        array_unshift($manifest, [
            'timestamp' => $timestamp,
            'datetime' => now()->toDateTimeString(),
            'details' => $createdFiles,
        ]);

        // Keep last 50 manifest records
        $manifest = array_slice($manifest, 0, 50);

        File::put($manifestPath, json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}
