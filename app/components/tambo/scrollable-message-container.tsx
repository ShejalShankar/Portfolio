'use client';

import { useTambo } from '@tambo-ai/react';
import { cn } from 'lib/utils';
import * as React from 'react';
import { useEffect, useRef } from 'react';

/**
 * Props for the ScrollableMessageContainer component
 */
export type ScrollableMessageContainerProps =
  React.HTMLAttributes<HTMLDivElement>;

/**
 * A scrollable container for message content with auto-scroll functionality.
 * Used across message thread components for consistent scrolling behavior.
 *
 * @example
 * ```tsx
 * <ScrollableMessageContainer>
 *   <ThreadContent variant="default">
 *     <ThreadContentMessages />
 *   </ThreadContent>
 * </ScrollableMessageContainer>
 * ```
 */
export const ScrollableMessageContainer = React.forwardRef<
  HTMLDivElement,
  ScrollableMessageContainerProps
>(({ className, children, ...props }, ref) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { thread } = useTambo();

  // Handle forwarded ref
  React.useImperativeHandle(ref, () => scrollContainerRef.current!, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollContainerRef.current && thread?.messages?.length) {
      const timeoutId = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 250);

      return () => clearTimeout(timeoutId);
    }
  }, [thread?.messages]);

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'flex-1 overflow-y-auto',
        // Scrollbar track
        '[&::-webkit-scrollbar]:w-2',
        '[&::-webkit-scrollbar]:h-2',
        // Scrollbar track background
        '[&::-webkit-scrollbar-track]:bg-transparent',
        // Scrollbar thumb
        '[&::-webkit-scrollbar-thumb]:bg-neutral-300/50',
        '[&::-webkit-scrollbar-thumb]:dark:bg-neutral-600/50',
        '[&::-webkit-scrollbar-thumb]:rounded-full',
        '[&::-webkit-scrollbar-thumb]:transition-colors',
        // Scrollbar thumb hover
        '[&::-webkit-scrollbar-thumb:hover]:bg-neutral-400/70',
        '[&::-webkit-scrollbar-thumb:hover]:dark:bg-neutral-500/70',
        // Scrollbar corner (where horizontal and vertical scrollbars meet)
        '[&::-webkit-scrollbar-corner]:bg-transparent',
        // Firefox scrollbar styling
        'scrollbar-thin',
        'scrollbar-track-transparent',
        'scrollbar-thumb-neutral-300/50',
        'dark:scrollbar-thumb-neutral-600/50',
        // Add some padding to prevent content from touching scrollbar
        'pr-1',
        className
      )}
      data-slot="scrollable-message-container"
      {...props}
    >
      {children}
    </div>
  );
});
ScrollableMessageContainer.displayName = 'ScrollableMessageContainer';
