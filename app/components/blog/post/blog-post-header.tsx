import { cn } from 'lib/utils';

export interface BlogPostHeaderProps {
  title: string;
  className?: string;
}

export function BlogPostHeader({ title, className }: BlogPostHeaderProps) {
  return (
    <h1
      className={cn(
        'title font-medium text-2xl tracking-tighter max-w-[650px]',
        className
      )}
    >
      {title}
    </h1>
  );
}
