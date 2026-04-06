import sharp from 'sharp';
import crypto from 'crypto';
import { storagePut } from './storage';

export interface ProcessedImage {
  original: { url: string; key: string };
  medium: { url: string; key: string };
  thumbnail: { url: string; key: string };
}

/**
 * Process and upload an image in multiple sizes
 * @param buffer - Image buffer from upload
 * @param filename - Original filename
 * @param category - Image category (e.g., 'gallery', 'events', 'members')
 * @returns URLs and keys for all processed versions
 */
export async function processAndUploadImage(
  buffer: Buffer,
  filename: string,
  category: string = 'gallery'
): Promise<ProcessedImage> {
  // Generate unique ID for this image
  const imageId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const baseName = `${category}/${timestamp}-${imageId}`;

  try {
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    
    // Process original (convert to WebP, optimize)
    const originalWebP = await sharp(buffer)
      .webp({ quality: 90 })
      .toBuffer();

    const originalKey = `${baseName}-original.webp`;
    const original = await storagePut(originalKey, originalWebP, 'image/webp');

    // Generate medium size (max width 800px)
    const mediumBuffer = await sharp(buffer)
      .resize(800, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    const mediumKey = `${baseName}-medium.webp`;
    const medium = await storagePut(mediumKey, mediumBuffer, 'image/webp');

    // Generate thumbnail (300x300px, cover)
    const thumbnailBuffer = await sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer();

    const thumbnailKey = `${baseName}-thumbnail.webp`;
    const thumbnail = await storagePut(thumbnailKey, thumbnailBuffer, 'image/webp');

    return {
      original,
      medium,
      thumbnail,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Process multiple images in parallel
 */
export async function processMultipleImages(
  images: Array<{ buffer: Buffer; filename: string }>,
  category: string = 'gallery'
): Promise<ProcessedImage[]> {
  return Promise.all(
    images.map(({ buffer, filename }) =>
      processAndUploadImage(buffer, filename, category)
    )
  );
}

/**
 * Validate image file
 */
export function validateImage(buffer: Buffer): Promise<boolean> {
  return sharp(buffer)
    .metadata()
    .then((metadata) => {
      // Check if it's a valid image
      if (!metadata.format) return false;
      
      // Check supported formats
      const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff'];
      if (!supportedFormats.includes(metadata.format)) return false;
      
      // Check dimensions (max 10000x10000)
      if (metadata.width && metadata.width > 10000) return false;
      if (metadata.height && metadata.height > 10000) return false;
      
      return true;
    })
    .catch(() => false);
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
