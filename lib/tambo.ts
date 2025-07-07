import { type TamboComponent } from '@tambo-ai/react';
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
];

export default components;
