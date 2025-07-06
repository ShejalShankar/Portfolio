'use client';

import { deleteComment } from 'app/db/actions';
import { useFormStatus } from 'react-dom';

export default function DeleteCommentButton({
  commentId,
  slug,
}: {
  commentId: string;
  slug: string;
}) {
  return (
    <form
      action={async () => {
        await deleteComment(commentId, slug);
      }}
    >
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
    >
      {pending ? 'deleting...' : 'delete'}
    </button>
  );
}
