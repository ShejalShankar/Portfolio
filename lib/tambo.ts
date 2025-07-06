import { type TamboComponent } from '@tambo-ai/react';
import {
  PhotoGridSection,
  PhotoGridSectionSchema,
} from '../app/components/photo-grid-section';

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
];

export default components;
