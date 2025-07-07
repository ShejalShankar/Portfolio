'use client';

import { cn } from 'lib/utils';
import { Briefcase, ExternalLink, FileText } from 'lucide-react';
import { z } from 'zod';

// Resume link from nav.tsx
const RESUME_URL =
  'https://drive.google.com/file/d/1f-YG86g7FeXBarBtjkxKRjC6BheMDGci/view?usp=sharing';

// Schema for Tambo AI
export const ResumeOverviewSchema = z.object({
  showDownloadButton: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to show the download/view button'),
  buttonText: z
    .string()
    .optional()
    .default('View Resume')
    .describe('Text for the resume button'),
  className: z
    .string()
    .optional()
    .describe('Optional CSS class name for styling'),
});

export type ResumeOverviewProps = z.infer<typeof ResumeOverviewSchema>;

export function ResumeOverview({
  showDownloadButton = true,
  buttonText = 'View Resume',
  className,
}: ResumeOverviewProps) {
  const handleOpenResume = () => {
    window.open(RESUME_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Card */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <Briefcase className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          </div>
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Professional Overview
          </h2>
        </div>

        <div className="space-y-3 text-sm">
          {/* Current Roles */}
          <div>
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Current Positions
            </h3>
            <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 dark:text-neutral-600 mt-1">
                  •
                </span>
                <span>Software Development Intern at tambo ai</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 dark:text-neutral-600 mt-1">
                  •
                </span>
                <span>Collaborating with James Murdza on GitWit.dev</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400 dark:text-neutral-600 mt-1">
                  •
                </span>
                <span>Research Assistant in AI at GWU</span>
              </li>
            </ul>
          </div>

          {/* Key Areas */}
          <div>
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Key Areas
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Full-stack development, AI/ML, cloud IDEs, open-source
              contributions, high-performance chatbots, and educational
              platforms.
            </p>
          </div>

          {/* Education */}
          <div>
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Education
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Currently pursuing Master's degree at George Washington University
              (GWU)
            </p>
          </div>
        </div>

        {/* Resume Button */}
        {showDownloadButton && (
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleOpenResume}
              className={cn(
                'group flex items-center gap-2 px-4 py-2.5 rounded-lg',
                'bg-neutral-900 dark:bg-neutral-100',
                'text-white dark:text-black',
                'hover:bg-neutral-800 dark:hover:bg-neutral-200',
                'transition-all duration-200',
                'text-sm font-medium',
                'w-full sm:w-auto justify-center'
              )}
            >
              <FileText className="w-4 h-4" />
              <span>{buttonText}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
            </button>
          </div>
        )}
      </div>

      {/* Additional Info Card */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4">
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          The resume includes detailed information about projects, technical
          skills, work experience, and academic achievements. It's hosted on
          Google Drive for easy access and sharing.
        </p>
      </div>
    </div>
  );
}

// Compact Resume Button Component
export const ResumeButtonSchema = z.object({
  variant: z
    .enum(['primary', 'secondary', 'ghost'])
    .optional()
    .default('primary')
    .describe('Button style variant'),
  size: z
    .enum(['sm', 'md', 'lg'])
    .optional()
    .default('md')
    .describe('Button size'),
  showIcon: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to show the icon'),
  className: z
    .string()
    .optional()
    .describe('Optional CSS class name for styling'),
});

export type ResumeButtonProps = z.infer<typeof ResumeButtonSchema>;

export function ResumeButton({
  variant = 'primary',
  size = 'md',
  showIcon = true,
  className,
}: ResumeButtonProps) {
  const handleOpenResume = () => {
    window.open(RESUME_URL, '_blank', 'noopener,noreferrer');
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantClasses = {
    primary: cn(
      'bg-neutral-900 dark:bg-neutral-100',
      'text-white dark:text-black',
      'hover:bg-neutral-800 dark:hover:bg-neutral-200'
    ),
    secondary: cn(
      'bg-white dark:bg-neutral-900',
      'border border-neutral-200 dark:border-neutral-800',
      'text-neutral-900 dark:text-neutral-100',
      'hover:bg-neutral-50 dark:hover:bg-neutral-800'
    ),
    ghost: cn(
      'text-neutral-600 dark:text-neutral-400',
      'hover:text-neutral-900 dark:hover:text-neutral-100',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
    ),
  };

  return (
    <button
      onClick={handleOpenResume}
      className={cn(
        'group inline-flex items-center gap-2 rounded-lg',
        'font-medium transition-all duration-200',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {showIcon && (
        <FileText
          className={cn(
            'transition-transform group-hover:scale-110',
            size === 'sm'
              ? 'w-3.5 h-3.5'
              : size === 'md'
                ? 'w-4 h-4'
                : 'w-5 h-5'
          )}
        />
      )}
      <span>View Resume</span>
      <ExternalLink
        className={cn(
          'opacity-70 group-hover:opacity-100',
          size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'
        )}
      />
    </button>
  );
}
