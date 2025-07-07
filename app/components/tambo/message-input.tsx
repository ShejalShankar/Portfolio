'use client';

import { useTamboThread, useTamboThreadInput } from '@tambo-ai/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'lib/utils';
import { ArrowUp, Square } from 'lucide-react';
import * as React from 'react';
import { SpeechToTextStream } from '../speech-to-text/speech-to-text-stream';

/**
 * CSS variants for the message input container
 * @typedef {Object} MessageInputVariants
 * @property {string} default - Default styling
 * @property {string} solid - Solid styling with shadow effects
 * @property {string} bordered - Bordered styling with border emphasis
 */
const messageInputVariants = cva('w-full', {
  variants: {
    variant: {
      default: '',
      solid: [
        '[&>div]:bg-white [&>div]:dark:bg-neutral-900',
        '[&>div]:border [&>div]:border-neutral-200 [&>div]:dark:border-neutral-800',
        '[&>div]:shadow-sm [&>div]:hover:shadow-md',
        '[&>div]:transition-all [&>div]:duration-200',
        '[&_textarea]:bg-transparent',
        '[&_textarea]:rounded-lg',
      ].join(' '),
      bordered: [
        '[&>div]:bg-transparent',
        '[&>div]:border [&>div]:border-neutral-300 [&>div]:dark:border-neutral-700',
        '[&>div]:shadow-none',
        '[&_textarea]:bg-transparent',
        '[&_textarea]:border-0',
      ].join(' '),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/**
 * @typedef MessageInputContextValue
 * @property {string} value - The current input value
 * @property {function} setValue - Function to update the input value
 * @property {function} submit - Function to submit the message
 * @property {function} handleSubmit - Function to handle form submission
 * @property {boolean} isPending - Whether a submission is in progress
 * @property {Error|null} error - Any error from the submission
 * @property {string|undefined} contextKey - The thread context key
 * @property {HTMLTextAreaElement|null} textareaRef - Reference to the textarea element
 * @property {string | null} submitError - Error from the submission
 * @property {function} setSubmitError - Function to set the submission error
 * @property {function} setShouldAutoSubmit - Function to set the auto-submit flag
 */
interface MessageInputContextValue {
  value: string;
  setValue: (value: string) => void;
  submit: (options: {
    contextKey?: string;
    streamResponse?: boolean;
  }) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isPending: boolean;
  error: Error | null;
  contextKey?: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  submitError: string | null;
  setSubmitError: React.Dispatch<React.SetStateAction<string | null>>;
  setShouldAutoSubmit: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * React Context for sharing message input data and functions among sub-components.
 * @internal
 */
const MessageInputContext =
  React.createContext<MessageInputContextValue | null>(null);

/**
 * Hook to access the message input context.
 * Throws an error if used outside of a MessageInput component.
 * @returns {MessageInputContextValue} The message input context value.
 * @throws {Error} If used outside of MessageInput.
 * @internal
 */
const useMessageInputContext = () => {
  const context = React.useContext(MessageInputContext);
  if (!context) {
    throw new Error(
      'MessageInput sub-components must be used within a MessageInput'
    );
  }
  return context;
};

/**
 * Props for the MessageInput component.
 * Extends standard HTMLFormElement attributes.
 */
export interface MessageInputProps
  extends React.HTMLAttributes<HTMLFormElement> {
  /** The context key identifying which thread to send messages to. */
  contextKey?: string;
  /** Optional styling variant for the input container. */
  variant?: VariantProps<typeof messageInputVariants>['variant'];
  /** The child elements to render within the form container. */
  children?: React.ReactNode;
}

/**
 * The root container for a message input component.
 * It establishes the context for its children and handles the form submission.
 * @component MessageInput
 * @example
 * ```tsx
 * <MessageInput contextKey="my-thread" variant="solid">
 *   <MessageInput.Textarea />
 *   <MessageInput.SubmitButton />
 *   <MessageInput.Error />
 * </MessageInput>
 * ```
 */
const MessageInput = React.forwardRef<HTMLFormElement, MessageInputProps>(
  ({ children, className, contextKey, variant, ...props }, ref) => {
    const { value, setValue, submit, isPending, error } =
      useTamboThreadInput(contextKey);
    const [displayValue, setDisplayValue] = React.useState('');
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [shouldAutoSubmit, setShouldAutoSubmit] = React.useState(false);

    React.useEffect(() => {
      setDisplayValue(value);
      if (value && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [value]);

    // Handle auto-submission when value is set and flag is true
    React.useEffect(() => {
      if (shouldAutoSubmit && value.trim()) {
        setShouldAutoSubmit(false);
        // Create and dispatch a synthetic submit event
        const form = textareaRef.current?.form;
        if (form) {
          const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true,
          });
          form.dispatchEvent(submitEvent);
        }
      }
    }, [value, shouldAutoSubmit]);

    const handleSubmit = React.useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;

        setSubmitError(null);
        setDisplayValue('');
        try {
          await submit({
            contextKey,
            streamResponse: true,
          });
          setValue('');
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 0);
        } catch (error) {
          console.error('Failed to submit message:', error);
          setDisplayValue(value);
          setSubmitError(
            error instanceof Error
              ? error.message
              : 'Failed to send message. Please try again.'
          );
        }
      },
      [value, submit, contextKey, setValue, setDisplayValue, setSubmitError]
    );

    const contextValue = React.useMemo(
      () => ({
        value: displayValue,
        setValue: (newValue: string) => {
          setValue(newValue);
          setDisplayValue(newValue);
        },
        submit,
        handleSubmit,
        isPending,
        error,
        contextKey,
        textareaRef,
        submitError,
        setSubmitError,
        setShouldAutoSubmit,
      }),
      [
        displayValue,
        setValue,
        submit,
        handleSubmit,
        isPending,
        error,
        contextKey,
        submitError,
      ]
    );
    return (
      <MessageInputContext.Provider
        value={contextValue as MessageInputContextValue}
      >
        <form
          ref={ref}
          onSubmit={handleSubmit}
          className={cn(messageInputVariants({ variant }), className)}
          data-slot="message-input-form"
          {...props}
        >
          <div className="flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all duration-200 p-3">
            {children}
          </div>
        </form>
      </MessageInputContext.Provider>
    );
  }
);
MessageInput.displayName = 'MessageInput';

/**
 * Props for the MessageInputTextarea component.
 * Extends standard TextareaHTMLAttributes.
 */
export interface MessageInputTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Custom placeholder text. */
  placeholder?: string;
}

/**
 * Textarea component for entering message text.
 * Automatically connects to the context to handle value changes and key presses.
 * @component MessageInput.Textarea
 * @example
 * ```tsx
 * <MessageInput>
 *   <MessageInput.Textarea placeholder="Type your message..." />
 * </MessageInput>
 * ```
 */
const MessageInputTextarea = ({
  className,
  placeholder = 'Type a message...',
  ...props
}: MessageInputTextareaProps) => {
  const { value, setValue, textareaRef, handleSubmit } =
    useMessageInputContext();
  const { isIdle } = useTamboThread();
  const isPending = !isIdle;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex-1 bg-transparent text-background resize-none text-[15px] leading-relaxed min-h-[80px] max-h-[200px]',
        // Remove all focus styles
        'focus:outline-none focus:ring-0 focus:border-transparent',
        'focus-visible:outline-none focus-visible:ring-0',
        // Remove any browser default outlines
        'outline-none border-none',
        // Placeholder styling
        'placeholder:text-neutral-500 dark:placeholder:text-neutral-400',
        // Custom scrollbar for textarea
        '[&::-webkit-scrollbar]:w-2',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:bg-neutral-300/50',
        '[&::-webkit-scrollbar-thumb]:dark:bg-neutral-600/50',
        '[&::-webkit-scrollbar-thumb]:rounded-full',
        '[&::-webkit-scrollbar-thumb:hover]:bg-neutral-400/70',
        '[&::-webkit-scrollbar-thumb:hover]:dark:bg-neutral-500/70',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300/50 dark:scrollbar-thumb-neutral-600/50',
        className
      )}
      disabled={isPending}
      placeholder={placeholder}
      aria-label="Chat Message Input"
      data-slot="message-input-textarea"
      {...props}
    />
  );
};
MessageInputTextarea.displayName = 'MessageInput.Textarea';

/**
 * Props for the MessageInputSubmitButton component.
 * Extends standard ButtonHTMLAttributes.
 */
export interface MessageInputSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional content to display inside the button. */
  children?: React.ReactNode;
}

/**
 * Submit button component for sending messages.
 * Automatically connects to the context to handle submission state.
 * @component MessageInput.SubmitButton
 * @example
 * ```tsx
 * <MessageInput>
 *   <MessageInput.Textarea />
 *   <div className="flex justify-end mt-2 p-1">
 *     <MessageInput.SubmitButton />
 *   </div>
 * </MessageInput>
 * ```
 */
const MessageInputSubmitButton = React.forwardRef<
  HTMLButtonElement,
  MessageInputSubmitButtonProps
>(({ className, children, ...props }, ref) => {
  const { isPending } = useMessageInputContext();
  const { cancel } = useTamboThread();

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cancel();
  };

  const buttonClasses = cn(
    'w-9 h-9 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 flex items-center justify-center cursor-pointer transition-colors duration-200',
    className
  );

  return (
    <button
      ref={ref}
      type={isPending ? 'button' : 'submit'}
      onClick={isPending ? handleCancel : undefined}
      className={buttonClasses}
      aria-label={isPending ? 'Cancel message' : 'Send message'}
      data-slot={isPending ? 'message-input-cancel' : 'message-input-submit'}
      {...props}
    >
      {children ??
        (isPending ? (
          <Square className="w-4 h-4" fill="currentColor" />
        ) : (
          <ArrowUp className="w-4 h-4" />
        ))}
    </button>
  );
});
MessageInputSubmitButton.displayName = 'MessageInput.SubmitButton';

/**
 * Props for the MessageInputError component.
 * Extends standard HTMLParagraphElement attributes.
 */
export type MessageInputErrorProps = React.HTMLAttributes<HTMLParagraphElement>;

/**
 * Error message component for displaying submission errors.
 * Automatically connects to the context to display any errors.
 * @component MessageInput.Error
 * @example
 * ```tsx
 * <MessageInput>
 *   <MessageInput.Textarea />
 *   <MessageInput.SubmitButton />
 *   <MessageInput.Error />
 * </MessageInput>
 * ```
 */
const MessageInputError = React.forwardRef<
  HTMLParagraphElement,
  MessageInputErrorProps
>(({ className, ...props }, ref) => {
  const { error, submitError } = useMessageInputContext();

  if (!error && !submitError) {
    return null;
  }

  return (
    <p
      ref={ref}
      className={cn('text-sm text-red-600 dark:text-red-400 mt-2', className)}
      data-slot="message-input-error"
      {...props}
    >
      {error?.message ?? submitError}
    </p>
  );
});
MessageInputError.displayName = 'MessageInput.Error';

/**
 * Container for the toolbar components (like submit button).
 * Provides correct spacing and alignment.
 * @component MessageInput.Toolbar
 * @example
 * ```tsx
 * <MessageInput>
 *   <MessageInput.Textarea />
 *   <MessageInput.Toolbar>
 *     <MessageInput.SpeechButton />
 *     <MessageInput.SubmitButton />
 *   </MessageInput.Toolbar>
 * </MessageInput>
 * ```
 */
const MessageInputToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex justify-end items-center gap-2 mt-1', className)}
      data-slot="message-input-toolbar"
      {...props}
    >
      {children}
    </div>
  );
});
MessageInputToolbar.displayName = 'MessageInput.Toolbar';

/**
 * Speech-to-text button component for voice input.
 * Automatically connects to the context to handle transcription.
 * @component MessageInput.SpeechButton
 * @example
 * ```tsx
 * <MessageInput>
 *   <MessageInput.Textarea />
 *   <MessageInput.Toolbar>
 *     <MessageInput.SpeechButton />
 *     <MessageInput.SubmitButton />
 *   </MessageInput.Toolbar>
 * </MessageInput>
 * ```
 */
interface MessageInputSpeechButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom className for the speech button */
  buttonClassName?: string;
  /** Callback when recording state changes */
  onRecordingChange?: (recording: boolean) => void;
}

const MessageInputSpeechButton = React.forwardRef<
  HTMLDivElement,
  MessageInputSpeechButtonProps
>(({ className, buttonClassName, onRecordingChange, ...props }, ref) => {
  const { setValue, isPending, setShouldAutoSubmit } = useMessageInputContext();

  const handleTranscript = (transcript: string) => {
    setValue(transcript);
  };

  const handleVoiceSubmit = () => {
    // Set the flag to trigger submission after value updates
    setShouldAutoSubmit(true);
  };

  return (
    <div ref={ref} className={className} {...props}>
      <SpeechToTextStream
        onTranscript={handleTranscript}
        onSubmit={handleVoiceSubmit}
        disabled={isPending}
        className={buttonClassName}
        onRecordingChange={onRecordingChange}
      />
    </div>
  );
});
MessageInputSpeechButton.displayName = 'MessageInput.SpeechButton';

// --- Exports ---
export {
  MessageInput,
  MessageInputError,
  MessageInputSpeechButton,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
  messageInputVariants,
};
