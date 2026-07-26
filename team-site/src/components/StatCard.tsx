import { ArrowUp, type LucideIcon } from 'lucide-react';
import type { SprintStat } from '../data/stats';

const icons: Record<SprintStat['tone'], LucideIcon> = {
  teal: ArrowUp,
  amber: ArrowUp,
  blue: ArrowUp,
};

type StatCardProps = {
  stat: SprintStat;
};

export function StatCard({ stat }: StatCardProps) {
  const Icon = icons[stat.tone];

  return (
    <article className={`statCard ${stat.tone}`}>
      <span>{stat.label}</span>
      <strong>{stat.value}</strong>
      <p>
        <Icon size={15} />
        {stat.detail}
      </p>
    </article>
  );
}
