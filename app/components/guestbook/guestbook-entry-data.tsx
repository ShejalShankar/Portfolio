import { cn } from 'lib/utils';

export interface GuestbookEntryData {
  id: string;
  created_by: string;
  created_at: string;
  body: string;
}

export interface GuestbookEntryDataProps {
  entry: GuestbookEntryData;
  className?: string;
}

export function GuestbookEntryData({
  entry,
  className,
}: GuestbookEntryDataProps) {
  return (
    <div
      className={cn(
        'border-b border-neutral-200 dark:border-neutral-800 pb-4',
        className
      )}
    >
      <div className="flex items-baseline space-x-2 mb-1">
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {entry.created_by}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {new Date(entry.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {entry.body}
      </p>
    </div>
  );
}
