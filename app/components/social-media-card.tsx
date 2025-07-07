'use client';

import { cn } from 'lib/utils';
import {
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  Twitter,
} from 'lucide-react';
import { z } from 'zod';

// Schema for Tambo AI
export const SocialMediaCardSchema = z.object({
  platform: z
    .enum([
      'twitter',
      'linkedin',
      'github',
      'email',
      'website',
      'discord',
      'custom',
    ])
    .describe('Social media platform type'),
  username: z.string().describe('Username or handle on the platform'),
  url: z.string().describe('Full URL to the social media profile'),
  displayName: z
    .string()
    .optional()
    .describe('Optional display name (defaults to username)'),
  description: z.string().optional().describe('Optional description or bio'),
  customIcon: z
    .string()
    .optional()
    .describe('Optional custom icon name for "custom" platform'),
  className: z
    .string()
    .optional()
    .describe('Optional CSS class name for styling'),
});

export type SocialMediaCardProps = z.infer<typeof SocialMediaCardSchema>;

// Icon mapping for different platforms
const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  email: Mail,
  website: Globe,
  discord: MessageSquare,
  custom: LinkIcon,
};

// Platform display names
const platformNames = {
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  email: 'Email',
  website: 'Website',
  discord: 'Discord',
  custom: 'Link',
};

// Platform colors for hover effects
const platformColors = {
  twitter: 'hover:text-[#1DA1F2] hover:border-[#1DA1F2]',
  linkedin: 'hover:text-[#0077B5] hover:border-[#0077B5]',
  github:
    'hover:text-[#333] dark:hover:text-[#f0f6fc] hover:border-[#333] dark:hover:border-[#f0f6fc]',
  email: 'hover:text-[#EA4335] hover:border-[#EA4335]',
  website: 'hover:text-blue-600 hover:border-blue-600',
  discord: 'hover:text-[#5865F2] hover:border-[#5865F2]',
  custom:
    'hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-700 dark:hover:border-neutral-300',
};

export function SocialMediaCard({
  platform,
  username,
  url,
  displayName,
  description,
  customIcon,
  className,
}: SocialMediaCardProps) {
  // Validate required props
  if (!platform || !username || !url) {
    console.warn('SocialMediaCard: Missing required props', {
      platform,
      username,
      url,
    });
    return null;
  }

  const Icon = platformIcons[platform] || LinkIcon;
  const platformName = customIcon || platformNames[platform];
  const platformColor = platformColors[platform];

  // For email, extract just the email address if it's a mailto: link
  const displayUsername =
    platform === 'email' && url.startsWith('mailto:')
      ? url.replace('mailto:', '')
      : username;

  return (
    <a
      href={url}
      target={platform === 'email' ? '_self' : '_blank'}
      rel={platform === 'email' ? undefined : 'noopener noreferrer'}
      className={cn(
        'group relative block p-4 rounded-lg border',
        'border-neutral-200 dark:border-neutral-800',
        'bg-white dark:bg-neutral-900',
        'transition-all duration-200',
        'hover:shadow-md hover:scale-[1.02]',
        platformColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700 transition-colors">
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {displayName || displayUsername}
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
            {platformName} • @{displayUsername}
          </p>

          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

// Export a multi-card component for displaying multiple social media profiles
export const SocialMediaGridSchema = z.object({
  cards: z
    .array(SocialMediaCardSchema)
    .default([])
    .describe('Array of social media cards to display'),
  columns: z
    .number()
    .optional()
    .default(2)
    .describe('Number of columns in the grid (default: 2)'),
  className: z
    .string()
    .optional()
    .describe('Optional CSS class name for the grid container'),
});

export type SocialMediaGridProps = z.infer<typeof SocialMediaGridSchema>;

export function SocialMediaGrid({
  cards,
  columns = 2,
  className,
}: SocialMediaGridProps) {
  // Handle undefined or empty cards array
  if (!cards || cards.length === 0) {
    return null;
  }

  // Filter out cards with missing required fields
  const validCards = cards.filter(
    card => card && card.platform && card.username && card.url
  );

  if (validCards.length === 0) {
    return null;
  }

  const gridCols =
    {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }[Math.min(Math.max(1, columns), 4)] || 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={cn('grid gap-4', gridCols, className)}>
      {validCards.map((card, index) => (
        <SocialMediaCard key={index} {...card} />
      ))}
    </div>
  );
}
