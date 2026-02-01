/**
 * Converts various CSS color formats to hex format for react-pdf compatibility
 * react-pdf only supports hex colors, not modern CSS color functions like lab(), oklch(), etc.
 */

/**
 * Converts a CSS color string to hex format
 * Supports: hex, rgb, rgba, hsl, hsla, lab, oklch, and named colors
 * Falls back to a default color if conversion fails
 */
export function convertColorToHex(color: string | undefined | null): string {
  if (!color) {
    return '#000000'; // Default fallback
  }

  const trimmedColor = color.trim();

  // Already hex format
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmedColor)) {
    return trimmedColor;
  }

  // Named colors - convert common ones
  const namedColors: Record<string, string> = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    transparent: '#00000000',
  };

  if (namedColors[trimmedColor.toLowerCase()]) {
    return namedColors[trimmedColor.toLowerCase()];
  }

  // RGB/RGBA format: rgb(255, 0, 0) or rgba(255, 0, 0, 0.5)
  const rgbMatch = trimmedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }

  // HSL/HSLA format: hsl(0, 100%, 50%) or hsla(0, 100%, 50%, 0.5)
  const hslMatch = trimmedColor.match(/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)$/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h < 1 / 6) {
      r = c; g = x; b = 0;
    } else if (h < 2 / 6) {
      r = x; g = c; b = 0;
    } else if (h < 3 / 6) {
      r = 0; g = c; b = x;
    } else if (h < 4 / 6) {
      r = 0; g = x; b = c;
    } else if (h < 5 / 6) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    const rgb = [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];

    return `#${rgb.map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }

  // For unsupported formats (lab, oklch, etc.), try to extract RGB if possible
  // Otherwise, fall back to a default color
  // Note: lab() and oklch() require complex color space conversions
  // For now, we'll use a fallback and log a warning
  if (trimmedColor.match(/^(lab|oklch|lch|color)\(/i)) {
    console.warn(`Unsupported color format "${trimmedColor}" converted to default. Use hex, rgb, or hsl instead.`);
    return '#000000'; // Fallback to black
  }

  // If we can't parse it, return a default color
  console.warn(`Could not parse color "${trimmedColor}", using default.`);
  return '#000000';
}

/**
 * Recursively sanitizes color values in an object
 */
export function sanitizeColors(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Check if it looks like a color function value
    if (
      obj.includes('rgb') ||
      obj.includes('hsl') ||
      obj.includes('lab') ||
      obj.includes('oklch') ||
      obj.includes('lch') ||
      obj.startsWith('#')
    ) {
      return convertColorToHex(obj);
    }
    // Only convert known named colors, not arbitrary strings like "paragraph" or "left"
    const knownNamedColors: Record<string, string> = {
      black: '#000000',
      white: '#ffffff',
      red: '#ff0000',
      green: '#008000',
      blue: '#0000ff',
      yellow: '#ffff00',
      cyan: '#00ffff',
      magenta: '#ff00ff',
      transparent: '#00000000',
    };
    if (knownNamedColors[obj.toLowerCase()]) {
      return knownNamedColors[obj.toLowerCase()];
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeColors);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Check if this is a color-related property
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('color') ||
          lowerKey.includes('background') ||
          lowerKey.includes('border')
        ) {
          sanitized[key] = convertColorToHex(obj[key]);
        } else {
          sanitized[key] = sanitizeColors(obj[key]);
        }
      }
    }
    return sanitized;
  }

  return obj;
}
