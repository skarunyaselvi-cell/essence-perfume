import { useEffect, useRef } from "react";
import * as THREE from "three";

// ── Particle helpers ──────────────────────────────────────────────────────────
function createParticles(container: HTMLDivElement): () => void {
  const COUNT = 80;
  const particles: HTMLDivElement[] = [];

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("div");
    const size = 3 + Math.random() * 7; // 3–10 px
    const left = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = 6 + Math.random() * 8;
    const gold = Math.random() > 0.4;

    Object.assign(el.style, {
      position: "absolute",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      left: `${left}%`,
      bottom: "-10px",
      background: gold
        ? `oklch(0.80 0.18 79.2 / ${0.4 + Math.random() * 0.5})`
        : `oklch(0.90 0.05 79.2 / ${0.2 + Math.random() * 0.3})`,
      boxShadow: gold
        ? `0 0 ${size * 1.5}px oklch(0.60 0.24 79.2 / 0.6)`
        : "none",
      pointerEvents: "none",
      animation: `heroParticleFloat ${duration}s ${delay}s ease-in infinite`,
    });

    container.appendChild(el);
    particles.push(el);
  }

  return () => {
    for (const p of particles) p.remove();
  };
}

// ── Three.js scene ─────────────────────────────────────────────────────────────
function createPerfumeScene(canvas: HTMLCanvasElement): () => void {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0.5, 4.5);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const goldLight = new THREE.PointLight(0xffd700, 2.5, 20);
  goldLight.position.set(2, 4, 3);
  scene.add(goldLight);

  const blueLight = new THREE.PointLight(0x4466ff, 1.5, 20);
  blueLight.position.set(-3, -4, 2);
  scene.add(blueLight);

  // Materials
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.6,
    roughness: 0.2,
    transparent: true,
    opacity: 0.85,
  });
  const goldEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.6,
    roughness: 0.2,
    emissive: 0xffd700,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.88,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.85,
    roughness: 0.1,
  });

  // Bottle group
  const group = new THREE.Group();
  scene.add(group);

  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 2, 32),
    glassMat,
  );
  group.add(body);

  // Liquid (inner)
  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 1.5, 32),
    goldEmissiveMat,
  );
  liquid.position.y = -0.05;
  group.add(liquid);

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 0.5, 32),
    glassMat,
  );
  neck.position.y = 1.25;
  group.add(neck);

  // Cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.4, 0.4, 32),
    capMat,
  );
  cap.position.y = 1.7;
  group.add(cap);

  // Resize helper
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();
  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) ro.observe(canvas.parentElement);

  // Animation loop
  let rafId: number;
  const clock = new THREE.Clock();

  function animate() {
    rafId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    group.rotation.y += 0.01;
    group.position.y = Math.sin(elapsed * 1.1) * 0.12;
    renderer.render(scene, camera);
  }

  animate();

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    renderer.dispose();
    glassMat.dispose();
    goldEmissiveMat.dispose();
    capMat.dispose();
  };
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  // Three.js scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return createPerfumeScene(canvas);
  }, []);

  // DOM particles
  useEffect(() => {
    const container = particleRef.current;
    if (!container) return;
    return createParticles(container);
  }, []);

  // Entrance animation via IntersectionObserver + GSAP
  useEffect(() => {
    const el = heroTextRef.current;
    if (!el) return;

    // Initial state
    el.style.opacity = "0";
    el.style.transform = "translateY(32px) scale(0.95)";
    el.style.transition =
      "opacity 1s ease, transform 1s cubic-bezier(0.16,1,0.3,1)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0) scale(1)";
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Inject particle keyframe once */}
      <style>{`
        @keyframes heroParticleFloat {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-90vh) scale(0.4); opacity: 0; }
        }
        @keyframes heroBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(10px); }
        }
      `}</style>

      <section
        data-ocid="hero.section"
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.08 0.04 280) 0%, oklch(0.12 0.08 290) 40%, oklch(0.10 0.06 260) 100%)",
        }}
      >
        {/* Particle layer */}
        <div
          ref={particleRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
          aria-hidden="true"
        />

        {/* Content grid */}
        <div
          className="relative w-full max-w-[1400px] mx-auto px-8 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-24"
          style={{ zIndex: 2 }}
        >
          {/* LEFT — Brand text */}
          <div
            ref={heroTextRef}
            className="flex flex-col justify-center order-2 lg:order-1"
          >
            {/* Pre-headline */}
            <p
              className="text-sm font-body tracking-wider-luxury uppercase mb-6"
              style={{ color: "oklch(0.60 0.24 79.2 / 0.7)" }}
            >
              Premium Fragrance Experience
            </p>

            {/* Brand name */}
            <h1
              data-ocid="hero.brand_title"
              className="text-gold-glow font-display leading-none mb-6"
              style={{
                fontSize: "clamp(4rem, 9vw, 8rem)",
                fontWeight: 300,
                letterSpacing: "0.1em",
                fontFamily: "'Cormorant Garamond', 'Fraunces', Georgia, serif",
              }}
            >
              ESSENCE
            </h1>

            {/* Tagline */}
            <p
              className="font-display italic mb-4"
              style={{
                fontSize: "clamp(1.1rem, 2.5vw, 1.7rem)",
                fontFamily: "'Cormorant Garamond', 'Fraunces', Georgia, serif",
                color: "oklch(0.88 0.04 79.2)",
                fontWeight: 300,
                letterSpacing: "0.04em",
              }}
            >
              Crafted Scent. Captured Emotion.
            </p>

            {/* Description */}
            <p
              className="font-body mb-10 max-w-md"
              style={{
                fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)",
                color: "oklch(0.65 0 0)",
                lineHeight: "1.8",
                fontWeight: 300,
              }}
            >
              Enter a world where fragrance becomes an art form. Eleven
              immersive journeys through scent, light, and emotion.
            </p>

            {/* Scroll CTA */}
            <div
              data-ocid="hero.scroll_cta"
              className="flex flex-col items-start gap-2"
            >
              <span
                className="font-body text-sm tracking-wider-luxury uppercase"
                style={{ color: "oklch(0.60 0.24 79.2 / 0.8)" }}
              >
                Scroll to Explore
              </span>
              {/* Bouncing chevron */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                style={{
                  animation: "heroBounce 2s ease-in-out infinite",
                  color: "oklch(0.60 0.24 79.2)",
                }}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Decorative gold line */}
            <div
              className="mt-12 h-px w-24"
              style={{
                background:
                  "linear-gradient(to right, oklch(0.60 0.24 79.2 / 0.7), transparent)",
              }}
              aria-hidden="true"
            />
          </div>

          {/* RIGHT — 3D Canvas */}
          <div
            className="relative flex items-center justify-center order-1 lg:order-2 h-[420px] lg:h-[620px]"
            style={{ minHeight: 320 }}
          >
            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle 45% at 50% 55%, oklch(0.60 0.24 79.2 / 0.18) 0%, oklch(0.40 0.15 79.2 / 0.07) 50%, transparent 75%)",
                animation: "heroPulse 4s ease-in-out infinite",
              }}
              aria-hidden="true"
            />

            {/* Canvas wrapper fills the container */}
            <canvas
              ref={canvasRef}
              data-ocid="hero.canvas_target"
              className="w-full h-full block"
              style={{ borderRadius: "1rem" }}
            />
          </div>
        </div>

        {/* Subtle vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 50%, oklch(0.06 0 0 / 0.5) 100%)",
            zIndex: 3,
          }}
          aria-hidden="true"
        />
      </section>

      {/* Pulse keyframe for glow */}
      <style>{`
        @keyframes heroPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
      `}</style>
    </>
  );
}
