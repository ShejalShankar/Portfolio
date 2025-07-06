import { cn } from 'lib/utils';

export interface BlogHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function BlogHeader({
  title = 'Blog',
  description,
  className,
}: BlogHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <h1 className="text-2xl font-normal mb-2 text-neutral-900 dark:text-neutral-100">
        {title}
      </h1>
      {description && (
        <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
      )}
    </div>
  );
}
