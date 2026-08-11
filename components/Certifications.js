"use client";

import { useEffect, useState, useCallback } from "react";
import { certs } from "@/data/certs";
import Modal from "./Modal";

const order = ["forage-dl", "bcg", "tata", "deloitte", "n8n", "sql"];
const delays = ["d1", "d2", "d3", "d4", "d5", "d6"];

export default function Certifications() {
  const [activeId, setActiveId] = useState(null);

  const close = useCallback(() => setActiveId(null), []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  const activeCert = activeId ? certs[activeId] : null;

  return (
    <div className="wrap" id="certs">
      <section className="section">
        <div className="sec-head fu">
          <span className="sec-num">03</span>
          <h2 className="sec-title">Certifications</h2>
          <div className="sec-rule"></div>
        </div>
        <div className="certs-grid">
          {order.map((id, i) => {
            const c = certs[id];
            return (
              <div className={`cert-card fu ${delays[i]}`} key={id} onClick={() => setActiveId(id)}>
                <div className="cert-inner">
                  <div className="cert-from">{c.from}</div>
                  <div className="cert-name">{c.title}</div>
                  <div className="cert-chips">
                    {c.chips.map((chip) => (
                      <span className="cert-chip" key={chip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                  <div className="cert-foot">
                    <span>{c.date}</span>
                    <span className="cert-verified">✓ Verified</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <Modal cert={activeCert} onClose={close} />
    </div>
  );
}
