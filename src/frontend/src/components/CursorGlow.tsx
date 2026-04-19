import { gsap } from "gsap";
import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    let isVisible = false;

    const onMove = (e: MouseEvent) => {
      gsap.to(el, {
        x: e.clientX - 15,
        y: e.clientY - 15,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (!isVisible) {
        isVisible = true;
        gsap.to(el, { opacity: 1, duration: 0.3 });
      }
    };

    const onEnter = () => {
      isVisible = true;
      gsap.to(el, { opacity: 1, duration: 0.3 });
    };

    const onLeave = () => {
      isVisible = false;
      gsap.to(el, { opacity: 0, duration: 0.3 });
    };

    const onMouseDown = () => {
      gsap.to(el, { scale: 0.7, duration: 0.1, ease: "power2.out" });
    };

    const onMouseUp = () => {
      gsap.to(el, { scale: 1, duration: 0.2, ease: "back.out(2)" });
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="cursor-ring fixed pointer-events-none z-[9999]"
      style={{ opacity: 0, top: 0, left: 0, willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
