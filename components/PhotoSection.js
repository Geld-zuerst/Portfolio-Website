import { PhotoCanvas } from "./ThreeScenes";

export default function PhotoSection() {
  return (
    <section className="photo-section" id="photo-sec">
      <PhotoCanvas />
      <div className="photo-ring-wrap fu">
        <div className="photo-ring"></div>
        <div className="photo-ring-outer"></div>
        <div className="photo-circle">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="photo-avatar-svg">
            <defs>
              <linearGradient id="avatarGrad2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#c84b2f" />
                <stop offset="100%" stopColor="#3a6ea8" />
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="var(--card-bg)" />
            <path d="M14 205 Q14 122 100 122 Q186 122 186 205 Z" fill="url(#avatarGrad2)" />
            <circle cx="100" cy="80" r="52" fill="url(#avatarGrad2)" />
            <polygon points="100,28 136,64 100,100 64,64" fill="#ffffff" opacity="0.12" />
            <polygon points="64,64 100,100 64,128 42,96" fill="#ffffff" opacity="0.07" />
            <polygon points="136,64 158,96 136,128 100,100" fill="#0e0e12" opacity="0.09" />
            <circle cx="100" cy="80" r="52" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="photo-name fu d2">Harsh Tiwari</div>
      <div className="photo-title fu d3">
        Builder & Learner · <span>Python Dev</span>
      </div>
    </section>
  );
}
