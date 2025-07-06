import { cn } from 'lib/utils';
import Image from 'next/image';

export interface PhotoGridItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface PhotoGridSectionProps {
  photos: PhotoGridItem[];
  className?: string;
  columns?: number;
}

export function PhotoGridSection({
  photos,
  className,
  columns = 3,
}: PhotoGridSectionProps) {
  const gridColsClass =
    {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    }[columns] || 'grid-cols-3';

  return (
    <div className={cn(`grid ${gridColsClass} gap-4 mb-16`, className)}>
      {photos.map((photo, index) => (
        <div key={index} className="relative">
          <Image
            alt={photo.alt}
            src={photo.src}
            className="rounded-sm object-cover w-full h-40 grayscale hover:grayscale-0 transition-all"
            width={400}
            height={160}
          />
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
