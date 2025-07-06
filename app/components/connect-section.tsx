import { cn } from 'lib/utils';

export interface SocialLink {
  name: string;
  url: string;
  icon?: React.ReactNode;
  external?: boolean;
}

export interface ConnectSectionProps {
  title?: string;
  links: SocialLink[];
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

function Badge({
  href,
  children,
  external = true,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const linkProps = external
    ? {
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {};

  return (
    <a
      href={href}
      {...linkProps}
      className={cn(
        'inline-flex items-center font-normal',
        'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors'
      )}
    >
      {children}
    </a>
  );
}

export function ConnectSection({
  title = 'Connect',
  links,
  className,
  layout = 'horizontal',
}: ConnectSectionProps) {
  const containerClass = {
    horizontal: 'flex gap-6',
    vertical: 'flex flex-col gap-3',
    grid: 'grid grid-cols-2 gap-3',
  }[layout];

  return (
    <div className={cn('mb-16', className)}>
      <h2 className="font-normal mb-4 text-neutral-500 dark:text-neutral-500 uppercase tracking-wide">
        {title}
      </h2>
      <div className={containerClass}>
        {links.map((link, index) => (
          <Badge key={index} href={link.url} external={link.external}>
            {link.icon && <span className="mr-2">{link.icon}</span>}
            {link.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
