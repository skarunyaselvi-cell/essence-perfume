import { gsap } from "gsap";
import { useEffect, useRef } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete,
        });
      },
    });

    tl.set(containerRef.current, { opacity: 1 })
      .from(brandRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      })
      .from(
        taglineRef.current,
        { y: 16, opacity: 0, duration: 0.7, ease: "power2.out" },
        "-=0.4",
      )
      .from(
        shimmerRef.current,
        {
          scaleX: 0,
          duration: 0.5,
          ease: "power2.out",
          transformOrigin: "left",
        },
        "-=0.2",
      )
      .to(
        progressRef.current,
        { width: "100%", duration: 1.4, ease: "power1.inOut" },
        "-=0.3",
      )
      .to({}, { duration: 0.4 });
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      data-ocid="loading_state"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "oklch(0.06 0 0)", opacity: 0 }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, oklch(0.60 0.24 79.2 / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Brand name */}
      <div ref={brandRef} className="text-center mb-3">
        <h1
          className="font-display tracking-wider-luxury text-gold-glow"
          style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300 }}
        >
          ESSENCE
        </h1>
      </div>

      {/* Tagline */}
      <p
        ref={taglineRef}
        className="text-muted-foreground tracking-wider-luxury text-sm mb-12"
        style={{ letterSpacing: "0.25em" }}
      >
        CRAFTED SCENT · CAPTURED EMOTION
      </p>

      {/* Gold shimmer divider */}
      <div
        ref={shimmerRef}
        className="mb-8"
        style={{ width: "200px", height: "1px" }}
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.60 0.24 79.2 / 0.8), transparent)",
          }}
        />
      </div>

      {/* Progress bar */}
      <div
        className="relative overflow-hidden"
        style={{
          width: "200px",
          height: "2px",
          background: "oklch(0.20 0.05 79.2 / 0.3)",
          borderRadius: "2px",
        }}
      >
        <div
          ref={progressRef}
          style={{
            width: "0%",
            height: "100%",
            background:
              "linear-gradient(90deg, oklch(0.55 0.24 79.2), oklch(0.70 0.24 79.2))",
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}
