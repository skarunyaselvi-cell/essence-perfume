import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import CursorGlow from "../components/CursorGlow";
import HeroSection from "../components/HeroSection";
import LoadingScreen from "../components/LoadingScreen";
import PerfumeBottleCanvas from "../components/PerfumeBottleCanvas";
import ScrollProgress from "../components/ScrollProgress";
import { perfumes } from "../data/perfumes";
import type { PerfumeData } from "../types/perfume";

gsap.registerPlugin(ScrollTrigger);

// ─── Particle system ───────────────────────────────────────────────────────────

interface ParticlesProps {
  color: string;
  sectionId: number;
}

function CssParticles({ color, sectionId }: ParticlesProps) {
  const PARTICLE_COUNT = 30;

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: Math.round(Math.random() * 90),
    duration: +(4 + Math.random() * 4).toFixed(2),
    delay: +(Math.random() * 5).toFixed(2),
    opacity: +(0.3 + Math.random() * 0.5).toFixed(2),
    size: Math.round(4 + Math.random() * 6),
  }));

  const keyframesId = `floatUp-${sectionId}`;

  return (
    <>
      <style>{`
        @keyframes ${keyframesId} {
          0%   { transform: translateY(0)    scale(1);   opacity: 0; }
          15%  { opacity: var(--p-opacity); }
          80%  { opacity: var(--p-opacity); }
          100% { transform: translateY(-120px) scale(0.6); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: "10%",
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: color,
            // @ts-expect-error CSS custom property
            "--p-opacity": p.opacity,
            animation: `${keyframesId} ${p.duration}s ${p.delay}s ease-in-out infinite`,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

interface NavProps {
  activeSection: number; // 0 = hero, 1-10 = perfumes
}

function Nav({ activeSection }: NavProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY && y > 120) {
        gsap.to(el, { y: -80, duration: 0.4, ease: "power2.inOut" });
      } else {
        gsap.to(el, { y: 0, duration: 0.4, ease: "power2.inOut" });
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // 11 dots: index 0 = hero, index 1-10 = perfumes
  const sectionIds = ["hero", ...perfumes.map((p) => `perfume-${p.id}`)];

  return (
    <nav
      ref={navRef}
      data-ocid="nav.panel"
      className="fixed top-0 left-0 right-0 z-[100]"
      style={{
        backdropFilter: "blur(20px)",
        background: "oklch(0.06 0 0 / 0.7)",
        borderBottom: "1px solid oklch(0.60 0.24 79.2 / 0.20)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          data-ocid="nav.logo_link"
          onClick={() => scrollToSection("hero")}
          className="font-display text-gold-glow tracking-wider-luxury transition-smooth hover:opacity-75"
          style={{
            fontSize: "1.4rem",
            fontWeight: 300,
            letterSpacing: "0.22em",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ESSENCE
        </button>

        {/* Navigation dots */}
        <div
          data-ocid="nav.dots_list"
          className="flex items-center gap-2"
          aria-label="Section navigation"
        >
          {sectionIds.map((id, idx) => {
            const isActive = activeSection === idx;
            return (
              <button
                key={id}
                type="button"
                data-ocid={`nav.dot.${idx}`}
                aria-label={idx === 0 ? "Hero" : perfumes[idx - 1]?.name}
                onClick={() => scrollToSection(id)}
                className="transition-smooth"
                style={{
                  width: isActive ? "10px" : "7px",
                  height: isActive ? "10px" : "7px",
                  borderRadius: "50%",
                  background: isActive
                    ? "oklch(0.65 0.24 79.2)"
                    : "oklch(0.35 0.04 79.2 / 0.6)",
                  boxShadow: isActive
                    ? "0 0 8px oklch(0.65 0.24 79.2 / 0.7)"
                    : "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>

        {/* Collection label */}
        <span
          className="hidden md:block font-body text-xs tracking-wider-luxury"
          style={{ color: "oklch(0.50 0.12 79.2)", letterSpacing: "0.18em" }}
        >
          10 FRAGRANCES
        </span>
      </div>
    </nav>
  );
}

// ─── Perfume section ───────────────────────────────────────────────────────────

interface PerfumeSectionProps {
  perfume: PerfumeData;
  index: number;
  onInView: (idx: number) => void;
}

function PerfumeSection({ perfume, index, onInView }: PerfumeSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const isEven = index % 2 === 0;

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const canvasWrap = canvasWrapRef.current;
    if (!section || !text || !canvasWrap) return;

    // Set initial state BEFORE creating timeline (avoids flash)
    gsap.set(text, { x: isEven ? -40 : 40, opacity: 0 });
    gsap.set(canvasWrap, { x: isEven ? 40 : -40, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        once: true,
      },
    });

    tl.to(text, { x: 0, opacity: 1, duration: 1, ease: "power2.out" }).to(
      canvasWrap,
      { x: 0, opacity: 1, duration: 1, ease: "power2.out" },
      "-=0.65",
    );

    // In-view tracker for nav dots (1-based: perfume 1 = nav index 1)
    const inViewTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      onEnter: () => onInView(index + 1),
      onEnterBack: () => onInView(index + 1),
    });

    return () => {
      tl.kill();
      inViewTrigger.kill();
    };
  }, [isEven, index, onInView]);

  return (
    <section
      ref={sectionRef}
      id={`perfume-${perfume.id}`}
      data-ocid={`perfume.section.${perfume.id}`}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${perfume.bgGradient}`}
    >
      {/* CSS Particles */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <CssParticles color={perfume.particleColor} sectionId={perfume.id} />
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 50%, transparent 40%, oklch(0.04 0 0 / 0.55) 100%)",
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Large decorative number */}
      <div
        className="absolute font-display select-none pointer-events-none"
        style={{
          fontSize: "clamp(8rem, 22vw, 20rem)",
          fontWeight: 700,
          color: "oklch(0.14 0.04 79.2 / 0.11)",
          right: isEven ? "auto" : "2%",
          left: isEven ? "2%" : "auto",
          bottom: "0%",
          lineHeight: 1,
          zIndex: 1,
          letterSpacing: "-0.05em",
        }}
        aria-hidden="true"
      >
        {String(perfume.id).padStart(2, "0")}
      </div>

      <div
        className="relative w-full max-w-[1400px] mx-auto px-8 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-28 lg:py-24"
        style={{ zIndex: 2 }}
      >
        {/* Canvas area */}
        <div
          ref={canvasWrapRef}
          className={`relative h-[340px] md:h-[480px] lg:h-[560px] ${isEven ? "lg:order-2" : "lg:order-1"}`}
        >
          {/* Radial glow blob */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle 55% at 50% 55%, ${perfume.accentHex}28 0%, transparent 70%)`,
              filter: "blur(22px)",
            }}
            aria-hidden="true"
          />
          <PerfumeBottleCanvas perfume={perfume} />
        </div>

        {/* Info card */}
        <div
          ref={textRef}
          className={`flex flex-col justify-center ${isEven ? "lg:order-1" : "lg:order-2"}`}
        >
          {/* Number tag */}
          <span
            className="font-body text-xs tracking-wider-luxury uppercase mb-4 block"
            style={{
              color: perfume.accentHex,
              opacity: 0.75,
              letterSpacing: "0.22em",
            }}
          >
            No. {String(perfume.id).padStart(2, "0")}
          </span>

          {/* Perfume name */}
          <h2
            data-ocid={`perfume.name.${perfume.id}`}
            className="font-display leading-none mb-3"
            style={{
              fontSize: "clamp(2.8rem, 5vw, 4.8rem)",
              fontWeight: 300,
              color: "oklch(0.93 0.04 79.2)",
              letterSpacing: "0.04em",
              textShadow: `0 0 40px ${perfume.accentHex}44`,
            }}
          >
            {perfume.name}
          </h2>

          {/* Tagline */}
          <p
            className="font-display italic mb-6"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.35rem)",
              color: perfume.accentHex,
              fontWeight: 300,
              opacity: 0.9,
            }}
          >
            "{perfume.tagline}"
          </p>

          {/* Gold divider */}
          <div
            className="mb-6 h-px w-16"
            style={{
              background: `linear-gradient(to right, ${perfume.accentHex}bb, transparent)`,
            }}
            aria-hidden="true"
          />

          {/* Description */}
          <p
            className="font-body mb-8"
            style={{
              fontSize: "clamp(0.88rem, 1.3vw, 1rem)",
              color: "oklch(0.70 0 0)",
              lineHeight: "1.9",
              fontWeight: 300,
              maxWidth: "44ch",
            }}
          >
            {perfume.description}
          </p>

          {/* Glassmorphism card with ingredient tags */}
          <div
            data-ocid={`perfume.ingredients.${perfume.id}`}
            className="glass-card p-5"
            style={{ borderRadius: "1rem" }}
          >
            <p
              className="font-body text-xs tracking-wider-luxury uppercase mb-3"
              style={{ color: "oklch(0.52 0 0)", letterSpacing: "0.17em" }}
            >
              Key Notes
            </p>
            <div className="flex flex-wrap gap-2">
              {perfume.ingredients.map((ing) => (
                <IngredientTag
                  key={ing}
                  label={ing}
                  accentHex={perfume.accentHex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Extracted to avoid inline event handler assignment lint warnings
interface IngredientTagProps {
  label: string;
  accentHex: string;
}

function IngredientTag({ label, accentHex }: IngredientTagProps) {
  const handleEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    el.style.background = `${accentHex}30`;
    el.style.transform = "translateY(-2px) scale(1.05)";
  };
  const handleLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    el.style.background = `${accentHex}15`;
    el.style.transform = "translateY(0) scale(1)";
  };

  return (
    <span
      className="font-body text-xs px-3 py-1.5 transition-smooth"
      style={{
        background: `${accentHex}15`,
        border: `1px solid ${accentHex}40`,
        borderRadius: "3rem",
        color: accentHex,
        letterSpacing: "0.05em",
        cursor: "default",
        display: "inline-block",
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {label}
    </span>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const utmUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  const handleLinkEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = "oklch(0.65 0.20 79.2)";
  };
  const handleLinkLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = "oklch(0.42 0 0)";
  };
  const handleAnchorEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = "oklch(0.75 0.24 79.2)";
  };
  const handleAnchorLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = "oklch(0.60 0.20 79.2)";
  };

  return (
    <footer
      data-ocid="footer.section"
      className="relative py-16 px-8"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.08 0.02 79.2 / 0.3) 0%, oklch(0.06 0 0) 100%)",
        borderTop: "1px solid oklch(0.20 0.08 79.2 / 0.3)",
      }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p
            className="font-display text-gold-glow tracking-wider-luxury mb-1"
            style={{
              fontSize: "1.6rem",
              fontWeight: 300,
              letterSpacing: "0.2em",
            }}
          >
            ESSENCE
          </p>
          <p
            className="font-body text-xs tracking-wider-luxury"
            style={{ color: "oklch(0.42 0 0)", letterSpacing: "0.14em" }}
          >
            CRAFTED SCENT · CAPTURED EMOTION
          </p>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          {perfumes.map((p) => (
            <button
              type="button"
              key={p.id}
              data-ocid={`footer.perfume_link.${p.id}`}
              onClick={() =>
                document
                  .getElementById(`perfume-${p.id}`)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="font-body text-xs transition-smooth"
              style={{
                color: "oklch(0.42 0 0)",
                background: "none",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.08em",
              }}
              onMouseEnter={handleLinkEnter}
              onMouseLeave={handleLinkLeave}
            >
              {p.name}
            </button>
          ))}
        </div>

        <p
          className="font-body text-xs"
          style={{ color: "oklch(0.38 0 0)", letterSpacing: "0.05em" }}
        >
          © {year}. Built with love using{" "}
          <a
            href={utmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-smooth"
            style={{ color: "oklch(0.60 0.20 79.2)" }}
            onMouseEnter={handleAnchorEnter}
            onMouseLeave={handleAnchorLeave}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function PerfumeExperience() {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Track hero section in-view for nav dot
  useEffect(() => {
    if (!loaded) return;
    const hero = document.getElementById("hero");
    if (!hero) return;

    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: "top 50%",
      end: "bottom 50%",
      onEnter: () => setActiveSection(0),
      onEnterBack: () => setActiveSection(0),
    });

    return () => trigger.kill();
  }, [loaded]);

  const handleSectionInView = (idx: number) => setActiveSection(idx);

  return (
    <>
      {/* Loading screen shown until dismissed */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Main content — rendered behind loading screen, becomes visible after dismiss */}
      <div
        data-ocid="experience.page"
        className="relative"
        style={{ visibility: loaded ? "visible" : "hidden" }}
      >
        <ScrollProgress />
        <CursorGlow />
        <Nav activeSection={activeSection} />

        {/* Hero section */}
        <div id="hero" className="pt-12">
          <HeroSection />
        </div>

        {/* 10 perfume sections */}
        {perfumes.map((perfume, i) => (
          <PerfumeSection
            key={perfume.id}
            perfume={perfume}
            index={i}
            onInView={handleSectionInView}
          />
        ))}

        <Footer />
      </div>
    </>
  );
}
