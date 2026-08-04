export default function Skills() {
  return (
    <div className="wrap" id="skills">
      <section className="section">
        <div className="sec-head fu">
          <span className="sec-num">02</span>
          <h2 className="sec-title">Skills</h2>
          <div className="sec-rule"></div>
        </div>
        <div className="skills-cols fu d1">
          <div>
            <div className="skill-group-label">Proficient</div>
            <div className="pills-wrap">
              {["Python", "NumPy", "Pandas", "Matplotlib", "Seaborn", "SQL", "Data Analytics", "AI-Dev", "Git / GitHub", "HTML & CSS"].map(
                (s) => (
                  <span className="pill hot" key={s}>
                    {s}
                  </span>
                )
              )}
            </div>
          </div>
          <div>
            <div className="skill-group-label">Currently Learning</div>
            <div className="pills-wrap">
              {["JavaScript", "Full-Stack Dev", "Automation Eng."].map((s) => (
                <span className="pill" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="strengths-wrap fu d2">
          <div className="skill-group-label" style={{ marginTop: "8px" }}>
            Core Strengths
          </div>
          <div className="pills-wrap">
            {[
              "🧩 Systems Thinking",
              "⚡ Fast Learning",
              "🎯 Strategic Planning",
              "🔍 Workflow Analysis",
              "🚀 Entrepreneurial Mindset",
              "🤝 Leadership & Initiative",
              "🔄 Adaptability",
            ].map((s) => (
              <span className="pill" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
