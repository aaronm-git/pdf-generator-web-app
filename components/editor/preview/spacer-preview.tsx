'use client';

import type { SpacerElement } from '@/lib/pdf/schema';

interface SpacerPreviewProps {
  element: SpacerElement;
}

export function SpacerPreview({ element }: SpacerPreviewProps) {
  return (
    <div
      className="border-l-2 border-dashed border-muted-foreground/20"
      style={{ height: element.height }}
    />
  );
}
