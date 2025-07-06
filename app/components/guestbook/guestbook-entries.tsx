import { cn } from 'lib/utils';
import { GuestbookEntryData } from './guestbook-entry-data';

export interface GuestbookEntriesProps {
  entries: GuestbookEntryData[];
  className?: string;
  emptyMessage?: string;
  showEmptyMessage?: boolean;
}

export function GuestbookEntries({
  entries,
  className,
  emptyMessage = 'No entries yet. Be the first to sign!',
  showEmptyMessage = false,
}: GuestbookEntriesProps) {
  if (entries.length === 0) {
    return showEmptyMessage ? (
      <div
        className={cn(
          'text-center text-neutral-500 dark:text-neutral-400 py-8',
          className
        )}
      >
        {emptyMessage}
      </div>
    ) : null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {entries.map(entry => (
        <GuestbookEntryData key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
