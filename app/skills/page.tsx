import React from 'react';

export const metadata = {
  title: 'Skills | Shejal Shankar',
  description:
    'An overview of my technical expertise, tools, and technologies I work with — from AI to full-stack and DevOps.',
};

export default function SkillsPage() {
  const skills = {
    'Frontend Development': [
      'React',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'HTML',
      'CSS',
      'JavaScript (ES6+)',
    ],
    'Backend Development': [
      'Node.js',
      'NestJS',
      'FastAPI',
      'PostgreSQL',
      'MongoDB',
      'REST APIs',
      'Prisma ORM',
    ],
    'AI & Machine Learning': [
      'LangChain',
      'OpenAI API',
      'Hugging Face',
      'PyTorch',
      'Pandas',
      'Scikit-learn',
    ],
    'DevOps & Infrastructure': [
      'Docker',
      'Kubernetes',
      'Prometheus',
      'Grafana',
      'Longhorn',
      'Helm',
    ],
    'Cloud & Tools': [
      'AWS',
      'Vercel',
      'Git',
      'GitHub Actions',
      'Postman',
      'VS Code',
      'Figma',
    ],
  };

  return (
    <section className="max-w-3xl mx-auto px-6 pt-4 pb-12">
      <h1 className="text-2xl font-normal mb-6 text-neutral-900 dark:text-neutral-100">Technical Skills ⚙️</h1>

      <p className="text-neutral-600 dark:text-neutral-300 mb-10 leading-relaxed">
        Here’s a snapshot of the technologies I use to build AI-powered, full-stack
        applications — blending frontend design, backend logic, and scalable
        infrastructure. Each tool plays a role in helping me create seamless,
        production-ready systems.
      </p>

      <div className="space-y-10">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category}>
             <h2 className="text-xl font-normal mb-6 text-neutral-900 dark:text-neutral-100">{category}</h2>
            <div className="flex flex-wrap gap-2">
              {items.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-md text-sm font-medium hover:scale-105 transition-transform"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
