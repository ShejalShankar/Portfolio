'use client';

import { SignIn, SignOut } from 'app/components/buttons';
import { cn } from 'lib/utils';
import { useRef } from 'react';
import { useFormStatus } from 'react-dom';

export interface GuestbookAuthFormProps {
  isAuthenticated: boolean;
  className?: string;
  onSubmit?: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded disabled:opacity-50"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Signing...' : 'Sign'}
    </button>
  );
}

export function GuestbookAuthForm({
  isAuthenticated,
  className,
  onSubmit,
}: GuestbookAuthFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  if (!isAuthenticated) {
    return (
      <div className={cn('mb-8', className)}>
        <SignIn />
      </div>
    );
  }

  return (
    <div className={cn('mb-8', className)}>
      <form
        className="relative max-w-[500px] mb-4"
        ref={formRef}
        action={async formData => {
          if (onSubmit) {
            await onSubmit(formData);
            formRef.current?.reset();
          }
        }}
      >
        <input
          aria-label="Your message"
          placeholder="Your message..."
          name="entry"
          type="text"
          required
          className="w-full pl-4 pr-20 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
        />
        <SubmitButton />
      </form>
      <SignOut />
    </div>
  );
}
