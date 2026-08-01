import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
import { useTheme } from "../../../App";

interface LandingNavbarProps {
  activeTab: "home" | "about" | "process" | "blog" | "contact";
  setActiveTab: (tab: "home" | "about" | "process" | "blog" | "contact") => void;
  onNavigate: (page: any) => void;
  user: any;
}

export function LandingNavbar({ activeTab, setActiveTab, onNavigate, user }: LandingNavbarProps) {
  const { isDark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNavId, setActiveNavId] = useState<"home" | "dashboard" | "kai">("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Auto highlight active tab based on scroll position
      const kaiElement = document.getElementById("kai-section");
      if (kaiElement) {
        const rect = kaiElement.getBoundingClientRect();
        // If the top of the kai-section is within the viewport or above it
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          setActiveNavId("kai");
        } else {
          setActiveNavId("home");
        }
      } else {
        setActiveNavId("home");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home" as const, label: "Home" },
    { id: "dashboard" as const, label: "Dashboard" },
    { id: "kai" as const, label: "Kai" },
  ];

  const handleNavClick = (itemId: "home" | "dashboard" | "kai") => {
    setActiveNavId(itemId);
    if (itemId === "home") {
      setActiveTab("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (itemId === "dashboard") {
      onNavigate("dashboard");
    } else if (itemId === "kai") {
      setActiveTab("home");
      setTimeout(() => {
        const el = document.getElementById("kai-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/10 shadow-lg shadow-black/5"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div
          className={`w-full max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 transition-all duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Logo & Tagline */}
          <div
            onClick={() => handleNavClick("home")}
            className="flex flex-col items-start cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                <img src="/logo.png" alt="Mentora Logo" className="w-4.5 h-4.5 object-contain brightness-0 invert" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Mentora
              </span>
            </div>
            <span className="text-[8px] font-semibold tracking-widest text-muted-foreground uppercase mt-1 leading-none animate-pulse" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Knowledge Beyond Boundaries
            </span>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1.5 bg-secondary/20 p-1 rounded-full border border-border/10 relative">
            {navItems.map((item) => {
              const isActive = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isActive ? "text-primary-foreground z-10" : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-all cursor-pointer active:scale-95"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(user ? "dashboard" : "login")}
              className="px-5 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-[#FF2B8A] to-[#F72585] hover:from-[#FF4CA0] hover:to-[#FF3E96] text-white flex items-center gap-1.5 shadow-lg shadow-pink-500/20 transition-all duration-300 hover:shadow-pink-500/30 cursor-pointer"
              style={{ fontFamily: "'Raleway', sans-serif" }}
            >
              Start Learning <ArrowRight size={13} />
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggle}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 p-4 mx-4 mt-2 border border-border/10 bg-background/95 backdrop-blur-md rounded-2xl md:hidden shadow-2xl flex flex-col gap-3"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleNavClick(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                  activeNavId === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/30"
                }`}
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-border/10 my-2 pt-2">
              <button
                onClick={() => {
                  onNavigate(user ? "dashboard" : "login");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#FF2B8A] to-[#F72585] hover:from-[#FF4CA0] hover:to-[#FF3E96] text-white flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/25 transition-all duration-300 cursor-pointer"
                style={{ fontFamily: "'Raleway', sans-serif" }}
              >
                Start Learning <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
