<?php
require 'vendor/autoload.php';
use Carbon\Carbon;
$currentYear = date('Y');
$currentMonth = date('m');
$val = '11/09/2026 NS';
$str = trim((string) $val);
if (str_contains($str, ' ')) {
    $str = explode(' ', $str)[0];
}
echo "Cleaned string: " . $str . "\n";
$strNorm = str_replace('-', '/', $str);
if (str_contains($strNorm, '/')) {
    $parts = explode('/', $strNorm);
    if (count($parts) === 3 && is_numeric($parts[0]) && is_numeric($parts[1])) {
        $y = $parts[2];
        $m = $parts[1];
        $d = $parts[0];
        if (strlen($y) === 2) {
            $y = '20'.$y;
        }
        if ((int) $d <= 31 && (int) $m <= 12) {
            echo "Parsed Date: " . Carbon::createFromDate($y, $m, $d)->format('Y-m-d') . "\n";
        }
    }
}
