export default function ProjectsPage() {
  return (
  <section className="max-w-3xl mx-auto px-6 pt-4 pb-12">
     <h1 className="text-2xl font-normal mb-6 text-neutral-900 dark:text-neutral-100">Projects 🚀</h1>
      <p className="text-neutral-600 dark:text-neutral-300 mb-8">
        A few of the projects I’ve worked on — spanning AI, full-stack development, and DevOps.
        Each project reflects my curiosity, experimentation, and focus on building systems that actually work in the real world.
      </p>

      <div className="space-y-10">
        <ProjectCard
          title="Financial Insight Assistant"
          description="An AI-powered web app that analyzes stock sentiment using Reddit and yFinance data, built with Next.js, LangChain, and OpenAI APIs."
          stack={['Next.js', 'LangChain', 'Python', 'yFinance', 'ChromaDB']}
          link="https://github.com/shejalshankar/Finance_Assistant"
        />
        <ProjectCard
          title="Brain Tumor Detection with SRGANs"
          description="Deep Learning pipeline built for the detection of brain tumor that combines YOLOv11 for object detection with Super-Resolution GANs (SRGAN) to enhance MRI image quality. The project addresses challenges like low-resolution scans and imaging artifacts that hinder accurate diagnosis."
          stack={['Pytorch', 'SRGAN', 'YOLOv11',]}
          link="https://github.com/ShejalShankar/BrainTumor_Detection"
        />
        <ProjectCard
          title="Monitoring Stack with Prometheus & Grafana"
          description="Deployed Prometheus, Grafana, and Pushgateway on Kubernetes with TLS-secured ingress, live metrics, and custom Spring Boot integration."
          stack={['Spring Boot', 'Kubernetes', 'Prometheus', 'Grafana']}
        />
      </div>
    </section>
  );
}

function ProjectCard({ title, description, stack, link }: any) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 hover:shadow-md transition-shadow duration-200">
      <h2 className="text-xl font-normal mb-6 text-neutral-900 dark:text-neutral-100">{title}</h2>
       <p className="text-neutral-600 dark:text-neutral-300 mb-8">{description}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {stack.map((tech: string) => (
          <span
            key={tech}
            className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md text-neutral-600 dark:text-neutral-300"
          >
            {tech}
          </span>
        ))}
      </div>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Project →
        </a>
      )}
    </div>
  );
}
