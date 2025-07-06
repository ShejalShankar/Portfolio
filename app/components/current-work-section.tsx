import { cn } from 'lib/utils';

export interface WorkItem {
  company: string;
  position: string;
  description: string;
  companyUrl?: string;
  additionalLinks?: {
    text: string;
    url: string;
  }[];
}

export interface CurrentWorkSectionProps {
  title?: string;
  workItems: React.ReactNode[];
  className?: string;
}

function Badge({
  href,
  children,
  underline = false,
}: {
  href: string;
  children: React.ReactNode;
  underline?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center font-normal',
        underline ? 'underline underline-offset-4' : '',
        'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors'
      )}
    >
      {children}
    </a>
  );
}

export function CurrentWorkSection({
  title = 'Current',
  workItems,
  className,
}: CurrentWorkSectionProps) {
  return (
    <div className={cn('mb-16', className)}>
      <h2 className="font-normal mb-4 text-neutral-500 dark:text-neutral-500 uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
        {workItems.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </div>
  );
}

export { Badge };
