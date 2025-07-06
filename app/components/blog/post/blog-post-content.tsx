import { cn } from 'lib/utils';
import { CustomMDX } from '../../mdx';

export interface BlogPostContentProps {
  content: string;
  className?: string;
}

export function BlogPostContent({ content, className }: BlogPostContentProps) {
  return (
    <article
      className={cn(
        'prose prose-quoteless prose-neutral dark:prose-invert',
        className
      )}
    >
      <CustomMDX source={content} />
    </article>
  );
}
