import { cn } from 'lib/utils';
import { BlogPostItem } from './blog-item';

export interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  summary?: string;
}

export interface BlogPostListProps {
  posts: BlogPost[];
  className?: string;
  showViews?: boolean;
  ViewsComponent?: React.ComponentType<{ slug: string }>;
  sortBy?: 'date' | 'title' | 'none';
  sortOrder?: 'asc' | 'desc';
}

export function BlogPostList({
  posts,
  className,
  showViews = false,
  ViewsComponent,
  sortBy = 'date',
  sortOrder = 'desc',
}: BlogPostListProps) {
  // Sort posts based on sortBy and sortOrder
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'none') return 0;

    let comparison = 0;

    if (sortBy === 'date') {
      comparison =
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className={cn('space-y-6', className)}>
      {sortedPosts.map(post => (
        <BlogPostItem
          key={post.slug}
          slug={post.slug}
          title={post.title}
          publishedAt={post.publishedAt}
          showViews={showViews}
          ViewsComponent={ViewsComponent}
        />
      ))}
    </div>
  );
}
