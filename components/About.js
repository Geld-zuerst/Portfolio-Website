export default function About() {
  return (
    <div className="wrap" id="about">
      <section className="section">
        <div className="sec-head fu">
          <span className="sec-num">00</span>
          <h2 className="sec-title">About Me</h2>
          <div className="sec-rule"></div>
        </div>
        <div className="story-grid">
          <div className="story-card fu">
            <div className="story-avatar">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="avatarGrad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c84b2f" />
                    <stop offset="100%" stopColor="#3a6ea8" />
                  </linearGradient>
                </defs>
                <rect width="200" height="200" fill="var(--card-bg)" />
                <path d="M20 200 Q20 128 100 128 Q180 128 180 200 Z" fill="url(#avatarGrad1)" />
                <circle cx="100" cy="82" r="50" fill="url(#avatarGrad1)" />
                <polygon points="100,34 132,66 100,98 68,66" fill="#ffffff" opacity="0.1" />
                <polygon points="68,66 100,98 68,120 48,94" fill="#ffffff" opacity="0.06" />
                <polygon points="132,66 152,94 132,120 100,98" fill="#0e0e12" opacity="0.08" />
                <circle cx="100" cy="82" r="50" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="meta-row">
              <span className="meta-icon">◎</span>
              <div>
                <div className="meta-label">Name</div>
                <div className="meta-val">Harsh Tiwari</div>
              </div>
            </div>
            <div className="meta-row">
              <span className="meta-icon">◎</span>
              <div>
                <div className="meta-label">Age</div>
                <div className="meta-val">19 years old</div>
              </div>
            </div>
            <div className="meta-row">
              <span className="meta-icon">◎</span>
              <div>
                <div className="meta-label">Role</div>
                <div className="meta-val">Python Developer & Vibe Coder</div>
              </div>
            </div>
            <div className="meta-row">
              <span className="meta-icon">◎</span>
              <div>
                <div className="meta-label">Experience</div>
                <div className="meta-val" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  2+ Yrs · Agency-style Delivery
                </div>
              </div>
            </div>
            <div className="meta-row">
              <span className="meta-icon">◎</span>
              <div>
                <div className="meta-label">Email</div>
                <div className="meta-val">
                  <a href="mailto:harsh.tiwari7112@gmail.com">harsh.tiwari7112@gmail.com</a>
                </div>
              </div>
            </div>
            <div className="meta-row">
              <span className="meta-icon">◎</span>
              <div>
                <div className="meta-label">GitHub</div>
                <div className="meta-val">
                  <a href="https://github.com/Harsh7112" target="_blank" rel="noreferrer">
                    github.com/Harsh7112
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="story-chapters fu">
            <div className="chapter">
              <div className="chapter-num">01</div>
              <div className="chapter-tag">The Foundation</div>
              <h3 className="chapter-title">Fresh Out of Class 12, Fully Focused</h3>
              <p className="chapter-body">
                Recently completed <strong>Class 12 (PCM)</strong> and fully focused on building a technical career.
                Strong interest in <strong>technology, problem-solving, and continuous learning</strong> — with the
                work ethic to back it up.
              </p>
            </div>
            <div className="chapter">
              <div className="chapter-num">02</div>
              <div className="chapter-tag">My Approach</div>
              <h3 className="chapter-title">Plan First, Then Ship Step by Step</h3>
              <p className="chapter-body">
                When I encounter something unfamiliar, I <strong>create a plan first</strong> — identify what I need
                to learn, then work step by step. This has built strong <strong>analytical and self-learning</strong>{" "}
                muscle. Comfortable in both <strong>solo and team</strong> settings, I take initiative when needed
                and adapt quickly — currently learning across <strong>programming, data, automation</strong> and
                emerging tech simultaneously.
              </p>
            </div>
            <div className="chapter">
              <div className="chapter-num">03</div>
              <div className="chapter-tag">The Mission</div>
              <h3 className="chapter-title">Solve, Impact, Grow</h3>
              <p className="chapter-body">
                To become a highly skilled professional who can <strong>solve complex problems</strong>, create
                meaningful impact, and grow into greater responsibilities over time — starting by shipping things
                now.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
