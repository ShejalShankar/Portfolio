[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fakhileshrangani4%2Fmy-portfolio)

# Akhilesh Rangani - Personal Portfolio

A modern personal portfolio website built with Next.js 15, featuring an AI-powered voice assistant and interactive components.

## About

This is my personal website where I share my projects, technical writings, and connect with others in the tech community. Currently serving as a Software Development Intern at tambo ai, collaborating on GitWit.dev, and working as a Research Assistant in AI at GWU.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Frontend**: [React 19](https://react.dev/) with TypeScript
- **Database**: [PostgreSQL](https://vercel.com/postgres) with direct SQL queries
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org) with GitHub OAuth
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with custom typography
- **Fonts**: [Geist Sans & Mono](https://vercel.com/font) by Vercel
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) & [Speed Insights](https://vercel.com/speed-insights)
- **Content**: MDX with [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)
- **Code Playground**: [Sandpack](https://sandpack.codesandbox.io/) for interactive examples
- **Tweet Embeds**: [react-tweet](https://react-tweet.vercel.app/) for Twitter integration
- **AI Assistant**: [Tambo AI](https://tambo.co) for voice-driven interactions
- **Speech Services**: OpenAI Whisper (STT) & ElevenLabs (TTS)
- **Firecrawl**: [Firecrawl](https://www.firecrawl.dev/) for crawling job postings to give to the AI
- **Deployment**: [Vercel](https://vercel.com) with automatic previews

## Features

### Core Pages

- **Home**: Hero section, photo grid, current work, featured projects, and latest writing
- **Blog**: Technical articles with MDX support, view counter, and comments system
- **Guestbook**: Interactive visitor messages with GitHub authentication
- **Admin Panel**: Content management dashboard for authenticated admin users

### AI-Powered Features

- **Voice-Driven Portfolio Agent**: An AI assistant that speaks as Akhilesh
  - Natural voice conversations using speech-to-text and text-to-speech
  - Real-time voice activity detection
  - Automatic speech submission detection
  - Personalized responses based on visitor context (student, recruiter, developer)

- **Dynamic Component Rendering**: AI can display relevant portfolio components
  - Photo grids, project showcases, social media cards
  - Resume overview and download buttons
  - Blog post previews and guestbook entries
  - Job analysis cards for recruiters

- **Job Posting Analysis**: Automatic analysis when URLs are shared
  - Extracts job requirements and skills
  - Matches against Akhilesh's experience
  - Provides tailored talking points
  - Calculates fit scores

### Interactive Features

- **Speech-to-Text**: Voice input with real-time transcription
  - Powered by OpenAI Whisper API
  - Voice activity detection for natural pauses
  - Automatic audio format conversion (WebM to WAV)
  - Smart submission detection using GPT-4

- **Text-to-Speech**: Natural voice synthesis for AI responses
  - Powered by ElevenLabs API
  - Automatic playback for new messages
  - Global audio management system
  - Synchronized playback controls

- **Comments System**: Blog post comments with GitHub authentication
- **View Counter**: Real-time page view tracking for blog posts
- **Sandpack Integration**: Live code examples with syntax highlighting
- **Photo Grid**: Dynamic image gallery with responsive layout
- **Dark Mode**: Automatic theme switching based on system preferences

### Technical Features

- **SSR/SSG**: Server-side rendering with Next.js App Router
- **Security Headers**: Comprehensive CSP and security configurations
- **Email Notifications**: Automated email alerts for new guestbook entries
- **URL Redirects**: Dynamic redirect management via database
- **Error Handling**: Custom error pages and graceful fallbacks
- **Audio Management**: Centralized system for managing TTS playback

## Project Structure

```bash
my-portfolio/
├── app/ # Next.js App Router
│ ├── admin/ # Admin dashboard
│ ├── api/ # API routes
│ │ ├── auth/ # NextAuth.js configuration
│ │ ├── speech-to-text/ # Voice transcription endpoints
│ │ ├── text-to-speech/ # Voice synthesis endpoints
│ │ └── job-scraper/ # Job posting analysis
│ ├── blog/ # Blog functionality
│ │ ├── [slug]/ # Dynamic blog post pages
│ │ └── page.tsx # Blog listing page
│ ├── components/ # Reusable React components
│ │ ├── blog/ # Blog-specific components
│ │ ├── guestbook/ # Guestbook components
│ │ ├── sandpack/ # Code playground components
│ │ ├── speech-to-text/ # Voice input components
│ │ ├── text-to-speech/ # Voice output components
│ │ ├── tambo/ # AI assistant components
│ │ └── tweet/ # Twitter embed components
│ ├── db/ # Database layer
│ │ ├── actions.ts # Server actions
│ │ ├── queries.tsx # Database queries
│ │ ├── postgres.ts # Database connection
│ │ └── blog.ts # Blog post utilities
│ ├── guestbook/ # Guestbook page
│ ├── auth.ts # Authentication configuration
│ ├── layout.tsx # Root layout with metadata
│ └── page.tsx # Homepage
├── content/ # MDX blog posts
├── lib/ # Utility functions
│ ├── audio-manager.ts # Global audio management
│ ├── tambo.ts # AI assistant configuration
│ ├── tambo_system_prompt.ts # AI personality & behavior
│ └── tools/ # AI assistant tools
│     ├── blog-tools.ts # Blog interaction tools
│     ├── guestbook-tools.ts # Guestbook tools
│     └── job-scraper-tools.ts # Job analysis tools
├── public/ # Static assets
│ ├── fonts/ # Custom fonts
│ ├── images/ # Images and media
│ └── speaking_agent_data.json # AI assistant knowledge base
└── ...configuration files
```

## Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun format` - Format code with Prettier

## Database Schema

The application uses PostgreSQL with the following tables:

```sql
-- Page view tracking
CREATE TABLE views (
  slug VARCHAR(255) PRIMARY KEY,
  count INT NOT NULL DEFAULT 0
);

-- Guestbook entries
CREATE TABLE guestbook (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Blog post comments
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  blog_slug VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- URL redirects
CREATE TABLE redirects (
  id SERIAL PRIMARY KEY,
  source VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  permanent BOOLEAN DEFAULT FALSE
);
```

## Getting Started

### Prerequisites

- Node.js 18.17+ (recommended: use the latest LTS version)
- bun or npm/yarn package manager
- PostgreSQL database (Vercel Postgres recommended)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/akhileshrangani4/my-portfolio.git
cd my-portfolio
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
bun dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database Configuration (Vercel Postgres)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NO_SSL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Authentication (NextAuth.js)
AUTH_SECRET=                      # Generate: openssl rand -base64 32
OAUTH_CLIENT_KEY=                 # GitHub OAuth App Client ID
OAUTH_CLIENT_SECRET=              # GitHub OAuth App Client Secret
AUTH_REDIRECT_PROXY_URL=          # For preview deployments
NEXTAUTH_URL=                     # Next-Auth url

# Email Notifications (Optional)
RESEND_SECRET=                    # Resend API key for email notifications

# AI Services
OPENAI_API_KEY=                   # OpenAI API key for GPT-4 and Whisper
ELEVENLABS_API_KEY=               # ElevenLabs API key for text-to-speech
ELEVENLABS_VOICE_ID=              # ElevenLabs voice ID for TTS
FIRECRAWL_API_KEY=                # Firecrawl API key for web scraping

# Tambo AI Configuration
NEXT_PUBLIC_TAMBO_API_KEY=        # Tambo AI API key

# Verification Codes
GOOGLE_VERIFICATION_CODE=         # Google
YANDEX_VERIFICATION_CODE=         # Yandex
```

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`

### AI Services Setup

1. **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/)
2. **ElevenLabs**: Sign up at [ElevenLabs](https://elevenlabs.io/) for TTS API
3. **Tambo AI**: Contact [Tambo AI](https://tambo.co) for API access
4. **Firecrawl**: Get API key from [Firecrawl](https://firecrawl.dev/)

## Content Management

### Blog Posts

- Create MDX files in the `content/` directory
- Use frontmatter for metadata:

```yaml
---
title: 'Your Post Title'
publishedAt: '2024-01-01'
summary: 'Brief description of your post'
---
```

### AI Assistant Knowledge

#### Note: These are not used in project anywhere but are used in tambo system instructions on tambo dashboard.

- Update `public/speaking_agent_data.json` with personal information
- Modify `lib/tambo_system_prompt.ts` to customize AI personality

### Admin Features

- Access admin panel at `/admin` (requires authentication)
- Manage guestbook entries
- View analytics and engagement metrics
- Delete inappropriate comments

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Enable Vercel Postgres integration
4. Deploy automatically on push to main branch

### Manual Database Setup

If not using Vercel Postgres, run the SQL schema manually on your PostgreSQL instance.

## Voice Assistant Usage

The AI-powered voice assistant can be activated in several ways:

1. **Voice Input**: Click the microphone button to start speaking
2. **Text Input**: Type messages in the chat interface
3. **URL Analysis**: Paste job posting URLs for automatic analysis

### Example Interactions

- "Tell me about yourself"
- "What projects have you built?"
- "Show me your resume"
- "What's in your guestbook?"
- "Can you analyze this job posting: [URL]"

## Connect

- **Website**: [heyavi.me](https://heyavi.me)
- **Twitter**: [@heyavi\_](https://twitter.com/heyavi_)
- **LinkedIn**: [Akhilesh Rangani](https://www.linkedin.com/in/akhileshrangani/)
- **GitHub**: [akhileshrangani4](https://github.com/akhileshrangani4)
- **Email**: akhileshrangani4@gmail.com

## License

This project is open source and available under the [MIT License](LICENSE.txt). Feel free to use it as inspiration for your own portfolio, but please customize it to make it your own and credit the original work.

## Contributing

While this is a personal portfolio, I welcome suggestions and improvements. Feel free to open issues or submit pull requests for:

- Bug fixes
- Performance improvements
- New features
- Documentation updates

---

_Built with ❤️ using Next.js and deployed on Vercel_
