import { useState } from "react";
import { motion } from "motion/react";
import { Mail, ShieldCheck, MapPin, Send, HelpCircle, Linkedin, Twitter, Github } from "lucide-react";

export function LandingContact() {
  const [formState, setFormState] = useState({ name: "", email: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: "", email: "", company: "", message: "" });
    }, 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-6 lg:px-10 xl:px-16 pt-32 pb-24 text-foreground relative z-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-20">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
          <Mail size={12} /> Contact Us
        </span>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Let's talk <span className="text-primary">alignment</span>.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Have questions about security, deployment models, custom curriculum indices, or enterprise licensing? Drop us a note.
        </p>
      </motion.div>

      {/* Grid: Form on left, info on right */}
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Form Container */}
        <motion.div variants={itemVariants} className="lg:col-span-7 lp-glass-card p-8 border border-white/5 relative">
          <div className="absolute inset-0 bg-primary/2 rounded-3xl pointer-events-none" />
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Send a Message
          </h2>

          {submitted ? (
            <div className="py-12 text-center text-sm font-semibold text-emerald-400 flex flex-col items-center gap-3">
              <ShieldCheck size={40} className="text-emerald-400 animate-bounce" />
              Thank you! Your message has been sent successfully. We'll get back to you shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Disha Shree"
                    className="w-full bg-secondary/15 border border-border/10 focus:border-primary/50 focus:bg-secondary/20 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Company</label>
                  <input
                    type="text"
                    required
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    placeholder="Tata Steel"
                    className="w-full bg-secondary/15 border border-border/10 focus:border-primary/50 focus:bg-secondary/20 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="disha.shree@company.com"
                  className="w-full bg-secondary/15 border border-border/10 focus:border-primary/50 focus:bg-secondary/20 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="How can we help your operations team?"
                  className="w-full bg-secondary/15 border border-border/10 focus:border-primary/50 focus:bg-secondary/20 rounded-xl px-4 py-2.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/30 resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 cursor-pointer active:scale-95 transition-all"
              >
                Send Message <Send size={12} />
              </motion.button>
            </form>
          )}
        </motion.div>

        {/* Info Container */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
          {/* Details Card */}
          <div className="lp-glass-card p-6 border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-foreground">Contact Details</h3>
            <div className="space-y-4">
              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <Mail size={15} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">General Inquiry</h4>
                  <a href="mailto:hello@mentora.ai" className="text-xs font-semibold text-foreground hover:text-primary transition-colors">hello@mentora.ai</a>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Support & Security</h4>
                  <a href="mailto:support@mentora.ai" className="text-xs font-semibold text-foreground hover:text-cyan-400 transition-colors">support@mentora.ai</a>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-400/10 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                  <MapPin size={15} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Office Location</h4>
                  <span className="text-xs text-foreground">TATA Research Center, Jamshedpur, JH, India</span>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-2.5 pt-4 border-t border-border/5">
              {[
                { icon: <Linkedin size={15} />, href: "#" },
                { icon: <Twitter size={15} />, href: "#" },
                { icon: <Github size={15} />, href: "#" }
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-8 h-8 rounded-lg bg-secondary/10 border border-border/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/40 transition-all cursor-pointer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Interactive Map Placeholder */}
          <div className="lp-glass-card p-6 border border-white/5 text-center flex flex-col items-center justify-center" style={{ minHeight: 180 }}>
            <MapPin size={24} className="text-primary mb-3" />
            <h4 className="font-bold text-xs">Jamshedpur Campus Map</h4>
            <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">Click below to open coordinates in Google Maps</p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="mt-4 px-4 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-[10px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              Open Maps
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
