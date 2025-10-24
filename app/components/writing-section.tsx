import { cn } from 'lib/utils';

export interface BlogPost {
  title: string;
  summary: string;
  slug: string;
  publishedAt: string;
}

export interface WritingSectionProps {
  title?: string;
  posts: BlogPost[];
  className?: string;
  showAll?: boolean;
  maxPosts?: number;
}

export function WritingSection({
  title = 'Highlights',
  posts,
  className,
  showAll = false,
  maxPosts = 3,
}: WritingSectionProps) {
  const displayPosts = showAll ? posts : posts.slice(0, maxPosts);

  return (
    <div className={cn('mb-16', className)}>
      <h2 className="font-normal mb-4 text-neutral-500 dark:text-neutral-500 uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-3">
        {displayPosts.map((post, index) => (
          <div key={index}>
            <a
              className="text-neutral-900 dark:text-neutral-100"
            >
              {post.title}
            </a>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {post.summary}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            </p>
          </div>
        ))}
      </div>
      {!showAll && posts.length > maxPosts && (
        <a
          href="/blog"
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mt-4 inline-block"
        >
          View all posts →
        </a>
      )}
    </div>
  );
}
