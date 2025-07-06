export interface BadgeProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  underline?: boolean;
  external?: boolean;
}

export interface SectionProps {
  className?: string;
  title?: string;
}
