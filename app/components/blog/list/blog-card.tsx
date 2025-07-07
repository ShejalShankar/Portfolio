import { cn } from 'lib/utils';
import Link from 'next/link';
import { z } from 'zod';

// Schema for Tambo AI
export const BlogCardSchema = z.object({
  slug: z.string().describe('URL slug for the blog post'),
  title: z.string().describe('Title of the blog post'),
  publishedAt: z
    .string()
    .describe('Publication date in ISO format (e.g., "2024-01-15")'),
  summary: z.string().describe('Brief description/summary of the blog post'),
  className: z
    .string()
    .optional()
    .describe('Optional CSS class name for styling'),
});

export interface BlogCardProps {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  className?: string;
}

export function BlogCard({
  slug,
  title,
  publishedAt,
  summary,
  className,
}: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className={cn(
        'block p-6 rounded-lg border border-neutral-200 dark:border-neutral-800',
        'hover:border-neutral-300 dark:hover:border-neutral-700',
        'transition-all duration-200',
        'group',
        className
      )}
    >
      <article>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 group-hover:underline underline-offset-4">
            {title}
          </h2>
          <time className="text-sm text-neutral-500 dark:text-neutral-500 flex-shrink-0 ml-4">
            {new Date(publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </time>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {summary}
        </p>
      </article>
    </Link>
  );
}
