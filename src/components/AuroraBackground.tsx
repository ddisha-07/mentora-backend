import { useEffect, useRef, useState } from "react";

export function AuroraBackground() {
  const blobsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", listener);

    if (mediaQuery.matches) {
      return () => {
        mediaQuery.removeEventListener("change", listener);
      };
    }

    // Parallax mouse effect variables
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to range [-1, 1]
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const updateParallax = () => {
      // Smooth interpolation (lerp)
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (blobsRef.current) {
        // Shift blobs by up to 18px
        blobsRef.current.style.transform = `translate3d(${currentX * 18}px, ${currentY * 18}px, 0)`;
      }
      if (gridRef.current) {
        // Shift grid slightly less (up to 5px) for parallax depth
        gridRef.current.style.transform = `translate3d(${currentX * 5}px, ${currentY * 5}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updateParallax);
    };

    updateParallax();

    return () => {
      mediaQuery.removeEventListener("change", listener);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none overflow-hidden" 
      style={{ 
        zIndex: -1, 
        backgroundColor: "var(--lp-bg)",
        transition: "background-color 0.5s ease"
      }}
    >
      <style>{`
        /* ── Drifting Animation Keyframes (Slow, non-looping jumps, fluid northern lights paths) ── */
        @keyframes aurora-premium-1 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          33% { transform: translate3d(10vw, 15vh, 0) scale(1.15) rotate(120deg); }
          66% { transform: translate3d(-8vw, 25vh, 0) scale(0.9) rotate(240deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(360deg); }
        }
        @keyframes aurora-premium-2 {
          0% { transform: translate3d(0, 0, 0) scale(1.1) rotate(360deg); }
          50% { transform: translate3d(-15vw, -10vh, 0) scale(0.9) rotate(180deg); }
          100% { transform: translate3d(0, 0, 0) scale(1.1) rotate(0deg); }
        }
        @keyframes aurora-premium-3 {
          0% { transform: translate3d(0, 0, 0) scale(0.9) rotate(0deg); }
          50% { transform: translate3d(18vw, -12vh, 0) scale(1.2) rotate(-180deg); }
          100% { transform: translate3d(0, 0, 0) scale(0.9) rotate(-360deg); }
        }
        @keyframes aurora-premium-4 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(180deg); }
          50% { transform: translate3d(-20vw, 15vh, 0) scale(1.05) rotate(0deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(-180deg); }
        }
        @keyframes aurora-premium-5 {
          0% { transform: translate3d(0, 0, 0) scale(1.05) rotate(0deg); }
          33% { transform: translate3d(-10vw, -20vh, 0) scale(1.15) rotate(120deg); }
          66% { transform: translate3d(15vw, -10vh, 0) scale(0.85) rotate(-120deg); }
          100% { transform: translate3d(0, 0, 0) scale(1.05) rotate(-360deg); }
        }
        @keyframes aurora-premium-6 {
          0% { transform: translate3d(0, 0, 0) scale(0.95) rotate(-180deg); }
          50% { transform: translate3d(12vw, 20vh, 0) scale(1.1) rotate(0deg); }
          100% { transform: translate3d(0, 0, 0) scale(0.95) rotate(180deg); }
        }

        .aurora-blobs {
          position: absolute;
          inset: -10%;
          filter: blur(200px); /* Massive blur radius to dissolve shapes naturally */
          transform: translate3d(0,0,0);
          will-change: transform;
          opacity: 0.45;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
        .dark .aurora-blobs {
          opacity: 0.32;
        }
      `}</style>

      {/* 6 Large Drifting Aurora Blobs (GPU Accelerated & Parallax Mouse-Shited) */}
      <div ref={blobsRef} className="aurora-blobs pointer-events-none">
        {/* Blob 1 - Purple (top-left) */}
        <div 
          className="absolute rounded-full pointer-events-none" 
          style={{
            top: "-10%",
            left: "-10%",
            width: "60vw",
            height: "60vh",
            background: "radial-gradient(circle, var(--lp-purple) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-premium-1 38s infinite linear",
          }} 
        />
        {/* Blob 2 - Pink (top-right) */}
        <div 
          className="absolute rounded-full pointer-events-none" 
          style={{
            top: "10%",
            right: "-15%",
            width: "65vw",
            height: "65vh",
            background: "radial-gradient(circle, var(--lp-pink) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-premium-2 46s infinite linear",
            animationDelay: "-4s"
          }} 
        />
        {/* Blob 3 - Cyan (bottom-left) */}
        <div 
          className="absolute rounded-full pointer-events-none" 
          style={{
            bottom: "-15%",
            left: "5%",
            width: "60vw",
            height: "60vh",
            background: "radial-gradient(circle, var(--lp-cyan) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-premium-3 52s infinite linear",
            animationDelay: "-8s"
          }} 
        />
        {/* Blob 4 - Blue / Electric Blue (top-center) */}
        <div 
          className="absolute rounded-full pointer-events-none" 
          style={{
            top: "5%",
            left: "25%",
            width: "55vw",
            height: "55vh",
            background: "radial-gradient(circle, var(--lp-blue) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-premium-4 58s infinite linear",
            animationDelay: "-12s"
          }} 
        />
        {/* Blob 5 - Violet (bottom-right) */}
        <div 
          className="absolute rounded-full pointer-events-none" 
          style={{
            bottom: "10%",
            right: "-10%",
            width: "55vw",
            height: "55vh",
            background: "radial-gradient(circle, var(--lp-purple) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-premium-5 42s infinite linear",
            animationDelay: "-16s"
          }} 
        />
        {/* Blob 6 - Orange / Subtle Accent (center-left) */}
        <div 
          className="absolute rounded-full pointer-events-none" 
          style={{
            top: "35%",
            left: "-5%",
            width: "50vw",
            height: "50vh",
            background: "radial-gradient(circle, var(--lp-orange) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-premium-6 60s infinite linear",
            animationDelay: "-20s"
          }} 
        />
      </div>

      {/* Subtle Integrated Dot-Grid Pattern */}
      <div 
        ref={gridRef}
        className="absolute inset-0 lp-dot-grid pointer-events-none" 
        style={{
          opacity: 0.08,
          willChange: "transform"
        }}
      />

      {/* Subtle Grain Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.015] mix-blend-overlay pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <filter id="auroraNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#auroraNoise)" />
      </svg>
    </div>
  );
}
