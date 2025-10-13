'use client';

import { useTamboThread, useTamboThreadInput } from '@tambo-ai/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'lib/utils';
import { ArrowUp, Square } from 'lucide-react';
import * as React from 'react';

// --- Variants for the input container styling ---
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
  defaultVariants: { variant: 'default' },
});

// --- Context setup ---
interface MessageInputContextValue {
  value: string;
  setValue: (value: string) => void;
  submit: (options: { contextKey?: string; streamResponse?: boolean }) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isPending: boolean;
  error: Error | null;
  contextKey?: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  submitError: string | null;
  setSubmitError: React.Dispatch<React.SetStateAction<string | null>>;
}

const MessageInputContext = React.createContext<MessageInputContextValue | null>(null);

const useMessageInputContext = () => {
  const ctx = React.useContext(MessageInputContext);
  if (!ctx) throw new Error('MessageInput sub-components must be used within a MessageInput');
  return ctx;
};

// --- Root component ---
export interface MessageInputProps extends React.HTMLAttributes<HTMLFormElement> {
  contextKey?: string;
  variant?: VariantProps<typeof messageInputVariants>['variant'];
  children?: React.ReactNode;
}

const MessageInput = React.forwardRef<HTMLFormElement, MessageInputProps>(
  ({ children, className, contextKey, variant, ...props }, ref) => {
    const { value, setValue, submit, isPending, error } = useTamboThreadInput(contextKey);
    const [displayValue, setDisplayValue] = React.useState('');
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useEffect(() => setDisplayValue(value), [value]);

    const handleSubmit = React.useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;

        setSubmitError(null);
        try {
          await submit({ contextKey, streamResponse: true });
          setValue('');
        } catch (err) {
          console.error('Failed to submit message:', err);
          setSubmitError(err instanceof Error ? err.message : 'Failed to send message.');
        }
      },
      [value, submit, contextKey, setValue]
    );

    const ctx: MessageInputContextValue = {
      value: displayValue,
      setValue: (v: string) => {
        setValue(v);
        setDisplayValue(v);
      },
      submit,
      handleSubmit,
      isPending,
      error,
      contextKey,
      textareaRef,
      submitError,
      setSubmitError,
    };

    return (
      <MessageInputContext.Provider value={ctx}>
        <form
          ref={ref}
          onSubmit={handleSubmit}
          className={cn(messageInputVariants({ variant }), className)}
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

// --- Textarea ---
export const MessageInputTextarea = ({
  className,
  placeholder = 'Type a message...',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const { value, setValue, textareaRef, handleSubmit } = useMessageInputContext();
  const { isIdle } = useTamboThread();
  const isPending = !isIdle;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) handleSubmit(e as unknown as React.FormEvent);
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
        'focus:outline-none border-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400',
        'scrollbar-thin scrollbar-thumb-neutral-300/50 dark:scrollbar-thumb-neutral-600/50',
        className
      )}
      disabled={isPending}
      placeholder={placeholder}
      aria-label="Chat Message Input"
      {...props}
    />
  );
};

// --- Submit button ---
export const MessageInputSubmitButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { isPending } = useMessageInputContext();
  const { cancel } = useTamboThread();

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    cancel();
  };

  return (
    <button
      ref={ref}
      type={isPending ? 'button' : 'submit'}
      onClick={isPending ? handleCancel : undefined}
      className={cn(
        'w-9 h-9 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 flex items-center justify-center transition-colors duration-200',
        className
      )}
      aria-label={isPending ? 'Cancel message' : 'Send message'}
      {...props}
    >
      {children ?? (isPending ? <Square className="w-4 h-4" fill="currentColor" /> : <ArrowUp className="w-4 h-4" />)}
    </button>
  );
});
MessageInputSubmitButton.displayName = 'MessageInput.SubmitButton';

// --- Error message ---
export const MessageInputError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { error, submitError } = useMessageInputContext();
  if (!error && !submitError) return null;
  return (
    <p ref={ref} className={cn('text-sm text-red-600 dark:text-red-400 mt-2', className)} {...props}>
      {error?.message ?? submitError}
    </p>
  );
});
MessageInputError.displayName = 'MessageInput.Error';

// --- Toolbar ---
export const MessageInputToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('flex justify-end items-center gap-2 mt-1', className)} {...props}>
    {children}
  </div>
));
MessageInputToolbar.displayName = 'MessageInput.Toolbar';

// --- Exports ---
export {
  MessageInput,
  MessageInputError,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
};
