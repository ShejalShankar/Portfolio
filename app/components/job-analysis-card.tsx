'use client';

import { cn } from 'lib/utils';
import { Briefcase, Building2, CheckCircle2, MapPin } from 'lucide-react';
import { z } from 'zod';

export const JobAnalysisCardSchema = z.object({
  jobTitle: z.string().describe('The job title'),
  company: z.string().describe('The company name'),
  location: z
    .string()
    .optional()
    .describe('Job location (remote/hybrid/onsite)'),
  experience: z.string().optional().describe('Required experience level'),
  keySkills: z
    .array(z.string())
    .optional()
    .default([])
    .describe('Key skills required for the role'),
  matchingPoints: z
    .array(z.string())
    .optional()
    .default([])
    .describe('Points where Akhilesh matches the requirements'),
  fitScore: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('How well Akhilesh fits (0-100)'),
});

export type JobAnalysisCardProps = z.infer<typeof JobAnalysisCardSchema>;

export function JobAnalysisCard({
  jobTitle,
  company,
  location,
  experience,
  keySkills = [],
  matchingPoints = [],
  fitScore,
}: JobAnalysisCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {jobTitle}
        </h3>
        <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            <span>{company}</span>
          </div>
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
          {experience && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{experience}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fit Score */}
      {fitScore !== undefined && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Match Score:
          </span>
          <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                fitScore >= 80
                  ? 'bg-green-500'
                  : fitScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
              )}
              style={{ width: `${fitScore}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {fitScore}%
          </span>
        </div>
      )}

      {/* Key Skills */}
      {keySkills && keySkills.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Key Skills Required:
          </h4>
          <div className="flex flex-wrap gap-2">
            {keySkills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Matching Points */}
      {matchingPoints && matchingPoints.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Why I'm a Great Fit:
          </h4>
          <ul className="space-y-1">
            {matchingPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
