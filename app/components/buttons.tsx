'use client';

import { signIn, signOut } from 'next-auth/react';

export function SignOut() {
  return (
    <button
      className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
      onClick={() => signOut()}
    >
      Sign out
    </button>
  );
}

export function SignIn() {
  return (
    <button
      className="flex items-center space-x-3 px-4 py-2 border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 rounded text-sm text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      onClick={() => signIn('github')}
    >
      <img alt="GitHub logo" src="/github-logo.svg" width="16" height="16" />
      <span>Sign in with GitHub</span>
    </button>
  );
}
