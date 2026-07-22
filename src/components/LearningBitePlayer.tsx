import React, { useState, useEffect } from "react";
import { 
  X, Zap, BookOpen, Trophy, ArrowRight, ArrowLeft, RotateCcw, 
  CheckCircle, AlertCircle, HelpCircle
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { LearningBite, UserBiteProgress } from "../types";

interface LearningBitePlayerProps {
  bites: LearningBite[];
  courseId: number;
  activityId: number;
  onClose: () => void;
  setProfile: any;
  setBiteProgress: any;
  setActivityProgress: any;
  onCompleteBite: (biteId: number, xpEarned: number) => void;
  onAllBitesCompleted: (xpEarned: number) => void;
}

export function LearningBitePlayer({
  bites,
  courseId,
  activityId,
  onClose,
  setProfile,
  setBiteProgress,
  setActivityProgress,
  onCompleteBite,
  onAllBitesCompleted
}: LearningBitePlayerProps) {
  // Navigation states
  const [currentBiteIdx, setCurrentBiteIdx] = useState(0);
  const [step, setStep] = useState<number>(1); // Step 1 to 7: Concept, Explanation, Visual, Real-World, Activity, Feedback, Completion
  const activeBite = bites[currentBiteIdx];

  // Quick activity states
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Resume state logic
  useEffect(() => {
    const fetchStatusAndResume = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: progress } = await supabase
          .from("user_bite_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("activity_id", activityId);

        if (progress && progress.length > 0) {
          const sortedBites = [...bites].sort((a, b) => a.order_index - b.order_index);
          const firstIncompleteIdx = sortedBites.findIndex(b => {
            const p = progress.find((prog: any) => Number(prog.bite_id) === Number(b.id));
            return !p || p.status !== "completed";
          });

          if (firstIncompleteIdx !== -1) {
            setCurrentBiteIdx(firstIncompleteIdx);
            setStep(1);
          } else {
            setCurrentBiteIdx(sortedBites.length - 1);
            setStep(7);
          }
        }
      } catch (err) {
        console.error("Error checking resume progress:", err);
      }
    };
    fetchStatusAndResume();
  }, [bites, activityId]);

  // Reset answer states when bite changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setAttempts(0);
    setIsCorrect(false);
  }, [currentBiteIdx]);

  if (!activeBite) {
    return (
      <div className="flex items-center justify-center p-8 bg-[#06060F] text-muted-foreground">
        Loading Learning Bite...
      </div>
    );
  }

  const content = activeBite.content;
  const totalBitesCount = bites.length;

  const handleNextStep = () => {
    if (step < 7) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (optionIdx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(optionIdx);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;

    const activityConfig = content.quickActivity;
    const isAnsCorrect = Number(selectedAnswer) === Number(activityConfig?.correctAnswer);
    
    setAttempts(prev => prev + 1);
    setIsCorrect(isAnsCorrect);
    setIsAnswerSubmitted(true);

    // Transition to step 6 (Feedback screen) for both correct and incorrect answers after a short delay
    setTimeout(() => {
      setStep(6);
    }, 600);
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setStep(5);
  };

  const handleClaimXp = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const xpEarned = activeBite.xp_reward || 20;

      // 1. Record User Bite Progress
      const { error: biteError } = await supabase
        .from("user_bite_progress")
        .upsert({
          user_id: user.id,
          bite_id: activeBite.id,
          activity_id: activityId,
          course_id: courseId,
          status: "completed",
          attempts: attempts,
          is_correct: isCorrect,
          xp_earned: xpEarned,
          completed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        }, { onConflict: "user_id,bite_id" });

      if (biteError) {
        console.error("Error saving user bite progress:", biteError);
      }

      // 2. Fetch updated profile to add XP
      const { data: profileData } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .single();
      
      const currentXp = (profileData?.xp || 0) + xpEarned;

      // 3. Update profile XP
      const { error: profError } = await supabase
        .from("profiles")
        .update({ xp: currentXp })
        .eq("id", user.id);

      if (!profError) {
        setProfile((prev: any) => prev ? { ...prev, xp: currentXp } : null);
      }

      // 4. Fetch updated bite progress
      const { data: freshBiteProg } = await supabase
        .from("user_bite_progress")
        .select("*")
        .eq("user_id", user.id);
      if (freshBiteProg) {
        setBiteProgress(freshBiteProg);
      }

      onCompleteBite(activeBite.id, xpEarned);

      // Check if all bites for this activity are completed (using timing-safe check)
      const completedBiteIds = new Set([
        ...(freshBiteProg || []).filter((p: any) => p.status === "completed" && Number(p.activity_id) === Number(activityId)).map((p: any) => Number(p.bite_id)),
        Number(activeBite.id)
      ]);
      const allCompleted = bites.every((b) => completedBiteIds.has(Number(b.id)));

      if (allCompleted) {
        const activityXp = 50;
        
        const { error: actError } = await supabase
          .from("user_activity_progress")
          .upsert({
            user_id: user.id,
            course_id: courseId,
            activity_id: activityId,
            status: "completed",
            xp_earned: activityXp,
            completed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString()
          }, { onConflict: "user_id,activity_id" });

        if (actError) {
          console.error("Error saving activity completion:", actError);
        }

        const { data: freshActProg } = await supabase
          .from("user_activity_progress")
          .select("*")
          .eq("user_id", user.id);
        if (freshActProg) {
          setActivityProgress(freshActProg);
        }

        onAllBitesCompleted(activityXp);
        onClose(); // Automatically return the user to the Course Details / Interactive Skill Path
      } else {
        if (currentBiteIdx < totalBitesCount - 1) {
          setCurrentBiteIdx(prev => prev + 1);
          setStep(1);
        } else {
          onClose();
        }
      }
    } catch (err) {
      console.error("Error in handleClaimXp:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#05050C] border border-border/10 rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-[500px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
            <Zap size={14} className="fill-cyan-400 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-black block">
              Learning Bite {currentBiteIdx + 1} of {totalBitesCount}
            </span>
            <h4 className="text-xs font-bold text-foreground truncate max-w-[280px] md:max-w-sm mt-0.5">{activeBite.title}</h4>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <X size={18} />
        </button>
      </div>

      {/* Step Progress indicators */}
      <div className="flex gap-1.5 justify-center mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div 
            key={s} 
            className={`h-1 rounded-full transition-all duration-300 ${
              s < step 
                ? "w-8 bg-cyan-500" 
                : s === step 
                ? "w-10 bg-cyan-400 shadow-md shadow-cyan-400/20" 
                : "w-4 bg-border/20"
            }`}
          />
        ))}
      </div>

      {/* Main Slide Panel */}
      <div className="flex-1 flex flex-col justify-center py-4 z-10">
        {step === 1 && content.concept && (
          <ConceptSection title={content.concept.title} description={content.concept.description} />
        )}
        {step === 2 && content.simpleExplanation && (
          <SimpleExplanationSection text={content.simpleExplanation.text} />
        )}
        {step === 3 && content.visual && (
          <VisualLearningSection type={content.visual.type} data={content.visual.data} />
        )}
        {step === 4 && content.realWorldExample && (
          <RealWorldExampleSection title={content.realWorldExample.title} description={content.realWorldExample.description} />
        )}
        {step === 5 && content.quickActivity && (
          <QuickActivitySection 
            question={content.quickActivity.question} 
            options={content.quickActivity.options} 
            selectedIdx={selectedAnswer}
            onSelect={handleAnswerSelect}
            isSubmitted={isAnswerSubmitted}
            isCorrectAnswer={isCorrect}
          />
        )}
        {step === 6 && content.kaiFeedback && (
          <KaiFeedbackSection 
            feedback={isCorrect ? content.kaiFeedback.correct : content.kaiFeedback.incorrect}
            isCorrect={isCorrect}
            onTryAgain={handleTryAgain}
            onContinue={handleNextStep}
          />
        )}
        {step === 7 && (
          <BiteCompletionSection 
            title={activeBite.title}
            xpReward={activeBite.xp_reward}
            isSaving={isSaving}
            onClaim={handleClaimXp}
          />
        )}
      </div>

      {/* Footer Nav Controls */}
      <div className="flex items-center justify-between border-t border-border/10 pt-4 mt-6 z-10">
        {step > 1 && step < 6 ? (
          <button 
            onClick={handlePrevStep}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all active:scale-95"
          >
            <ArrowLeft size={13} /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button 
            onClick={handleNextStep}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-cyan-500/10"
          >
            Continue <ArrowRight size={13} />
          </button>
        ) : step === 5 ? (
          <button 
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null || isAnswerSubmitted}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              selectedAnswer !== null && !isAnswerSubmitted
                ? "bg-cyan-400 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-400/20"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// ─── Concept Section ──────────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  description: string;
}

export function ConceptSection({ title, description }: SectionProps) {
  return (
    <div className="space-y-4 text-center max-w-md mx-auto">
      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold font-mono">
        Concept Node
      </span>
      <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed pt-2">{description}</p>
    </div>
  );
}

// ─── Simple Explanation Section ────────────────────────────────────────────────
export function SimpleExplanationSection({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-center max-w-lg mx-auto">
      <span className="text-[10px] text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold font-mono">
        Simple Analogy
      </span>
      <div className="bg-muted/30 border border-border/10 rounded-2xl p-5 md:p-6 mt-4 relative">
        <span className="text-3xl text-purple-500/30 font-serif absolute -top-3 left-4">“</span>
        <p className="text-xs text-foreground leading-relaxed italic text-muted-foreground relative z-10">
          {text}
        </p>
      </div>
    </div>
  );
}

// ─── Visual Learning Section ──────────────────────────────────────────────────
interface VisualProps {
  type: 'flow' | 'comparison' | 'timeline' | 'process' | 'cards';
  data: any;
}

export function VisualLearningSection({ type, data }: VisualProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (type === "flow" && data.steps) {
      const interval = setInterval(() => {
        setActiveStep(prev => (prev < data.steps.length - 1 ? prev + 1 : 0));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [type, data]);

  return (
    <div className="space-y-4 text-center w-full max-w-lg mx-auto">
      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold font-mono mb-4 inline-block">
        Interactive Blueprint
      </span>

      {type === "flow" && data.steps && (
        <div className="flex flex-col items-center gap-4 py-4 w-full">
          {data.steps.map((step: string, idx: number) => {
            const isActive = idx === activeStep;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <svg className="w-4 h-6 text-cyan-500/40 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                <div 
                  className={`px-5 py-3 rounded-xl border text-xs font-bold font-mono transition-all duration-300 w-full max-w-xs ${
                    isActive 
                      ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 scale-[1.03] shadow-md shadow-cyan-500/5" 
                      : "bg-card border-border/10 text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {type === "comparison" && (
        <div className="border border-border/10 rounded-2xl overflow-hidden bg-card/50 text-left mt-2">
          <div className="grid grid-cols-2 bg-muted/40 border-b border-border/10 p-3 font-bold text-xs">
            <div className="text-cyan-400">{data.leftTitle || "System A"}</div>
            <div className="text-purple-400">{data.rightTitle || "System B"}</div>
          </div>
          <div className="divide-y divide-border/10 text-xs">
            {data.comparisonItems?.map((item: any, idx: number) => (
              <div key={idx} className="grid grid-cols-2 p-3 hover:bg-muted/20 transition-all">
                <div>
                  <span className="block text-[10px] text-muted-foreground font-mono mb-0.5">{item.label}</span>
                  <span className="text-foreground/90">{item.left}</span>
                </div>
                <div className="border-l border-border/10 pl-3">
                  <span className="block text-[10px] text-muted-foreground font-mono mb-0.5">{item.label}</span>
                  <span className="text-foreground/90">{item.right}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {type === "timeline" && (
        <div className="space-y-4 text-left py-2">
          {data.timelineItems?.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4 relative group">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[10px] text-cyan-400 font-bold group-hover:border-cyan-400 transition-all">
                  {idx + 1}
                </div>
                {idx < data.timelineItems.length - 1 && (
                  <div className="w-0.5 h-12 bg-border/20 group-hover:bg-cyan-500/30 transition-all" />
                )}
              </div>
              <div className="flex-1 bg-card/30 border border-border/10 rounded-xl p-3">
                <h5 className="text-xs font-bold text-foreground">{item.title}</h5>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {type === "process" && (
        <div className="grid grid-cols-2 gap-3 text-left">
          {data.steps?.map((step: string, idx: number) => (
            <div key={idx} className="bg-card border border-border/10 rounded-xl p-3.5 hover:border-cyan-500/40 hover:scale-[1.01] transition-all">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">Step {idx + 1}</span>
              <p className="text-xs text-foreground font-semibold">{step}</p>
            </div>
          ))}
        </div>
      )}

      {type === "cards" && (
        <div className="grid md:grid-cols-2 gap-4 text-left">
          {data.cardItems?.map((item: any, idx: number) => (
            <div key={idx} className="bg-muted/30 border border-border/10 rounded-2xl p-4 space-y-1.5 hover:border-purple-500/30 transition-all">
              <h5 className="text-xs font-extrabold text-foreground">{item.title}</h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Real-World Example Section ───────────────────────────────────────────────
export function RealWorldExampleSection({ title, description }: SectionProps) {
  return (
    <div className="space-y-4 text-center max-w-lg mx-auto">
      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold font-mono">
        Case Study
      </span>
      <h3 className="text-base font-extrabold text-foreground tracking-tight mt-2">{title}</h3>
      <div className="bg-[#0b0c16] border border-border/10 rounded-2xl p-5 text-left space-y-2 mt-3">
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Quick Activity Section ──────────────────────────────────────────────────
interface ActivityProps {
  question: string;
  options: string[];
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
  isSubmitted: boolean;
  isCorrectAnswer: boolean;
}

export function QuickActivitySection({
  question,
  options,
  selectedIdx,
  onSelect,
  isSubmitted,
  isCorrectAnswer
}: ActivityProps) {
  return (
    <div className="space-y-4 w-full max-w-lg mx-auto text-left">
      <div className="text-center mb-2">
        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold font-mono">
          Interactive Triage
        </span>
      </div>
      <h3 className="text-xs font-bold text-foreground leading-relaxed mt-2 border-b border-border/10 pb-3 mb-3">
        {question}
      </h3>
      <div className="space-y-2.5">
        {options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <div 
              key={idx}
              onClick={() => onSelect(idx)}
              className={`p-3.5 border rounded-2xl text-xs cursor-pointer transition-all duration-200 ${
                isSelected
                  ? isSubmitted
                    ? isCorrectAnswer
                      ? "border-emerald-500 bg-emerald-500/5 text-foreground"
                      : "border-red-500 bg-red-500/5 text-foreground"
                    : "border-cyan-400 bg-cyan-500/5 text-foreground"
                  : "border-border/10 bg-card hover:bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex gap-3 items-center">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono ${
                  isSelected 
                    ? isSubmitted
                      ? isCorrectAnswer
                        ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                        : "border-red-500 text-red-400 bg-red-500/10"
                      : "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                    : "border-border/20 text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-semibold">{opt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Kai Feedback Section ────────────────────────────────────────────────────
interface FeedbackProps {
  feedback: string;
  isCorrect: boolean;
  onTryAgain: () => void;
  onContinue: () => void;
}

export function KaiFeedbackSection({
  feedback,
  isCorrect,
  onTryAgain,
  onContinue
}: FeedbackProps) {
  return (
    <div className="space-y-4 text-center max-w-lg mx-auto">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <HelpCircle size={15} />
        </span>
        <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-black">
          Kai Explains
        </span>
      </div>

      <div className="bg-[#0b0c16] border border-border/10 rounded-3xl p-5 md:p-6 text-left relative space-y-4">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <CheckCircle size={15} /> Correct!
            </span>
          ) : (
            <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
              <AlertCircle size={15} /> Not quite...
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {feedback}
        </p>
      </div>

      <div className="pt-4 flex justify-center gap-3">
        {!isCorrect ? (
          <button
            onClick={onTryAgain}
            className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-cyan-500/10"
          >
            <RotateCcw size={13} /> Try Again
          </button>
        ) : (
          <button
            onClick={onContinue}
            className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-cyan-500/10"
          >
            Proceed <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Bite Completion Section ──────────────────────────────────────────────────
interface CompletionProps {
  title: string;
  xpReward: number;
  isSaving: boolean;
  onClaim: () => void;
}

export function BiteCompletionSection({
  title,
  xpReward,
  isSaving,
  onClaim
}: CompletionProps) {
  return (
    <div className="text-center py-6 space-y-6 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
        <Trophy size={30} className="animate-bounce" />
      </div>
      
      <div className="space-y-2">
        <h4 className="text-lg font-extrabold text-foreground">Bite Complete!</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You completed <strong className="text-cyan-400">{title}</strong>.
        </p>
      </div>

      <div className="bg-cyan-500/5 rounded-2xl p-4 border border-cyan-500/10 text-center max-w-xs mx-auto">
        <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-bold block mb-1">XP Gained</span>
        <span className="text-xl font-mono font-extrabold text-cyan-400">+{xpReward} XP</span>
      </div>

      <div className="pt-4">
        <button
          onClick={onClaim}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 hover:opacity-95 text-black font-extrabold py-3.5 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-cyan-400/20"
        >
          {isSaving ? "Saving..." : "Claim Reward & Continue"}
        </button>
      </div>
    </div>
  );
}
