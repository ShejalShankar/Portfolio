import { cn } from 'lib/utils';
import Link from 'next/link';
import { Suspense } from 'react';

export interface BlogPostItemProps {
  slug: string;
  title: string;
  publishedAt: string;
  className?: string;
  showViews?: boolean;
  ViewsComponent?: React.ComponentType<{ slug: string }>;
}

export function BlogPostItem({
  slug,
  title,
  publishedAt,
  className,
  showViews = false,
  ViewsComponent,
}: BlogPostItemProps) {
  return (
    <Link
      key={slug}
      className={cn('block group', className)}
      href={`/blog/${slug}`}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-neutral-900 dark:text-neutral-100 group-hover:underline underline-offset-4">
          {title}
        </h2>
        <span className="text-sm text-neutral-500 dark:text-neutral-500">
          {new Date(publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
      {showViews && ViewsComponent && (
        <Suspense fallback={<div className="h-4" />}>
          <ViewsComponent slug={slug} />
        </Suspense>
      )}
    </Link>
  );
}
