import { BlogHeader } from 'app/components/blog/list/blog-header';
import { BlogPostList } from 'app/components/blog/list/blog-list';
import { getBlogPosts } from 'app/db/blog';
import { getViewsCount } from 'app/db/queries';
import ViewCounter from '../components/blog/list/view-counter';

export const metadata = {
  title: 'Blog',
  description: 'Read my thoughts on software development, design, and more.',
};

async function Views({ slug }: { slug: string }) {
  let views = await getViewsCount();
  return <ViewCounter allViews={views} slug={slug} />;
}

export default function BlogPage() {
  let allBlogs = getBlogPosts();

  // Transform blog posts to match component interface
  const blogPosts = allBlogs.map(post => ({
    slug: post.slug,
    title: post.metadata.title,
    publishedAt: post.metadata.publishedAt,
    summary: post.metadata.summary,
  }));

  return (
    <section>
      <BlogHeader
        title="Blog"
        description="Read my thoughts on software development, design, and more."
      />
      <BlogPostList
        posts={blogPosts}
        showViews={true}
        ViewsComponent={Views}
        sortBy="date"
        sortOrder="desc"
      />
    </section>
  );
}
