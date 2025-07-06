'use server';

import { auth, youtube } from '@googleapis/youtube';
import { unstable_noStore as noStore } from 'next/cache';
import { sql } from './postgres';

let googleAuth = new auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
  scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
});

let yt = youtube({
  version: 'v3',
  auth: googleAuth,
});

export async function getBlogViews() {
  if (!process.env.POSTGRES_URL) {
    return [];
  }

  noStore();
  let views = await sql`
    SELECT count
    FROM views
  `;

  return views.reduce((acc, curr) => acc + Number(curr.count), 0);
}

export async function getViewsCount(): Promise<
  { slug: string; count: number }[]
> {
  if (!process.env.POSTGRES_URL) {
    return [];
  }

  noStore();
  return sql`
    SELECT slug, count
    FROM views
  `;
}

export async function getGuestbookEntries() {
  if (!process.env.POSTGRES_URL) {
    return [];
  }

  noStore();
  return sql`
    SELECT id, body, created_by, created_at
    FROM guestbook
    ORDER BY created_at DESC
    LIMIT 100
  `;
}

export async function getComments(slug: string) {
  if (!process.env.POSTGRES_URL) {
    return [];
  }

  noStore();
  return sql`
    SELECT id, blog_slug, email, body, created_by, created_at
    FROM comments
    WHERE blog_slug = ${slug}
    ORDER BY created_at DESC
    LIMIT 100
  `;
}

export async function getCommentsCount(slug: string) {
  if (!process.env.POSTGRES_URL) {
    return 0;
  }

  noStore();
  const result = await sql`
    SELECT COUNT(*) as count
    FROM comments
    WHERE blog_slug = ${slug}
  `;

  return Number(result[0]?.count || 0);
}
