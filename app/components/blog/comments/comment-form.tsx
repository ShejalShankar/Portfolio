'use client';

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { saveComment } from '../../../db/actions';

export default function CommentForm({ slug }: { slug: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      className="max-w-[650px] mb-8"
      ref={formRef}
      action={async formData => {
        formData.append('slug', slug);
        await saveComment(formData);
        formRef.current?.reset();
      }}
    >
      <div className="space-y-3">
        <textarea
          aria-label="Your comment"
          placeholder="Share your thoughts..."
          name="comment"
          required
          rows={3}
          className="w-full px-3 py-3 text-sm border-0 border-b border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none transition-colors"
        />
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Posting...' : 'Post'}
    </button>
  );
}
