import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { PerfumeData } from "../types/perfume";

gsap.registerPlugin(ScrollTrigger);

interface PerfumeBottleCanvasProps {
  perfume: PerfumeData;
  className?: string;
}

export default function PerfumeBottleCanvas({
  perfume,
  className = "",
}: PerfumeBottleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0.3, 4);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const goldLight = new THREE.PointLight(0xffd700, 2.5, 20);
    goldLight.position.set(3, 4, 3);
    scene.add(goldLight);

    const accentLight = new THREE.PointLight(
      new THREE.Color(perfume.accentHex),
      1.8,
      15,
    );
    accentLight.position.set(-3, -3, 2);
    scene.add(accentLight);

    // Parse hex to Three.Color
    const bottleColorObj = new THREE.Color(perfume.bottleColor);
    const liquidColorObj = new THREE.Color(perfume.liquidColor);

    // Materials
    const glassMat = new THREE.MeshStandardMaterial({
      color: bottleColorObj,
      metalness: 0.5,
      roughness: 0.15,
      transparent: true,
      opacity: 0.8,
    });

    const liquidMat = new THREE.MeshStandardMaterial({
      color: liquidColorObj,
      metalness: 0.4,
      roughness: 0.25,
      emissive: liquidColorObj,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.85,
    });

    const capMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.9,
      roughness: 0.05,
    });

    const goldRingMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.1,
      emissive: 0xd4af37,
      emissiveIntensity: 0.15,
    });

    // Build bottle group
    const group = new THREE.Group();
    scene.add(group);

    // Body
    group.add(
      new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.9, 32), glassMat),
    );
    // Liquid
    const liq = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.44, 1.4, 32),
      liquidMat,
    );
    liq.position.y = -0.05;
    group.add(liq);
    // Neck
    group.add(
      Object.assign(
        new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.34, 0.5, 32),
          glassMat,
        ),
        { position: new THREE.Vector3(0, 1.2, 0) },
      ),
    );
    // Gold ring (collar)
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32),
      goldRingMat,
    );
    ring.position.y = 0.96;
    group.add(ring);
    // Cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.33, 0.45, 32),
      capMat,
    );
    cap.position.y = 1.65;
    group.add(cap);

    // Particle points floating around the bottle
    const particleCount = 60;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.9 + Math.random() * 1.2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(perfume.accentHex),
      size: 0.035,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(particleGeo, particleMat);
    scene.add(points);

    // Resize
    const canvasEl = canvas;
    function resize() {
      const parent = canvasEl.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    if (canvasEl.parentElement) ro.observe(canvasEl.parentElement);

    // Animate
    let rafId: number;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y += 0.008;
      group.position.y = Math.sin(t * 0.9) * 0.1;
      points.rotation.y -= 0.003;
      points.rotation.x = Math.sin(t * 0.3) * 0.1;
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.dispose();
      glassMat.dispose();
      liquidMat.dispose();
      capMat.dispose();
      goldRingMat.dispose();
      particleMat.dispose();
      particleGeo.dispose();
    };
  }, [perfume]);

  return (
    <canvas
      ref={canvasRef}
      data-ocid="bottle.canvas_target"
      className={`block w-full h-full ${className}`}
    />
  );
}
