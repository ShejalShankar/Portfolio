import { cn } from 'lib/utils';

export interface HeroSectionProps {
  name: string;
  description: string;
  className?: string;
}

export function HeroSection({
  name,
  description,
  className,
}: HeroSectionProps) {
  return (
    <div className={cn('mb-16', className)}>
      <h1 className="text-2xl font-normal mb-6 text-neutral-900 dark:text-neutral-100">
        {name}
      </h1>
      <div className="text-neutral-600 dark:text-neutral-400 space-y-4">
        <p>{description}</p>
      </div>
    </div>
  );
}
