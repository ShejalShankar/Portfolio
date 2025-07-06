'use client';

import { cn } from 'lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import { z } from 'zod';

export const PhotoGridSectionSchema = z.object({
  photos: z
    .array(
      z.object({
        src: z
          .string()
          .describe(
            'Image path (use local images like "/images/home/me.jpg", "/images/home/me2.jpg", "/images/home/me3.jpg", "/images/home/uni.jpg", "/images/home/vercel.jpg", "/images/home/twitter.jpg", "/images/home/linkedin.png", "/images/home/einstien.jpg", "/images/home/me4.jpg", "/images/home/x.png")'
          ),
        alt: z
          .string()
          .describe(
            'Alternative text for the image (e.g., "Me", "University", "Washington DC", "Work", "Team photo")'
          ),
        caption: z
          .string()
          .optional()
          .describe(
            'Optional caption for the image (e.g., "At university", "Working remotely", "Conference photo")'
          ),
      })
    )
    .optional()
    .default([
      { src: '/images/home/me.jpg', alt: 'Me' },
      { src: '/images/home/me3.jpg', alt: 'University' },
      { src: '/images/home/me2.jpg', alt: 'Washington DC' },
    ])
    .describe(
      'Array of photo objects to display in the grid. Use available portfolio images from /images/home/ directory.'
    ),
  className: z
    .string()
    .optional()
    .describe('Optional CSS class name for styling'),
  columns: z
    .number()
    .min(1)
    .max(4)
    .optional()
    .describe('Number of columns in the grid (1-4, default: 3)'),
});

export type PhotoGridSectionProps = z.infer<typeof PhotoGridSectionSchema>;

export function PhotoGridSection({
  photos = [],
  className,
  columns = 3,
}: PhotoGridSectionProps) {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const gridColsClass =
    {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    }[columns] || 'grid-cols-3';

  const validPhotos = photos.filter(
    photo =>
      photo.src &&
      photo.src.trim() !== '' &&
      photo.alt &&
      photo.alt.trim() !== ''
  );

  if (!validPhotos || validPhotos.length === 0) {
    return (
      <div
        className={cn(
          'mb-16 p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg text-center',
          className
        )}
      >
        <p className="text-neutral-500 dark:text-neutral-400">
          No valid photos provided for the photo grid.
        </p>
      </div>
    );
  }

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  const isValidImageUrl = (src: string) => {
    return (
      src.startsWith('/') || src.startsWith('./') || src.includes('localhost')
    );
  };

  return (
    <div className={cn(`grid ${gridColsClass} gap-4 mb-16`, className)}>
      {validPhotos.map((photo, index) => (
        <div key={index} className="relative">
          {!failedImages.has(index) && isValidImageUrl(photo.src) ? (
            <Image
              alt={photo.alt}
              src={photo.src}
              className="rounded-sm object-cover w-full h-40 grayscale hover:grayscale-0 transition-all"
              width={400}
              height={160}
              onError={() => handleImageError(index)}
            />
          ) : (
            <div className="w-full h-40 bg-neutral-100 dark:bg-neutral-800 rounded-sm flex items-center justify-center">
              <div className="text-center text-neutral-500 dark:text-neutral-400">
                <svg
                  className="mx-auto h-8 w-8 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xs">Image placeholder</p>
              </div>
            </div>
          )}
          {photo.caption && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              {photo.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
