'use client';

import { cn } from 'lib/utils';
import { z } from 'zod';

// Schema for Tambo AI
export const GuestbookEntrySchema = z.object({
  id: z.string().describe('Unique identifier for the entry'),
  created_by: z.string().describe('Name of the person who created the entry'),
  created_at: z.string().describe('ISO timestamp when the entry was created'),
  body: z.string().describe('The message content'),
});

export const GuestbookDisplaySchema = z.object({
  entries: z
    .array(GuestbookEntrySchema)
    .describe('Array of guestbook entries to display'),
  title: z
    .string()
    .optional()
    .describe('Optional title for the guestbook section'),
  showCount: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to show the total count of entries'),
  maxEntries: z
    .number()
    .optional()
    .describe('Maximum number of entries to display'),
  className: z
    .string()
    .optional()
    .describe('Optional CSS class name for styling'),
});

export type GuestbookEntry = z.infer<typeof GuestbookEntrySchema>;
export type GuestbookDisplayProps = z.infer<typeof GuestbookDisplaySchema>;

// Individual entry component
function GuestbookEntryItem({ entry }: { entry: GuestbookEntry }) {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
      <div className="flex items-baseline space-x-2 mb-1">
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {entry.created_by}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {new Date(entry.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {entry.body}
      </p>
    </div>
  );
}

export function GuestbookDisplay({
  entries = [],
  title,
  showCount = true,
  maxEntries,
  className,
}: GuestbookDisplayProps) {
  // Handle empty or invalid entries
  if (!entries || entries.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {title && (
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
        )}
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No guestbook entries yet.
        </p>
      </div>
    );
  }

  // Filter valid entries
  const validEntries = entries.filter(
    entry =>
      entry && entry.id && entry.created_by && entry.created_at && entry.body
  );

  // Limit entries if maxEntries is specified
  const displayEntries = maxEntries
    ? validEntries.slice(0, maxEntries)
    : validEntries;

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          {showCount && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {validEntries.length}{' '}
              {validEntries.length === 1 ? 'entry' : 'entries'}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {displayEntries.map(entry => (
          <GuestbookEntryItem key={entry.id} entry={entry} />
        ))}
      </div>

      {maxEntries && validEntries.length > maxEntries && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center pt-4">
          Showing {maxEntries} of {validEntries.length} entries
        </p>
      )}
    </div>
  );
}

// Compact version for displaying a single highlighted entry
export const GuestbookHighlightSchema = z.object({
  entry: GuestbookEntrySchema.describe('A single guestbook entry to highlight'),
  title: z
    .string()
    .optional()
    .describe('Optional title for the highlight section'),
  className: z
    .string()
    .optional()
    .describe('Optional CSS class name for styling'),
});

export type GuestbookHighlightProps = z.infer<typeof GuestbookHighlightSchema>;

export function GuestbookHighlight({
  entry,
  title = 'Featured Guestbook Entry',
  className,
}: GuestbookHighlightProps) {
  if (
    !entry ||
    !entry.id ||
    !entry.created_by ||
    !entry.created_at ||
    !entry.body
  ) {
    return null;
  }

  return (
    <div
      className={cn(
        'p-6 rounded-lg border border-neutral-200 dark:border-neutral-800',
        'bg-neutral-50 dark:bg-neutral-900',
        className
      )}
    >
      {title && (
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-500 uppercase tracking-wide mb-4">
          {title}
        </h3>
      )}

      <blockquote className="space-y-3">
        <p className="text-base text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
          "{entry.body}"
        </p>

        <footer className="flex items-baseline space-x-2">
          <cite className="text-sm font-medium text-neutral-900 dark:text-neutral-100 not-italic">
            {entry.created_by}
          </cite>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {new Date(entry.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </footer>
      </blockquote>
    </div>
  );
}
