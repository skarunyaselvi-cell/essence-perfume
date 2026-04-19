import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const el = barRef.current;
      if (!el) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      el.style.width = `${progress}%`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[1000] pointer-events-none"
      style={{ height: "2px", background: "transparent" }}
      aria-hidden="true"
    >
      <div
        ref={barRef}
        style={{
          height: "100%",
          width: "0%",
          background:
            "linear-gradient(90deg, oklch(0.50 0.24 79.2), oklch(0.70 0.24 79.2), oklch(0.60 0.24 79.2))",
          boxShadow: "0 0 8px oklch(0.60 0.24 79.2 / 0.6)",
          transition: "width 0.05s linear",
          willChange: "width",
        }}
      />
    </div>
  );
}
