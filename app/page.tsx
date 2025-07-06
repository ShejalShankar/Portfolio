import { ConnectSection } from 'app/components/connect-section';
import { Badge, CurrentWorkSection } from 'app/components/current-work-section';
import { HeroSection } from 'app/components/hero-section';
import { PhotoGridSection } from 'app/components/photo-grid-section';
import { ProjectsSection } from 'app/components/projects-section';
import { WritingSection } from 'app/components/writing-section';
import { getBlogPosts } from 'app/db/blog';
import { PreloadResources } from 'app/preload';
import { userData } from 'lib/data';
import me from 'public/images/home/me.jpg';
import me2 from 'public/images/home/me2.jpg';
import me3 from 'public/images/home/me3.jpg';

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
    name: "hey, I'm Akhilesh 👋",
    description:
      'A Software Dev from India. I develop stuff ranging from state-of-the-art to just-for-fun and everything in between!',
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
      title: 'Sandbox IDE',
      description: 'Open-source cloud IDE with live collaboration',
      url: 'https://sandbox.gitwit.dev/',
    },
    {
      title: 'DressUp AI',
      description: 'AI-driven styling app with personalized recommendations',
      url: 'https://soundsgood-fashion-generator.vercel.app/analyze',
    },
  ];

  // Current work data - keeping the original inline structure
  const workData = [
    <p key="tambo">
      Software Development Intern at{' '}
      <Badge href="https://tambo.co" underline={true}>
        tambo ai
      </Badge>
      .
    </p>,
    <p key="gitwit">
      Working with{' '}
      <Badge href="https://jamesmurdza.com" underline={false}>
        James Murdza
      </Badge>{' '}
      on{' '}
      <Badge href="https://www.gitwit.dev" underline={true}>
        GitWit.dev
      </Badge>
      , an AI-powered, open source cloud IDE.
    </p>,
    <p key="gwu">
      Research Assistant in AI at{' '}
      <Badge href="https://www.gwu.edu/" underline={true}>
        GWU
      </Badge>
      , building high-performance chatbots and educational platforms.
    </p>,
  ];

  // Writing data
  const writingData = sortedBlogs.map(blog => ({
    title: blog.metadata.title,
    summary: blog.metadata.summary,
    slug: blog.slug,
    publishedAt: blog.metadata.publishedAt,
  }));

  // Connect data
  const connectData = [
    { name: 'Twitter', url: userData.twitter, external: true },
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
      <WritingSection posts={writingData} maxPosts={1} />
      <ConnectSection links={connectData} />
    </section>
  );
}
