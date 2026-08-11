import { HeroCanvas } from "./ThreeScenes";

export default function Hero() {
  return (
    <div className="hero">
      <HeroCanvas />

      <div className="eyebrow fu d1">
        <div className="eyebrow-rule"></div>
        <span className="eyebrow-text">19 · Python Developer & Product Builder</span>
      </div>

      <h1 className="hero-name fu d2">
        <span className="solid">
          Harsh
          <br />
        </span>
        <span className="outline">Tiwari.</span>
      </h1>

      <p className="hero-tagline fu d3">
        Product builder in progress. Shipping real apps with AI-assisted development while learning Python, data
        analysis, SQL, and automation from the ground up.
      </p>

      <div className="hero-stats fu d4">
        <div className="stat-item">
          <div className="stat-number">19</div>
          <div className="stat-label">Years Old</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">
            2<span className="stat-accent">+</span>
          </div>
          <div className="stat-label">Yrs Vibe Coding</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">
            3<span className="stat-accent">×</span>
          </div>
          <div className="stat-label">Sites Shipped</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">Py</div>
          <div className="stat-label">Core Stack</div>
        </div>
      </div>

      <div className="scroll-hint">Scroll</div>
    </div>
  );
}
