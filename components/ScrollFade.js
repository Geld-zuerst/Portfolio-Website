"use client";

import { useEffect } from "react";

export default function ScrollFade() {
  useEffect(() => {
    const fuEls = document.querySelectorAll(".fu");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.style.animationPlayState = "running";
        });
      },
      { threshold: 0.1 }
    );
    fuEls.forEach((el) => {
      if (!el.closest(".hero") && !el.closest("nav")) el.style.animationPlayState = "paused";
      obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  return null;
}
