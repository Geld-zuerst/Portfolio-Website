import ArrowIcon from "./ArrowIcon";
import { projects } from "@/data/projects";

const statusClass = {
  live: "status-live",
  wip: "status-wip",
  code: "status-code",
};

export default function Projects() {
  return (
    <div className="wrap" id="projects">
      <section className="section">
        <div className="sec-head fu">
          <span className="sec-num">01</span>
          <h2 className="sec-title">Vibe Coded Projects</h2>
          <div className="sec-rule"></div>
        </div>
        <div className="proj-note fu d1">
          A mix of AI-assisted builds (Base44, Lovable) and hand-coded Python — real products, real users, learning
          by shipping.
        </div>
        <div className="projects-grid">
          {projects.map((p) => (
            <a
              key={p.key}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className={`proj-card ${p.className} fu ${p.delay}`}
            >
              <div className="proj-thumb">
                <div className="proj-thumb-bg"></div>
                <div className="proj-thumb-word">{p.word}</div>
                <div className="proj-thumb-icon">{p.icon}</div>
                <span className={`proj-status ${statusClass[p.status]}`}>{p.statusLabel}</span>
              </div>
              <div className="proj-body">
                <div className="proj-name">{p.name}</div>
                <p className="proj-desc">{p.desc}</p>
                <div className="proj-tags">
                  {p.tags.map((tag) => (
                    <span className="proj-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="proj-link-row">
                  <span className="proj-arrow">
                    {p.link} <ArrowIcon />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
