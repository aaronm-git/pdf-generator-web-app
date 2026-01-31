import { domToPng } from 'modern-screenshot';

/**
 * Remove selection rings and labels from the preview before capture
 */
function removeSelectionStyles(element: HTMLElement) {
  const changes: Array<{ el: HTMLElement; className: string; style: string }> = [];
  
  // Find all elements with selection rings (ring-2, ring-blue-500, etc.)
  const ringElements = element.querySelectorAll('[class*="ring-2"], [class*="ring-blue"]');
  ringElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      const originalClassName = el.className;
      // Remove ring classes
      const newClassName = originalClassName
        .replace(/\bring-\d+\b/g, '')
        .replace(/\bring-blue-\d+\b/g, '')
        .replace(/\bring-offset-\d+\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      changes.push({
        el,
        className: originalClassName,
        style: el.style.cssText,
      });
      
      el.className = newClassName;
    }
  });
  
  // Hide label tabs - these are absolutely positioned elements with negative top values
  // They're typically children of selected elements
  const labelElements = element.querySelectorAll('[class*="absolute"][class*="-top"]');
  labelElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      const classList = Array.from(el.classList);
      // Check if it has absolute positioning and negative top (like -top-3)
      const hasNegativeTop = classList.some(cls => cls.includes('-top-') && cls.match(/-top-\d+/));
      const hasAbsolute = classList.includes('absolute') || el.style.position === 'absolute';
      
      if (hasAbsolute && hasNegativeTop) {
        changes.push({
          el,
          className: el.className,
          style: el.style.cssText,
        });
        el.style.display = 'none';
      }
    }
  });
  
  return changes;
}

/**
 * Restore selection styles after capture
 */
function restoreSelectionStyles(changes: Array<{ el: HTMLElement; className: string; style: string }>) {
  changes.forEach(({ el, className, style }) => {
    el.className = className;
    el.style.cssText = style;
  });
}

/**
 * Capture a thumbnail from a DOM element.
 * Uses modern-screenshot which supports modern CSS color functions (oklch, lab, etc.)
 * @param element - The element to capture
 * @param options - Capture options
 * @returns Base64 encoded PNG image
 */
export async function captureThumbnail(
  element: HTMLElement,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<string> {
  const { width = 300, height = 400, quality = 1.0 } = options;

  let changes: Array<{ el: HTMLElement; className: string; style: string }> = [];
  
  try {
    // Remove selection rings and labels before capture
    changes = removeSelectionStyles(element);
    
    // Capture the element as a PNG data URL using modern-screenshot
    // Use scale 2 for higher resolution capture (2x for retina quality)
    const dataUrl = await domToPng(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      quality: 1.0, // Maximum quality
    });
    
    // Restore selection styles after capture
    restoreSelectionStyles(changes);
    changes = []; // Clear changes to prevent double restore

    // Create a canvas to resize to thumbnail dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    // Create a new canvas with desired thumbnail dimensions
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = width;
    thumbnailCanvas.height = height;

    const ctx = thumbnailCanvas.getContext('2d', {
      willReadFrequently: false,
      alpha: true,
    });
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Enable high-quality image smoothing for better detail
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate aspect ratio and draw scaled image
    const aspectRatio = img.width / img.height;
    const targetAspectRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0; // Always position at top

    if (aspectRatio > targetAspectRatio) {
      // Source is wider, fit to height
      drawHeight = height;
      drawWidth = height * aspectRatio;
      offsetX = (width - drawWidth) / 2; // Center horizontally
    } else {
      // Source is taller, fit to width
      drawWidth = width;
      drawHeight = width / aspectRatio;
      // offsetY stays 0 to position at top
    }

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw scaled image positioned at top with high quality
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // Convert to base64 PNG with maximum quality
    return thumbnailCanvas.toDataURL('image/png', 1.0);
  } catch (error) {
    // Always restore styles even if capture fails
    if (changes.length > 0) {
      restoreSelectionStyles(changes);
    }
    console.error('Failed to capture thumbnail:', error);
    throw error;
  }
}

/**
 * Upload a base64 image to Vercel Blob storage.
 * @param base64Image - Base64 encoded image
 * @param filename - Optional filename
 * @returns Public URL of the uploaded image
 */
export async function uploadThumbnail(
  base64Image: string,
  filename?: string
): Promise<string> {
  const response = await fetch('/api/upload/thumbnail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, filename }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to upload thumbnail');
  }

  const data = await response.json();
  return data.url;
}
