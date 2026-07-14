import { useState, useEffect, useRef, createContext, useContext } from "react";
import { supabase } from "./src/lib/supabaseClient";
import {
  LayoutDashboard, BookOpen, Award, Bell, Settings, User,
  X, ChevronRight, ChevronLeft, ChevronDown, Play, Download,
  FileText, Clock, Star, Users, BarChart3, Sparkles, Zap, Brain,
  Search, Check, CheckCircle, ArrowRight, ArrowLeft, HelpCircle,
  Timer, Trophy, Lock, Globe, Shield, Eye, EyeOff,
  GraduationCap, Share2, Megaphone, LogOut,
  Twitter, Linkedin, Github, Volume2, Maximize, Code, Database,
  Monitor, Bookmark, Building2,
  Edit2, Camera, Mail,
  SkipForward, SkipBack, Pause, Circle,
  Send, Bot, RefreshCw,
  Flame, Map, UserCheck, Sun, Moon
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip, RadialBarChart, RadialBar
} from "recharts";

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeCtx = createContext<{ isDark: boolean; toggle: () => void }>({ isDark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

// ─── App Context ──────────────────────────────────────────────────────────────
export type AppContextType = {
  user: any;
  profile: any;
  courses: any[];
  enrollments: any[];
  selectedCourseId: number | null;
  setSelectedCourseId: (id: number | null) => void;
  selectedLessonId: number | null;
  setSelectedLessonId: (id: number | null) => void;
  enrollInCourse: (courseId: number) => Promise<void>;
  updateLessonProgress: (courseId: number, lessonId: number, completed: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AppCtx = createContext<AppContextType | null>(null);
const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppCtx.Provider");
  return ctx;
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Page =
  | "landing" | "login" | "dashboard" | "courses" | "course-detail"
  | "lesson" | "ai-chat" | "quiz" | "quiz-results" | "certificates"
  | "profile" | "settings" | "announcements";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const COURSES = [
  {
    id: 1,
    title: "Advanced Machine Learning & Neural Networks",
    instructor: "Dr. Sarah Chen",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&auto=format",
    thumbnail: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=340&fit=crop&auto=format",
    category: "AI & ML",
    difficulty: "Advanced",
    duration: "42h 30m",
    lessons: 64,
    students: 4280,
    rating: 4.9,
    progress: 68,
    description:
      "Master the fundamentals of machine learning, deep learning, and neural network architectures used in production AI systems at scale.",
    tags: ["Python", "TensorFlow", "PyTorch", "Deep Learning"],
  },
  {
    id: 2,
    title: "Cybersecurity & Zero Trust Architecture",
    instructor: "Marcus Rivera",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format",
    thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=340&fit=crop&auto=format",
    category: "Security",
    difficulty: "Intermediate",
    duration: "28h 15m",
    lessons: 48,
    students: 3150,
    rating: 4.8,
    progress: 32,
    description:
      "Build enterprise security frameworks using zero-trust principles, threat modeling, and advanced penetration testing methodologies.",
    tags: ["Security", "Zero Trust", "Compliance", "Networking"],
  },
  {
    id: 3,
    title: "Executive Leadership & Strategic Thinking",
    instructor: "Amanda Foster",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=340&fit=crop&auto=format",
    category: "Leadership",
    difficulty: "Intermediate",
    duration: "18h 45m",
    lessons: 32,
    students: 5620,
    rating: 4.7,
    progress: 85,
    description:
      "Develop executive presence, strategic thinking frameworks, and high-performance team management skills for modern enterprise.",
    tags: ["Leadership", "Strategy", "Management", "Communication"],
  },
  {
    id: 4,
    title: "Data Analytics & Business Intelligence",
    instructor: "James Okafor",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&auto=format",
    category: "Data Science",
    difficulty: "Beginner",
    duration: "24h 20m",
    lessons: 40,
    students: 6890,
    rating: 4.8,
    progress: 0,
    description:
      "Transform raw data into actionable business insights using SQL, Python, Power BI, and advanced statistical analysis techniques.",
    tags: ["SQL", "Python", "Power BI", "Statistics"],
  },
  {
    id: 5,
    title: "Cloud Architecture & DevOps Engineering",
    instructor: "Priya Sharma",
    instructorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop&auto=format",
    category: "Cloud & DevOps",
    difficulty: "Advanced",
    duration: "36h 10m",
    lessons: 58,
    students: 2740,
    rating: 4.9,
    progress: 15,
    description:
      "Design scalable cloud infrastructure on AWS, Azure, and GCP with modern DevOps practices, Kubernetes, and CI/CD pipelines.",
    tags: ["AWS", "Kubernetes", "Terraform", "Docker"],
  },
  {
    id: 6,
    title: "Product Management & Agile Methodology",
    instructor: "Daniel Kim",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&auto=format",
    thumbnail: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=340&fit=crop&auto=format",
    category: "Product",
    difficulty: "Intermediate",
    duration: "22h 00m",
    lessons: 36,
    students: 4120,
    rating: 4.6,
    progress: 0,
    description:
      "Learn product discovery, roadmapping, stakeholder management, and agile frameworks used at top tech companies worldwide.",
    tags: ["Agile", "Scrum", "Roadmapping", "OKRs"],
  },
];

const MODULES = [
  {
    id: 1, title: "Introduction to Neural Networks",
    lessons: [
      { id: 1, title: "What is a Neural Network?", duration: "12:30", completed: true },
      { id: 2, title: "Perceptrons and Activation Functions", duration: "18:45", completed: true },
      { id: 3, title: "Forward Propagation Explained", duration: "22:10", completed: true },
    ],
  },
  {
    id: 2, title: "Deep Learning Fundamentals",
    lessons: [
      { id: 4, title: "Backpropagation Algorithm", duration: "28:00", completed: true },
      { id: 5, title: "Gradient Descent Variants", duration: "24:15", completed: false, current: true },
      { id: 6, title: "Regularization Techniques", duration: "20:30", completed: false },
    ],
  },
  {
    id: 3, title: "Convolutional Neural Networks",
    lessons: [
      { id: 7, title: "Convolution Operations", duration: "31:20", completed: false },
      { id: 8, title: "Pooling and Stride", duration: "15:45", completed: false },
      { id: 9, title: "CNN Architectures: ResNet, VGG", duration: "42:00", completed: false },
    ],
  },
  {
    id: 4, title: "Transformers & Attention Mechanisms",
    lessons: [
      { id: 10, title: "Attention Mechanism Explained", duration: "35:00", completed: false },
      { id: 11, title: "Transformer Architecture Deep Dive", duration: "48:30", completed: false },
      { id: 12, title: "Fine-tuning Pre-trained Models", duration: "38:15", completed: false },
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which activation function is commonly used in hidden layers of deep neural networks to solve the vanishing gradient problem?",
    options: ["Sigmoid", "Tanh", "ReLU", "Softmax"],
    correct: 2,
    explanation: "ReLU (Rectified Linear Unit) is preferred because it doesn't saturate for positive values, helping gradients flow during backpropagation.",
  },
  {
    id: 2,
    question: "What is the primary purpose of dropout regularization in neural networks?",
    options: [
      "Speed up training by reducing computations",
      "Prevent overfitting by randomly disabling neurons",
      "Increase model accuracy by adding parameters",
      "Improve gradient flow through the network",
    ],
    correct: 1,
    explanation: "Dropout randomly sets a fraction of inputs to zero during training, forcing the network to learn redundant representations and reducing overfitting.",
  },
  {
    id: 3,
    question: "Which optimizer is most commonly used for training large language models?",
    options: ["SGD", "RMSProp", "Adam / AdamW", "Adagrad"],
    correct: 2,
    explanation: "AdamW (Adam with weight decay) is widely used for LLMs due to adaptive learning rates and effective weight regularization.",
  },
  {
    id: 4,
    question: "In transformer architecture, what does 'multi-head attention' allow the model to do?",
    options: [
      "Process multiple batches simultaneously",
      "Attend to information from different representation subspaces",
      "Use multiple learning rates during training",
      "Stack multiple transformer layers in parallel",
    ],
    correct: 1,
    explanation: "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.",
  },
  {
    id: 5,
    question: "What is the main advantage of using batch normalization in deep networks?",
    options: [
      "Reduces the number of parameters",
      "Speeds up training and acts as regularization",
      "Eliminates the need for dropout layers",
      "Increases model interpretability",
    ],
    correct: 1,
    explanation: "Batch normalization normalizes inputs to each layer, allowing higher learning rates, reducing sensitivity to initialization, and providing regularization.",
  },
];

const LEARNING_DATA = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 2.0 },
  { day: "Fri", hours: 4.1 },
  { day: "Sat", hours: 1.2 },
  { day: "Sun", hours: 0.8 },
];

const MONTHLY_DATA = [
  { month: "Jan", hours: 18 },
  { month: "Feb", hours: 26 },
  { month: "Mar", hours: 22 },
  { month: "Apr", hours: 35 },
  { month: "May", hours: 28 },
  { month: "Jun", hours: 42 },
];

const CERTIFICATES = [
  { id: 1, title: "Machine Learning Fundamentals", course: "Advanced ML & Neural Networks", date: "March 15, 2024", instructor: "Dr. Sarah Chen", credentialId: "ML-2024-4821", score: 96 },
  { id: 2, title: "Leadership Excellence", course: "Executive Leadership & Strategic Thinking", date: "February 8, 2024", instructor: "Amanda Foster", credentialId: "LD-2024-3156", score: 92 },
  { id: 3, title: "Data Analytics Professional", course: "Data Analytics & Business Intelligence", date: "January 22, 2024", instructor: "James Okafor", credentialId: "DA-2024-7294", score: 88 },
];

const INITIAL_CHAT = [
  {
    role: "ai",
    content: "Hello! I'm **Mentora AI**, your intelligent learning assistant. I can help you understand complex concepts, answer questions about your courses, explain code, and create personalized study plans.\n\nWhat would you like to explore today?",
    timestamp: "Now",
  },
];

const AI_RESPONSES = [
  "Great question! **Backpropagation** is the algorithm used to train neural networks by computing gradients of the loss function with respect to each weight.\n\n```python\n# Forward pass\noutput = model(input)\nloss = criterion(output, target)\n\n# Backward pass\nloss.backward()  # Computes gradients\noptimizer.step() # Updates weights\n```\n\nThe gradient flows **backward** from the output layer to the input, telling each weight how much it contributed to the error using the chain rule of calculus.",
  "Based on your learning history, here's your personalized study plan for next week:\n\n**Monday & Tuesday** — Complete Module 2 (Lessons 5–6)\n**Wednesday** — Start Convolutional Neural Networks\n**Thursday** — Practice problems + Quiz prep\n**Friday** — Review & self-assessment\n\nAt your current pace, you'll complete the course in **3 weeks**. Want me to add calendar reminders?",
  "CNNs and RNNs serve different purposes:\n\n**CNN (Convolutional Neural Network)**\n• Best for: Images, spatial data\n• Key operation: Convolution + Pooling\n• Captures local spatial patterns\n\n**RNN (Recurrent Neural Network)**\n• Best for: Sequential data, time series, text\n• Key operation: Recurrent hidden state\n• Captures temporal dependencies\n\nIn modern NLP, **Transformers** have largely replaced RNNs due to better parallelization and long-range dependency modeling.",
  "Here's a focused quiz prep plan:\n\n**Key topics to review:**\n1. Activation functions (ReLU, Sigmoid, Softmax)\n2. Regularization (Dropout, BatchNorm, L1/L2)\n3. Optimizers (SGD, Adam, AdamW)\n4. Transformer architecture & attention\n5. CNN fundamentals\n\nSpend ~20 minutes per topic. Would you like me to generate practice questions for any of these areas?",
];

const SUGGESTED_PROMPTS = [
  "Explain backpropagation in simple terms",
  "Create a study plan for next week",
  "What's the difference between CNN and RNN?",
  "Help me prepare for the ML quiz",
];

const TESTIMONIALS = [
  {
    name: "Rachel Nguyen", role: "ML Engineer, Anthropic",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&auto=format",
    text: "Mentora transformed how our engineering team approaches continuous learning. The AI assistant is genuinely helpful, not just a chatbot.",
  },
  {
    name: "Carlos Mendoza", role: "VP Engineering, Stripe",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&auto=format",
    text: "The personalized learning paths and skill analytics gave us real visibility into our team's capabilities for the first time.",
  },
  {
    name: "Yuki Tanaka", role: "Head of L&D, Cloudflare",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&auto=format",
    text: "Course completion rates jumped 74% after switching to Mentora. The interface feels like software people actually want to use.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sg = (extra = "") => ({ style: { fontFamily: "'Raleway', sans-serif" }, className: extra });
const cr = (extra = "") => ({ style: { fontFamily: "'Dancing Script', cursive" }, className: extra });
const mono = (extra = "") => ({ style: { fontFamily: "'JetBrains Mono', monospace" }, className: extra });

const difficultyColor: Record<string, string> = {
  Beginner: "#10B981",
  Intermediate: "#F59E0B",
  Advanced: "#FF4444",
};

const getTooltipStyle = (isDark: boolean) => ({
  background: isDark ? "#0F0D26" : "#F0F5FF",
  border: `1px solid ${isDark ? "#221F4A" : "#C0D4F5"}`,
  borderRadius: 12,
  color: isDark ? "#fff" : "#0B1240",
  fontSize: 12,
});

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ─── Primitive Components ─────────────────────────────────────────────────────

function CyanButton({ children, onClick, className = "", outline = false, size = "md" }: {
  children: React.ReactNode; onClick?: () => void; className?: string; outline?: boolean; size?: "sm" | "md" | "lg";
}) {
  const pad = size === "sm" ? "px-4 py-1.5 text-sm" : size === "lg" ? "px-8 py-4 text-base" : "px-6 py-2.5 text-sm";
  if (outline) {
    return (
      <button onClick={onClick}
        className={`${pad} rounded-xl border border-primary text-primary font-medium transition-all hover:bg-primary/10 active:scale-95 ${className}`}
        style={{ fontFamily: "'Raleway', sans-serif" }}>
        {children}
      </button>
    );
  }
  return (
    <button onClick={onClick}
      className={`${pad} rounded-xl bg-primary text-white font-semibold transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_color-mix(in_srgb,var(--primary)_45%,transparent)] active:scale-95 ${className}`}
      style={{ fontFamily: "'Raleway', sans-serif" }}>
      {children}
    </button>
  );
}

function Badge({ children, color = "cyan" }: { children: React.ReactNode; color?: "cyan" | "green" | "yellow" | "red" | "purple" | "default" }) {
  const c = {
    cyan: "bg-primary/10 text-primary border-primary/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    purple: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    default: "bg-muted text-muted-foreground border-border",
  }[color];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${c}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {children}
    </span>
  );
}

function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 bg-muted rounded-full overflow-hidden ${className}`}>
      <div className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${clamp(value, 0, 100)}%`, boxShadow: "0 0 8px color-mix(in srgb, var(--primary) 50%, transparent)" }} />
    </div>
  );
}

function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick}
      className={`bg-card border border-border rounded-2xl ${onClick ? "cursor-pointer hover:border-border/70 hover:bg-muted/50 transition-all duration-200" : ""} ${className}`}>
      {children}
    </div>
  );
}

function Input({ placeholder, type = "text", value, onChange, icon, className = "" }: {
  placeholder?: string; type?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; icon?: React.ReactNode; className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        className={`w-full bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm outline-none focus:border-primary/50 transition-colors ${icon ? "pl-10 pr-4 py-2.5" : "px-4 py-2.5"}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      />
    </div>
  );
}

function StatCard({ label, value, delta, icon }: { label: string; value: string; delta?: string; icon: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        {delta && <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md font-mono">{delta}</span>}
      </div>
      <p {...mono("text-2xl text-foreground font-semibold")}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
    </Card>
  );
}

// ─── Neural Network SVG ───────────────────────────────────────────────────────
function NeuralNetSVG({ className = "" }: { className?: string }) {
  const { isDark } = useTheme();
  const nodeFill = isDark ? "#0F0D26" : "#F0F5FF";
  const layers = [
    [{ x: 80, y: 100 }, { x: 80, y: 200 }, { x: 80, y: 300 }, { x: 80, y: 400 }],
    [{ x: 220, y: 70 }, { x: 220, y: 170 }, { x: 220, y: 270 }, { x: 220, y: 370 }, { x: 220, y: 460 }],
    [{ x: 360, y: 120 }, { x: 360, y: 230 }, { x: 360, y: 340 }, { x: 360, y: 440 }],
    [{ x: 490, y: 170 }, { x: 490, y: 290 }, { x: 490, y: 410 }],
  ];
  const connections: [number, number, number, number][] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const from of layers[l]) {
      for (const to of layers[l + 1]) {
        connections.push([from.x, from.y, to.x, to.y]);
      }
    }
  }
  const allNodes = layers.flat();
  return (
    <svg viewBox="0 0 580 530" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4CC9F0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4CC9F0" stopOpacity="0.2" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {connections.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--primary)" strokeWidth="0.6" strokeOpacity="0.12" />
      ))}
      {allNodes.map((node, i) => (
        <g key={i} filter="url(#glow)">
          <circle cx={node.x} cy={node.y} r="16" fill={nodeFill} stroke="var(--primary)" strokeWidth="1" strokeOpacity="0.5" />
          <circle cx={node.x} cy={node.y} r="6" fill="url(#nodeGlow)" />
        </g>
      ))}
      <circle cx="290" cy="265" r="80" fill="none" stroke="var(--primary)" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="4 6" />
      <circle cx="290" cy="265" r="130" fill="none" stroke="var(--primary)" strokeWidth="0.5" strokeOpacity="0.05" strokeDasharray="4 10" />
    </svg>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
// Inline icon box for the hero headline (like the reference design)
function HeroIconBox({
  bg, border, iconColor, icon, rotate = 0,
}: {
  bg: string; border: string; iconColor: string; icon: React.ReactNode; rotate?: number;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl flex-shrink-0 align-middle"
      style={{
        background: bg,
        border: `1.5px solid ${border}`,
        width: "clamp(2.8rem, 6.5vw, 5.8rem)",
        height: "clamp(2.8rem, 6.5vw, 5.8rem)",
        color: iconColor,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        verticalAlign: "middle",
        display: "inline-flex",
      }}
    >
      <span style={{ transform: rotate ? `rotate(${-rotate}deg)` : undefined, display: "flex" }}>
        {icon}
      </span>
    </span>
  );
}

function LandingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { isDark, toggle } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: <Brain size={22} />, title: "AI Learning Assistant", desc: "Context-aware AI that answers questions, explains concepts, and creates personalized study plans in real time." },
    { icon: <Map size={22} />, title: "Personalized Learning Paths", desc: "Adaptive curricula built around your role, skills, and goals — evolving as you progress through the platform." },
    { icon: <HelpCircle size={22} />, title: "Interactive Quizzes", desc: "Timed assessments with instant feedback, detailed explanations, and spaced repetition scheduling." },
    { icon: <BarChart3 size={22} />, title: "Skill Analytics", desc: "Granular skill-gap analysis and progress heatmaps that surface exactly where to focus next." },
    { icon: <Database size={22} />, title: "Knowledge Repository", desc: "A searchable internal knowledge base powered by AI — find answers from your organization's documentation instantly." },
    { icon: <Award size={22} />, title: "Verified Certificates", desc: "Blockchain-backed credentials shareable on LinkedIn, automatically tied to your professional profile." },
  ];

  const companies = ["Stripe", "Cloudflare", "Anthropic", "Figma", "Vercel", "Linear", "Notion", "Raycast"];

  const faqs = [
    { q: "How does the AI assistant work?", a: "Mentora AI is trained on your organization's content, industry knowledge, and your specific courses. It understands context from your learning history and provides relevant, accurate answers — not generic web results." },
    { q: "Can Mentora integrate with our existing tools?", a: "Yes. Mentora connects with Slack, Microsoft Teams, HRIS systems, SSO providers (Okta, Azure AD), and your existing LMS content via SCORM and xAPI standards." },
    { q: "How are certificates verified?", a: "Each certificate is cryptographically signed and stored on a distributed ledger. Verifiers can check authenticity via a public URL without creating an account." },
    { q: "What does enterprise pricing look like?", a: "Mentora is priced per seat with volume discounts. Custom contracts include dedicated onboarding, SLA guarantees, and private cloud deployment options. Contact us for a quote." },
    { q: "Is our data private and secure?", a: "Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II certified and GDPR compliant. AI models never train on your proprietary data." },
  ];

  const iconSize = "clamp(1.4rem, 3.2vw, 2.8rem)";

  return (
    <div className="bg-background text-foreground min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span {...sg("text-lg font-bold tracking-tight")}>Mentora</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {["Blog", "About", "Process", "Contact"].map((item) => (
              <a key={item} href="#" className="hover:text-foreground transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle}
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => onNavigate("login")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 hidden sm:block">
              Login
            </button>
            <CyanButton onClick={() => onNavigate("login")} size="sm">Get started</CyanButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col pt-20 pb-0 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center px-6 lg:px-10 xl:px-16 pt-8">
          {/* Eyebrow pill */}
          <div className="mb-8 lg:mb-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs" {...mono()}>
              <Sparkles size={11} /> AI-Powered · Enterprise Learning Platform
            </span>
          </div>

          {/* Giant headline — Raleway 900 bold + Dancing Script cursive interleaved */}
          <h1 style={{ lineHeight: 1.08 }}>
            {/* Line 1: bold "Build" + vivid icon boxes + cursive "your" */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-3">
              <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "clamp(3.2rem, 8.5vw, 7.5rem)", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Build
              </span>
              <HeroIconBox bg="var(--primary)" border="var(--primary)" iconColor="#ffffff"
                icon={<Brain style={{ width: iconSize, height: iconSize }} />} />
              <HeroIconBox bg={isDark ? "#1a1740" : "#E6EEFF"} border="var(--border)" iconColor="var(--muted-foreground)"
                icon={<Zap style={{ width: iconSize, height: iconSize }} />} rotate={-8} />
              <HeroIconBox bg="#4CC9F0" border="#4CC9F0" iconColor="#06060F"
                icon={<GraduationCap style={{ width: iconSize, height: iconSize }} />} />
              <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 700, color: "var(--muted-foreground)" }}>
                your
              </span>
            </div>
            {/* Line 2: bold "skills" + warm icon box + cursive glowing "online." */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "clamp(3.2rem, 8.5vw, 7.5rem)", fontWeight: 900, letterSpacing: "-0.03em" }}>
                skills
              </span>
              <HeroIconBox bg="#F8961E" border="#F8961E" iconColor="#FFFFFF"
                icon={<Award style={{ width: iconSize, height: iconSize }} />} />
              <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 700, color: "var(--primary)", textShadow: "0 0 50px rgba(224,24,110,0.4)" }}>
                online.
              </span>
            </div>
          </h1>

          {/* Subtitle + CTA row */}
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-md">
              Learn and improve your skills with interactive courses and AI-powered skill tests — built specifically for future professionals.
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <CyanButton onClick={() => onNavigate("login")} size="lg">
                Start Learning
              </CyanButton>
              <CyanButton onClick={() => onNavigate("courses")} size="lg" outline>
                Explore Courses
              </CyanButton>
            </div>
          </div>
        </div>

        {/* ── Course preview cards floating at the bottom ── */}
        <div className="mt-14 px-6 lg:px-10 xl:px-16 pb-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            {/* Card 1 — workshop card */}
            <div
              className="rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              style={{ background: isDark ? "#100E25" : "#EDF0FF", border: `1.5px solid ${isDark ? "#221F4A" : "#C0D4F5"}`, minHeight: 180 }}
              onClick={() => onNavigate("login")}
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge color="default">Workshop</Badge>
                  <Badge color="red">Advanced</Badge>
                </div>
                <p {...sg("text-base font-bold leading-snug")}>Advanced ML &amp; Neural Networks</p>
              </div>
              <div className="mt-4">
                <p {...mono("text-2xl font-semibold text-primary")}>4,280</p>
                <p className="text-xs text-muted-foreground">enrolled learners</p>
              </div>
            </div>

            {/* Card 2 — featured instructor card */}
            <div
              className="rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              style={{ background: isDark ? "#150E30" : "#F2EEFF", border: `1.5px solid ${isDark ? "#3D1A7A" : "#C9B8F5"}`, minHeight: 180 }}
              onClick={() => onNavigate("login")}
            >
              <div className="flex -space-x-3 mb-4">
                {[TESTIMONIALS[0].avatar, TESTIMONIALS[1].avatar, TESTIMONIALS[2].avatar].map((src, i) => (
                  <img key={i} src={src} alt="" className="w-10 h-10 rounded-full object-cover border-2 bg-muted" style={{ borderColor: isDark ? "#150E30" : "#F0ECFF" }} />
                ))}
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium" style={{ border: `2px solid ${isDark ? "#150E30" : "#F0ECFF"}` }}>+40</div>
              </div>
              <div>
                <Badge color="purple">Course</Badge>
                <p {...sg("text-base font-bold leading-snug mt-2")}>Data Analytics from scratch</p>
                <p className="text-xs text-muted-foreground mt-1">Beginner · 6–8 months</p>
              </div>
            </div>

            {/* Card 3 — teal accent card */}
            <div
              className="rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              style={{ background: isDark ? "#0d1f1f" : "#E9F8FF", border: isDark ? "1.5px solid #F7258522" : "1.5px solid #BAE6FF", minHeight: 180 }}
              onClick={() => onNavigate("login")}
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge color="cyan">Live</Badge>
                  <Badge color="green">Beginner</Badge>
                </div>
                <p {...sg("text-base font-bold leading-snug")}>AI &amp; Leadership Summit</p>
                <p className="text-xs text-muted-foreground mt-2">July 28 · Virtual</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Registration open</span>
              </div>
            </div>

            {/* Card 4 — amber stat card */}
            <div
              className="rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              style={{ background: isDark ? "#1e1700" : "#FFF8EC", border: isDark ? "1.5px solid #F59E0B30" : "1.5px solid #FFD59B", minHeight: 180 }}
              onClick={() => onNavigate("login")}
            >
              <div>
                <Badge color="yellow">Skill Track</Badge>
                <p {...sg("text-base font-bold leading-snug mt-3")}>Competitive Advantage</p>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-1.5">
                  {["Python", "Finance", "Strategy", "Design", "Ops"].map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] text-[10px]" {...mono()}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <section className="py-12 border-y border-border mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest" {...mono()}>
            Trusted by world-class teams
          </p>
          <div className="flex items-center gap-10 flex-wrap justify-center">
            {companies.map((c) => (
              <span key={c} {...sg("text-muted-foreground text-sm font-semibold hover:text-foreground/60 transition-colors cursor-default select-none")}>
                {c}
              </span>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-8 text-center">
            {[["4,200+", "Courses"], ["98%", "Completion"], ["340+", "Enterprises"]].map(([v, l]) => (
              <div key={l}>
                <p {...mono("text-xl font-semibold text-foreground")}>{v}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p {...cr("text-primary text-2xl mb-2")}>Platform Capabilities</p>
            <h2 {...sg("text-4xl lg:text-5xl font-bold mb-4")}>Everything your team <span style={{ fontFamily: "'Dancing Script', cursive", color: "#4CC9F0" }}>needs</span> to grow</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              One platform for structured learning, informal knowledge sharing, assessments, and skill development.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <Card key={i} className="p-6 group hover:border-primary/30 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/15 transition-colors">
                  {f.icon}
                </div>
                <h3 {...sg("text-base font-semibold mb-2")}>{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Preview */}
      <section className="py-28 px-6 lg:px-10 bg-surface">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p {...cr("text-primary text-2xl mb-2")}>AI Assistant</p>
            <h2 {...sg("text-4xl lg:text-5xl font-bold mb-6")}>Your <span style={{ fontFamily: "'Dancing Script', cursive", color: "#4CC9F0", fontWeight: 700 }}>always-on</span><br />learning companion</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Ask questions about your courses, get instant explanations of complex concepts, receive personalized study plans, or discuss ideas — all within the context of your organization's knowledge.
            </p>
            <ul className="space-y-3">
              {["Context-aware responses using your course content", "Code explanations with syntax highlighting", "Personalized quiz generation on demand", "Multi-turn conversations with memory"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle size={16} className="text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <CyanButton onClick={() => onNavigate("login")} className="mt-8">Try AI Assistant</CyanButton>
          </div>
          <div>
            <Card className="p-1 overflow-hidden">
              <div className="bg-secondary rounded-xl p-4 h-80 flex flex-col">
                <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"><Bot size={14} className="text-primary" /></div>
                  <span className="text-sm font-medium">Mentora AI</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 space-y-3 overflow-hidden">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-[10px] text-muted-foreground">Y</div>
                    <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 text-sm text-muted-foreground max-w-xs">
                      What's the difference between supervised and unsupervised learning?
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-primary/10 border border-primary/20 rounded-xl rounded-tr-sm px-3 py-2 text-sm text-foreground max-w-xs">
                      <span className="font-semibold text-primary">Supervised learning</span> uses labeled data to train models, while <span className="font-semibold text-primary">unsupervised learning</span> finds hidden patterns in unlabeled data...
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center"><Bot size={12} className="text-primary" /></div>
                  </div>
                  <div className="flex items-center gap-1 pl-8">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Preview */}
      <section className="py-28 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p {...cr("text-primary text-2xl mb-1")}>Course Library</p>
              <h2 {...sg("text-4xl lg:text-5xl font-bold")}>Learn from <span style={{ fontFamily: "'Dancing Script', cursive", color: "#F8961E" }}>the best</span></h2>
            </div>
            <CyanButton onClick={() => onNavigate("login")} outline>View all courses</CyanButton>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COURSES.slice(0, 3).map((course) => (
              <Card key={course.id} className="overflow-hidden group cursor-pointer" onClick={() => onNavigate("login")}>
                <div className="h-44 overflow-hidden bg-surface">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge color="default">{course.category}</Badge>
                    <Badge color={course.difficulty === "Advanced" ? "red" : course.difficulty === "Intermediate" ? "yellow" : "green"}>{course.difficulty}</Badge>
                  </div>
                  <h3 {...sg("text-sm font-semibold mb-2 leading-snug group-hover:text-primary transition-colors")}>{course.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{course.instructor}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={12} />{course.duration}</span>
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" />{course.rating}</span>
                    <span className="flex items-center gap-1"><Users size={12} />{course.students.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 px-6 lg:px-10 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p {...cr("text-primary text-2xl mb-1")}>Testimonials</p>
            <h2 {...sg("text-4xl lg:text-5xl font-bold")}>Loved by <span style={{ fontFamily: "'Dancing Script', cursive", color: "#4CC9F0" }}>learning leaders</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover bg-muted" />
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p {...cr("text-primary text-2xl mb-1")}>FAQ</p>
            <h2 {...sg("text-4xl lg:text-5xl font-bold")}>Common <span style={{ fontFamily: "'Dancing Script', cursive", color: "#A855F7" }}>questions</span></h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span {...sg("text-sm font-medium")}>{faq.q}</span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 lg:px-10">
        <div className="max-w-4xl mx-auto text-center border border-border rounded-3xl p-16 bg-gradient-to-b from-secondary to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/3 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <NeuralNetSVG className="w-full" />
          </div>
          <div className="relative z-10">
            <Sparkles className="text-primary mx-auto mb-6" size={32} />
            <h2 {...sg("text-4xl lg:text-5xl font-bold mb-4")}>Ready to build a <span style={{ fontFamily: "'Dancing Script', cursive", color: "var(--primary)" }}>smarter</span> team?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
              Join 340+ enterprises already using Mentora to develop talent at scale.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <CyanButton onClick={() => onNavigate("login")} size="lg">Get started for free</CyanButton>
              <CyanButton onClick={() => onNavigate("login")} size="lg" outline>Book a demo</CyanButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span {...sg("font-bold tracking-tight")}>Mentora</span>
              <span className="text-muted-foreground text-xs ml-2">© 2024 Mentora Inc.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {["Privacy", "Terms", "Security", "Status"].map((l) => (
                <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { isDark, toggle } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setAuthLoading(true);
    setErrorMsg("");
    try {
      // 1. Try to log in
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        // 2. If login fails, check if the error is "Invalid login credentials". 
        // If so, fall back to registering them as a new user (frictionless testing/onboarding!)
        if (signInErr.message.includes("Invalid login credentials") || signInErr.message.includes("does not exist")) {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: email.split("@")[0],
                username: email.split("@")[0]
              }
            }
          });
          if (signUpErr) throw signUpErr;
          
          if (!signUpData.session) {
            setErrorMsg("Account created! A confirmation link has been sent to your email.");
            setAuthLoading(false);
            return;
          }
        } else {
          throw signInErr;
        }
      }
      onNavigate("dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary border-r border-border flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span {...sg("text-2xl font-bold")}>Mentora</span>
          </div>
          <NeuralNetSVG className="w-80 mb-10 opacity-70" />
          <h2 style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 900, fontSize: "2rem", marginBottom: "1rem", lineHeight: 1.15 }}>
            Learn <span style={{ fontFamily: "'Dancing Script', cursive", color: "#4CC9F0", fontWeight: 700 }}>smarter,</span><br />
            <span style={{ fontFamily: "'Dancing Script', cursive", color: "var(--primary)", fontWeight: 700, fontSize: "2.2rem" }}>grow faster.</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            AI-powered enterprise learning that adapts to you. Join 50,000+ professionals already on Mentora.
          </p>
          <div className="flex items-center justify-center gap-6 mt-10 text-muted-foreground text-xs">
            {[["SOC 2", Shield], ["GDPR", Globe], ["SSO", Lock]].map(([label, Icon]: any) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon size={13} />{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <button onClick={toggle}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span {...sg("text-lg font-semibold")}>Mentora</span>
          </div>
          <h2 style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 900, fontSize: "2rem", marginBottom: "0.5rem" }}>
            Welcome <span style={{ fontFamily: "'Dancing Script', cursive", color: "var(--primary)", fontWeight: 700 }}>back</span>
          </h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to continue your learning journey.</p>

          {errorMsg && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Work email</label>
              <Input
                type="email" placeholder="you@company.com" value={email}
                onChange={(e) => setEmail(e.target.value)} icon={<Mail size={15} />}
                disabled={authLoading}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"} placeholder="••••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} icon={<Lock size={15} />}
                  disabled={authLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={authLoading}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <button type="button" onClick={() => setRemember(!remember)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${remember ? "bg-primary border-primary" : "border-border"}`}
                  disabled={authLoading}>
                  {remember && <Check size={10} className="text-white" />}
                </button>
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
            </div>
            <CyanButton className="w-full py-3 mt-2 text-center" disabled={authLoading}>
              {authLoading ? "Authenticating..." : "Sign in"}
            </CyanButton>
          </form>

          <div className="relative my-6">
            <div className="border-t border-border" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">or</span>
          </div>

          <button className="w-full py-2.5 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-3 hover:border-border transition-all"
            onClick={() => onNavigate("dashboard")} disabled={authLoading}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">Create account</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activePage, onNavigate, collapsed, onToggle }: {
  activePage: Page; onNavigate: (p: Page) => void; collapsed: boolean; onToggle: () => void;
}) {
  const { user, profile, enrollments, signOut } = useApp();
  const navItems = [
    { page: "dashboard" as Page, icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { page: "courses" as Page, icon: <BookOpen size={18} />, label: "My Learning" },
    { page: "courses" as Page, icon: <GraduationCap size={18} />, label: "Courses", alt: true },
    { page: "certificates" as Page, icon: <Award size={18} />, label: "Certificates" },
    { page: "ai-chat" as Page, icon: <Bot size={18} />, label: "AI Assistant", accent: true },
    { page: "announcements" as Page, icon: <Megaphone size={18} />, label: "Announcements" },
  ];
  const bottomItems = [
    { page: "profile" as Page, icon: <User size={18} />, label: "Profile" },
    { page: "settings" as Page, icon: <Settings size={18} />, label: "Settings" },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = activePage === item.page && !item.alt;
    return (
      <button onClick={() => onNavigate(item.page)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "bg-primary/10 text-primary" : item.accent ? "text-primary/70 hover:text-primary hover:bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
        <span className="flex-shrink-0">{item.icon}</span>
        {!collapsed && <span style={{ fontFamily: "'Raleway', sans-serif" }} className="font-medium">{item.label}</span>}
        {!collapsed && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
      </button>
    );
  };

  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrollments.length)
    : 0;

  return (
    <aside className={`flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-border px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <span {...sg("font-semibold text-base")}>Mentora</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
        )}
        <button onClick={onToggle} className={`text-muted-foreground hover:text-foreground transition-colors ${collapsed ? "hidden" : ""}`}>
          <ChevronLeft size={16} />
        </button>
      </div>

      {collapsed && (
        <button onClick={onToggle} className="flex justify-center py-2 text-muted-foreground hover:text-foreground border-b border-border">
          <ChevronRight size={16} />
        </button>
      )}

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item, i) => <NavItem key={i} item={item} />)}
      </nav>

      <div className="p-3 space-y-0.5 border-t border-border">
        {bottomItems.map((item, i) => <NavItem key={i} item={item} />)}
        <button onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-all">
          <LogOut size={18} />
          {!collapsed && <span style={{ fontFamily: "'Raleway', sans-serif" }} className="font-medium">Sign Out</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="p-3 pb-4">
          <div className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <img src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&auto=format"} alt="User" className="w-7 h-7 rounded-full object-cover bg-muted" />
              <div>
                <p className="text-xs font-medium leading-none truncate max-w-[120px]">{profile?.full_name || user?.email?.split('@')[0] || "Student"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{profile?.role || "student"}</p>
              </div>
            </div>
            <ProgressBar value={avgProgress} className="mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1">{avgProgress}% avg. progress</p>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── Top Nav ──────────────────────────────────────────────────────────────────
function TopNav({ title, onNavigate }: { title: string; onNavigate: (p: Page) => void }) {
  const { isDark, toggle } = useTheme();
  const { profile } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm flex-shrink-0">
      <h1 {...sg("text-lg font-semibold")}>{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search courses, topics…" className="bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground w-64 outline-none focus:border-primary/50 transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }} />
        </div>
        <button onClick={toggle}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span {...sg("text-sm font-semibold")}>Notifications</span>
                <span className="text-xs text-primary">Mark all read</span>
              </div>
              {[
                { icon: <CheckCircle size={14} className="text-emerald-400" />, text: "Module 1 completed — Great job!", time: "2m ago" },
                { icon: <Sparkles size={14} className="text-primary" />, text: "New course: Prompt Engineering 101", time: "1h ago" },
                { icon: <Trophy size={14} className="text-amber-400" />, text: "Certificate earned: Leadership Excellence", time: "3h ago" },
                { icon: <Megaphone size={14} className="text-violet-400" />, text: "Team update from L&D: Q3 Learning Goals", time: "Yesterday" },
              ].map((n, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/60 transition-colors cursor-pointer border-b border-border/50">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">{n.icon}</div>
                  <div>
                    <p className="text-xs text-foreground">{n.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => onNavigate("profile")} className="w-9 h-9 rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all">
          <img src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=36&h=36&fit=crop&auto=format"} alt="Profile" className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { isDark } = useTheme();
  const { profile, courses, enrollments, setSelectedCourseId } = useApp();

  // Find courses that are currently in progress for this user
  const inProgress = enrollments
    .filter((e) => (e.progress || 0) > 0 && (e.progress || 0) < 100)
    .map((e) => {
      const c = courses.find((course) => Number(course.id) === Number(e.course_id));
      if (!c) return null;
      return { ...c, progress: e.progress };
    })
    .filter(Boolean) as any[];

  const completedCount = enrollments.filter((e) => e.progress === 100).length;

  const handleContinue = (courseId: number) => {
    setSelectedCourseId(courseId);
    onNavigate("lesson");
  };

  const handleContinueLatest = () => {
    if (inProgress.length > 0) {
      handleContinue(inProgress[0].id);
    } else if (enrollments.length > 0) {
      handleContinue(enrollments[0].course_id);
    } else {
      onNavigate("courses");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-card via-muted to-card border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 pointer-events-none">
          <NeuralNetSVG className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <p className="text-muted-foreground text-sm mb-1">Good morning,</p>
          <h2 {...sg("text-2xl font-bold mb-2")}>{profile?.full_name || "Student"} 👋</h2>
          <p className="text-muted-foreground text-sm mb-4">You're on a 12-day learning streak. Keep it up!</p>
          <div className="flex items-center gap-4">
            <CyanButton size="sm" onClick={handleContinueLatest}>Continue Learning</CyanButton>
            <CyanButton size="sm" outline onClick={() => onNavigate("courses")}>Browse Courses</CyanButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Courses enrolled" value={enrollments.length.toString()} delta="+1 this month" icon={<BookOpen size={18} />} />
        <StatCard label="Hours learned" value="148h" delta="+16.5h" icon={<Clock size={18} />} />
        <StatCard label="Certificates" value={completedCount.toString()} delta="+1 new" icon={<Award size={18} />} />
        <StatCard label="Skill points" value="2,840" delta="+340" icon={<Zap size={18} />} />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <h3 {...sg("text-base font-semibold")}>Continue Learning</h3>
          {inProgress.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground text-sm">
              <BookOpen size={30} className="mx-auto mb-2 text-border" />
              No courses in progress. <button onClick={() => onNavigate("courses")} className="text-primary hover:underline">Enroll in a course</button> to start learning!
            </Card>
          ) : (
            inProgress.map((course) => (
              <Card key={course.id} className="p-4 flex gap-4 items-center cursor-pointer" onClick={() => handleContinue(course.id)}>
                <img src={course.thumbnail} alt={course.title} className="w-20 h-14 rounded-xl object-cover flex-shrink-0 bg-muted" />
                <div className="flex-1 min-w-0">
                  <p {...sg("text-sm font-medium truncate")}>{course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
                  <div className="mt-2">
                    <ProgressBar value={course.progress} />
                    <p {...mono("text-[10px] text-muted-foreground mt-1")}>{course.progress}% complete</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              </Card>
            ))
          )}

          {/* Learning Chart */}
          <Card className="p-5 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 {...sg("text-sm font-semibold")}>Weekly Activity</h3>
              <span {...mono("text-xs text-muted-foreground")}>This week</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={LEARNING_DATA}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip contentStyle={getTooltipStyle(isDark)}
                  formatter={(v: number) => [`${v}h`, "Hours"]} />
                <Area type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={2} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Weekly goal */}
          <Card className="p-5">
            <h3 {...sg("text-sm font-semibold mb-4")}>Weekly Goal</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="8"
                    strokeDasharray={`${251.2 * 0.68} 251.2`}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 6px rgba(247,37,133,0.45))" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p {...mono("text-2xl font-semibold text-foreground")}>68%</p>
                  <p className="text-[10px] text-muted-foreground">of goal</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[["Target", "20h / week"], ["Completed", "13.6h"], ["Remaining", "6.4h"]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span {...mono("text-foreground")}>{v}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Assistant */}
          <Card className="p-5 border-primary/20 bg-gradient-to-br from-card to-muted">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot size={16} className="text-primary" />
              </div>
              <div>
                <p {...sg("text-sm font-semibold")}>Mentora AI</p>
                <p className="text-[10px] text-emerald-400">Online</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Ask me anything about your courses or learning path.</p>
            <CyanButton size="sm" className="w-full text-center" onClick={() => onNavigate("ai-chat")}>
              Start Conversation
            </CyanButton>
          </Card>

          {/* Recent Activity */}
          <Card className="p-5">
            <h3 {...sg("text-sm font-semibold mb-3")}>Recent Activity</h3>
            <div className="space-y-3">
              {[
                { icon: <Play size={12} />, text: "Watched: Gradient Descent Variants", time: "2h ago", color: "#F72585" },
                { icon: <CheckCircle size={12} />, text: "Completed: Backpropagation Algorithm", time: "Yesterday", color: "#10B981" },
                { icon: <Trophy size={12} />, text: "Quiz passed: ML Basics (96%)", time: "2 days ago", color: "#F59E0B" },
                { icon: <Award size={12} />, text: "Certificate: ML Fundamentals", time: "5 days ago", color: "#7C3AED" },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: a.color + "15", color: a.color }}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{a.text}</p>
                    <p className="text-[10px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recommended */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 {...sg("text-base font-semibold")}>Recommended for you</h3>
          <button onClick={() => onNavigate("courses")} className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter((c) => !enrollments.some((e) => Number(e.course_id) === Number(c.id)))
            .slice(0, 3)
            .map((course) => (
              <Card key={course.id} className="overflow-hidden cursor-pointer group" onClick={() => { setSelectedCourseId(course.id); onNavigate("course-detail"); }}>
                <div className="h-32 overflow-hidden bg-surface">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge color="default">{course.category}</Badge>
                    <Badge color={course.difficulty === "Advanced" ? "red" : course.difficulty === "Intermediate" ? "yellow" : "green"}>{course.difficulty}</Badge>
                  </div>
                  <p {...sg("text-sm font-medium leading-snug mb-2 group-hover:text-primary transition-colors")}>{course.title}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={11} />{course.duration}</span>
                    <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" />{course.rating}</span>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Course Catalog ───────────────────────────────────────────────────────────
function CourseCatalogPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState("All");
  const { courses, enrollments, setSelectedCourseId } = useApp();

  const categories = ["All", "AI & ML", "Security", "Leadership", "Data Science", "Cloud & DevOps", "Product"];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = courses.map(c => {
    const e = enrollments.find(env => Number(env.course_id) === Number(c.id));
    return { ...c, progress: e ? e.progress : 0 };
  }).filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchDiff = activeDifficulty === "All" || c.difficulty === activeDifficulty;
    return matchSearch && matchCat && matchDiff;
  });

  const handleCourseClick = (courseId: number) => {
    setSelectedCourseId(courseId);
    onNavigate("course-detail");
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h2 {...sg("text-2xl font-bold mb-1")}>Course Library</h2>
        <p className="text-muted-foreground text-sm">{courses.length} courses across {categories.length - 1} disciplines</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input placeholder="Search courses, instructors…" value={search}
          onChange={(e) => setSearch(e.target.value)} icon={<Search size={15} />} className="w-72" />
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === c ? "bg-primary/10 text-primary border border-primary/20" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
              style={{ fontFamily: "'Raleway', sans-serif" }}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {difficulties.map((d) => (
            <button key={d} onClick={() => setActiveDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeDifficulty === d ? "bg-primary/10 text-primary border border-primary/20" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
              style={{ fontFamily: "'Raleway', sans-serif" }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search size={40} className="text-border mx-auto mb-4" />
          <p {...sg("text-lg font-semibold mb-2")}>No courses found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Card key={course.id} className="overflow-hidden group cursor-pointer" onClick={() => handleCourseClick(course.id)}>
              <div className="h-44 overflow-hidden bg-surface relative">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                {course.progress > 0 && (
                  <div className="absolute bottom-3 left-3 right-3">
                     <ProgressBar value={course.progress} />
                     <p {...mono("text-[10px] text-white/80 mt-1")}>{course.progress}% complete</p>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge color="default">{course.category}</Badge>
                  <Badge color={course.difficulty === "Advanced" ? "red" : course.difficulty === "Intermediate" ? "yellow" : "green"}>
                    {course.difficulty}
                  </Badge>
                </div>
                <h3 {...sg("text-sm font-semibold leading-snug mb-3 group-hover:text-primary transition-colors")}>
                  {course.title}
                </h3>
                <div className="flex items-center gap-2 mb-5">
                  <img src={course.instructorAvatar} alt={course.instructor} className="w-5 h-5 rounded-full object-cover bg-muted" />
                  <span className="text-xs text-muted-foreground">{course.instructor}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-5">
                  <span className="flex items-center gap-1"><Clock size={12} />{course.duration}</span>
                  <span className="flex items-center gap-1"><BookOpen size={12} />{course.lessons} lessons</span>
                  <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" />{course.rating}</span>
                </div>
                <CyanButton className="w-full text-center" size="sm" onClick={(e) => { e.stopPropagation(); handleCourseClick(course.id); }}>
                  {course.progress > 0 ? "Continue Learning" : "Start Learning"}
                </CyanButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Course Detail ────────────────────────────────────────────────────────────
function CourseDetailPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { courses, enrollments, selectedCourseId, enrollInCourse } = useApp();
  const [openModule, setOpenModule] = useState<number | null>(1);

  const course = courses.find((c) => Number(c.id) === Number(selectedCourseId)) || courses[0];
  const enrollment = enrollments.find((e) => Number(e.course_id) === Number(course.id));
  const isEnrolled = !!enrollment;
  const progress = enrollment ? enrollment.progress : 0;

  // Use dynamic modules from database if they exist, otherwise fallback to mock MODULES
  const modules = course.modules && course.modules.length > 0 ? course.modules : MODULES;

  const handleEnrollOrContinue = async () => {
    if (isEnrolled) {
      onNavigate("lesson");
    } else {
      await enrollInCourse(course.id);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Banner */}
      <div className="relative h-56 overflow-hidden">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge color="cyan">{course.category}</Badge>
            <Badge color="red">{course.difficulty}</Badge>
          </div>
          <h2 {...sg("text-2xl font-bold")}>{course.title}</h2>
        </div>
        <button onClick={() => onNavigate("courses")}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/80 backdrop-blur-sm border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="p-6 grid lg:grid-cols-3 gap-6">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructor */}
          <Card className="p-4 flex items-center gap-4">
            <img src={course.instructorAvatar} alt={course.instructor} className="w-12 h-12 rounded-full object-cover bg-muted" />
            <div>
              <p {...sg("text-sm font-semibold")}>{course.instructor}</p>
              <p className="text-xs text-muted-foreground">Lead Instructor, AI Research Division</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" />{course.rating}</span>
              <span className="flex items-center gap-1"><Users size={12} />{course.students.toLocaleString()} enrolled</span>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-5">
            <h3 {...sg("text-sm font-semibold mb-3")}>About this course</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { label: "Prerequisites", value: "Python, Linear Algebra basics" },
                { label: "Certificate", value: "Verified on completion" },
                { label: "Access", value: "Unlimited, self-paced" },
                { label: "Language", value: "English + subtitles" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="text-xs text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Learning Objectives */}
          <Card className="p-5">
            <h3 {...sg("text-sm font-semibold mb-3")}>What you'll learn</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Design and train deep neural networks from scratch",
                "Implement CNNs for computer vision tasks",
                "Build transformer models for NLP applications",
                "Deploy ML models to production environments",
                "Apply regularization and optimization techniques",
                "Evaluate model performance rigorously",
              ].map((obj) => (
                <div key={obj} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle size={13} className="text-primary mt-0.5 flex-shrink-0" />
                  {obj}
                </div>
              ))}
            </div>
          </Card>

          {/* Modules */}
          <div>
            <h3 {...sg("text-sm font-semibold mb-3")}>Course Content</h3>
            <div className="space-y-2">
              {modules.map((mod: any) => (
                <div key={mod.id} className="border border-border rounded-xl overflow-hidden">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted transition-colors"
                    onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}>
                    <div className="flex items-center gap-3">
                      <span {...mono("text-xs text-muted-foreground")}>M{mod.id}</span>
                      <span {...sg("text-sm font-medium")}>{mod.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{mod.lessons?.length || 0} lessons</span>
                      <ChevronDown size={14} className={`text-muted-foreground transition-transform ${openModule === mod.id ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  {openModule === mod.id && (
                    <div className="bg-secondary divide-y divide-border/50">
                      {mod.lessons?.map((lesson: any) => {
                        const isLessonCompleted = enrollment?.completed_lessons?.includes(lesson.id) || false;
                        return (
                          <div key={lesson.id}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-card transition-colors ${lesson.current ? "bg-primary/5" : ""}`}
                            onClick={() => {
                              if (isEnrolled) {
                                onNavigate("lesson");
                              } else {
                                handleEnrollOrContinue();
                              }
                            }}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isLessonCompleted ? "bg-emerald-500/10" : lesson.current ? "bg-primary/10" : "bg-muted"}`}>
                              {isLessonCompleted ? <Check size={12} className="text-emerald-400" /> : lesson.current ? <Play size={10} className="text-primary" /> : <Circle size={12} className="text-muted-foreground" />}
                            </div>
                            <span className={`text-xs flex-1 ${lesson.current ? "text-foreground font-medium" : isLessonCompleted ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                              {lesson.title}
                              {lesson.current && <span className="ml-2 text-primary text-[10px]">Current</span>}
                            </span>
                            <span {...mono("text-[10px] text-muted-foreground")}>{lesson.duration}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-4">
          <Card className="p-5 sticky top-4">
            {isEnrolled && (
              <div className="mb-4">
                <ProgressBar value={progress} />
                <p {...mono("text-xs text-muted-foreground mt-1")}>{progress}% complete</p>
              </div>
            )}
            <CyanButton className="w-full text-center mb-3" onClick={handleEnrollOrContinue}>
              {isEnrolled ? "Continue Learning" : "Enroll Now"}
            </CyanButton>
            {isEnrolled && (
              <button onClick={() => onNavigate("quiz")}
                className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all mb-4"
                style={{ fontFamily: "'Raleway', sans-serif" }}>
                Take Quiz
              </button>
            )}
            <div className="space-y-3 text-xs text-muted-foreground">
              {[
                [<Clock size={13} />, `${course.duration} total`],
                [<BookOpen size={13} />, `${course.lessons} lessons`],
                [<Users size={13} />, `${course.students.toLocaleString()} enrolled`],
                [<Award size={13} />, "Certificate included"],
                [<Download size={13} />, "Downloadable resources"],
              ].map(([icon, text], i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground">{icon as React.ReactNode}</span>
                  {text as string}
                </div>
              ))}
            </div>
            {course.tags && course.tags.length > 0 && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-border flex-wrap">
                {course.tags.map((tag) => <Badge key={tag} color="default">{tag}</Badge>)}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Lesson Viewer ────────────────────────────────────────────────────────────
function LessonViewerPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [notes, setNotes] = useState("Key insight: ReLU solves the vanishing gradient problem by maintaining non-zero gradients for positive values.\n\n- Adam optimizer converges faster than SGD\n- Learning rate scheduling is critical for stability");
  const [aiOpen, setAiOpen] = useState(false);

  const { courses, enrollments, selectedCourseId, selectedLessonId, setSelectedLessonId, updateLessonProgress } = useApp();

  const course = courses.find((c) => Number(c.id) === Number(selectedCourseId)) || courses[0];
  const enrollment = enrollments.find((e) => Number(e.course_id) === Number(course.id));
  const progressPercent = enrollment ? enrollment.progress : 0;

  const modules = course.modules && course.modules.length > 0 ? course.modules : MODULES;

  // Flatten lessons and add parent module title
  const allLessons = modules.flatMap((m: any) =>
    (m.lessons || []).map((l: any) => ({ ...l, moduleTitle: m.title }))
  );

  const currentLesson = allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];

  useEffect(() => {
    if (currentLesson && currentLesson.id !== selectedLessonId) {
      setSelectedLessonId(currentLesson.id);
    }
  }, [currentLesson, selectedLessonId, setSelectedLessonId]);

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const nextLesson = currentIndex !== -1 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;

  const handleNextLesson = () => {
    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      setSelectedLessonId(prevLesson.id);
    }
  };

  const currentCompleted = enrollment?.completed_lessons?.includes(currentLesson?.id) || false;

  const toggleLesson = async (lessonId: number, isCurrentlyCompleted: boolean) => {
    await updateLessonProgress(course.id, lessonId, !isCurrentlyCompleted);
  };

  return (
    <div className="flex h-full bg-background" style={{ maxHeight: "calc(100vh - 64px)" }}>
      {/* Video area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => onNavigate("course-detail")} className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> {course.title}
          </button>
          <ChevronRight size={12} />
          <span className="truncate max-w-[200px]">{currentLesson?.moduleTitle || "Curriculum"}</span>
          <ChevronRight size={12} />
          <span className="text-foreground truncate max-w-[200px]">{currentLesson?.title || "Lesson"}</span>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black relative flex items-center justify-center group" style={{ minHeight: 0 }}>
          <img src={course.thumbnail}
            alt="Lesson thumbnail" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={() => setPlaying(!playing)}
              className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-all">
              {playing ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <span {...mono("text-xs text-white")}>0:00</span>
              <div className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer">
                <div className="h-full bg-primary rounded-full relative" style={{ width: `0%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(247,37,133,0.8)]" />
                </div>
              </div>
              <span {...mono("text-xs text-muted-foreground")}>{currentLesson?.duration || "0:00"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={handlePrevLesson} disabled={!prevLesson} className={`transition-colors ${prevLesson ? "text-white/70 hover:text-white" : "text-white/20 cursor-not-allowed"}`}><SkipBack size={16} /></button>
                <button onClick={() => setPlaying(!playing)} className="text-white hover:text-primary transition-colors">
                  {playing ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={handleNextLesson} disabled={!nextLesson} className={`transition-colors ${nextLesson ? "text-white/70 hover:text-white" : "text-white/20 cursor-not-allowed"}`}><SkipForward size={16} /></button>
                <Volume2 size={14} className="text-white/70" />
                <div className="w-20 h-1 bg-white/20 rounded-full cursor-pointer">
                  <div className="h-full bg-white/60 rounded-full" style={{ width: `${volume}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span {...mono("text-xs text-white/70")}>1.0×</span>
                <button className="text-white/70 hover:text-white transition-colors"><Maximize size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson info */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div>
            <h3 {...sg("text-base font-semibold")}>{currentLesson?.title || "No lesson selected"}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{currentLesson?.moduleTitle} • {currentLesson?.duration || "0:00"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLesson(currentLesson.id, currentCompleted)}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${currentCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" : "border-border text-muted-foreground hover:text-foreground"}`}>
              <CheckCircle size={13} /> {currentCompleted ? "Completed" : "Mark Complete"}
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-border flex items-center gap-1.5 transition-all">
              <Download size={13} /> Resources
            </button>
            <CyanButton size="sm" onClick={handleNextLesson} disabled={!nextLesson}>
              Next Lesson
            </CyanButton>
          </div>
        </div>

        {/* Notes */}
        <div className="px-6 pb-4 flex-1 overflow-auto border-t border-border">
          <div className="flex items-center justify-between py-3 mb-2">
            <h4 {...sg("text-sm font-semibold")}>My Notes</h4>
            <span className="text-xs text-muted-foreground">Auto-saved</span>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-card border border-border rounded-xl p-3 text-sm text-muted-foreground outline-none focus:border-primary/30 resize-none transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace", minHeight: 120 }}
            placeholder="Take notes here…" />
        </div>
      </div>

      {/* Sidebar: module list */}
      <aside className="w-72 flex-shrink-0 border-l border-sidebar-border bg-sidebar overflow-y-auto hidden xl:block">
        <div className="p-4 border-b border-border">
          <p {...sg("text-sm font-semibold")}>Course Content</p>
          <ProgressBar value={progressPercent} className="mt-2" />
          <p {...mono("text-[10px] text-muted-foreground mt-1")}>{progressPercent}% complete</p>
        </div>
        {modules.map((mod: any) => (
          <div key={mod.id} className="border-b border-border/50">
            <div className="px-4 py-3 bg-surface">
              <p className="text-xs text-muted-foreground font-medium">{mod.title}</p>
            </div>
            {mod.lessons?.map((lesson: any) => {
              const isLessonCompleted = enrollment?.completed_lessons?.includes(lesson.id) || false;
              const isSelected = selectedLessonId === lesson.id;
              return (
                <div key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-card transition-colors ${isSelected ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLesson(lesson.id, isLessonCompleted); }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isLessonCompleted ? "bg-emerald-500/10 text-emerald-400" : isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-border"}`}>
                    {isLessonCompleted ? <Check size={10} /> : isSelected ? <Play size={8} /> : null}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${isSelected ? "text-white font-medium" : "text-muted-foreground"}`}>{lesson.title}</p>
                    <p {...mono("text-[10px] text-muted-foreground")}>{lesson.duration}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Floating AI button */}
      <button onClick={() => setAiOpen(!aiOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_40%,transparent)] hover:bg-primary/90 transition-all z-40">
        <Bot size={20} className="text-white" />
      </button>
      {aiOpen && (
        <div className="fixed bottom-20 right-6 w-72 bg-card border border-border rounded-2xl shadow-2xl z-40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot size={15} className="text-primary" />
              <span {...sg("text-sm font-semibold")}>Mentora AI</span>
            </div>
            <button onClick={() => setAiOpen(false)}><X size={14} className="text-muted-foreground" /></button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Ask anything about this lesson.</p>
          <div className="flex gap-2">
            <input placeholder="Ask AI…" className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none" style={{ fontFamily: "'Poppins', sans-serif" }} />
            <button onClick={() => onNavigate("ai-chat")} className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function AIChatPage() {
  const [messages, setMessages] = useState(INITIAL_CHAT);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiResponseIdx = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: "user" as const, content: text, timestamp: "Just now" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg = {
        role: "ai" as const,
        content: AI_RESPONSES[aiResponseIdx.current % AI_RESPONSES.length],
        timestamp: "Just now",
      };
      aiResponseIdx.current++;
      setMessages((prev) => [...prev, aiMsg]);
    }, 1800);
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```\w*\n?/, "").replace(/```$/, "");
        return (
          <div key={i} className="mt-2 mb-2 bg-surface border border-border rounded-xl p-3 overflow-x-auto">
            <pre {...mono("text-xs text-primary whitespace-pre-wrap")}>{code}</pre>
          </div>
        );
      }
      return (
        <span key={i} className="whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: part
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
              .replace(/•/g, '<span class="text-primary">•</span>'),
          }}
        />
      );
    });
  };

  return (
    <div className="flex h-full" style={{ maxHeight: "calc(100vh - 64px)" }}>
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot size={18} className="text-primary" />
          </div>
          <div>
            <p {...sg("text-sm font-semibold")}>Mentora AI</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-xs text-emerald-400">Online · Ready to help</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border transition-all">
<RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={15} className="text-primary" />
                </div>
              )}
              <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${msg.role === "ai" ? "bg-card border border-border text-muted-foreground rounded-tl-sm" : "bg-primary/10 border border-primary/20 text-white rounded-tr-sm"}`}>
                {renderContent(msg.content)}
                <p {...mono("text-[10px] text-muted-foreground/60 mt-2")}>{msg.timestamp}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 mt-0.5">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&auto=format" alt="You" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot size={15} className="text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1">
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Suggested prompts</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all">
    {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-end gap-3 bg-card border border-border rounded-2xl p-3 focus-within:border-primary/30 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask me anything about your courses…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none resize-none max-h-32 min-h-[20px]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
              rows={1}
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <Send size={15} className="text-white" />
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Mentora AI has access to your course content and learning history.
          </p>
        </div>
      </div>

      {/* Sidebar: context */}
      <aside className="w-72 flex-shrink-0 border-l border-sidebar-border bg-sidebar p-4 space-y-4 hidden lg:block">
        <div>
          <p {...sg("text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3")}>Active Course</p>
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <img src={COURSES[0].thumbnail} alt="" className="w-10 h-8 rounded-lg object-cover bg-muted" />
              <p className="text-xs font-medium leading-tight">{COURSES[0].title}</p>
            </div>
            <ProgressBar value={68} />
            <p {...mono("text-[10px] text-muted-foreground mt-1")}>Module 2 of 4 • Lesson 5</p>
          </Card>
        </div>
        <div>
          <p {...sg("text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3")}>Capabilities</p>
          <div className="space-y-2">
            {[
              [<Brain size={13} />, "Explain concepts from your courses"],
              [<Code size={13} />, "Debug and review code"],
              [<HelpCircle size={13} />, "Generate practice questions"],
              [<Map size={13} />, "Create personalized study plans"],
              [<FileText size={13} />, "Summarize course modules"],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary">{icon as React.ReactNode}</span>
                {text as string}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p {...sg("text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3")}>Recent Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {["Backpropagation", "Adam optimizer", "ReLU", "Transformers", "CNNs"].map((t) => (
              <button key={t} onClick={() => sendMessage(`Explain ${t}`)}
                className="px-2.5 py-1 rounded-lg bg-card border border-border text-[10px] text-muted-foreground hover:text-foreground hover:border-border transition-all">
  {t}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── Quiz Page ────────────────────────────────────────────────────────────────
function QuizPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) { clearInterval(timer); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const q = QUIZ_QUESTIONS[current];
  const timerColor = timeLeft < 300 ? "#FF4444" : timeLeft < 600 ? "#F59E0B" : "var(--primary)";

  return (
    <div className="min-h-full bg-background p-6 flex items-start justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 {...sg("text-xl font-bold")}>ML & Neural Networks</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Module 2 Assessment · 5 questions</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card">
            <Timer size={15} style={{ color: timerColor }} />
            <span {...mono(`text-base font-semibold`)} style={{ color: timerColor }}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {QUIZ_QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < current ? "bg-primary" : i === current ? "bg-primary/50" : "bg-muted"}`} />
          ))}
        </div>
        <p {...mono("text-xs text-muted-foreground mb-6")}>Question {current + 1} of {QUIZ_QUESTIONS.length}</p>

        {/* Question */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <HelpCircle size={14} className="text-primary" />
            </div>
            <p {...sg("text-base font-medium leading-relaxed")}>{q.question}</p>
          </div>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const selected = answers[current] === i;
              return (
                <button key={i} onClick={() => setAnswers({ ...answers, [current]: i })}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${selected ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-border hover:text-foreground"}`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-primary bg-primary" : "border-border"}`}>
                    {selected && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm">{opt}</span>
                  <span {...mono("text-xs text-muted-foreground ml-auto")}>{String.fromCharCode(65 + i)}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: "'Raleway', sans-serif" }}>
            <ArrowLeft size={14} /> Previous
          </button>
          <div className="flex gap-1">
            {QUIZ_QUESTIONS.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-8 h-8 rounded-lg text-xs transition-all ${i === current ? "bg-primary text-white" : answers[i] !== undefined ? "bg-primary/10 text-primary" : "bg-card border border-border text-muted-foreground"}`}
                {...mono()}>
                {i + 1}
              </button>
            ))}
          </div>
          {current < QUIZ_QUESTIONS.length - 1 ? (
            <button onClick={() => setCurrent(current + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
              style={{ fontFamily: "'Raleway', sans-serif" }}>
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <CyanButton onClick={() => onNavigate("quiz-results")}>
              Submit Quiz
            </CyanButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Results ─────────────────────────────────────────────────────────────
function QuizResultsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const score = 80;
  const correct = 4;
  const total = 5;

  return (
    <div className="min-h-full bg-background p-6 flex items-start justify-center">
      <div className="w-full max-w-2xl">
        <Card className="p-8 text-center mb-6">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="8"
                strokeDasharray={`${263.9 * score / 100} 263.9`} strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 10px rgba(247,37,133,0.6))" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p {...mono("text-3xl font-semibold text-foreground")}>{score}%</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          </div>
          <h2 {...sg("text-2xl font-bold mb-2")}>
            {score >= 80 ? "Excellent Work!" : score >= 60 ? "Good Effort!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            You answered {correct} out of {total} questions correctly.{" "}
            {score >= 80 ? "You've passed and earned a certificate!" : "Review the material and try again."}
          </p>
          <div className="flex items-center justify-center gap-6 mb-6">
            {[["Correct", `${correct}/${total}`, "#10B981"], ["Time Taken", "12:34", "var(--primary)"], ["Rank", "Top 8%", "#7C3AED"]].map(([l, v, c]) => (
              <div key={l as string} className="text-center">
                <p {...mono("text-xl font-semibold")} style={{ color: c as string }}>{v}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
          {score >= 80 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-6">
              <Trophy size={16} />
              <span {...sg("font-medium")}>Certificate Unlocked!</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-3">
            <CyanButton onClick={() => onNavigate("certificates")}>View Certificate</CyanButton>
            <CyanButton outline onClick={() => onNavigate("quiz")}>Retake Quiz</CyanButton>
            <CyanButton outline onClick={() => onNavigate("course-detail")}>Back to Course</CyanButton>
          </div>
        </Card>

        {/* Question breakdown */}
        <h3 {...sg("text-sm font-semibold mb-3")}>Question Review</h3>
        <div className="space-y-3">
          {QUIZ_QUESTIONS.map((q, i) => {
            const userAns = i === 2 ? 0 : q.correct;
            const isCorrect = userAns === q.correct;
            return (
              <Card key={q.id} className={`p-4 border-l-2 ${isCorrect ? "border-l-emerald-500" : "border-l-red-500"}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCorrect ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {isCorrect ? <Check size={12} className="text-emerald-400" /> : <X size={12} className="text-red-400" />}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{q.question}</p>
                </div>
                <div className="ml-9 space-y-1">
                  <p className="text-xs text-emerald-400">✓ Correct: {q.options[q.correct]}</p>
                  {!isCorrect && <p className="text-xs text-red-400">✗ Your answer: {q.options[userAns]}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{q.explanation}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Certificates ─────────────────────────────────────────────────────────────
function CertificatesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 {...sg("text-2xl font-bold mb-1")}>My Certificates</h2>
          <p className="text-muted-foreground text-sm">{CERTIFICATES.length} certificates earned</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield size={13} className="text-primary" />
          Blockchain-verified credentials
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CERTIFICATES.map((cert) => (
          <Card key={cert.id} className="overflow-hidden group">
            {/* Certificate preview */}
            <div className="bg-gradient-to-br from-surface to-card p-8 text-center border-b border-border relative">
              <div className="absolute inset-0 bg-primary/2 pointer-events-none" />
              <div className="absolute top-3 left-3 right-3 flex justify-between">
                <div className="w-6 h-6 rounded-full border border-primary/20" />
                <div className="w-6 h-6 rounded-full border border-primary/20" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Award size={22} className="text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" {...mono()}>Certificate of Completion</p>
                <p {...sg("text-base font-bold mb-1")}>{cert.title}</p>
                <p className="text-xs text-muted-foreground">Alex Johnson</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{cert.course}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3" {...mono()}>
                <span>Score: <span className="text-primary">{cert.score}%</span></span>
                <span>{cert.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface border border-border text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all"
                  style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <Download size={12} /> Download
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface border border-border text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all"
                  style={{ fontFamily: "'Raleway', sans-serif" }}>
                  <Share2 size={12} /> Share
                </button>
              </div>
              <p {...mono("text-[9px] text-muted-foreground/50 text-center mt-2")}>ID: {cert.credentialId}</p>
            </div>
          </Card>
        ))}

        {/* Locked certificate */}
        <Card className="overflow-hidden opacity-60">
          <div className="bg-gradient-to-br from-surface to-card p-8 text-center border-b border-border relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock size={32} className="text-border" />
            </div>
            <div className="relative z-10 opacity-40">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Award size={22} className="text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" {...mono()}>Certificate of Completion</p>
              <p {...sg("text-base font-bold mb-1 text-muted-foreground")}>Cloud Architecture</p>
              <p className="text-xs text-muted-foreground">Alex Johnson</p>
            </div>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Cloud Architecture & DevOps</p>
            <p className="text-xs text-muted-foreground mb-3">Complete the course to unlock</p>
            <ProgressBar value={15} />
            <p {...mono("text-[10px] text-muted-foreground mt-1")}>15% complete</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { isDark } = useTheme();
  const skills = [
    { name: "Machine Learning", level: 78, color: "#F72585" },
    { name: "Python", level: 92, color: "#10B981" },
    { name: "Cybersecurity", level: 45, color: "#F59E0B" },
    { name: "Cloud Computing", level: 61, color: "#7C3AED" },
    { name: "Leadership", level: 84, color: "#FF4444" },
    { name: "Data Analytics", level: 70, color: "#0099FF" },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Profile header */}
      <Card className="p-6 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none">
          <NeuralNetSVG className="w-full h-full" />
        </div>
        <div className="flex items-start gap-6 relative z-10">
          <div className="relative flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format"
              alt="Alex Johnson" className="w-20 h-20 rounded-2xl object-cover bg-muted" />
            <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 {...sg("text-2xl font-bold")}>Alex Johnson</h2>
              <Badge color="cyan">ML Engineer</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Machine Learning Engineer · Acme Corporation · San Francisco, CA</p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Mail size={12} />alex.johnson@acme.com</span>
              <span className="flex items-center gap-1"><Building2 size={12} />Engineering Department</span>
              <span className="flex items-center gap-1"><UserCheck size={12} />Member since Jan 2024</span>
            </div>
          </div>
          <button onClick={() => onNavigate("settings")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all flex-shrink-0"
            style={{ fontFamily: "'Raleway', sans-serif" }}>
            <Edit2 size={13} /> Edit Profile
          </button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="space-y-5">
          {/* Learning stats */}
          <Card className="p-5">
            <h3 {...sg("text-sm font-semibold mb-4")}>Learning Statistics</h3>
            <div className="space-y-3">
              {[
                { label: "Total hours learned", value: "148h", icon: <Clock size={14} /> },
                { label: "Courses completed", value: "8", icon: <CheckCircle size={14} /> },
                { label: "Certificates earned", value: "3", icon: <Award size={14} /> },
                { label: "Current streak", value: "12 days", icon: <Flame size={14} /> },
                { label: "Skill points", value: "2,840", icon: <Zap size={14} /> },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-primary">{stat.icon}</span>
                    {stat.label}
                  </div>
                  <span {...mono("text-sm font-semibold text-foreground")}>{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-5">
            <h3 {...sg("text-sm font-semibold mb-4")}>Achievements</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🔥", label: "12-Day Streak", unlocked: true },
                { icon: "🏆", label: "Quiz Master", unlocked: true },
                { icon: "⚡", label: "Speed Learner", unlocked: true },
                { icon: "🎯", label: "Perfect Score", unlocked: true },
                { icon: "🧠", label: "Deep Thinker", unlocked: false },
                { icon: "🚀", label: "Early Adopter", unlocked: false },
              ].map((a) => (
                <div key={a.label} className={`text-center p-2 rounded-xl border ${a.unlocked ? "border-border bg-card" : "border-border opacity-30"}`}>
                  <p className="text-xl mb-1">{a.icon}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">{a.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-5">
          {/* Skills */}
          <Card className="p-5">
            <h3 {...sg("text-sm font-semibold mb-4")}>Skill Proficiency</h3>
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground">{skill.name}</span>
                    <span {...mono("text-xs")} style={{ color: skill.color }}>{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%`, background: skill.color, boxShadow: `0 0 8px ${skill.color}40` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Progress chart */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 {...sg("text-sm font-semibold")}>Monthly Learning Activity</h3>
              <span {...mono("text-xs text-muted-foreground")}>Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MONTHLY_DATA} barSize={28}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip contentStyle={getTooltipStyle(isDark)}
                  formatter={(v: number) => [`${v}h`, "Hours"]} />
                <Bar dataKey="hours" fill="var(--primary)" radius={[6, 6, 0, 0]}
                  style={{ filter: "drop-shadow(0 0 6px rgba(247,37,133,0.35))" }} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Current courses */}
          <Card className="p-5">
            <h3 {...sg("text-sm font-semibold mb-4")}>Active Enrollments</h3>
            <div className="space-y-3">
              {COURSES.filter((c) => c.progress > 0).map((course) => (
                <div key={course.id} className="flex items-center gap-3 cursor-pointer hover:bg-muted rounded-xl p-2 -mx-2 transition-colors"
                  onClick={() => onNavigate("course-detail")}>
                  <img src={course.thumbnail} alt="" className="w-12 h-10 rounded-lg object-cover bg-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <ProgressBar value={course.progress} className="mt-1.5 max-w-xs" />
                  </div>
                  <span {...mono("text-xs text-muted-foreground")}>{course.progress}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function SettingsPage() {
  const { isDark, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [notifSettings, setNotifSettings] = useState({
    courseUpdates: true,
    aiInsights: true,
    weeklyDigest: false,
    achievements: true,
    teamActivity: false,
  });
  const [language, setLanguage] = useState("English");
  const [showCurrentPw, setShowCurrentPw] = useState(false);

  const tabs = [
    { id: "account", label: "Account", icon: <User size={14} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
    { id: "appearance", label: "Appearance", icon: <Monitor size={14} /> },
    { id: "security", label: "Security", icon: <Shield size={14} /> },
    { id: "privacy", label: "Privacy", icon: <Lock size={14} /> },
  ];

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`w-10 h-5.5 rounded-full transition-all flex items-center px-0.5 ${value ? "bg-primary" : "bg-muted"}`}
      style={{ height: 22 }}>
      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <h2 {...sg("text-2xl font-bold mb-6")}>Settings</h2>
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="space-y-0.5">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}
              style={{ fontFamily: "'Raleway', sans-serif" }}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeTab === "account" && (
            <>
              <Card className="p-5">
                <h3 {...sg("text-sm font-semibold mb-4")}>Personal Information</h3>
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format"
                    alt="Avatar" className="w-16 h-16 rounded-2xl object-cover bg-muted" />
                  <div>
                    <CyanButton size="sm">Change photo</CyanButton>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF · max 2MB</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[["First name", "Alex"], ["Last name", "Johnson"], ["Job title", "ML Engineer"], ["Department", "Engineering"]].map(([label, val]) => (
                    <div key={label as string}>
                      <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
                      <Input value={val as string} onChange={() => {}} />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground block mb-1.5">Work email</label>
                    <Input value="alex.johnson@acme.com" type="email" onChange={() => {}} icon={<Mail size={14} />} />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <CyanButton size="sm">Save changes</CyanButton>
                </div>
              </Card>
              <Card className="p-5">
                <h3 {...sg("text-sm font-semibold mb-4")}>Language & Region</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Display Language</p>
                    <p className="text-xs text-muted-foreground">Language used throughout the interface</p>
                  </div>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {["English", "Spanish", "French", "German", "Japanese"].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </Card>
            </>
          )}

          {activeTab === "notifications" && (
            <Card className="p-5">
              <h3 {...sg("text-sm font-semibold mb-4")}>Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries(notifSettings).map(([key, val]) => {
                  const labels: Record<string, [string, string]> = {
                    courseUpdates: ["Course updates", "New lessons, instructor announcements"],
                    aiInsights: ["AI learning insights", "Personalized tips from Mentora AI"],
                    weeklyDigest: ["Weekly digest", "Summary of your learning progress"],
                    achievements: ["Achievements", "Badges, streaks, and milestones"],
                    teamActivity: ["Team activity", "Updates from your learning cohort"],
                  };
                  const [title, desc] = labels[key];
                  return (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Toggle value={val} onChange={() => setNotifSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card className="p-5">
              <h3 {...sg("text-sm font-semibold mb-4")}>Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "dark", label: "Dark", preview: "#06060F", active: isDark },
                  { id: "light", label: "Light", preview: "#F0F5FF", active: !isDark },
                ].map((t) => (
                  <button key={t.id} onClick={toggle}
                    className={`p-3 rounded-xl border text-sm text-center transition-all ${t.active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-border"}`}
                    style={{ fontFamily: "'Raleway', sans-serif" }}>
                    <div className="w-full h-10 rounded-lg mb-2 border border-border" style={{ background: t.preview }} />
                    {t.label}
                    {t.active && <div className="mt-1 flex justify-center"><div className="w-1.5 h-1.5 rounded-full bg-primary" /></div>}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="p-5">
              <h3 {...sg("text-sm font-semibold mb-4")}>Change Password</h3>
              <div className="space-y-4">
                {[["Current password", showCurrentPw, () => setShowCurrentPw(!showCurrentPw)], ["New password", false, () => {}], ["Confirm new password", false, () => {}]].map(([label, show, toggle]: any) => (
                  <div key={label}>
                    <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
                    <div className="relative">
                      <Input type={show ? "text" : "password"} placeholder="••••••••••" onChange={() => {}} icon={<Lock size={14} />} />
                      <button type="button" onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {show ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                <CyanButton size="sm">Update password</CyanButton>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <h4 {...sg("text-sm font-semibold mb-3")}>Two-factor authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Authenticator app</p>
                    <p className="text-xs text-muted-foreground">Not configured</p>
                  </div>
                  <CyanButton size="sm" outline>Enable 2FA</CyanButton>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "privacy" && (
            <Card className="p-5">
              <h3 {...sg("text-sm font-semibold mb-4")}>Privacy Controls</h3>
              <div className="space-y-4">
                {[
                  ["Profile visibility", "Allow team members to view your learning profile", true],
                  ["Activity sharing", "Share your learning activity with your manager", true],
                  ["Analytics", "Help improve Mentora with anonymized usage data", false],
                  ["AI personalization", "Allow AI to use your learning history for personalization", true],
                ].map(([title, desc, defaultVal]) => (
                  <div key={title as string} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{title as string}</p>
                      <p className="text-xs text-muted-foreground">{desc as string}</p>
                    </div>
                    <Toggle value={defaultVal as boolean} onChange={() => {}} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Announcements Page ───────────────────────────────────────────────────────
function AnnouncementsPage() {
  const announcements = [
    { id: 1, title: "Q3 Learning Goals Now Published", body: "The Q3 mandatory learning paths have been finalized by L&D. All engineers must complete the Cloud Architecture module by September 30th.", author: "Jordan Lee, L&D Lead", date: "July 10, 2024", tag: "Mandatory", color: "red" as const },
    { id: 2, title: "New Course: Prompt Engineering for Developers", body: "We've partnered with OpenAI to bring you an exclusive Prompt Engineering course. Early access opens Friday.", author: "System", date: "July 8, 2024", tag: "New Course", color: "cyan" as const },
    { id: 3, title: "Platform Update: AI Assistant v2.0", body: "Mentora AI now supports multi-turn conversations with course context memory, code execution explanations, and source citations.", author: "Product Team", date: "July 5, 2024", tag: "Update", color: "purple" as const },
    { id: 4, title: "Congratulations to July Graduates!", body: "23 team members completed their certifications this month — a new record! Special shoutout to the Data Science cohort.", author: "HR Team", date: "July 1, 2024", tag: "Achievement", color: "green" as const },
  ];

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <h2 {...sg("text-2xl font-bold mb-6")}>Announcements</h2>
      <div className="space-y-4">
        {announcements.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Megaphone size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 {...sg("text-sm font-semibold")}>{a.title}</h3>
                  <p className="text-xs text-muted-foreground">{a.author} · {a.date}</p>
                </div>
              </div>
              <Badge color={a.color}>{a.tag}</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── App Layout ───────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  courses: "Course Library",
  "course-detail": "Course Details",
  lesson: "Lesson Viewer",
  "ai-chat": "AI Assistant",
  quiz: "Quiz",
  "quiz-results": "Quiz Results",
  certificates: "My Certificates",
  profile: "Profile",
  settings: "Settings",
  announcements: "Announcements",
};

function AppLayout({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage onNavigate={onNavigate} />;
      case "courses": return <CourseCatalogPage onNavigate={onNavigate} />;
      case "course-detail": return <CourseDetailPage onNavigate={onNavigate} />;
      case "lesson": return <LessonViewerPage onNavigate={onNavigate} />;
      case "ai-chat": return <AIChatPage />;
      case "quiz": return <QuizPage onNavigate={onNavigate} />;
      case "quiz-results": return <QuizResultsPage onNavigate={onNavigate} />;
      case "certificates": return <CertificatesPage onNavigate={onNavigate} />;
      case "profile": return <ProfilePage onNavigate={onNavigate} />;
      case "settings": return <SettingsPage />;
      case "announcements": return <AnnouncementsPage />;
      default: return <DashboardPage onNavigate={onNavigate} />;
    }
  };

  const isFullHeight = page === "lesson" || page === "ai-chat";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Sidebar activePage={page} onNavigate={onNavigate} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav title={PAGE_TITLES[page] ?? "Mentora"} onNavigate={onNavigate} />
        <main className={`flex-1 ${isFullHeight ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [isDark, setIsDark] = useState(true);

  // Synchronize theme class with html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Supabase states
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>(COURSES);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(1);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const appPages: Page[] = [
    "dashboard", "courses", "course-detail", "lesson", "ai-chat",
    "quiz", "quiz-results", "certificates", "profile", "settings", "announcements",
  ];

  const fetchProfileAndData = async (userId: string) => {
    try {
      // 1. Fetch Profile
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!profErr && profData) {
        setProfile(profData);
      } else {
        // Create a temporary fallback profile if database trigger hasn't finished yet
        setProfile({
          id: userId,
          full_name: user?.email?.split("@")[0] || "Student",
          username: user?.email?.split("@")[0] || "student",
          avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&auto=format",
          email: user?.email,
          role: "student"
        });
      }

      // 2. Fetch Enrollments
      const { data: enrollmentsData, error: enrollmentsErr } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", userId);

      if (!enrollmentsErr && enrollmentsData) {
        setEnrollments(enrollmentsData);
      }
    } catch (err) {
      console.error("Error in fetchProfileAndData:", err);
    }
  };

  // On mount: fetch public courses and check current auth session
  useEffect(() => {
    let active = true;

    const initApp = async () => {
      // Fetch public courses first
      try {
        const { data: coursesData, error: coursesErr } = await supabase
          .from("courses")
          .select("*")
          .order("id", { ascending: true });

        if (active) {
          if (!coursesErr && coursesData) {
            setCourses(coursesData);
          }
        }
      } catch (err) {
        console.error("Error loading courses on mount:", err);
      }

      // Get current auth session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (active) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await fetchProfileAndData(currentUser.id);
            setPage("dashboard");
          }
        }
      } catch (err) {
        console.error("Error checking auth session:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    initApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfileAndData(currentUser.id);
        if (event === "SIGNED_IN") {
          setPage("dashboard");
        }
      } else {
        setProfile(null);
        setEnrollments([]);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const enrollInCourse = async (courseId: number) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: courseId,
        progress: 0,
        completed_lessons: []
      });

      if (!error) {
        const { data } = await supabase.from("enrollments").select("*").eq("user_id", user.id);
        if (data) setEnrollments(data);
      } else {
        console.error("Error enrolling in course:", error);
      }
    } catch (err) {
      console.error("Error enrolling:", err);
    }
  };

  const updateLessonProgress = async (courseId: number, lessonId: number, completed: boolean) => {
    if (!user) return;
    try {
      const currentEnrollment = enrollments.find(e => Number(e.course_id) === Number(courseId));
      let completedLessons: number[] = currentEnrollment?.completed_lessons || [];

      if (completed) {
        if (!completedLessons.includes(lessonId)) {
          completedLessons = [...completedLessons, lessonId];
        }
      } else {
        completedLessons = completedLessons.filter((id: number) => id !== lessonId);
      }

      const courseObj = courses.find(c => Number(c.id) === Number(courseId));
      const totalLessons = courseObj?.lessons || 1;
      const newProgress = Math.min(100, Math.max(0, Math.round((completedLessons.length / totalLessons) * 100)));

      if (currentEnrollment) {
        const { error } = await supabase
          .from("enrollments")
          .update({
            completed_lessons: completedLessons,
            progress: newProgress
          })
          .eq("id", currentEnrollment.id);

        if (!error) {
          setEnrollments(prev => prev.map(e => e.id === currentEnrollment.id ? { ...e, completed_lessons: completedLessons, progress: newProgress } : e));
        }
      } else {
        const { error } = await supabase
          .from("enrollments")
          .insert({
            user_id: user.id,
            course_id: courseId,
            progress: newProgress,
            completed_lessons: completedLessons
          });

        if (!error) {
          const { data } = await supabase.from("enrollments").select("*").eq("user_id", user.id);
          if (data) setEnrollments(data);
        }
      }
    } catch (err) {
      console.error("Error updating lesson progress:", err);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setEnrollments([]);
      setPage("landing");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#06060F] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground tracking-wider uppercase animate-pulse">Mentora Loading...</span>
      </div>
    );
  }

  return (
    <AppCtx.Provider value={{
      user,
      profile,
      courses,
      enrollments,
      selectedCourseId,
      setSelectedCourseId,
      selectedLessonId,
      setSelectedLessonId,
      enrollInCourse,
      updateLessonProgress,
      signOut,
      loading
    }}>
      <ThemeCtx.Provider value={{ isDark, toggle: () => setIsDark((d) => !d) }}>
        <div className={isDark ? "dark" : ""} style={{ colorScheme: isDark ? "dark" : "light" }}>
          <style>{`
            ::-webkit-scrollbar { width: 5px; height: 5px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
            ::-webkit-scrollbar-thumb:hover { background: var(--muted-foreground); }
            * { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
          `}</style>
          {page === "landing" && <LandingPage onNavigate={setPage} />}
          {page === "login" && <LoginPage onNavigate={setPage} />}
          {appPages.includes(page) && <AppLayout page={page} onNavigate={setPage} />}
        </div>
      </ThemeCtx.Provider>
    </AppCtx.Provider>
  );
}
