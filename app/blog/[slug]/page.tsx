import Comments from 'app/components/blog/comments/comments';
import ViewCounter from 'app/components/blog/list/view-counter';
import { BlogPostContent } from 'app/components/blog/post/blog-post-content';
import { BlogPostHeader } from 'app/components/blog/post/blog-post-header';
import { BlogPostMeta } from 'app/components/blog/post/blog-post-meta';
import { BlogPostStructuredData } from 'app/components/blog/post/blog-post-structured-data';
import { increment } from 'app/db/actions';
import { getBlogPosts } from 'app/db/blog';
import { getViewsCount } from 'app/db/queries';
import { userData } from 'lib/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

export async function generateMetadata({
  params,
}): Promise<Metadata | undefined> {
  const resolvedParams = await params;
  let post = getBlogPosts().find(post => post.slug === resolvedParams.slug);
  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image
    ? `${userData.site}${image}`
    : `${userData.site}/og?title=${title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${userData.site}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Blog({ params }) {
  const resolvedParams = await params;
  let post = getBlogPosts().find(post => post.slug === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <BlogPostStructuredData
        title={post.metadata.title}
        publishedAt={post.metadata.publishedAt}
        summary={post.metadata.summary}
        image={post.metadata.image}
        slug={post.slug}
        authorName={userData.name}
      />

      <BlogPostHeader title={post.metadata.title} />

      <BlogPostMeta
        publishedAt={post.metadata.publishedAt}
        ViewsComponent={Views}
        slug={post.slug}
      />

      <BlogPostContent content={post.content} />

      <Comments slug={post.slug} />
    </section>
  );
}

let incrementViews = cache(increment);

async function Views({ slug }: { slug: string }) {
  let views = await getViewsCount();
  incrementViews(slug);
  return <ViewCounter allViews={views} slug={slug} />;
}
