"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ── HERO — PARTICLE FIELD ── */
export function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.z = 30;

    function resize() {
      const w = canvas.parentElement.offsetWidth;
      const h = canvas.parentElement.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const N = 1000;
    const positions = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      sizes[i] = Math.random() * 1.2 + 0.3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xc84b2f,
      size: 0.24,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    const octGeo = new THREE.OctahedronGeometry(6, 0);
    const octMat = new THREE.MeshBasicMaterial({ color: 0xc84b2f, wireframe: true, transparent: true, opacity: 0.18 });
    const oct = new THREE.Mesh(octGeo, octMat);
    oct.position.set(14, 2, -5);
    scene.add(oct);

    const torusGeo = new THREE.TorusGeometry(5, 0.06, 8, 60);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x3a6ea8, transparent: true, opacity: 0.22 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(-14, -2, -8);
    scene.add(torus);

    const torus2Geo = new THREE.TorusGeometry(3.2, 0.04, 8, 48);
    const torus2Mat = new THREE.MeshBasicMaterial({ color: 0xc84b2f, transparent: true, opacity: 0.2 });
    const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
    torus2.position.set(16, -6, -4);
    torus2.rotation.x = Math.PI / 3;
    scene.add(torus2);

    let mx = 0,
      my = 0;
    function onMouseMove(e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    document.addEventListener("mousemove", onMouseMove);

    let t = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      t += 0.008;
      particles.rotation.y = t * 0.04;
      particles.rotation.x = t * 0.015;
      oct.rotation.x = t * 0.4;
      oct.rotation.y = t * 0.55;
      torus.rotation.z = t * 0.25;
      torus.rotation.x = t * 0.15 + 0.5;
      torus2.rotation.y = t * 0.35;
      torus2.rotation.z = t * 0.2;

      camera.position.x += (mx * 2 - camera.position.x) * 0.04;
      camera.position.y += (-my * 1.5 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
    };
  }, []);

  return <canvas id="hero-canvas" ref={canvasRef}></canvas>;
}

/* ── PHOTO SECTION — ORBITAL SPHERE ── */
export function PhotoCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    if (!canvas || !section) return;
    let raf;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    camera.position.z = 22;

    function resize() {
      const w = section.offsetWidth;
      const h = section.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const icoGeo = new THREE.IcosahedronGeometry(4.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0xc84b2f, wireframe: true, transparent: true, opacity: 0.22 });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    function makeRing(r, tilt, opacity) {
      const g = new THREE.TorusGeometry(r, 0.025, 6, 80);
      const m = new THREE.MeshBasicMaterial({ color: 0xc84b2f, transparent: true, opacity });
      const mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = tilt;
      return mesh;
    }
    const ring1 = makeRing(7, Math.PI / 4, 0.32);
    const ring2 = makeRing(9, -Math.PI / 5, 0.22);
    const ring3 = makeRing(11, Math.PI / 2.2, 0.16);
    scene.add(ring1, ring2, ring3);

    function makeDot(r, speed, offset, size) {
      const g = new THREE.SphereGeometry(size, 6, 6);
      const m = new THREE.MeshBasicMaterial({ color: 0xc84b2f });
      const mesh = new THREE.Mesh(g, m);
      mesh._r = r;
      mesh._speed = speed;
      mesh._offset = offset;
      return mesh;
    }
    const dots = [makeDot(7, 0.8, 0, 0.15), makeDot(9, -0.5, 1.2, 0.1), makeDot(11, 0.35, 2.5, 0.12), makeDot(7, 0.8, Math.PI, 0.1)];
    dots.forEach((d) => scene.add(d));

    const pN = 250;
    const pPos = new Float32Array(pN * 3);
    for (let i = 0; i < pN; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 50;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xc84b2f, size: 0.18, transparent: true, opacity: 0.4 });
    scene.add(new THREE.Points(pGeo, pMat));

    let t = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      t += 0.01;
      ico.rotation.x = t * 0.2;
      ico.rotation.y = t * 0.3;
      ring1.rotation.z = t * 0.25;
      ring2.rotation.z = -t * 0.18;
      ring3.rotation.z = t * 0.12;

      dots.forEach((d, i) => {
        const angle = t * d._speed + d._offset;
        const tilt = i * 0.7;
        d.position.x = Math.cos(angle) * d._r;
        d.position.y = Math.sin(angle) * d._r * Math.sin(tilt);
        d.position.z = Math.sin(angle) * d._r * Math.cos(tilt);
      });

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, []);

  return <canvas id="photo-canvas" ref={canvasRef}></canvas>;
}

/* ── SEPARATOR — WAVE GRID ── */
export function WaveGridCanvas({ id }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = canvas?.parentElement;
    if (!canvas || !wrap) return;
    let raf;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    camera.position.z = 20;

    function resize() {
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const cols = 40,
      rows = 16;
    const spacing = 1.2;
    const pointsGroup = new THREE.Group();
    const waveDots = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const g = new THREE.SphereGeometry(0.06, 4, 4);
        const m = new THREE.MeshBasicMaterial({ color: 0xc84b2f, transparent: true, opacity: 0.55 });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.x = (c - cols / 2) * spacing;
        mesh.position.y = (r - rows / 2) * spacing * 0.6;
        mesh._c = c;
        mesh._r = r;
        pointsGroup.add(mesh);
        waveDots.push(mesh);
      }
    }
    scene.add(pointsGroup);

    for (let r = 0; r < rows; r++) {
      const pts = [];
      for (let c = 0; c < cols; c++) {
        pts.push(new THREE.Vector3((c - cols / 2) * spacing, (r - rows / 2) * spacing * 0.6, 0));
      }
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const m = new THREE.LineBasicMaterial({ color: 0xc84b2f, transparent: true, opacity: 0.12 });
      scene.add(new THREE.Line(g, m));
    }

    let t = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      t += 0.025;
      waveDots.forEach((d) => {
        const wave = Math.sin(d._c * 0.35 + t) * Math.cos(d._r * 0.5 + t * 0.4);
        d.position.z = wave * 1.8;
        d.material.opacity = 0.25 + (wave + 1) * 0.3;
      });
      pointsGroup.rotation.y = Math.sin(t * 0.1) * 0.15;
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, []);

  return <canvas id={id} className="section-canvas" ref={canvasRef}></canvas>;
}

/* ── SEPARATOR — FLOATING CUBES ── */
export function FloatingCubesCanvas({ id }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = canvas?.parentElement;
    if (!canvas || !wrap) return;
    let raf;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.z = 22;

    function resize() {
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const cubes = [];
    for (let i = 0; i < 18; i++) {
      const s = Math.random() * 1.2 + 0.3;
      const g = new THREE.BoxGeometry(s, s, s);
      const m = new THREE.MeshBasicMaterial({ color: 0xc84b2f, wireframe: true, transparent: true, opacity: Math.random() * 0.35 + 0.15 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set((Math.random() - 0.5) * 36, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 14);
      mesh._rx = (Math.random() - 0.5) * 0.025;
      mesh._ry = (Math.random() - 0.5) * 0.025;
      mesh._float = Math.random() * Math.PI * 2;
      mesh._floatSpeed = Math.random() * 0.5 + 0.3;
      scene.add(mesh);
      cubes.push(mesh);
    }

    let t = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      t += 0.01;
      cubes.forEach((c) => {
        c.rotation.x += c._rx;
        c.rotation.y += c._ry;
        c.position.y += Math.sin(t * c._floatSpeed + c._float) * 0.012;
      });
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, []);

  return <canvas id={id} className="section-canvas" ref={canvasRef}></canvas>;
}

/* ── CONTACT — ABSTRACT SPHERE ── */
export function ContactCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    if (!canvas || !section) return;
    let raf;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.z = 18;

    function resize() {
      const w = section.offsetWidth;
      const h = section.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const sGeo = new THREE.SphereGeometry(5.5, 18, 14);
    const sMat = new THREE.MeshBasicMaterial({ color: 0xc84b2f, wireframe: true, transparent: true, opacity: 0.2 });
    const sphere = new THREE.Mesh(sGeo, sMat);
    scene.add(sphere);

    for (let i = 0; i < 3; i++) {
      const g = new THREE.TorusGeometry(7 + i * 1.8, 0.03, 6, 80);
      const m = new THREE.MeshBasicMaterial({ color: 0xc84b2f, transparent: true, opacity: 0.18 - i * 0.04 });
      const mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = i * 0.9;
      mesh.rotation.y = i * 0.6;
      mesh._speed = 0.18 - i * 0.04;
      scene.add(mesh);
    }

    const meshes = scene.children.filter((c) => c.isMesh);

    let t = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      t += 0.008;
      sphere.rotation.y = t * 0.3;
      sphere.rotation.x = t * 0.15;
      meshes.slice(1).forEach((m, i) => {
        m.rotation.z += 0.006 * (i % 2 === 0 ? 1 : -1);
      });
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, []);

  return <canvas id="contact-canvas" ref={canvasRef}></canvas>;
}
