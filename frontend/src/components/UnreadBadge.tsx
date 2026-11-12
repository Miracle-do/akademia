import { cn } from '@/lib/utils';

/** Pastille rouge avec le nombre de messages non lus (« 99+ » au-delà). Ne s'affiche pas à 0. */
export function UnreadBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      key={count}
      aria-hidden="true"
      className={cn(
        'badge-pop flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bad px-1 text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-card',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
