import { cn } from 'lib/utils';

export interface GuestbookHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function GuestbookHeader({
  title = 'sign my guestbook',
  description = 'Leave your mark on my guestbook. Say hi, ask a question, or share your thoughts.',
  className,
}: GuestbookHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">{title}</h1>
      <p className="prose prose-neutral dark:prose-invert mb-8">
        {description}
      </p>
    </div>
  );
}
