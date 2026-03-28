
'use client';
import { DrawConfigurator } from '@/components/admin/DrawConfigurator';

interface Draw {
  id: string;
  draw_month: string;
  mode: string;
  status: string;
  numbers: number[] | null;
  total_pool_cents: number;
  match_5_pool_cents: number;
  match_4_pool_cents: number;
  match_3_pool_cents: number;
  rollover_cents: number;
  eligible_participants: number;
  match_5_count: number;
  match_4_count: number;
  match_3_count: number;
  executed_at: string | null;
  published_at: string | null;
}

export function DrawsClient({ draws }: { draws: Draw[] }) {
  function handleUpdate() {
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      {draws.map((draw) => (
        <DrawConfigurator
          key={draw.id}
          draw={draw as Record<string, unknown>}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
