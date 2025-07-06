'use client';

import { useTambo } from '@tambo-ai/react';
import type { messageVariants } from 'app/components/tambo/message';
import {
  MessageInput,
  MessageInputError,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from 'app/components/tambo/message-input';
import { ScrollableMessageContainer } from 'app/components/tambo/scrollable-message-container';
import {
  ThreadContent,
  ThreadContentMessages,
} from 'app/components/tambo/thread-content';
import type { VariantProps } from 'class-variance-authority';
import { cn } from 'lib/utils';
import Image from 'next/image';
import hand from 'public/emojis/hand.svg';
import microphone from 'public/emojis/microphone.svg';
import robot from 'public/emojis/robot.svg';
import * as React from 'react';
import { createPortal } from 'react-dom';

/**
 * Props for the ControlBar component
 * @interface
 * @extends React.HTMLAttributes<HTMLDivElement>
 */
export interface ControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional context key for the thread */
  contextKey?: string;
  /** Keyboard shortcut for toggling the control bar (default: "mod+k") */
  hotkey?: string;
  /**
   * Controls the visual styling of messages in the thread.
   * Possible values include: "default", "compact", etc.
   * These values are defined in messageVariants from "@/components/tambo/message".
   * @example variant="compact"
   */
  variant?: VariantProps<typeof messageVariants>['variant'];
}

/**
 * A floating control bar component for quick access to chat functionality
 * @component
 * @example
 * ```tsx
 * <ControlBar
 *   contextKey="my-thread"
 *   hotkey="mod+k"
 *   className="custom-styles"
 * />
 * ```
 */
export const ControlBar = React.forwardRef<HTMLDivElement, ControlBarProps>(
  ({ className, contextKey, hotkey = 'mod+k', variant, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const isMac =
      typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac');
    const { thread } = useTambo();

    // Ensure we're mounted before creating portal
    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        const [modifier, key] = hotkey.split('+');
        const isModifierPressed =
          modifier === 'mod' ? e.metaKey || e.ctrlKey : false;
        if (e.key === key && isModifierPressed) {
          e.preventDefault();
          setOpen(open => !open);
        }
      };
      document.addEventListener('keydown', down);
      return () => document.removeEventListener('keydown', down);
    }, [hotkey]);

    // Handle escape key
    React.useEffect(() => {
      if (!open) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open]);

    const modalContent = open ? (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/40 z-[9998]"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Modal Content */}
        <div
          ref={ref}
          className={cn(
            'fixed top-1/4 left-1/2 z-[9999] w-[440px] max-w-[90vw] rounded-lg shadow-lg transition-all duration-200 outline-none',
            className
          )}
          style={{
            position: 'fixed',
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
          {...props}
        >
          <div className="flex flex-col gap-3">
            <div className="bg-background border rounded-lg p-3 flex items-center justify-between gap-4">
              <div className="flex-1">
                <MessageInput contextKey={contextKey}>
                  <MessageInputTextarea />
                  <MessageInputToolbar>
                    <MessageInputSubmitButton />
                  </MessageInputToolbar>
                  <MessageInputError />
                </MessageInput>
              </div>
            </div>
            {thread?.messages?.length > 0 && (
              <ScrollableMessageContainer className="bg-background border rounded-lg p-4 max-h-[500px]">
                <ThreadContent variant={variant}>
                  <ThreadContentMessages />
                </ThreadContent>
              </ScrollableMessageContainer>
            )}
          </div>
        </div>
      </>
    ) : null;

    return (
      <>
        {/* Trigger Button */}
        <button
          onClick={() => setOpen(true)}
          aria-label="AI chat"
          className={cn(
            'fixed bottom-4 right-4 z-50',
            'px-3 py-2',
            'focus:outline-none focus:ring-0 focus:border-none outline-none border-none',
            'active:outline-none active:ring-0 active:border-none',
            'transition-all duration-200',
            'relative'
          )}
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            zIndex: 50,
            outline: 'none',
            border: 'none',
            boxShadow: 'none',
          }}
        >
          {/* Background light effect with pulse */}
          <div
            className="absolute inset-0 -z-10 rounded-lg animate-pulse-glow"
            style={{
              background:
                'radial-gradient(circle at center, rgba(128, 128, 128, 0.4) 0%, rgba(128, 128, 128, 0.25) 40%, rgba(128, 128, 128, 0.15) 70%, rgba(128, 128, 128, 0.05) 85%, transparent 100%)',
              filter: 'blur(16px)',
              transform: 'scale(2.5)',
            }}
          />

          <span className="text-2xl animate-pulse-wave select-none flex items-center gap-2">
            <Image src={robot} alt="robot" width={24} height={24} />
            <Image
              src={hand}
              alt="hand"
              width={24}
              height={24}
              className="hidden sm:inline"
            />
            <Image
              src={microphone}
              alt="microphone"
              width={24}
              height={24}
              className="hidden sm:inline"
            />
          </span>
        </button>

        {/* Portal the modal to document.body */}
        {mounted && createPortal(modalContent, document.body)}
      </>
    );
  }
);
ControlBar.displayName = 'ControlBar';
