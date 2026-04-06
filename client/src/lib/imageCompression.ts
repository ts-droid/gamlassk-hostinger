import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

/**
 * Compress and resize an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1920, // Max width or height in pixels
    useWebWorker: true, // Use web worker for better performance
    quality: 0.8, // Image quality (0-1)
    ...options,
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    
    // Log compression results
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress image specifically for logos (smaller size, higher quality)
 */
export async function compressLogo(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 512,
    quality: 0.9,
  });
}

/**
 * Compress image for gallery (medium size, balanced quality)
 */
export async function compressGalleryImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    quality: 0.85,
  });
}

/**
 * Compress thumbnail image (small size, lower quality acceptable)
 */
export async function compressThumbnail(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 400,
    quality: 0.75,
  });
}
