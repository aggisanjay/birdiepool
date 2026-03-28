'use client';
import { DrawConfigurator } from '@/components/admin/DrawConfigurator';

export function DrawDetailClient({ draw }: { draw: Record<string, unknown> }) {
  return (
    <DrawConfigurator
      draw={draw}
      onUpdate={() => window.location.reload()}
    />
  );
}
