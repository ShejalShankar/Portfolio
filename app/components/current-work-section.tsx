'use client';

import { cn } from 'lib/utils';
import React from 'react';
import { z } from 'zod';

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

// Schema for Tambo AI - structured data only
export const CurrentWorkSectionSchema = z.object({
  title: z.string().optional().describe('Section title (default: "Current")'),
  workItems: z
    .array(
      z.object({
        description: z.string().describe('Work description text'),
        company: z.string().optional().describe('Company name'),
        companyUrl: z.string().optional().describe('Company website URL'),
        additionalLinks: z
          .array(
            z.object({
              text: z.string().describe('Link text'),
              url: z.string().describe('Link URL'),
              underline: z
                .boolean()
                .optional()
                .describe('Whether to underline the link'),
            })
          )
          .optional()
          .describe('Additional related links'),
      })
    )
    .describe('Array of work items with structured data'),
  className: z
    .string()
    .optional()
    .describe('Optional CSS class name for styling'),
});

// Type for the component props - supports both structured data and React elements
export type CurrentWorkSectionProps = {
  title?: string;
  workItems?: Array<
    | {
        description: string;
        company?: string;
        companyUrl?: string;
        additionalLinks?: {
          text: string;
          url: string;
          underline?: boolean;
        }[];
      }
    | React.ReactElement
  >;
  className?: string;
};

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
  workItems = [],
  className,
}: CurrentWorkSectionProps) {
  // Early return if no work items
  if (!workItems || workItems.length === 0) {
    return null;
  }

  return (
    <div className={cn('mb-16', className)}>
      <h2 className="font-normal mb-4 text-neutral-500 dark:text-neutral-500 uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
        {workItems.map((item, index) => {
          // Check if it's a React element
          if (React.isValidElement(item)) {
            return <div key={index}>{item}</div>;
          }

          // Otherwise treat as structured data
          if (typeof item === 'object' && 'description' in item) {
            return (
              <p key={index}>
                {item.description}
                {item.company && (
                  <>
                    {' '}
                    {item.companyUrl ? (
                      <Badge href={item.companyUrl} underline={true}>
                        {item.company}
                      </Badge>
                    ) : (
                      item.company
                    )}
                  </>
                )}
                {item.additionalLinks?.map((link, linkIndex) => (
                  <span key={linkIndex}>
                    {' '}
                    <Badge href={link.url} underline={link.underline}>
                      {link.text}
                    </Badge>
                  </span>
                ))}
                .
              </p>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

export { Badge };
