import { useEffect, useState } from "react";

export function AuroraBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => {
      mediaQuery.removeEventListener("change", listener);
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
        /* ── Drifting Animation Keyframes ── */
        @keyframes aurora-drift-1 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          33% { transform: translate3d(12vw, 8vh, 0) scale(1.15) rotate(120deg); }
          66% { transform: translate3d(-8vw, 18vh, 0) scale(0.85) rotate(240deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(360deg); }
        }
        @keyframes aurora-drift-2 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(-15vw, -12vh, 0) scale(0.9) rotate(-180deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(-360deg); }
        }
        @keyframes aurora-drift-3 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(20vw, -8vh, 0) scale(1.2) rotate(180deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(360deg); }
        }
        @keyframes aurora-drift-4 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(-20vw, 15vh, 0) scale(1.05) rotate(180deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(360deg); }
        }
        @keyframes aurora-drift-5 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          33% { transform: translate3d(-10vw, -20vh, 0) scale(1.1) rotate(-120deg); }
          66% { transform: translate3d(15vw, -12vh, 0) scale(0.9) rotate(-240deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(-360deg); }
        }
        @keyframes aurora-drift-6 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(18vw, 12vh, 0) scale(1.15) rotate(180deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(360deg); }
        }
        @keyframes aurora-drift-7 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(-12vw, 18vh, 0) scale(0.85) rotate(-180deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(-360deg); }
        }
        @keyframes aurora-drift-8 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(6vw, -15vh, 0) scale(1.2) rotate(180deg); }
          100% { transform: translate3d(0, 0, 0) scale(1) rotate(360deg); }
        }

        /* ── Grid Breathing Keyframe ── */
        @keyframes aurora-grid-pulse {
          0%, 100% { opacity: var(--grid-pulse-min); }
          50% { opacity: var(--grid-pulse-max); }
        }

        .aurora-container {
          position: absolute;
          inset: 0;
          filter: blur(140px);
          transform: translate3d(0,0,0);
          opacity: 0.16;
          transition: opacity 0.5s ease;
        }
        .dark .aurora-container {
          opacity: 0.14;
        }

        /* ── Breathing variables ── */
        :root:not(.dark) {
          --grid-pulse-min: 0.03;
          --grid-pulse-max: 0.07;
        }
        .dark {
          --grid-pulse-min: 0.05;
          --grid-pulse-max: 0.11;
        }
      `}</style>

      {/* 8 Drifting Aurora Mesh Gradient Layers */}
      <div className="aurora-container">
        {/* Layer 1 - Purple */}
        <div 
          className="absolute rounded-full" 
          style={{
            top: "-15%",
            left: "-15%",
            width: "55vw",
            height: "55vh",
            background: "radial-gradient(circle, var(--lp-purple) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-drift-1 32s infinite linear",
          }} 
        />
        {/* Layer 2 - Pink */}
        <div 
          className="absolute rounded-full" 
          style={{
            top: "15%",
            right: "-20%",
            width: "65vw",
            height: "65vh",
            background: "radial-gradient(circle, var(--lp-pink) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-drift-2 38s infinite linear",
            animationDelay: "-3s"
          }} 
        />
        {/* Layer 3 - Cyan */}
        <div 
          className="absolute rounded-full" 
          style={{
            bottom: "-20%",
            left: "10%",
            width: "60vw",
            height: "60vh",
            background: "radial-gradient(circle, var(--lp-cyan) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-drift-3 44s infinite linear",
            animationDelay: "-6s"
          }} 
        />
        {/* Layer 4 - Blue */}
        <div 
          className="absolute rounded-full" 
          style={{
            top: "5%",
            left: "25%",
            width: "50vw",
            height: "50vh",
            background: "radial-gradient(circle, var(--lp-blue) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-drift-4 48s infinite linear",
            animationDelay: "-9s"
          }} 
        />
        {/* Layer 5 - Violet/Purple */}
        <div 
          className="absolute rounded-full" 
          style={{
            bottom: "15%",
            right: "-10%",
            width: "55vw",
            height: "55vh",
            background: "radial-gradient(circle, var(--lp-purple) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-drift-5 35s infinite linear",
            animationDelay: "-12s"
          }} 
        />
        {/* Layer 6 - Soft Orange */}
        <div 
          className="absolute rounded-full" 
          style={{
            top: "35%",
            left: "-5%",
            width: "45vw",
            height: "45vh",
            background: "radial-gradient(circle, var(--lp-orange) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-drift-6 52s infinite linear",
            animationDelay: "-15s"
          }} 
        />
        {/* Layer 7 - Pink/Magenta */}
        <div 
          className="absolute rounded-full" 
          style={{
            top: "-10%",
            right: "20%",
            width: "50vw",
            height: "50vh",
            background: "radial-gradient(circle, var(--lp-pink) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-drift-7 42s infinite linear",
            animationDelay: "-18s"
          }} 
        />
        {/* Layer 8 - Cyan/Blue */}
        <div 
          className="absolute rounded-full" 
          style={{
            bottom: "-10%",
            right: "25%",
            width: "55vw",
            height: "55vh",
            background: "radial-gradient(circle, var(--lp-cyan) 0%, transparent 80%)",
            animation: reducedMotion ? "none" : "aurora-drift-8 56s infinite linear",
            animationDelay: "-21s"
          }} 
        />
      </div>

      {/* Breathing Dot-Grid Pattern */}
      <div 
        className="absolute inset-0 lp-dot-grid" 
        style={{
          animation: reducedMotion ? "none" : "aurora-grid-pulse 10s infinite ease-in-out"
        }}
      />

      {/* Grain/Noise Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="auroraNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#auroraNoise)" />
      </svg>
    </div>
  );
}
