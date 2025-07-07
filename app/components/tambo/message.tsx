'use client';

import type { TamboThreadMessage } from '@tambo-ai/react';
import { useTambo } from '@tambo-ai/react';
import type TamboAI from '@tambo-ai/typescript-sdk';
import { createMarkdownComponents } from 'app/components/tambo/markdown-components';
import { cva, type VariantProps } from 'class-variance-authority';
import stringify from 'json-stringify-pretty-compact';
import { checkHasContent, getSafeContent } from 'lib/thread-hooks';
import { cn } from 'lib/utils';
import { Check, ChevronDown, ExternalLink, Loader2, X } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { TextToSpeechStream } from '../text-to-speech/text-to-speech-stream';

/**
 * CSS variants for the message container
 * @typedef {Object} MessageVariants
 * @property {string} default - Default styling
 * @property {string} solid - Solid styling with shadow effects
 */
const messageVariants = cva('flex', {
  variants: {
    variant: {
      default: '',
      solid: [
        '[&>div>div:first-child]:shadow-md',
        '[&>div>div:first-child]:bg-container/50',
        '[&>div>div:first-child]:hover:bg-container',
        '[&>div>div:first-child]:transition-all',
        '[&>div>div:first-child]:duration-200',
      ].join(' '),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/**
 * @typedef MessageContextValue
 * @property {"user" | "assistant"} role - The role of the message sender.
 * @property {VariantProps<typeof messageVariants>["variant"]} [variant] - Optional styling variant for the message container.
 * @property {TamboThreadMessage} message - The full Tambo thread message object.
 * @property {boolean} [isLoading] - Optional flag to indicate if the message is in a loading state.
 */
interface MessageContextValue {
  role: 'user' | 'assistant';
  variant?: VariantProps<typeof messageVariants>['variant'];
  message: TamboThreadMessage;
  isLoading?: boolean;
}

/**
 * React Context for sharing message data and settings among sub-components.
 * @internal
 */
const MessageContext = React.createContext<MessageContextValue | null>(null);

/**
 * Hook to access the message context.
 * Throws an error if used outside of a Message component.
 * @returns {MessageContextValue} The message context value.
 * @throws {Error} If used outside of Message.
 * @internal
 */
const useMessageContext = () => {
  const context = React.useContext(MessageContext);
  if (!context) {
    throw new Error('Message sub-components must be used within a Message');
  }
  return context;
};

// --- Sub-Components ---

/**
 * Props for the Message component.
 * Extends standard HTMLDivElement attributes.
 */
export interface MessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  /** The role of the message sender ('user' or 'assistant'). */
  role: 'user' | 'assistant';
  /** The full Tambo thread message object. */
  message: TamboThreadMessage;
  /** Optional styling variant for the message container. */
  variant?: VariantProps<typeof messageVariants>['variant'];
  /** Optional flag to indicate if the message is in a loading state. */
  isLoading?: boolean;
  /** The child elements to render within the root container. Typically includes Message.Bubble and Message.RenderedComponentArea. */
  children: React.ReactNode;
}

/**
 * The root container for a message component.
 * It establishes the context for its children and applies alignment styles based on the role.
 * @component Message
 * @example
 * ```tsx
 * <Message role="user" message={messageData} variant="solid">
 *   <Message.Bubble />
 *   <Message.RenderedComponentArea />
 * </Message>
 * ```
 */
const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  (
    { children, className, role, variant, isLoading, message, ...props },
    ref
  ) => {
    const contextValue = React.useMemo(
      () => ({ role, variant, isLoading, message }),
      [role, variant, isLoading, message]
    );

    // Don't render tool response messages as they're shown in tool call dropdowns
    if (message.actionType === 'tool_response') {
      return null;
    }
    return (
      <MessageContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(messageVariants({ variant }), className)}
          data-message-role={role}
          data-message-id={message.id}
          {...props}
        >
          {children}
        </div>
      </MessageContext.Provider>
    );
  }
);
Message.displayName = 'Message';

/**
 * Loading indicator with bouncing dots animation
 *
 * A reusable component that displays three animated dots for loading states.
 * Used in message content and tool status areas.
 *
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard HTML div props
 * @param {string} [props.className] - Optional CSS classes to apply
 * @returns {JSX.Element} Animated loading indicator component
 */
const LoadingIndicator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div className={cn('flex items-center gap-1', className)} {...props}>
      <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.1s]"></span>
    </div>
  );
};
LoadingIndicator.displayName = 'LoadingIndicator';

/**
 * Props for the MessageContent component.
 * Extends standard HTMLDivElement attributes.
 */
export interface MessageContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Optional override for the message content. If not provided, uses the content from the message object in the context. */
  content?: string | { type: string; text?: string }[];
  /** Optional flag to render as Markdown. Default is true. */
  markdown?: boolean;
}

/**
 * Displays the message content with optional markdown formatting.
 * Only shows text content - tool calls are handled by ToolcallInfo component.
 * @component MessageContent
 */
const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  (
    { className, children, content: contentProp, markdown = true, ...props },
    ref
  ) => {
    const { message, isLoading, role } = useMessageContext();
    const { thread } = useTambo();
    const contentToRender = children ?? contentProp ?? message.content;

    const safeContent = React.useMemo(
      () => getSafeContent(contentToRender as TamboThreadMessage['content']),
      [contentToRender]
    );
    const hasContent = React.useMemo(
      () => checkHasContent(contentToRender as TamboThreadMessage['content']),
      [contentToRender]
    );

    const showLoading = isLoading && !hasContent;

    // Extract text content for TTS
    const textContent = React.useMemo(() => {
      if (typeof safeContent === 'string') {
        // Remove markdown formatting for cleaner speech
        return safeContent
          .replace(/[#*`_~\[\]()]/g, '') // Remove markdown symbols
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .trim();
      }
      return '';
    }, [safeContent]);

    // Check if this is the latest assistant message
    const isLatestAssistantMessage = React.useMemo(() => {
      if (!thread?.messages || role !== 'assistant') return false;

      // Find the last assistant message in the thread
      const assistantMessages = thread.messages.filter(
        (m: TamboThreadMessage) => m.role === 'assistant'
      );

      if (assistantMessages.length === 0) return false;

      const lastAssistantMessage =
        assistantMessages[assistantMessages.length - 1];
      return lastAssistantMessage.id === message.id;
    }, [thread?.messages, role, message.id]);

    // Only show TTS for the latest assistant message
    const [showTTS, setShowTTS] = React.useState(false);

    React.useEffect(() => {
      if (isLatestAssistantMessage && textContent && !isLoading) {
        // Delay showing TTS to avoid playing old messages on page load
        const timer = setTimeout(() => setShowTTS(true), 100);
        return () => clearTimeout(timer);
      } else {
        setShowTTS(false);
      }
    }, [isLatestAssistantMessage, textContent, isLoading]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative block rounded-lg px-4 py-3 text-[15px] leading-relaxed transition-all duration-200 font-normal max-w-full',
          // Message bubble base styling
          'border shadow-sm',
          // User message styling
          role === 'user' && [
            'bg-white dark:bg-neutral-900',
            'border-neutral-200 dark:border-neutral-800',
            'shadow-neutral-100 dark:shadow-neutral-900/30',
            'hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700',
          ],
          // Assistant message styling
          role === 'assistant' && [
            'bg-neutral-50 dark:bg-neutral-800/50',
            'border-neutral-200 dark:border-neutral-700',
            'shadow-neutral-100 dark:shadow-neutral-900/30',
          ],
          // Markdown content styling
          '[&_p]:mb-2 [&_p:last-child]:mb-0',
          '[&_ul]:mb-2 [&_ul]:ml-4',
          '[&_ol]:mb-2 [&_ol]:ml-4',
          '[&_li]:list-item [&_li]:mb-1',
          '[&_code]:bg-neutral-100 [&_code]:dark:bg-neutral-800',
          '[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm',
          '[&_pre]:bg-neutral-100 [&_pre]:dark:bg-neutral-800',
          '[&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto',
          '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300',
          '[&_blockquote]:dark:border-neutral-600 [&_blockquote]:pl-4',
          '[&_blockquote]:italic [&_blockquote]:text-neutral-600',
          '[&_blockquote]:dark:text-neutral-400',
          className
        )}
        data-slot="message-content"
        {...props}
      >
        {showLoading ? (
          <div
            className="flex items-center justify-start h-4"
            data-slot="message-loading-indicator"
          >
            <LoadingIndicator className="text-neutral-500 dark:text-neutral-400" />
          </div>
        ) : (
          <>
            <div
              className={cn('break-words', !markdown && 'whitespace-pre-wrap')}
              data-slot="message-content-text"
            >
              {!contentToRender ? (
                <span className="text-neutral-500 dark:text-neutral-400 italic">
                  Empty message
                </span>
              ) : React.isValidElement(contentToRender) ? (
                contentToRender
              ) : markdown ? (
                <ReactMarkdown components={createMarkdownComponents()}>
                  {typeof safeContent === 'string' ? safeContent : ''}
                </ReactMarkdown>
              ) : (
                safeContent
              )}
              {message.isCancelled && (
                <span className="text-neutral-500 dark:text-neutral-400 text-xs ml-2">
                  (cancelled)
                </span>
              )}
            </div>

            {/* Add TTS controls for assistant messages */}
            {showTTS &&
              role === 'assistant' &&
              textContent &&
              !message.isCancelled && (
                <div className="mt-2 flex items-center">
                  <TextToSpeechStream
                    text={textContent}
                    autoPlay={true}
                    showControls={true}
                    className="text-xs"
                  />
                </div>
              )}
          </>
        )}
      </div>
    );
  }
);
MessageContent.displayName = 'MessageContent';

/**
 * Props for the ToolcallInfo component.
 * Extends standard HTMLDivElement attributes.
 */
export interface ToolcallInfoProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Optional flag to render response content as Markdown. Default is true. */
  markdown?: boolean;
}

function getToolStatusMessage(
  message: TamboThreadMessage,
  isLoading: boolean | undefined
) {
  const isToolCall = message.actionType === 'tool_call';
  if (!isToolCall) return null;

  const toolCallMessage = isLoading
    ? `Calling ${message.toolCallRequest?.toolName ?? 'tool'}`
    : `Called ${message.toolCallRequest?.toolName ?? 'tool'}`;
  const toolStatusMessage = isLoading
    ? message.component?.statusMessage
    : message.component?.completionStatusMessage;
  return toolStatusMessage ?? toolCallMessage;
}

/**
 * Displays tool call information in a collapsible dropdown.
 * Shows tool name, parameters, and associated tool response.
 * @component ToolcallInfo
 */
const ToolcallInfo = React.forwardRef<HTMLDivElement, ToolcallInfoProps>(
  ({ className, markdown = true, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { message, isLoading } = useMessageContext();
    const { thread } = useTambo();
    const toolDetailsId = React.useId();

    const associatedToolResponse = React.useMemo(() => {
      if (!thread?.messages) return null;
      const currentMessageIndex = thread.messages.findIndex(
        (m: TamboThreadMessage) => m.id === message.id
      );
      if (currentMessageIndex === -1) return null;
      for (let i = currentMessageIndex + 1; i < thread.messages.length; i++) {
        const nextMessage = thread.messages[i];
        if (nextMessage.actionType === 'tool_response') {
          return nextMessage;
        }
        if (nextMessage.actionType === 'tool_call') {
          break;
        }
      }
      return null;
    }, [message, thread?.messages]);

    if (message.actionType !== 'tool_call') {
      return null;
    }

    const toolCallRequest: TamboAI.ToolCallRequest | undefined =
      message.toolCallRequest ?? message.component?.toolCallRequest;
    const hasToolError = message.error;

    const toolStatusMessage = getToolStatusMessage(message, isLoading);

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-start text-xs mt-2', className)}
        data-slot="toolcall-info"
        {...props}
      >
        <div className="flex flex-col gap-2">
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={toolDetailsId}
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-1.5 cursor-pointer',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'rounded-md px-2 py-1 select-none w-fit',
              'text-neutral-600 dark:text-neutral-400',
              'transition-colors duration-200'
            )}
          >
            {hasToolError ? (
              <X className="w-3 h-3 text-red-500" />
            ) : isLoading ? (
              <Loader2 className="w-3 h-3 text-neutral-500 animate-spin" />
            ) : (
              <Check className="w-3 h-3 text-green-600 dark:text-green-500" />
            )}
            <span className="font-medium">{toolStatusMessage}</span>
            <ChevronDown
              className={cn(
                'w-3 h-3 transition-transform duration-200',
                !isExpanded && '-rotate-90'
              )}
            />
          </button>
          <div
            id={toolDetailsId}
            className={cn(
              'flex flex-col gap-2 pl-4 overflow-hidden transition-[max-height,opacity] duration-300',
              'text-neutral-600 dark:text-neutral-400',
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <span className="whitespace-pre-wrap">
              <span className="font-medium">tool:</span>{' '}
              {toolCallRequest?.toolName}
            </span>
            <div>
              <span className="font-medium">parameters:</span>
              <pre className="mt-1 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-x-auto">
                {stringify(keyifyParameters(toolCallRequest?.parameters))}
              </pre>
            </div>
            {associatedToolResponse && (
              <>
                <span className="font-medium">result:</span>
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-md p-2">
                  {!associatedToolResponse.content ? (
                    <span className="text-neutral-500 dark:text-neutral-400 italic">
                      Empty response
                    </span>
                  ) : React.isValidElement(associatedToolResponse.content) ? (
                    associatedToolResponse.content
                  ) : markdown ? (
                    <ReactMarkdown components={createMarkdownComponents()}>
                      {typeof getSafeContent(associatedToolResponse.content) ===
                      'string'
                        ? (getSafeContent(
                            associatedToolResponse.content
                          ) as string)
                        : ''}
                    </ReactMarkdown>
                  ) : (
                    getSafeContent(associatedToolResponse.content)
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ToolcallInfo.displayName = 'ToolcallInfo';

function keyifyParameters(
  parameters: TamboAI.ToolCallRequest['parameters'] | undefined
) {
  if (!parameters) return;
  return Object.fromEntries(
    parameters.map(p => [p.parameterName, p.parameterValue])
  );
}

/**
 * Props for the MessageRenderedComponentArea component.
 * Extends standard HTMLDivElement attributes.
 */
export type MessageRenderedComponentAreaProps =
  React.HTMLAttributes<HTMLDivElement>;

/**
 * Displays the `renderedComponent` associated with an assistant message.
 * Shows a button to view in canvas if a canvas space exists, otherwise renders inline.
 * Only renders if the message role is 'assistant' and `message.renderedComponent` exists.
 * @component Message.RenderedComponentArea
 */
const MessageRenderedComponentArea = React.forwardRef<
  HTMLDivElement,
  MessageRenderedComponentAreaProps
>(({ className, children, ...props }, ref) => {
  const { message, role } = useMessageContext();
  const [canvasExists, setCanvasExists] = React.useState(false);

  // Check if canvas exists on mount and window resize
  React.useEffect(() => {
    const checkCanvasExists = () => {
      const canvas = document.querySelector('[data-canvas-space="true"]');
      setCanvasExists(!!canvas);
    };

    // Check on mount
    checkCanvasExists();

    // Set up resize listener
    window.addEventListener('resize', checkCanvasExists);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkCanvasExists);
    };
  }, []);

  if (
    !message.renderedComponent ||
    role !== 'assistant' ||
    message.isCancelled
  ) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn('pt-2', className)}
      data-slot="message-rendered-component-area"
      {...props}
    >
      {children ??
        (canvasExists ? (
          <div className="flex justify-start pl-4">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('tambo:showComponent', {
                      detail: {
                        messageId: message.id,
                        component: message.renderedComponent,
                      },
                    })
                  );
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors duration-200 cursor-pointer group"
              aria-label="View component in canvas"
            >
              View component
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full pt-4 px-2">{message.renderedComponent}</div>
        ))}
    </div>
  );
});
MessageRenderedComponentArea.displayName = 'Message.RenderedComponentArea';

// --- Exports ---
export {
  LoadingIndicator,
  Message,
  MessageContent,
  MessageRenderedComponentArea,
  messageVariants,
  ToolcallInfo,
};
