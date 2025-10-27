import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement
) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    console.log('Starting background removal...');
    onProgress?.(10);

    const segmenter = await pipeline(
      'image-segmentation',
      'Xenova/segformer-b0-finetuned-ade-512-512',
      { device: 'webgpu' }
    );

    onProgress?.(30);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not get canvas context');

    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(
      `Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`
    );

    onProgress?.(50);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    console.log('Processing with AI model...');

    const result = await segmenter(imageData);
    onProgress?.(80);

    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');

    if (!outputCtx) throw new Error('Could not get output canvas context');

    outputCtx.drawImage(canvas, 0, 0);

    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;

    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }

    outputCtx.putImageData(outputImageData, 0, 0);
    onProgress?.(95);

    console.log('Background removal complete');

    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            onProgress?.(100);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const applyAdjustments = (
  canvas: HTMLCanvasElement,
  adjustments: {
    exposure: number;
    contrast: number;
    brightness: number;
    saturation: number;
    highlights: number;
    shadows: number;
    temperature: number;
    tint: number;
    clarity: number;
    vibrance: number;
  }
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Exposure
    const exposureFactor = 1 + adjustments.exposure / 100;
    r *= exposureFactor;
    g *= exposureFactor;
    b *= exposureFactor;

    // Brightness
    const brightnessFactor = adjustments.brightness * 2.55;
    r += brightnessFactor;
    g += brightnessFactor;
    b += brightnessFactor;

    // Contrast
    const contrastFactor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // Saturation
    const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
    const saturationFactor = 1 + adjustments.saturation / 100;
    r = gray + (r - gray) * saturationFactor;
    g = gray + (g - gray) * saturationFactor;
    b = gray + (b - gray) * saturationFactor;

    // Temperature (warm/cool)
    const tempFactor = adjustments.temperature / 100;
    r += tempFactor * 10;
    b -= tempFactor * 10;

    // Tint (magenta/green)
    const tintFactor = adjustments.tint / 100;
    r += tintFactor * 5;
    g += tintFactor * 5;

    // Clamp values
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
};

export const generateGrid = async (
  canvas: HTMLCanvasElement,
  rows: number,
  cols: number
): Promise<Blob[]> => {
  // Instagram portrait posts: 4:5 aspect ratio, 1080 x 1350 pixels
  const instagramWidth = 1080;
  const instagramHeight = 1350;
  const pieces: Blob[] = [];

  const totalPieces = rows * cols;

  for (let pieceIndex = 0; pieceIndex < totalPieces; pieceIndex++) {
    const pieceCanvas = document.createElement('canvas');
    pieceCanvas.width = instagramWidth;
    pieceCanvas.height = instagramHeight;
    const pieceCtx = pieceCanvas.getContext('2d');

    if (!pieceCtx) continue;

    // Calculate which part of the original image to use for this piece
    const sectionWidth = canvas.width / cols;
    const sectionHeight = canvas.height / rows;

    const row = Math.floor(pieceIndex / cols);
    const col = pieceIndex % cols;

    // Calculate scale to fit the section into 1080x1350 while maintaining aspect ratio
    const scaleX = instagramWidth / sectionWidth;
    const scaleY = instagramHeight / sectionHeight;
    const scale = Math.min(scaleX, scaleY); // Fit entirely

    const scaledWidth = sectionWidth * scale;
    const scaledHeight = sectionHeight * scale;

    // Center the scaled section in the Instagram canvas
    const offsetX = (instagramWidth - scaledWidth) / 2;
    const offsetY = (instagramHeight - scaledHeight) / 2;

    // Draw the scaled section centered in the Instagram-sized canvas
    pieceCtx.drawImage(
      canvas,
      col * sectionWidth,
      row * sectionHeight,
      sectionWidth,
      sectionHeight,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );

    // Convert to blob with maximum quality
    const blob = await new Promise<Blob>((resolve, reject) => {
      pieceCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        'image/png',
        1.0
      );
    });

    pieces.push(blob);
  }

  return pieces;
};

export const upscaleImage = async (
  canvas: HTMLCanvasElement,
  resolution: '2k' | '4k' | '8k',
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  onProgress?.(10);

  const resolutionMap = {
    '2k': { width: 2560, height: 1440 },
    '4k': { width: 3840, height: 2160 },
    '8k': { width: 7680, height: 4320 },
  };

  const targetRes = resolutionMap[resolution];
  const aspectRatio = canvas.width / canvas.height;

  let targetWidth: number;
  let targetHeight: number;

  if (aspectRatio > targetRes.width / targetRes.height) {
    targetWidth = targetRes.width;
    targetHeight = Math.round(targetRes.width / aspectRatio);
  } else {
    targetHeight = targetRes.height;
    targetWidth = Math.round(targetRes.height * aspectRatio);
  }

  onProgress?.(30);

  // Create high-quality upscaled canvas
  const upscaledCanvas = document.createElement('canvas');
  upscaledCanvas.width = targetWidth;
  upscaledCanvas.height = targetHeight;
  const ctx = upscaledCanvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  onProgress?.(50);

  // Multi-step upscaling for better quality
  const steps = Math.ceil(Math.log2(targetWidth / canvas.width));
  let currentCanvas = canvas;

  for (let i = 0; i < steps; i++) {
    const scale = Math.pow(2, i + 1);
    const stepWidth = Math.min(canvas.width * scale, targetWidth);
    const stepHeight = Math.min(canvas.height * scale, targetHeight);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = stepWidth;
    tempCanvas.height = stepHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) continue;

    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(currentCanvas, 0, 0, stepWidth, stepHeight);

    currentCanvas = tempCanvas;
    onProgress?.(50 + (i / steps) * 40);
  }

  onProgress?.(90);

  // Final draw to target resolution
  ctx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

  // Apply HD enhancement: sharpening and contrast boost
  const enhancedImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = enhancedImageData.data;

  // Sharpening kernel
  const sharpenKernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  const tempData = new Uint8ClampedArray(data);

  for (let y = 1; y < targetHeight - 1; y++) {
    for (let x = 1; x < targetWidth - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * targetWidth + (x + kx)) * 4 + c;
            sum += tempData[idx] * sharpenKernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * targetWidth + x) * 4 + c;
        data[idx] = Math.max(0, Math.min(255, sum));
      }
    }
  }

  // Contrast boost
  const contrastFactor = 1.1; // Slight contrast increase
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      data[i + c] = contrastFactor * (data[i + c] - 128) + 128;
      data[i + c] = Math.max(0, Math.min(255, data[i + c]));
    }
  }

  ctx.putImageData(enhancedImageData, 0, 0);

  onProgress?.(95);

  return new Promise((resolve, reject) => {
    upscaledCanvas.toBlob(
      (blob) => {
        if (blob) {
          onProgress?.(100);
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/png',
      1.0
    );
  });
};
