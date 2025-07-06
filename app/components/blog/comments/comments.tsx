import { auth } from 'app/auth';
import { getComments } from 'app/db/queries';
import { Suspense } from 'react';
import { SignIn } from '../../buttons';
import CommentForm from './comment-form';
import DeleteCommentButton from './delete-comment-button';
import { userData } from 'lib/data';

export default function Comments({ slug }: { slug: string }) {
  return (
    <div className="max-w-[650px] mt-16">
      <h2 className="font-medium text-lg mb-8 tracking-tight text-neutral-900 dark:text-neutral-100">
        Comments
      </h2>
      <Suspense
        fallback={<div className="text-sm text-neutral-500">Loading...</div>}
      >
        <CommentSection slug={slug} />
      </Suspense>
    </div>
  );
}

async function CommentSection({ slug }: { slug: string }) {
  let session = await auth();
  let comments = await getComments(slug);
  let isAdmin = session?.user?.email === userData.email;

  return (
    <>
      {session?.user ? (
        <CommentForm slug={slug} />
      ) : (
        <div className="mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Sign in to leave a comment
          </p>
          <SignIn />
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 py-8 text-center">
          No comments yet
        </p>
      ) : (
        <div className="space-y-8">
          {comments.map(comment => (
            <div key={comment.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {comment.created_by}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {isAdmin && (
                  <DeleteCommentButton
                    commentId={comment.id.toString()}
                    slug={slug}
                  />
                )}
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
