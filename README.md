[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fakhileshrangani4%2Fmy-portfolio)

# Akhilesh Rangani - Personal Portfolio

A modern personal portfolio website built with Next.js 15, showcasing my work!.

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
- **Deployment**: [Vercel](https://vercel.com) with automatic previews

## Features

### Core Pages

- **Home**: Hero section, photo grid, current work, featured projects, and latest writing
- **Blog**: Technical articles with MDX support, view counter, and comments system
- **Guestbook**: Interactive visitor messages with GitHub authentication
- **Admin Panel**: Content management dashboard for authenticated admin users

### Interactive Features

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

## Project Structure

```bash
my-portfolio/
├── app/ # Next.js App Router
│ ├── admin/ # Admin dashboard
│ ├── api/ # API routes
│ │ └── auth/ # NextAuth.js configuration
│ ├── blog/ # Blog functionality
│ │ ├── [slug]/ # Dynamic blog post pages
│ │ └── page.tsx # Blog listing page
│ ├── components/ # Reusable React components
│ │ ├── blog/ # Blog-specific components
│ │ │ ├── comments/ # Comment system
│ │ │ ├── list/ # Blog listing components
│ │ │ └── post/ # Blog post components
│ │ ├── guestbook/ # Guestbook components
│ │ ├── sandpack/ # Code playground components
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
├── public/ # Static assets
│ ├── fonts/ # Custom fonts
│ └── images/ # Images and media
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

# Email Notifications (Optional)
RESEND_SECRET=                    # Resend API key for email notifications

```

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`

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
