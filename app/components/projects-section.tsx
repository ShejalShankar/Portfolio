import { cn } from 'lib/utils';

export interface Project {
  title: string;
  description: string;
  url: string;
  technologies?: string[];
  featured?: boolean;
}

export interface ProjectsSectionProps {
  title?: string;
  projects: Project[];
  className?: string;
}

function Badge({
  href,
  children,
  underline = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  underline?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center font-normal',
        underline ? 'underline underline-offset-4' : '',
        'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors',
        className
      )}
    >
      {children}
    </a>
  );
}

export function ProjectsSection({
  title = 'Projects',
  projects,
  className,
}: ProjectsSectionProps) {
  return (
    <div className={cn('mb-16', className)}>
      <h2 className="font-normal mb-4 text-neutral-500 dark:text-neutral-500 uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-3">
        {projects.map((project, index) => (
          <div
            key={index}
            className={cn(
              project.featured
                ? 'border-l-2 border-neutral-200 dark:border-neutral-700 pl-4'
                : ''
            )}
          >
            <Badge
              href={project.url}
              underline={true}
              className="text-neutral-900 dark:text-neutral-100 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              {project.title} →
            </Badge>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {project.description}
            </p>
            {project.technologies && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
