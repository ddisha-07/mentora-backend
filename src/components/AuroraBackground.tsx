export function AuroraBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none overflow-hidden" 
      style={{ 
        zIndex: -1, 
        backgroundColor: "var(--lp-bg)",
        transition: "background-color 0.5s ease"
      }}
    />
  );
}
