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
  GuestbookDisplay,
  GuestbookDisplaySchema,
  GuestbookHighlight,
  GuestbookHighlightSchema,
} from '../app/components/guestbook/guestbook-display';
import {
  PhotoGridSection,
  PhotoGridSectionSchema,
} from '../app/components/photo-grid-section';
import {
  ProjectsSection,
  ProjectsSectionSchema,
} from '../app/components/projects-section';
import {
  ResumeButton,
  ResumeButtonSchema,
  ResumeOverview,
  ResumeOverviewSchema,
} from '../app/components/resume-card';
import {
  SocialMediaCard,
  SocialMediaCardSchema,
  SocialMediaGrid,
  SocialMediaGridSchema,
} from '../app/components/social-media-card';
import { blogTools } from './tools/blog-tools';
import { guestbookTools } from './tools/guestbook-tools';

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
  {
    name: 'GuestbookDisplay',
    description: `A component that displays guestbook entries from visitors to Akhilesh's portfolio. Use this when users ask about the guestbook, visitor messages, or what people have written.

Works perfectly with the fetchGuestbookEntries tool to show real guestbook data.

Features:
- Shows visitor names, messages, and timestamps
- Can display a specific number of entries
- Shows total count of entries
- Handles empty states gracefully

Use when users ask:
- "Show me the guestbook"
- "What have people written?"
- "Display visitor messages"`,
    component: GuestbookDisplay,
    propsSchema: GuestbookDisplaySchema,
  },
  {
    name: 'GuestbookHighlight',
    description: `A component that highlights a single guestbook entry in a featured format. Use this to showcase a specific message or recent entry.

Perfect for:
- Highlighting the most recent guestbook entry
- Featuring a particularly interesting message
- Showing a sample of what the guestbook contains

The component displays the message in a quote format with author attribution.`,
    component: GuestbookHighlight,
    propsSchema: GuestbookHighlightSchema,
  },
  {
    name: 'ResumeOverview',
    description: `A comprehensive resume overview card that displays Akhilesh's professional background and a button to view his full resume. Use this when users ask about his resume, CV, qualifications, or professional background.

Features:
- Current positions at tambo ai, GitWit.dev, and GWU
- Key areas of expertise (full-stack development, AI/ML, cloud IDEs)
- Education information (Master's at GWU)
- Button to open the full resume in Google Drive

Perfect for when users ask:
- "Show me Akhilesh's resume"
- "What are his qualifications?"
- "Can I see his CV?"
- "What's his professional background?"`,
    component: ResumeOverview,
    propsSchema: ResumeOverviewSchema,
  },
  {
    name: 'ResumeButton',
    description: `A standalone button component to open Akhilesh's resume. Use this when you need a simple, clean button to link to the resume without the full overview card.

Available in three variants:
- primary: Dark button with white text (default)
- secondary: White button with border
- ghost: Transparent with hover effect

Sizes: sm, md (default), lg

Perfect for:
- Adding a resume link in other contexts
- Providing quick access to the resume
- When the full overview card is too much`,
    component: ResumeButton,
    propsSchema: ResumeButtonSchema,
  },
];

// Export tools separately so they can be registered in the provider
export const tools = [...blogTools, ...guestbookTools];

export default components;
