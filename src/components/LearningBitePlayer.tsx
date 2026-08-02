import React, { useState, useEffect } from "react";
import { 
  X, Zap, BookOpen, Trophy, ArrowRight, ArrowLeft, RotateCcw, 
  CheckCircle, AlertCircle, HelpCircle,
  Eye, Brain, Play as PlayIcon, Sparkles, Check, AlertTriangle, Lock
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
          const sortedBites = [...bites].sort((a, b) => a.orderIndex - b.orderIndex);
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

  if (bites.length === 0) {
    return (
      <div className="bg-[#05050C] border border-border/10 rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-[400px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-4 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-black">
              Empty Activity
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 z-10 gap-3">
          <BookOpen className="text-muted-foreground/30 animate-pulse" size={48} />
          <h4 className="text-sm font-bold text-foreground">No Learning Bites Available</h4>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            No Learning Bites are available for this activity yet.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border/10 pt-4 mt-6 z-10">
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-cyan-500/10"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

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

      const xpEarned = activeBite.xpReward || 20;

      // Check if this bite has already been completed in the database
      const { data: existingBite } = await supabase
        .from("user_bite_progress")
        .select("status")
        .eq("user_id", user.id)
        .eq("bite_id", activeBite.id)
        .maybeSingle();

      const alreadyCompleted = existingBite && existingBite.status === "completed";

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

      // Only award bite XP to profile if this is the first completion
      if (!alreadyCompleted) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("xp")
          .eq("id", user.id)
          .single();
        
        const currentXp = (profileData?.xp || 0) + xpEarned;

        const { error: profError } = await supabase
          .from("profiles")
          .update({ xp: currentXp })
          .eq("id", user.id);

        if (!profError) {
          setProfile((prev: any) => prev ? { ...prev, xp: currentXp } : null);
        }
      }

      // 4. Fetch updated bite progress
      const { data: freshBiteProg } = await supabase
        .from("user_bite_progress")
        .select("*")
        .eq("user_id", user.id);
      if (freshBiteProg) {
        setBiteProgress(freshBiteProg);
      }

      onCompleteBite(activeBite.id, alreadyCompleted ? 0 : xpEarned);

      // Check if all bites for this activity are completed (using timing-safe check)
      const completedBiteIds = new Set([
        ...(freshBiteProg || []).filter((p: any) => p.status === "completed" && Number(p.activity_id) === Number(activityId)).map((p: any) => Number(p.bite_id)),
        Number(activeBite.id)
      ]);
      const allCompleted = bites.every((b) => completedBiteIds.has(Number(b.id)));

      if (allCompleted) {
        const activityXp = Number(activityId) === 111 ? 100 : 50;

        // Check if the activity has already been marked completed
        const { data: existingAct } = await supabase
          .from("user_activity_progress")
          .select("status")
          .eq("user_id", user.id)
          .eq("activity_id", activityId)
          .maybeSingle();

        const actAlreadyCompleted = existingAct && existingAct.status === "completed";
        
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

        // Only award activity bonus XP to profile if this is the first completion
        if (!actAlreadyCompleted) {
          const { data: profileData2 } = await supabase
            .from("profiles")
            .select("xp")
            .eq("id", user.id)
            .single();
          
          const nextXp = (profileData2?.xp || 0) + activityXp;
          const { error: profError2 } = await supabase
            .from("profiles")
            .update({ xp: nextXp })
            .eq("id", user.id);

          if (!profError2) {
            setProfile((prev: any) => prev ? { ...prev, xp: nextXp } : null);
          }
          onAllBitesCompleted(activityXp);
        } else {
          onAllBitesCompleted(0);
        }
        
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

  if (activeBite && Number(activeBite.id) === 1111) {
    return (
      <CustomSinglePagePlayer
        activeBite={activeBite}
        onClose={onClose}
        handleClaimXp={handleClaimXp}
        isSaving={isSaving}
      />
    );
  }

  if (activeBite && Number(activeBite.id) === 1112) {
    return (
      <CustomBite2Player
        activeBite={activeBite}
        onClose={onClose}
        handleClaimXp={handleClaimXp}
        isSaving={isSaving}
      />
    );
  }

  if (activeBite && Number(activeBite.id) === 1113) {
    return (
      <CustomBite3Player
        activeBite={activeBite}
        onClose={onClose}
        handleClaimXp={handleClaimXp}
        isSaving={isSaving}
      />
    );
  }

  if (activeBite && Number(activeBite.id) === 1114) {
    return (
      <CustomBite4Player
        activeBite={activeBite}
        onClose={onClose}
        handleClaimXp={handleClaimXp}
        isSaving={isSaving}
      />
    );
  }

  if (activeBite && Number(activeBite.stageId || activeBite.stage_id) === 102) {
    return (
      <CustomLockedStage2Player
        activeBite={activeBite}
        onClose={onClose}
      />
    );
  }

  if (activeBite && Number(activeBite.stageId || activeBite.stage_id) === 103) {
    return (
      <CustomLockedStage3Player
        activeBite={activeBite}
        onClose={onClose}
      />
    );
  }

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
            xpReward={activeBite.xpReward}
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

// ─── Custom Single Page Player for Bite 1111 ───────────────────────────────────
interface CustomSinglePagePlayerProps {
  activeBite: any;
  onClose: () => void;
  handleClaimXp: () => void;
  isSaving: boolean;
}

export function CustomSinglePagePlayer({
  activeBite,
  onClose,
  handleClaimXp,
  isSaving
}: CustomSinglePagePlayerProps) {
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null
  });
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false
  });

  const mcqs = [
    {
      id: 1,
      question: "1. What is the primary role of an AI Agent's 'Brain'?",
      options: [
        "To store visual images of code files.",
        "To reason through logical steps and formulate a plan of actions.",
        "To connect directly to the hardware computer screens.",
        "To run simple if-else regex patterns."
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "2. Which of the following is an example of an agent's 'Perception' sensing the environment?",
      options: [
        "Executing an SQL command to delete rows.",
        "An agent receiving a database alert callback webhook.",
        "The agent sending an email to human customers.",
        "Printing logs to the console log stream."
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "3. What is a major difference between traditional automated programs and Agentic AI?",
      options: [
        "Traditional programs adapt to novel failures dynamically.",
        "Agentic AI generates dynamic task planning paths and adapts to tool exceptions.",
        "Traditional programs use natural language models.",
        "Agentic AI runs only on offline machines."
      ],
      correctAnswer: 1
    }
  ];

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (quizChecked && quizCorrect[qId]) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleCheckAnswers = () => {
    const c1 = quizAnswers[1] === mcqs[0].correctAnswer;
    const c2 = quizAnswers[2] === mcqs[1].correctAnswer;
    const c3 = quizAnswers[3] === mcqs[2].correctAnswer;
    setQuizCorrect({ 1: c1, 2: c2, 3: c3 });
    setQuizChecked(true);
  };

  const allCorrect = quizCorrect[1] && quizCorrect[2] && quizCorrect[3];

  return (
    <div className="bg-[#05050C] border border-border/10 rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between max-h-[85vh]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
            <Zap size={14} className="fill-cyan-400 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-black block">
              Learning Bite Player &bull; 1 of 4
            </span>
            <h4 className="text-xs font-bold text-foreground mt-0.5">{activeBite.title}</h4>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <X size={18} />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 my-4 z-10 text-left">
        
        {/* Objectives Panel */}
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 block mb-1">Learning Objective</span>
          <p className="text-xs text-foreground font-semibold">Explain what an AI Agent is.</p>
        </div>

        {/* Concept Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" /> Concept Introduction
          </h3>
          <div className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
            <p>
              At its core, an <strong>AI Agent</strong> is an autonomous system powered by a large language model that acts as its cognitive engine. Unlike traditional chatbots that simply answer questions, an agent is designed to achieve high-level goals by planning its own actions, observing the consequences, and self-correcting along the way.
            </p>
            <p>
              Agents operate in an environment by receiving signals (perception), evaluating options (reasoning), and executing decisions through API calls, databases, and scripts (actions). This continuous loop of feedback allows them to handle complex, multi-step tasks without needing human prompts at every step.
            </p>
            <p>
              By integrating memory and external tool access, agents transition from text assistants to proactive digital workers. They can automate repetitive processes, coordinate with other software nodes, and adapt to changing system environments.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3.5 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2">
                <Eye size={16} />
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">Perceives</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                The agent senses its environment by reading databases, monitoring system metrics, or parsing incoming emails and webhooks.
              </p>
            </div>
            
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3.5 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
                <Brain size={16} />
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">Reasons</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                The central LLM brain reviews the perceived state, references its memory of past actions, and formulates a step-by-step logic path.
              </p>
            </div>
            
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3.5 flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 mb-2">
                <PlayIcon size={14} className="fill-pink-400/20" />
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">Acts</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                The agent calls tools (such as database writers, external API keys, or web browsers) to execute its decided actions.
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise Example Section */}
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 block mb-1">Enterprise Workplace Example</span>
          <h4 className="text-xs font-bold text-foreground mb-1.5">Automated Refund & Discrepancy Manager</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An agent monitors the finance inbox. When it receives a customer billing dispute, it queries the Stripe API for the transaction ID, checks the internal ship ledger, resolves whether the customer was double-charged, processes the refund transaction autonomously, and posts a Slack notification to the finance channel for auditing records.
          </p>
        </div>

        {/* Key Takeaways */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-foreground">Key Takeaways</h3>
          <ul className="space-y-2 text-xs text-muted-foreground list-none">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>Goal-Driven Autonomy:</strong> Agents work toward high-level objectives rather than answering single prompt inputs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>Tool Integration:</strong> They extend LLM capability by executing code, calling APIs, and updating records.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>Feedback Loops:</strong> Agents continuously inspect tool outputs to verify correctness before proceeding.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>Cognitive Brain:</strong> The model acts as the router and planner, replacing nested hardcoded logical blocks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>Graceful Error Detours:</strong> Agents can handle network or tool failure logs by planning alternative paths.</span>
            </li>
          </ul>
        </div>

        {/* Quick Quiz Section */}
        <div className="space-y-4 border-t border-white/5 pt-5">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-foreground">Quick Quiz (Answer 3 Questions)</h3>
          </div>

          <div className="space-y-5">
            {mcqs.map((q) => {
              const isCorrect = quizCorrect[q.id];
              return (
                <div key={q.id} className="space-y-2 bg-white/[0.005] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-foreground leading-relaxed">{q.question}</h4>
                    {quizChecked && (
                      isCorrect ? (
                        <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1"><Check size={12} /> Correct</span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-extrabold flex items-center gap-1"><AlertTriangle size={12} /> Try Again</span>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={`text-left text-xs p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 font-medium"
                              : "bg-muted/10 border-border/10 hover:border-border/30 text-muted-foreground"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!allCorrect && (
            <button
              onClick={handleCheckAnswers}
              disabled={quizAnswers[1] === null || quizAnswers[2] === null || quizAnswers[3] === null}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                quizAnswers[1] !== null && quizAnswers[2] !== null && quizAnswers[3] !== null
                  ? "bg-cyan-400 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-400/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Verify Answers
            </button>
          )}
        </div>
      </div>

      {/* Footer / Completion Button */}
      <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-between z-10">
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-muted-foreground font-semibold">Reward</span>
          <span className="text-xs font-mono font-bold text-cyan-400">⚡ 50 XP</span>
        </div>

        {allCorrect ? (
          <button
            onClick={handleClaimXp}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#FF2B8A] to-[#7C3AED] hover:opacity-95 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-1.5"
          >
            {isSaving ? "Completing..." : "Complete Lesson"} <ArrowRight size={13} />
          </button>
        ) : (
          <button
            disabled
            className="bg-muted text-muted-foreground/50 cursor-not-allowed font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5"
          >
            Complete Lesson <Lock size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Custom Single Page Player for Bite 1112 ───────────────────────────────────
interface CustomBite2PlayerProps {
  activeBite: any;
  onClose: () => void;
  handleClaimXp: () => void;
  isSaving: boolean;
}

export function CustomBite2Player({
  activeBite,
  onClose,
  handleClaimXp,
  isSaving
}: CustomBite2PlayerProps) {
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null
  });
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false
  });

  const mcqs = [
    {
      id: 1,
      question: "1. Which component acts as the cognitive engine for decision making and planning?",
      options: [
        "Sensors",
        "Brain (LLM)",
        "Tools",
        "Memory"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "2. If an agent recalls a customer's preference from an interaction two weeks ago, which component is it utilizing?",
      options: [
        "Sensors",
        "Brain",
        "Tools",
        "Memory (Long-term)"
      ],
      correctAnswer: 3
    },
    {
      id: 3,
      question: "3. What is the primary role of 'Sensors' in an AI agent system?",
      options: [
        "To run code functions in the console.",
        "To parse environment signals and load states into the context.",
        "To decrease total token sizes.",
        "To delete database files."
      ],
      correctAnswer: 1
    }
  ];

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (quizChecked && quizCorrect[qId]) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleCheckAnswers = () => {
    const c1 = quizAnswers[1] === mcqs[0].correctAnswer;
    const c2 = quizAnswers[2] === mcqs[1].correctAnswer;
    const c3 = quizAnswers[3] === mcqs[2].correctAnswer;
    setQuizCorrect({ 1: c1, 2: c2, 3: c3 });
    setQuizChecked(true);
  };

  const allCorrect = quizCorrect[1] && quizCorrect[2] && quizCorrect[3];

  return (
    <div className="bg-[#05050C] border border-border/10 rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between max-h-[85vh]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
            <Zap size={14} className="fill-cyan-400 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-black block">
              Learning Bite Player &bull; 2 of 4
            </span>
            <h4 className="text-xs font-bold text-foreground mt-0.5">{activeBite.title}</h4>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <X size={18} />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 my-4 z-10 text-left">
        
        {/* Objectives Panel */}
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 block mb-1">Learning Objective</span>
          <p className="text-xs text-foreground font-semibold">Identify and describe the four core components of an AI Agent: Senses, Brain, Hands, and Memory.</p>
        </div>

        {/* Concept Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" /> Core Concepts
          </h3>
          <div className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
            <p>
              An autonomous AI Agent is not a single piece of code; rather, it is a dynamic system built by coupling four distinct component layers: <strong>Senses (Perception)</strong>, the <strong>Brain (LLM)</strong>, <strong>Hands (Action Tools)</strong>, and <strong>Memory (Context)</strong>.
            </p>
            <p>
              Each layer serves a unique role. Senses read inputs from the active environment. The Brain translates these signals using context templates to form plans. The Hands run functions that edit external databases, and the Memory queries files and histories to build a continuous learning thread.
            </p>
          </div>
        </div>

        {/* Visual Explanation Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Visual Explanation</h3>
          <div className="overflow-x-auto border border-white/5 rounded-2xl bg-white/[0.005]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="p-3 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Component</th>
                  <th className="p-3 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Role</th>
                  <th className="p-3 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Software Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-muted-foreground">
                <tr>
                  <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                    <span className="text-cyan-400">👀</span> Senses
                  </td>
                  <td className="p-3">Reads inputs and metrics</td>
                  <td className="p-3 font-mono text-[10px]">webhook_receivers, log_monitors</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-foreground">
                    <span className="text-purple-400">🧠</span> Brain
                  </td>
                  <td className="p-3">Plans logic steps and detours</td>
                  <td className="p-3 font-mono text-[10px]">LLMs (Gemini, Claude)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-foreground">
                    <span className="text-pink-400">🛠️</span> Hands
                  </td>
                  <td className="p-3">Executes tasks in the env</td>
                  <td className="p-3 font-mono text-[10px]">stripe_apis, sql_writers, send_slack()</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-foreground">
                    <span className="text-amber-400">💾</span> Memory
                  </td>
                  <td className="p-3">Recalls history and context</td>
                  <td className="p-3 font-mono text-[10px]">vector_dbs, session_cookies</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Real World Example Section */}
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 block mb-1">Real-World Case Study</span>
          <h4 className="text-xs font-bold text-foreground mb-1.5">Automated Customer Care Specialist</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An incoming complaint email triggers the agent. The <strong>Sensors (Senses)</strong> read and parse the text content. The <strong>Brain</strong> decides the ticket requires checking order histories. It queries the database using its database query <strong>Tool (Hands)</strong> and recalls past return policies from its documentation <strong>Memory</strong>. Finally, the Brain drafts the response email and updates the ticket status to resolved.
          </p>
        </div>

        {/* Key Takeaways */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-foreground">Key Takeaways</h3>
          <ul className="space-y-2 text-xs text-muted-foreground list-none">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>The Senses (Sensors)</strong> act as the entry point that reads system state and triggers agent loops.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>The Brain (LLM)</strong> functions as the supervisor engine that decides planning paths.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>The Hands (Tools)</strong> represent the interface wrappers (databases, scripts, webhooks) that alter the external system.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>Short-Term Memory</strong> maintains the active conversation context window to prevent repetition.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 pt-0.5">&bull;</span>
              <span><strong>Long-Term Memory</strong> uses vector representations to query thousands of document files semantically on demand.</span>
            </li>
          </ul>
        </div>

        {/* Quick Quiz Section */}
        <div className="space-y-4 border-t border-white/5 pt-5">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-foreground">Quick Quiz (Answer 3 Questions)</h3>
          </div>

          <div className="space-y-5">
            {mcqs.map((q) => {
              const isCorrect = quizCorrect[q.id];
              return (
                <div key={q.id} className="space-y-2 bg-white/[0.005] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-foreground leading-relaxed">{q.question}</h4>
                    {quizChecked && (
                      isCorrect ? (
                        <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1"><Check size={12} /> Correct</span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-extrabold flex items-center gap-1"><AlertTriangle size={12} /> Try Again</span>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={`text-left text-xs p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 font-medium"
                              : "bg-muted/10 border-border/10 hover:border-border/30 text-muted-foreground"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!allCorrect && (
            <button
              onClick={handleCheckAnswers}
              disabled={quizAnswers[1] === null || quizAnswers[2] === null || quizAnswers[3] === null}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                quizAnswers[1] !== null && quizAnswers[2] !== null && quizAnswers[3] !== null
                  ? "bg-cyan-400 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-400/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Verify Answers
            </button>
          )}
        </div>
      </div>

      {/* Footer / Completion Button */}
      <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-between z-10">
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-muted-foreground font-semibold">Reward</span>
          <span className="text-xs font-mono font-bold text-cyan-400">⚡ 50 XP</span>
        </div>

        {allCorrect ? (
          <button
            onClick={handleClaimXp}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#FF2B8A] to-[#7C3AED] hover:opacity-95 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-1.5"
          >
            {isSaving ? "Completing..." : "Complete Lesson"} <ArrowRight size={13} />
          </button>
        ) : (
          <button
            disabled
            className="bg-muted text-muted-foreground/50 cursor-not-allowed font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5"
          >
            Complete Lesson <Lock size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Custom Single Page Player for Bite 1113 ───────────────────────────────────
interface CustomBite3PlayerProps {
  activeBite: any;
  onClose: () => void;
  handleClaimXp: () => void;
  isSaving: boolean;
}

export function CustomBite3Player({
  activeBite,
  onClose,
  handleClaimXp,
  isSaving
}: CustomBite3PlayerProps) {
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null
  });
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false
  });

  const mcqs = [
    {
      id: 1,
      question: "1. What is the first stage of the Agent Lifecycle where information is collected?",
      options: [
        "Action",
        "Perception",
        "Feedback",
        "Planning"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "2. Which stage involves decomposing a large objective into smaller milestones before taking action?",
      options: [
        "Perception",
        "Reasoning",
        "Planning",
        "Action"
      ],
      correctAnswer: 2
    },
    {
      id: 3,
      question: "3. Why is the 'Feedback' stage critical to the agent loop lifecycle?",
      options: [
        "It increases total database size.",
        "It allows the agent to observe action outcomes and plan detours if a tool fails.",
        "It deletes past history records.",
        "It disables tool calls."
      ],
      correctAnswer: 1
    }
  ];

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (quizChecked && quizCorrect[qId]) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleCheckAnswers = () => {
    const c1 = quizAnswers[1] === mcqs[0].correctAnswer;
    const c2 = quizAnswers[2] === mcqs[1].correctAnswer;
    const c3 = quizAnswers[3] === mcqs[2].correctAnswer;
    setQuizCorrect({ 1: c1, 2: c2, 3: c3 });
    setQuizChecked(true);
  };

  const allCorrect = quizCorrect[1] && quizCorrect[2] && quizCorrect[3];

  return (
    <div className="bg-[#05050C] border border-border/10 rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between max-h-[85vh]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
            <Zap size={14} className="fill-cyan-400 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-black block">
              Learning Bite Player &bull; 3 of 4
            </span>
            <h4 className="text-xs font-bold text-foreground mt-0.5">{activeBite.title}</h4>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <X size={18} />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 my-4 z-10 text-left">
        
        {/* Objectives Panel */}
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 block mb-1">Learning Objective</span>
          <p className="text-xs text-foreground font-semibold">Understand the five sequential phases of the AI Agent Lifecycle: Perception, Reasoning, Planning, Action, and Feedback.</p>
        </div>

        {/* Concept Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" /> The Loop Mechanism
          </h3>
          <div className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
            <p>
              An AI Agent operates not as a static script but inside a continuous execution loop called the **Agent Lifecycle**. This loop runs sequentially, allowing the agent to continuously check the system state, re-evaluate its plan, call APIs, and check outputs.
            </p>
            <p>
              By structuring execution into five standard phases, agents maintain robust progress alignment towards their final objectives, handling unexpected environment detours autonomously.
            </p>
          </div>
        </div>

        {/* Visual Step-by-Step Flow */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Step-by-Step Visual Flow</h3>
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">1</div>
              <div>
                <h4 className="text-xs font-bold text-foreground mb-0.5">Perception</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The agent scans environmental states, queries system databases, reads files, or intercepts webhook request callbacks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">2</div>
              <div>
                <h4 className="text-xs font-bold text-foreground mb-0.5">Reasoning</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The LLM brain evaluates the gathered input state parameters against the high-level goals and checks constraints.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">3</div>
              <div>
                <h4 className="text-xs font-bold text-foreground mb-0.5">Planning</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The model decomposes the complex objective into a series of smaller, sequential sub-tasks or tool calls.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">4</div>
              <div>
                <h4 className="text-xs font-bold text-foreground mb-0.5">Action</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The agent fires decided tools (e.g. database writers, file creators, email dispatchers) to interact with the environment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-3.5">
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">5</div>
              <div>
                <h4 className="text-xs font-bold text-foreground mb-0.5">Feedback</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The agent observes the result of the tool run, processes errors or exceptions, and returns to Step 1 to continue.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workplace Example Section */}
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 block mb-1">Workplace Example</span>
          <h4 className="text-xs font-bold text-foreground mb-1.5">Automated Fleet Dispatch Agent</h4>
          <div className="text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
            <p>
              <strong>1. Perception:</strong> GPS sensors alert the dispatch coordinator agent that an active delivery cargo vehicle has broken down on Route 4.
            </p>
            <p>
              <strong>2. Reasoning:</strong> The brain calculates that if left unchecked, the shipment SLA will fail. It decides cargo must be transferred.
            </p>
            <p>
              <strong>3. Planning:</strong> The agent designs a plan: Find closest standby vehicle, request a cargo swap ticket, and notify customer of delay.
            </p>
            <p>
              <strong>4. Action:</strong> The agent invokes dispatch APIs to register standby Carrier B to Route 4.
            </p>
            <p>
              <strong>5. Feedback:</strong> The API returns confirmation. The agent monitors the standby carrier's GPS sensor to confirm the detour is resolved.
            </p>
          </div>
        </div>

        {/* Quick Quiz Section */}
        <div className="space-y-4 border-t border-white/5 pt-5">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-foreground">Quick Quiz (Answer 3 Questions)</h3>
          </div>

          <div className="space-y-5">
            {mcqs.map((q) => {
              const isCorrect = quizCorrect[q.id];
              return (
                <div key={q.id} className="space-y-2 bg-white/[0.005] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-foreground leading-relaxed">{q.question}</h4>
                    {quizChecked && (
                      isCorrect ? (
                        <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1"><Check size={12} /> Correct</span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-extrabold flex items-center gap-1"><AlertTriangle size={12} /> Try Again</span>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={`text-left text-xs p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 font-medium"
                              : "bg-muted/10 border-border/10 hover:border-border/30 text-muted-foreground"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!allCorrect && (
            <button
              onClick={handleCheckAnswers}
              disabled={quizAnswers[1] === null || quizAnswers[2] === null || quizAnswers[3] === null}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                quizAnswers[1] !== null && quizAnswers[2] !== null && quizAnswers[3] !== null
                  ? "bg-cyan-400 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-400/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Verify Answers
            </button>
          )}
        </div>
      </div>

      {/* Footer / Completion Button */}
      <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-between z-10">
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-muted-foreground font-semibold">Reward</span>
          <span className="text-xs font-mono font-bold text-cyan-400">⚡ 50 XP</span>
        </div>

        {allCorrect ? (
          <button
            onClick={handleClaimXp}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#FF2B8A] to-[#7C3AED] hover:opacity-95 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-1.5"
          >
            {isSaving ? "Completing..." : "Complete Lesson"} <ArrowRight size={13} />
          </button>
        ) : (
          <button
            disabled
            className="bg-muted text-muted-foreground/50 cursor-not-allowed font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5"
          >
            Complete Lesson <Lock size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Custom Single Page Player for Bite 1114 ───────────────────────────────────
interface CustomBite4PlayerProps {
  activeBite: any;
  onClose: () => void;
  handleClaimXp: () => void;
  isSaving: boolean;
}

export function CustomBite4Player({
  activeBite,
  onClose,
  handleClaimXp,
  isSaving
}: CustomBite4PlayerProps) {
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null
  });
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false
  });

  const mcqs = [
    {
      id: 1,
      question: "1. What is a defining characteristic of Agentic AI compared to Traditional AI?",
      options: [
        "It uses faster local cache memories.",
        "It dynamically plans execution paths and self-corrects based on feedback observations.",
        "It relies on fixed, hardcoded decision trees.",
        "It does not require neural network compute."
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "2. Which task is best suited for Traditional AI rather than Agentic AI?",
      options: [
        "Running a multi-agent coding sweep to fix code files.",
        "Classifying incoming customer emails as 'Billing' or 'Technical' based on static rules.",
        "Monitoring ship routes and rerouting carriers autonomously around bad weather detours.",
        "Conducting a comprehensive financial ledger audit across systems."
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      question: "3. What happens when an Agentic AI system encounters an unexpected error from an API tool?",
      options: [
        "It crashes and terminates the environment.",
        "It parses the error feedback as an observation to plan a recovery detour.",
        "It deletes database records.",
        "It alerts the browser to redirect externally."
      ],
      correctAnswer: 1
    }
  ];

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (quizChecked && quizCorrect[qId]) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleCheckAnswers = () => {
    const c1 = quizAnswers[1] === mcqs[0].correctAnswer;
    const c2 = quizAnswers[2] === mcqs[1].correctAnswer;
    const c3 = quizAnswers[3] === mcqs[2].correctAnswer;
    setQuizCorrect({ 1: c1, 2: c2, 3: c3 });
    setQuizChecked(true);
  };

  const allCorrect = quizCorrect[1] && quizCorrect[2] && quizCorrect[3];

  return (
    <div className="bg-[#05050C] border border-border/10 rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between max-h-[85vh]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
            <Zap size={14} className="fill-cyan-400 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-black block">
              Learning Bite Player &bull; 4 of 4
            </span>
            <h4 className="text-xs font-bold text-foreground mt-0.5">{activeBite.title}</h4>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <X size={18} />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 my-4 z-10 text-left">
        
        {/* Objectives Panel */}
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 block mb-1">Learning Objective</span>
          <p className="text-xs text-foreground font-semibold">Contrast rule-based automation with cognitive planning capabilities in Agentic AI.</p>
        </div>

        {/* Concept Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" /> Paradigm Comparison
          </h3>
          <div className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
            <p>
              Traditional AI is built around rigid boundaries: statistical classification models, keyword search heuristics, or nested hardcoded if-else trees. While highly efficient for structured outputs, they break down completely when presented with formatting anomalies or unexpected tool errors.
            </p>
            <p>
              Agentic AI shifts the paradigm by utilizing LLMs to formulate dynamic planning paths. This allows software agents to run tool loops, evaluate unexpected observations, self-reflect on discrepancies, and compile alternatives dynamically.
            </p>
          </div>
        </div>

        {/* Comparison Cards Layout */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Traditional vs Agentic AI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Traditional Card */}
            <div className="bg-white/[0.005] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-sm">⚙️</span>
                <h4 className="text-xs font-bold text-foreground">Traditional AI</h4>
              </div>
              <div className="space-y-2 text-[10px] text-muted-foreground leading-relaxed">
                <p><strong>System Role:</strong> Runs fixed scripts, automated regex patterns, or static classification limits.</p>
                <p><strong>Advantages:</strong> Predictable, low latency, low computation costs, high output throughput.</p>
                <p><strong>Use Cases:</strong> SPAM filters, document classification index lists, numeric data parsing.</p>
                <p><strong>Enterprise Application:</strong> Simple alert pipelines when sales CRM fields are modified.</p>
              </div>
            </div>

            {/* Agentic Card */}
            <div className="bg-cyan-500/[0.02] border border-cyan-500/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-2">
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                <h4 className="text-xs font-bold text-cyan-400">Agentic AI</h4>
              </div>
              <div className="space-y-2 text-[10px] text-muted-foreground leading-relaxed">
                <p><strong>System Role:</strong> Runs goal planners, autonomous tool loops, and self-reflection checking paths.</p>
                <p><strong>Advantages:</strong> Adapts to novel errors, writes SQL/code on the fly, tolerates format shifts.</p>
                <p><strong>Use Cases:</strong> Developer coding swarms, shipping logistics route handlers, invoice auditing bots.</p>
                <p><strong>Enterprise Application:</strong> Customer refunds manager connecting Stripes, logs, and databases.</p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Quick Quiz Section */}
        <div className="space-y-4 border-t border-white/5 pt-5">
          <div className="flex items-center gap-2">
            <HelpCircle size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-foreground">Quick Quiz (Answer 3 Questions)</h3>
          </div>

          <div className="space-y-5">
            {mcqs.map((q) => {
              const isCorrect = quizCorrect[q.id];
              return (
                <div key={q.id} className="space-y-2 bg-white/[0.005] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-foreground leading-relaxed">{q.question}</h4>
                    {quizChecked && (
                      isCorrect ? (
                        <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1"><Check size={12} /> Correct</span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-extrabold flex items-center gap-1"><AlertTriangle size={12} /> Try Again</span>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={`text-left text-xs p-3 rounded-xl border transition-all duration-200 ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 font-medium"
                              : "bg-muted/10 border-border/10 hover:border-border/30 text-muted-foreground"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!allCorrect && (
            <button
              onClick={handleCheckAnswers}
              disabled={quizAnswers[1] === null || quizAnswers[2] === null || quizAnswers[3] === null}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                quizAnswers[1] !== null && quizAnswers[2] !== null && quizAnswers[3] !== null
                  ? "bg-cyan-400 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-400/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Verify Answers
            </button>
          )}
        </div>
      </div>

      {/* Footer / Completion Button */}
      <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-between z-10">
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-muted-foreground font-semibold">Reward</span>
          <span className="text-xs font-mono font-bold text-cyan-400">⚡ 50 XP</span>
        </div>

        {allCorrect ? (
          <button
            onClick={handleClaimXp}
            disabled={isSaving}
            className="bg-gradient-to-r from-emerald-400 to-cyan-500 hover:opacity-95 text-black font-extrabold px-6 py-3 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-cyan-400/20 flex items-center gap-1.5"
          >
            {isSaving ? "Completing..." : "Complete Lesson"} <ArrowRight size={13} />
          </button>
        ) : (
          <button
            disabled
            className="bg-muted text-muted-foreground/50 cursor-not-allowed font-extrabold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5"
          >
            Complete Lesson <Lock size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Custom Player for Stage 2 (Reasoning & Planning) ─────────────────────────
interface CustomLockedStage2PlayerProps {
  activeBite: any;
  onClose: () => void;
}

export function CustomLockedStage2Player({
  activeBite,
  onClose
}: CustomLockedStage2PlayerProps) {
  const stage2Bites = [
    { id: 1121, title: "1. Introduction to Planning" },
    { id: 1122, title: "2. Chain-of-Thought Reasoning" },
    { id: 1123, title: "3. Self-Reflection & Correction" },
    { id: 1124, title: "4. Tree of Thoughts Planning" }
  ];

  return (
    <div className="bg-[#05050C] border border-border/10 rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-[500px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
            <Lock size={14} className="text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-black block">
              Stage 2 &bull; Reasoning & Planning
            </span>
            <h4 className="text-xs font-bold text-foreground mt-0.5">{activeBite.title}</h4>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 my-6 z-10">
        <div className="w-16 h-16 rounded-full bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/5">
          <Lock size={28} className="animate-pulse" />
        </div>
        
        <div className="space-y-2 max-w-md">
          <h3 className="text-sm font-bold text-foreground">Content Locked</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This learning bite is part of <strong className="text-cyan-400">Stage 2: Reasoning & Planning</strong>.
          </p>
          <div className="inline-block bg-cyan-500/5 border border-cyan-500/10 rounded-xl px-4 py-2 mt-2">
            <span className="text-xs font-semibold text-cyan-400">
              Available after completing Stage 1.
            </span>
          </div>
        </div>

        {/* Outline of the 4 bites */}
        <div className="w-full max-w-sm bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-2.5 text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
            Stage 2 Roadmap Outline (4 Bites)
          </span>
          {stage2Bites.map((b) => (
            <div key={b.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.02] last:border-0 opacity-60">
              <span className="text-muted-foreground font-medium">{b.title}</span>
              <Lock size={12} className="text-muted-foreground/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-end z-10">
        <button
          onClick={onClose}
          className="bg-muted text-foreground font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-muted/80 transition-all active:scale-95"
        >
          Back to Roadmap
        </button>
      </div>
    </div>
  );
}

// ─── Custom Player for Stage 3 (Multi-Agent Collaboration) ────────────────────
interface CustomLockedStage3PlayerProps {
  activeBite: any;
  onClose: () => void;
}

export function CustomLockedStage3Player({
  activeBite,
  onClose
}: CustomLockedStage3PlayerProps) {
  const stage3Bites = [
    { id: 1131, title: "1. Introduction to Multi-Agent Systems" },
    { id: 1132, title: "2. Supervisor and Worker Routing" },
    { id: 1133, title: "3. Collaborative Swarms" },
    { id: 1134, title: "4. Conflict Resolution Consensus" }
  ];

  return (
    <div className="bg-[#05050C] border border-border/10 rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-[500px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">
            <Lock size={14} className="text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono font-black block">
              Stage 3 &bull; Multi-Agent Collaboration
            </span>
            <h4 className="text-xs font-bold text-foreground mt-0.5">{activeBite.title}</h4>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 my-6 z-10">
        <div className="w-16 h-16 rounded-full bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/5">
          <Sparkles size={28} className="text-purple-400 animate-pulse" />
        </div>
        
        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-black text-purple-400 tracking-tight">Coming Soon</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This module is currently under active development.
          </p>
          <div className="inline-block bg-purple-500/5 border border-purple-500/10 rounded-xl px-4 py-2 mt-2">
            <span className="text-xs font-semibold text-purple-400">
              Available after Stage 2.
            </span>
          </div>
        </div>

        {/* Outline of the 4 bites */}
        <div className="w-full max-w-sm bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-2.5 text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
            Stage 3 Roadmap Outline (4 Bites)
          </span>
          {stage3Bites.map((b) => (
            <div key={b.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.02] last:border-0 opacity-60">
              <span className="text-muted-foreground font-medium">{b.title}</span>
              <Lock size={12} className="text-muted-foreground/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-end z-10">
        <button
          onClick={onClose}
          className="bg-muted text-foreground font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-muted/80 transition-all active:scale-95"
        >
          Back to Roadmap
        </button>
      </div>
    </div>
  );
}
