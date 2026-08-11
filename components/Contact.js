import { ContactCanvas } from "./ThreeScenes";

export default function Contact() {
  return (
    <section className="contact-section" id="contact">
      <ContactCanvas />
      <div className="section-label fu" style={{ display: "block", textAlign: "center" }}>
        Let&apos;s Connect
      </div>
      <h2 className="contact-heading fu">
        Let&apos;s build
        <br />
        something real.
      </h2>
      <p className="contact-sub fu d2">Have a project, an idea, or just want to talk shop? I&apos;m all ears.</p>
      <div className="contact-links fu d3">
        <a href="mailto:harsh.tiwari7112@gmail.com" className="btn-primary">
          Say Hello →
        </a>
        <a href="https://github.com/Harsh7112" target="_blank" rel="noreferrer" className="btn-secondary">
          github.com/Harsh7112
        </a>
      </div>
    </section>
  );
}
