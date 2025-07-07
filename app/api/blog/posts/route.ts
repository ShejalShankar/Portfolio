import { getBlogPosts } from 'app/db/blog';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const slug = searchParams.get('slug');

    // Get all blog posts
    const allPosts = getBlogPosts();

    // If looking for a specific post
    if (slug) {
      const post = allPosts.find(p => p.slug === slug);
      if (!post) {
        return NextResponse.json(
          { error: `Blog post with slug "${slug}" not found` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        slug: post.slug,
        title: post.metadata.title,
        publishedAt: post.metadata.publishedAt,
        summary: post.metadata.summary,
        content: post.content,
      });
    }

    // Sort posts
    const sortedPosts = [...allPosts].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.metadata.publishedAt).getTime();
        const dateB = new Date(b.metadata.publishedAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        // Sort by title
        const comparison = a.metadata.title.localeCompare(b.metadata.title);
        return sortOrder === 'desc' ? -comparison : comparison;
      }
    });

    // Apply limit if specified
    const limitedPosts = limit
      ? sortedPosts.slice(0, parseInt(limit))
      : sortedPosts;

    // Transform to match BlogPostItem props
    return NextResponse.json({
      posts: limitedPosts.map(post => ({
        slug: post.slug,
        title: post.metadata.title,
        publishedAt: post.metadata.publishedAt,
        summary: post.metadata.summary,
      })),
      total: allPosts.length,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
