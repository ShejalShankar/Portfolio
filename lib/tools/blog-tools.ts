import { type TamboTool } from '@tambo-ai/react';
import { z } from 'zod';

// Tool to fetch blog posts via API
const fetchBlogPosts = async (options: {
  limit?: number;
  sortBy?: 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}) => {
  const { limit, sortBy = 'date', sortOrder = 'desc' } = options;

  // Build query parameters
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  params.append('sortBy', sortBy);
  params.append('sortOrder', sortOrder);

  // Fetch from API route
  const response = await fetch(`/api/blog/posts?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }

  return response.json();
};

export const blogTools: TamboTool[] = [
  {
    name: 'fetchBlogPosts',
    description: `Fetches blog posts from Akhilesh's portfolio. Use this tool when the user asks about blog posts, articles, or writing.
    
The tool returns:
- slug: URL identifier for the blog post
- title: The blog post title
- publishedAt: Publication date
- summary: A brief description of the blog post content (USE THIS to tell users what the blog is about!)

The tool can:
- Fetch all blog posts or limit the number returned
- Sort by date (newest/oldest first) or title (alphabetical)

Use the summary field to provide brief descriptions of what each blog post is about when presenting them to users.`,
    tool: fetchBlogPosts,
    toolSchema: z
      .function()
      .args(
        z.object({
          limit: z
            .number()
            .optional()
            .describe('Maximum number of posts to return'),
          sortBy: z
            .enum(['date', 'title'])
            .optional()
            .describe('Field to sort by (default: date)'),
          sortOrder: z
            .enum(['asc', 'desc'])
            .optional()
            .describe('Sort order (default: desc for newest first)'),
        })
      )
      .returns(
        z.object({
          posts: z.array(
            z.object({
              slug: z.string(),
              title: z.string(),
              publishedAt: z.string(),
              summary: z
                .string()
                .describe('Brief description of the blog post content'),
            })
          ),
          total: z.number(),
        })
      ),
  },
];

// Tool to fetch a single blog post by slug
const fetchBlogPostBySlug = async (slug: string) => {
  const response = await fetch(`/api/blog/posts?slug=${slug}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Blog post with slug "${slug}" not found`);
    }
    throw new Error('Failed to fetch blog post');
  }

  return response.json();
};

// Add the single post fetching tool
blogTools.push({
  name: 'fetchBlogPostBySlug',
  description: `Fetches a single blog post by its slug/URL identifier. Use this when the user asks about a specific blog post.
  
Returns the full blog post including:
- slug: URL identifier
- title: Blog post title
- publishedAt: Publication date
- summary: Brief description of what the blog post is about (USE THIS to give users a quick overview!)
- content: Full MDX content of the post

The summary field is particularly useful for giving users a quick overview of what the blog post covers without needing to show the full content.

Example slugs might be: "hello-world", "building-with-nextjs", etc.`,
  tool: fetchBlogPostBySlug,
  toolSchema: z
    .function()
    .args(z.string().describe('The slug/URL identifier of the blog post'))
    .returns(
      z.object({
        slug: z.string(),
        title: z.string(),
        publishedAt: z.string(),
        summary: z
          .string()
          .describe('Brief description of the blog post content'),
        content: z.string(),
      })
    ),
});
