<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageCompressionService
{
    /**
     * Compress an image file or path, resize if necessary, and save to public storage.
     *
     * @param  UploadedFile|string  $fileOrPath  Uploaded file instance or local path
     * @param  string  $directory  Destination folder inside storage/app/public/
     * @param  int  $maxWidth  Maximum allowed width/height in pixels
     * @param  int  $quality  Compression quality (1-100)
     * @param  string  $format  Target format ('webp' or 'jpg')
     * @return string|null Relative storage path, or null on failure
     */
    public function compressAndStore(
        UploadedFile|string $fileOrPath,
        string $directory = 'magnetic_plugs',
        int $maxWidth = 1600,
        int $quality = 75,
        string $format = 'webp'
    ): ?string {
        $realPath = $fileOrPath instanceof UploadedFile ? $fileOrPath->getRealPath() : $fileOrPath;

        if (! file_exists($realPath) || filesize($realPath) === 0) {
            return null;
        }

        try {
            $imageInfo = @getimagesize($realPath);
            if (! $imageInfo) {
                // If not an image readable by getimagesize, fallback to raw store if UploadedFile
                if ($fileOrPath instanceof UploadedFile) {
                    return $fileOrPath->store($directory, 'public');
                }

                return null;
            }

            [$origWidth, $origHeight, $imageType] = $imageInfo;

            // Create GD image resource based on type
            $sourceImage = match ($imageType) {
                IMAGETYPE_JPEG => @imagecreatefromjpeg($realPath),
                IMAGETYPE_PNG => @imagecreatefrompng($realPath),
                IMAGETYPE_WEBP => @imagecreatefromwebp($realPath),
                IMAGETYPE_GIF => @imagecreatefromgif($realPath),
                IMAGETYPE_BMP => @imagecreatefrombmp($realPath),
                default => null,
            };

            if (! $sourceImage) {
                if ($fileOrPath instanceof UploadedFile) {
                    return $fileOrPath->store($directory, 'public');
                }

                return null;
            }

            // Correct EXIF orientation for JPEGs from mobile cameras
            if ($imageType === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
                $exif = @exif_read_data($realPath);
                if (! empty($exif['Orientation'])) {
                    $sourceImage = match ($exif['Orientation']) {
                        3 => imagerotate($sourceImage, 180, 0),
                        6 => imagerotate($sourceImage, -90, 0),
                        8 => imagerotate($sourceImage, 90, 0),
                        default => $sourceImage,
                    };
                    $origWidth = imagesx($sourceImage);
                    $origHeight = imagesy($sourceImage);
                }
            }

            return $this->compressGdResource($sourceImage, $directory, $maxWidth, $quality, $format);
        } catch (\Throwable $e) {
            // Safe fallback if GD fails
            if ($fileOrPath instanceof UploadedFile) {
                return $fileOrPath->store($directory, 'public');
            }

            return null;
        }
    }

    /**
     * Compress a GD image resource and save to public disk.
     */
    public function compressGdResource(
        $sourceImage,
        string $directory = 'magnetic_plugs',
        int $maxWidth = 1600,
        int $quality = 75,
        string $format = 'webp'
    ): ?string {
        if (! $sourceImage) {
            return null;
        }

        $origWidth = imagesx($sourceImage);
        $origHeight = imagesy($sourceImage);

        // Compute proportional dimensions
        if ($origWidth > $maxWidth || $origHeight > $maxWidth) {
            if ($origWidth >= $origHeight) {
                $newWidth = $maxWidth;
                $newHeight = (int) round(($origHeight / $origWidth) * $maxWidth);
            } else {
                $newHeight = $maxWidth;
                $newWidth = (int) round(($origWidth / $origHeight) * $maxWidth);
            }
        } else {
            $newWidth = $origWidth;
            $newHeight = $origHeight;
        }

        $targetImage = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve alpha for transparent PNG / WebP
        imagealphablending($targetImage, false);
        imagesavealpha($targetImage, true);
        $transparent = imagecolorallocatealpha($targetImage, 255, 255, 255, 127);
        imagefilledrectangle($targetImage, 0, 0, $newWidth, $newHeight, $transparent);
        imagealphablending($targetImage, true);

        // High quality resample
        imagecopyresampled($targetImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        // Prepare destination path in storage
        $filename = Str::uuid().'.'.$format;
        $relativeDir = trim($directory, '/');
        $fullDir = Storage::disk('public')->path($relativeDir);

        if (! file_exists($fullDir)) {
            @mkdir($fullDir, 0755, true);
        }

        $fullPath = $fullDir.DIRECTORY_SEPARATOR.$filename;

        // Output compressed image
        if ($format === 'webp' && function_exists('imagewebp')) {
            imagewebp($targetImage, $fullPath, $quality);
        } else {
            // Default to JPEG with quality compression
            $filename = Str::uuid().'.jpg';
            $fullPath = $fullDir.DIRECTORY_SEPARATOR.$filename;
            imagejpeg($targetImage, $fullPath, $quality);
        }

        imagedestroy($sourceImage);
        imagedestroy($targetImage);

        return $relativeDir.'/'.$filename;
    }
}
