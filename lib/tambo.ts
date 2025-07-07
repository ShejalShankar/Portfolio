import { type TamboComponent } from '@tambo-ai/react';
import {
  BlogCard,
  BlogCardSchema,
} from '../app/components/blog/list/blog-card';
import {
  CurrentWorkSection,
  CurrentWorkSectionSchema,
} from '../app/components/current-work-section';
import {
  PhotoGridSection,
  PhotoGridSectionSchema,
} from '../app/components/photo-grid-section';
import {
  ProjectsSection,
  ProjectsSectionSchema,
} from '../app/components/projects-section';
import {
  SocialMediaCard,
  SocialMediaCardSchema,
  SocialMediaGrid,
  SocialMediaGridSchema,
} from '../app/components/social-media-card';
import { blogTools } from './tools/blog-tools';

export const components: TamboComponent[] = [
  {
    name: 'PhotoGridSection',
    description: `A responsive photo grid component that displays Akhilesh's portfolio images in a configurable grid layout with optional captions. Use the available portfolio images from /images/home/ directory. Perfect for showcasing personal photos, work experiences, and professional moments.
    
Available images:
- /images/home/me.jpg (Portrait photo at a restaurant)
- /images/home/me2.jpg (Washington DC)
- /images/home/me3.jpg (University)
- /images/home/me4.jpg (Another portrait)
- /images/home/uni.jpg (University campus)
- /images/home/twitter.jpg (Akhilesh at a trip to tidal basin in Washington DC)
- /images/home/vercel.jpg (Akhilesh at a trip to tidal basin in Washington DC)

Always use these local image paths instead of external URLs, always show three images, randomize the order of the images, and use different captions for each image, not what is provided in the perenthsis - they are just short descriptions.`,
    component: PhotoGridSection,
    propsSchema: PhotoGridSectionSchema,
  },
  {
    name: 'CurrentWorkSection',
    description: `A section component that displays Akhilesh's current work experiences and positions. Use structured data to describe work items with companies and links. Use it when the user asks about his current work.

Example work items:
- Software Development Intern at tambo ai (https://tambo.co)
- Working with James Murdza on GitWit.dev, an AI-powered, open source cloud IDE
- Research Assistant in AI at GWU, building high-performance chatbots and educational platforms

Each work item can include a description, company name with optional URL, and additional links with custom text.`,
    component: CurrentWorkSection,
    propsSchema: CurrentWorkSectionSchema,
  },
  {
    name: 'ProjectsSection',
    description: `A section component that displays Akhilesh's projects with descriptions and links. Use it when the user asks about projects or portfolio work.

Example projects:
- Sandbox IDE: Open-source cloud IDE with live collaboration (https://sandbox.gitwit.dev/)
- DressUp AI: AI-driven styling app with personalized recommendations (https://soundsgood-fashion-generator.vercel.app/analyze)

Each project can include a title, description, URL, optional technologies list, and featured flag for highlighting important projects.`,
    component: ProjectsSection,
    propsSchema: ProjectsSectionSchema,
  },
  {
    name: 'BlogCard',
    description: `A component that displays a blog post card with title, date, and summary. Use this to show blog posts with their descriptions so users can understand what each post is about.

Works perfectly with the fetchBlogPosts tool which returns summaries.

Example usage:
- Display blog posts with their summaries when users ask "What blog posts are available?"
- Show a preview of blog content without needing to navigate to the full post
- Creates an attractive card layout with hover effects

Each card links to the full blog post at /blog/[slug].`,
    component: BlogCard,
    propsSchema: BlogCardSchema,
  },
  {
    name: 'SocialMediaCard',
    description: `A component that displays a single social media profile card with platform-specific styling and icons. Use this to show individual social media profiles when users ask about specific platforms or contact information.

Akhilesh's social media profiles:
- Twitter: @heyavi_ (https://twitter.com/heyavi_)
- LinkedIn: akhileshrangani (https://www.linkedin.com/in/akhileshrangani/)
- GitHub: akhileshrangani4 (https://github.com/akhileshrangani4)
- Email: akhileshrangani4@gmail.com (mailto:akhileshrangani4@gmail.com)

Each card shows the platform icon, username, and can include an optional description. Cards have hover effects with platform-specific colors.`,
    component: SocialMediaCard,
    propsSchema: SocialMediaCardSchema,
  },
  {
    name: 'SocialMediaGrid',
    description: `A grid component that displays multiple social media profile cards. Use this when users ask about Akhilesh's social media presence, contact information, or how to connect with him.

This is perfect for showing all social media profiles at once:
- Twitter: @heyavi_ (https://twitter.com/heyavi_) - "Follow me for tech insights and updates"
- LinkedIn: akhileshrangani (https://www.linkedin.com/in/akhileshrangani/) - "Connect for professional opportunities"
- GitHub: akhileshrangani4 (https://github.com/akhileshrangani4) - "Check out my open source projects"
- Email: akhileshrangani4@gmail.com - "Reach out for collaborations"

The grid can display 1-4 columns and automatically adjusts for mobile responsiveness.`,
    component: SocialMediaGrid,
    propsSchema: SocialMediaGridSchema,
  },
];

// Export tools separately so they can be registered in the provider
export const tools = blogTools;

export default components;
