'use client';

import { useTambo, useTamboThread } from '@tambo-ai/react';
import { CanvasSpace } from 'app/components/tambo/canvas-space';
import type { messageVariants } from 'app/components/tambo/message';
import {
  MessageInput,
  MessageInputError,
  MessageInputSpeechButton,
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
import { MessageSquare, Mic, Square, X, PanelRightClose } from 'lucide-react';
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
    const [isMinimalMode, setIsMinimalMode] = React.useState(true);
    const [isRecording, setIsRecording] = React.useState(false);
    const isMac =
      typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac');
    const { thread } = useTambo();
    const { cancel, isIdle } = useTamboThread();

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

        {/* Split Layout Container */}
        <div
          className="fixed inset-0 z-[9999] flex"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          {/* Canvas Space - full width in minimal mode */}
          <div className={cn('relative', isMinimalMode ? 'flex-1' : 'flex-1')}>
            <CanvasSpace className="h-full border-none bg-white/70 dark:bg-neutral-900/70" />

            {/* Close button - positioned in top left of canvas */}
            <button
              onClick={() => setOpen(false)}
              className={cn(
                'absolute top-4 left-4 z-10',
                'w-10 h-10',
                'bg-white/80 dark:bg-neutral-900/80',
                'border border-neutral-200 dark:border-neutral-800',
                'rounded-sm',
                'shadow-sm hover:shadow-md',
                'transition-all duration-200',
                'flex items-center justify-center',
                'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              )}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Toggle button - positioned in top right of canvas */}
            <button
              onClick={() => setIsMinimalMode(!isMinimalMode)}
              className={cn(
                'absolute top-4 right-4 z-10',
                'w-10 h-10',
                'bg-white/80 dark:bg-neutral-900/80',
                'border border-neutral-200 dark:border-neutral-800',
                'rounded-sm',
                'shadow-sm hover:shadow-md',
                'transition-all duration-200',
                'flex items-center justify-center',
                'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              )}
              aria-label={isMinimalMode ? 'Show chat' : 'Hide chat'}
            >
              {isMinimalMode ? (
                <MessageSquare className="w-5 h-5" />
              ) : (
                <PanelRightClose className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Right side - Chat Interface (only shown when not in minimal mode) */}
          {!isMinimalMode && (
            <div
              ref={ref}
              className={cn(
                'w-[440px] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm h-full flex flex-col shadow-lg transition-all duration-300',
                className
              )}
              {...props}
            >
              <div className="flex flex-col h-full p-4 gap-4">
                {/* Chat messages area - always render container with flex-1 */}
                <div className="flex-1 min-h-0">
                  {thread?.messages?.length > 0 && (
                    <ScrollableMessageContainer className="h-full bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-lg p-4 overflow-y-auto">
                      <ThreadContent variant={variant}>
                        <ThreadContentMessages />
                      </ThreadContent>
                    </ScrollableMessageContainer>
                  )}
                </div>

                {/* Message input at bottom */}
                <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-lg p-3">
                  <MessageInput contextKey={contextKey}>
                    <MessageInputTextarea />
                    <MessageInputToolbar>
                      <MessageInputSpeechButton />
                      <MessageInputSubmitButton />
                    </MessageInputToolbar>
                    <MessageInputError />
                  </MessageInput>
                </div>
              </div>
            </div>
          )}

          {/* Floating button in minimal mode - handles both mic and stop */}
          {isMinimalMode && (
            <div
              className="fixed bottom-6 right-6 z-50"
              style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 50,
              }}
            >
              {/* Show stop button when thread is running */}
              {!isIdle ? (
                <div className="relative">
                  {/* Background glow effect */}
                  <div
                    className="absolute inset-0 -z-10 rounded-sm transition-all duration-500 animate-pulse-glow"
                    style={{
                      background:
                        'radial-gradient(circle at center, rgba(255, 59, 48, 0.4) 0%, rgba(255, 59, 48, 0.25) 40%, rgba(255, 59, 48, 0.15) 70%, rgba(255, 59, 48, 0.05) 85%, transparent 100%)',
                      filter: 'blur(16px)',
                      transform: 'scale(2.5)',
                    }}
                  />

                  <button
                    onClick={() => cancel()}
                    className={cn(
                      'w-12 h-12',
                      'bg-white/80 dark:bg-neutral-900/80',
                      'border border-neutral-200 dark:border-neutral-800',
                      'rounded-sm',
                      'shadow-sm hover:shadow-md',
                      'transition-all duration-200',
                      'flex items-center justify-center',
                      'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                    )}
                    aria-label="Stop thread"
                  >
                    <Square className="w-5 h-5" fill="currentColor" />
                  </button>
                </div>
              ) : (
                // Show mic button when idle
                <MessageInput
                  contextKey={contextKey}
                  className="!w-auto [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!shadow-none [&>div]:!p-0"
                >
                  {/* Hidden form elements to maintain context */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      padding: 0,
                      margin: '-1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      borderWidth: 0,
                    }}
                  >
                    <MessageInputTextarea />
                    <MessageInputSubmitButton />
                  </div>

                  {/* Custom styled speech button */}
                  <div className="relative">
                    {/* Background glow effect */}
                    <div
                      className="absolute inset-0 -z-10 rounded-sm transition-all duration-500 animate-pulse-glow"
                      style={{
                        background: isRecording
                          ? 'radial-gradient(circle at center, rgba(255, 59, 48, 0.4) 0%, rgba(255, 59, 48, 0.25) 40%, rgba(255, 59, 48, 0.15) 70%, rgba(255, 59, 48, 0.05) 85%, transparent 100%)'
                          : 'radial-gradient(circle at center, rgba(128, 128, 128, 0.4) 0%, rgba(128, 128, 128, 0.25) 40%, rgba(128, 128, 128, 0.15) 70%, rgba(128, 128, 128, 0.05) 85%, transparent 100%)',
                        filter: 'blur(16px)',
                        transform: 'scale(2.5)',
                      }}
                    />

                    <MessageInputSpeechButton
                      // Hide the default "Listening..." text
                      className="[&>div>div:nth-child(2)]:hidden"
                      buttonClassName={cn(
                        'w-12 h-12',
                        'bg-white/80 dark:bg-neutral-900/80',
                        'border border-neutral-200 dark:border-neutral-800',
                        'rounded-sm',
                        'shadow-sm hover:shadow-md',
                        'transition-all duration-200',
                        'flex items-center justify-center',
                        'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                      )}
                      onRecordingChange={setIsRecording}
                    />
                  </div>
                </MessageInput>
              )}
            </div>
          )}
        </div>
      </>
    ) : null;

    return (
      <>
        {/* Minimalist trigger button */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-12 h-12',
            'bg-white dark:bg-neutral-900',
            'border border-neutral-200 dark:border-neutral-800',
            'rounded-sm',
            'shadow-sm hover:shadow-md',
            'transition-all duration-200',
            'flex items-center justify-center',
            'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
            'animate-pulse-wave'
          )}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
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
          <Mic className="w-5 h-5" />

          {/* Keyboard shortcut hint */}
          <span className="absolute -top-8 right-0 text-xs text-neutral-400 dark:text-neutral-500 opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
            {isMac ? '⌘' : 'Ctrl'}+K
          </span>
        </button>

        {/* Portal the modal to document.body */}
        {mounted && createPortal(modalContent, document.body)}
      </>
    );
  }
);
ControlBar.displayName = 'ControlBar';
