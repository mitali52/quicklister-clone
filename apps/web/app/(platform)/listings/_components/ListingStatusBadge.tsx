import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/schemas/listing.schemas';
import type { ListingStatus } from '@/lib/api/listings.api';

interface ListingStatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export function ListingStatusBadge({ status, className }: ListingStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700',
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
