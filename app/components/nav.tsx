import Link from 'next/link';

type NavItem = {
  name: string;
  external?: boolean;
};

const navItems: Record<string, NavItem> = {
  '/': {
    name: 'Home',
  },
  '/blog': {
    name: 'Blog',
  },
  '/Projects': {
    name: 'Projects',
  },
  [process.env.RESUME_URL!]:
    {
      name: 'Resume',
      external: true,
    },
  [process.env.CAL_URL!]:
    {
      name: 'Calendar',
      external: true,
    },
};

export function Navbar() {
  return (
    <aside className="mb-20">
      <div className="lg:sticky lg:top-20">
        <nav className="flex flex-row items-start relative" id="nav">
          <div className="flex flex-row gap-8">
            {Object.entries(navItems).map(([path, item]) => {
              if (item.external) {
                return (
                  <a
                    key={path}
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                  >
                    {item.name}
                  </a>
                );
              }

              return (
                <Link
                  key={path}
                  href={path}
                  className="text-base text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
