/**
 * Utility to compress images on the client side before upload.
 * Reduces large phone camera photos (5-15 MB) down to lightweight WebP/JPEG (100-300 KB)
 * without sacrificing visual quality for inspection purposes.
 */

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function compressImage(file, options = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return { file, previewUrl: null, originalSize: file?.size || 0, compressedSize: file?.size || 0, ratio: 0 };
  }

  const maxWidth = options.maxWidth || 1400;
  const maxHeight = options.maxHeight || 1400;
  const quality = options.quality ?? 0.75;
  const outputType = options.outputType || 'image/webp';

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional aspect ratio resize
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ file, previewUrl: null, originalSize: file.size, compressedSize: file.size, ratio: 0 });
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compression didn't reduce size (e.g. tiny icon), keep original
              const previewUrl = URL.createObjectURL(file);
              resolve({
                file,
                previewUrl,
                originalSize: file.size,
                compressedSize: file.size,
                ratio: 0,
                formattedOriginalSize: formatBytes(file.size),
                formattedCompressedSize: formatBytes(file.size),
              });
              return;
            }

            // Generate clean filename with appropriate extension
            const ext = outputType === 'image/webp' ? '.webp' : '.jpg';
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFileName = `${baseName}${ext}`;

            const compressedFile = new File([blob], newFileName, {
              type: outputType,
              lastModified: Date.now(),
            });

            const ratio = Math.round(((file.size - compressedFile.size) / file.size) * 100);

            resolve({
              file: compressedFile,
              previewUrl: URL.createObjectURL(compressedFile),
              originalSize: file.size,
              compressedSize: compressedFile.size,
              ratio,
              formattedOriginalSize: formatBytes(file.size),
              formattedCompressedSize: formatBytes(compressedFile.size),
            });
          },
          outputType,
          quality
        );
      };

      img.onerror = () => {
        resolve({ file, previewUrl: null, originalSize: file.size, compressedSize: file.size, ratio: 0 });
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      resolve({ file, previewUrl: null, originalSize: file.size, compressedSize: file.size, ratio: 0 });
    };

    reader.readAsDataURL(file);
  });
}
