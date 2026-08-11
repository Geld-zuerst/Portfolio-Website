import ArrowIcon from "./ArrowIcon";

const statusClass = {
  live: "status-live",
  wip: "status-wip",
  code: "status-code",
};

export default function ProjectCard({ p }) {
  return (
    <a href={p.href} target="_blank" rel="noreferrer" className={`proj-card ${p.className} fu ${p.delay}`}>
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
  );
}
