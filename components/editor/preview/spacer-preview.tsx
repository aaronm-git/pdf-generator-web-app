'use client';

import type { SpacerElement } from '@/types/pdf';

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
