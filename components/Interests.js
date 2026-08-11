export default function Interests() {
  const interests = [
    "Full-Stack Development",
    "Automation Engineering",
    "AI Workflows",
    "SaaS Products",
    "Dashboards & Analytics",
    "Product Engineering",
    "Entrepreneurship",
    "Data Science",
  ];

  return (
    <div className="wrap" id="interests">
      <section className="section">
        <div className="sec-head fu">
          <span className="sec-num">04</span>
          <h2 className="sec-title">Career Interests</h2>
          <div className="sec-rule"></div>
        </div>
        <div className="pills-wrap fu d1">
          {interests.map((i) => (
            <span className="pill" key={i}>
              {i}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
