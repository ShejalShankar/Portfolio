import { getBlogPosts } from 'app/db/blog';
import { userData } from 'lib/data';

export default async function sitemap() {
  let blogs = getBlogPosts().map(post => ({
    url: `${userData.site}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ['', '/blog', '/guestbook'].map(route => ({
    url: `${userData.site}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes, ...blogs];
}
