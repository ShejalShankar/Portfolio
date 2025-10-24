import { ConnectSection } from 'app/components/connect-section';
import { Badge, CurrentWorkSection } from 'app/components/current-work-section';
import { HeroSection } from 'app/components/hero-section';
import { PhotoGridSection } from 'app/components/photo-grid-section';
import { ProjectsSection } from 'app/components/projects-section';
import { WritingSection } from 'app/components/writing-section';
import { getBlogPosts } from 'app/db/blog';
import { PreloadResources } from 'app/preload';
import { userData } from 'lib/data';
import me from 'public/images/home/me.jpeg';
import me2 from 'public/images/home/me2.jpeg';
import me3 from 'public/images/home/me3.jpeg';

export default function Page() {
  const allBlogs = getBlogPosts();
  const sortedBlogs = allBlogs.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1;
    }
    return 1;
  });

  // Hero section data
  const heroData = {
    name: "Hey, I'm Shejal 👋",
    description:
      'A Full-Stack Developer and an AI Enthusiast. I love building intelligent systems, exploring new places and experiencing everything life has to offer. Also a huge car enthusiast who enjoys the perfect blend of engineering and design — both on the road and in code.',
  };

  // Photo grid data
  const photoData = [
    { src: me.src, alt: 'Me' },
    { src: me3.src, alt: 'University' },
    { src: me2.src, alt: 'Washington DC' },
  ];

  // Projects data - simplified to match original structure
  const projectsData = [
    {
      title: 'AI Powered Market Intelligence',
      description: 'AI-driven market research tool for competitive analysis',
      url: 'https://github.com/shejalshankar/Finanace_Assistant',
    },
    {
      title: 'Brain Tumor Detection with SRGAN',
      description: 'AI model for brain tumor detection using super-resolution GANs',
      url: 'https://github.com/ShejalShankar/BrainTumor_Detection',
    },
  ];

  // Current work data - keeping the original inline structure
  const workData = [
    <p key="tambo">
      Full Stack Software Developer{' '}
      <Badge href="https://home.gabrielai.co/" underline={true}>
        Gabriel AI
      </Badge>
      .
    </p>,
    <p key="gitwit">
      Working on a Personal Project: {' '}
      <Badge href="https://github.com/shejalshankar/AI_Agent_Event_Mapper" underline={false}>
        Agentic AI Event Mapper
      </Badge>{' '}
      {' '}
      <Badge href="https://github.com/shejalshankar/AI_Agent_Event_Mapper" underline={true}>
        AI Event Mapper
      </Badge>
      , an AI-powered, open source event mapping tool.
    </p>,
  ];

  // Writing data
  const highlights = [
  {
    title: 'Passion and Pursuit',
    summary: 'Cars, travel, food, and the pursuit of unforgettable experiences.',
    slug: 'cars x travel x Technology',
    publishedAt: '2025',
  },
  {
    title: 'Attending Grace Hopper Celebration 2025',
    summary: 'Attending the world’s largest gathering of women technologists.',
    slug: 'ghc-2025',
    publishedAt: '2025',
  },
  {
    title: 'Exploring AI x Full Stack',
    summary: 'Building tools that merge intelligent automation with elegant front-end design.',
    slug: 'ai-fullstack',
    publishedAt: '2024',
  },
];
;
  // Connect data
  const connectData = [
    {
      name: 'LinkedIn',
      url: userData.linkedin,
      external: true,
    },
    {
      name: 'GitHub',
      url: userData.github,
      external: true,
    },
    { name: 'Email', url: `mailto:${userData.email}`, external: true },
  ];

  return (
    <section>
      <PreloadResources />

      <HeroSection {...heroData} />
      <PhotoGridSection photos={photoData} />
      <CurrentWorkSection workItems={workData} />
      <ProjectsSection projects={projectsData} />
      <WritingSection posts={highlights} maxPosts={3} />
      <ConnectSection links={connectData} />
    </section>
  );
}
