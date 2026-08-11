import ProjectCard from "./ProjectCard";
import { projects } from "@/data/projects";

export default function Projects() {
  const vibeProjects = projects.filter((p) => p.type === "vibe");
  const selfProjects = projects.filter((p) => p.type === "self");

  return (
    <div className="wrap" id="projects">
      <section className="section">
        <div className="sec-head fu">
          <span className="sec-num">01</span>
          <h2 className="sec-title">Projects</h2>
          <div className="sec-rule"></div>
        </div>
        <div className="proj-note fu d1">
          A mix of AI-assisted builds (Base44, Lovable) and hand-coded Python — real products, real users, learning
          by shipping.
        </div>

        {/* Vibe Coded */}
        <div className="proj-group">
          <div className="skill-group-label">
            <span className="proj-group-dot proj-group-dot-vibe"></span>
            Vibe Coded — AI-Assisted Builds
          </div>
          <p className="proj-group-sub fu d1">
            Built end-to-end with AI dev tools like Base44 and Lovable — idea to live product, fast.
          </p>
          <div className="projects-grid">
            {vibeProjects.map((p) => (
              <ProjectCard p={p} key={p.key} />
            ))}
          </div>
        </div>

        {/* Self Coded */}
        <div className="proj-group proj-group-last">
          <div className="skill-group-label">
            <span className="proj-group-dot proj-group-dot-self"></span>
            Self Coded — Hand-Written Python
          </div>
          <p className="proj-group-sub fu d1">
            Written from scratch, no frameworks — pure Python logic, structure, and problem-solving.
          </p>
          <div className="projects-grid">
            {selfProjects.map((p) => (
              <ProjectCard p={p} key={p.key} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
