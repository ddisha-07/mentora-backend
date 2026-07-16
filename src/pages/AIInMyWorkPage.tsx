import React, { useState } from 'react';
import {
  Sparkles, ShieldCheck, Cpu, Play, CheckCircle, RefreshCw, BarChart2,
  FileText, Activity, AlertTriangle, BookOpen, MessageSquare, Layers, HelpCircle, Bookmark
} from 'lucide-react';
import { useApp } from '../../App';
import { Card } from '../components/reusable';

interface UseCase {
  id: string;
  title: string;
  shortDesc: string;
  whatIsIt: string;
  whyUseful: string;
  howApplies: string;
  realWorldExample: string;
  relatedSOPs: string[];
  recommendedCourses: string[];
  simulationType: 'vibration' | 'loto' | 'purity';
}

export default function AIInMyWorkPage() {
  const { profile, setPage, savedItems, setSavedItems } = useApp();

  const handleToggleBookmark = (uc: UseCase) => {
    const isSaved = (savedItems || []).some(x => x.id === uc.id && x.type === 'ai_usecase');
    if (isSaved) {
      setSavedItems(prev => prev.filter(x => !(x.id === uc.id && x.type === 'ai_usecase')));
    } else {
      setSavedItems(prev => [
        ...prev,
        {
          id: uc.id,
          type: 'ai_usecase',
          title: uc.title,
          desc: uc.shortDesc,
          category: 'AI Use Cases',
          page: 'ai-in-my-work'
        }
      ]);
    }
  };

  const isBookmarked = (uc: UseCase) => {
    return (savedItems || []).some(x => x.id === uc.id && x.type === 'ai_usecase');
  };

  const activeProfile = profile || {
    name: 'Learner',
    role: 'JUNIOR_EMPLOYEE',
    department: 'Maintenance'
  };

  const userDept = activeProfile.department || 'Maintenance';

  // State to support selecting different departments manually for testing/grading
  const [selectedDept, setSelectedDept] = useState<string>(userDept);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);

  // Simulation states
  const [vibrationVal, setVibrationVal] = useState(65);
  const [hasHelmet, setHasHelmet] = useState(true);
  const [breakerIsolated, setBreakerIsolated] = useState(false);
  const [purityVal, setPurityVal] = useState(96);
  const [simOutput, setSimOutput] = useState<string>('Adjust variables to trigger real-time AI modeling...');

  const DEPARTMENTS = [
    'Maintenance',
    'Manufacturing',
    'Safety',
    'Quality Control',
    'Supply Chain',
    'Human Resources',
    'Finance'
  ];

  const USE_CASES_BY_DEPT: Record<string, UseCase[]> = {
    Maintenance: [
      {
        id: 'pred_maint',
        title: 'Predictive Maintenance Engine',
        shortDesc: 'Analyzes motor vibration telemetry to schedule repairs before failures occur.',
        whatIsIt: 'An AI engine training on structural vibration and thermal logs of rotating assets.',
        whyUseful: 'Reduces unplanned downtime by 35% and extends bearing lifespans.',
        howApplies: 'Integrates directly with Modbus telemetry streams on Boiler and Pump housings.',
        realWorldExample: 'Jamshedpur Turbine Room avoided a major rotor shaft snap in Q1 22 using vibration warning spikes.',
        relatedSOPs: ['SOP-302: Turbine Maintenance Schedule', 'SOP-14: Mechanical Safety Releases'],
        recommendedCourses: ['Basics of Vibration Analytics', 'IIoT Modbus Telemetry Integrations'],
        simulationType: 'vibration'
      },
      {
        id: 'sensor_anomaly',
        title: 'Sensor Anomaly Detector',
        shortDesc: 'Identifies faulty thermocouple readings vs actual high-temperature spikes.',
        whatIsIt: 'Unsupervised ML clustering that tags anomalous sensor outputs compared to historical plant envelopes.',
        whyUseful: 'Prevents false alarms and avoids emergency shutdowns due to broken cables.',
        howApplies: 'Monitors thermocouple sensor registers in steam tubes.',
        realWorldExample: 'Prevented a full plant trip when sensor TT-104 failed open at 999C while surrounding sensors remained normal.',
        relatedSOPs: ['SOP-104: Sensor Calibration Protocols'],
        recommendedCourses: ['Unsupervised Clustering for Engineering'],
        simulationType: 'vibration'
      }
    ],
    Manufacturing: [
      {
        id: 'cv_inspection',
        title: 'Computer Vision Defect Scan',
        shortDesc: 'Inspects welds and rivet joints on the assembly line using neural networks.',
        whatIsIt: 'A YOLO-based vision model that scans conveyor components under high speed strobe lights.',
        whyUseful: 'Catches hairline fractures invisible to the human eye at 120 parts per minute.',
        howApplies: 'Analyzes frames from high-resolution overhead digital cameras.',
        realWorldExample: 'Pune Chassis assembly line decreased customer defect claims by 90% since deployment.',
        relatedSOPs: ['SOP-22: Visual Inspection Checks'],
        recommendedCourses: ['Convolutional Neural Networks in Quality Control'],
        simulationType: 'purity'
      }
    ],
    Safety: [
      {
        id: 'safety_analytics',
        title: 'Workplace Safety Compliance Guard',
        shortDesc: 'Monitors thermal imaging feeds to ensure PPE compliance and lockout safety.',
        whatIsIt: 'Object detection models trained on helmets, high-vis vests, and breaker toggle tags.',
        whyUseful: 'Guarantees 100% compliance in high-risk zones, automatically generating warnings.',
        howApplies: 'Examines IP camera feeds surrounding high pressure valves.',
        realWorldExample: 'Automatically flagged an un-isolated breaker panel before a technician began override procedures.',
        relatedSOPs: ['SOP-14.2: Lockout/Tagout overrides'],
        recommendedCourses: ['Industrial Hazards & Workplace Safety Management'],
        simulationType: 'loto'
      }
    ],
    'Quality Control': [
      {
        id: 'quality_pred',
        title: 'Chemical Purity Prediction Model',
        shortDesc: 'Predicts final batch density and tensile strength before the cooling cycle.',
        whatIsIt: 'Regression forests modeling heat logs, pressure sequences, and raw material purity inputs.',
        whyUseful: 'Saves batches by advising corrective chemical adjusters mid-run.',
        howApplies: 'Processes logs from raw hopper flow sensors.',
        realWorldExample: 'Rescued 40 tons of high-grade alloy batch #402 by recommending an immediate silicon compound offset.',
        relatedSOPs: ['SOP-401: Alloy Composition Limits'],
        recommendedCourses: ['Regression Modeling for Materials Engineering'],
        simulationType: 'purity'
      }
    ],
    'Supply Chain': [
      {
        id: 'demand_fore',
        title: 'Smart Demand Forecaster',
        shortDesc: 'Forecasts material consumption rates to optimize storage buffers.',
        whatIsIt: 'LSTM Neural Networks forecasting factory throughput vs supplier logistics timelines.',
        whyUseful: 'Cuts inventory storage costs by 18% and prevents production lockouts.',
        howApplies: 'Integrates warehouse stock databases with production scheduling calendars.',
        realWorldExample: 'Ensured zero delays during the 2024 steel logistics bottleneck by pre-ordering custom pins.',
        relatedSOPs: ['SOP-9: Material Dispatch Regulations'],
        recommendedCourses: ['LSTM Networks for Logistics Managers'],
        simulationType: 'purity'
      }
    ],
    'Human Resources': [
      {
        id: 'curriculum_match',
        title: 'Skill Gap Optimizer',
        shortDesc: 'Automates matching certification curriculum maps with plant safety compliance matrices.',
        whatIsIt: 'A semantic parsing LLM that audits employee course history against plant roles.',
        whyUseful: 'Ensures zero safety compliance audit violations across operational shifts.',
        howApplies: 'Scans the Skill Passport records database.',
        realWorldExample: 'Flagged 4 newly promoted operators who lacked verified LOTO credentials before active shift deployments.',
        relatedSOPs: ['SOP-1: Operator Certification Policies'],
        recommendedCourses: ['HR Analytics & Compliance Management'],
        simulationType: 'loto'
      }
    ],
    Finance: [
      {
        id: 'cost_optim',
        title: 'Steam Utility Cost Optimizer',
        shortDesc: 'Analyzes steam boiler grid loads to purchase electricity at peak tariff dips.',
        whatIsIt: 'Reinforcement Learning maximizing thermal grid load vs time-of-day tariff pricing.',
        whyUseful: 'Saves up to $14,000 monthly on Plant 2 thermal boiler operations.',
        howApplies: 'Examines boiler heating telemetry against national power grids.',
        realWorldExample: 'Pune Plant reduced utility bills by 12% in Q4 by shifting heat cycles to nocturnal dips.',
        relatedSOPs: ['SOP-502: Utility Billing Schedules'],
        recommendedCourses: ['Energy Grid Finance Modeling'],
        simulationType: 'vibration'
      }
    ]
  };

  // Get active use cases based on selected department tab
  const useCases = USE_CASES_BY_DEPT[selectedDept] || USE_CASES_BY_DEPT.Maintenance;

  const handleRunSimulation = (useCase: UseCase) => {
    if (useCase.simulationType === 'vibration') {
      if (vibrationVal > 100) {
        setSimOutput(`🔴 ML MODEL WARNING: Anomalous Vibration Frequency Detected (${vibrationVal}Hz)!
Risk of Bearing Failure: 94%.
Recommendation: Isolate valve and refer to ${useCase.relatedSOPs[0] || 'SOP'}.`);
      } else {
        setSimOutput(`🟢 ML MODEL NORMAL: Vibration Frequency (${vibrationVal}Hz) within safety envelope.
Structural Stability: 98.7%.
Action: Routine inspections only.`);
      }
    } else if (useCase.simulationType === 'loto') {
      if (!hasHelmet || !breakerIsolated) {
        let violations = [];
        if (!hasHelmet) violations.push('Missing Helmet PPE');
        if (!breakerIsolated) violations.push('Breaker 4B not isolated (LOTO Failure)');
        setSimOutput(`🔴 ML MODEL WARNING: Safety Violations Found!
Violations: ${violations.join(' & ')}.
Risk Coefficient: HIGH.
Action: Lockout valve handles immediately and wear proper gear.`);
      } else {
        setSimOutput(`🟢 ML MODEL NORMAL: All LOTO checklists and PPE guards are compliant.
Safety Index: 100%.
Action: Proceed with mechanical work.`);
      }
    } else if (useCase.simulationType === 'purity') {
      if (purityVal < 95) {
        setSimOutput(`🔴 ML MODEL WARNING: Alloy Purity dropped to ${purityVal}%!
Tensile Failure Risk: 88%.
Recommendation: Inject silicon compound stabilizer or review ${useCase.relatedSOPs[0] || 'SOP'}.`);
      } else {
        setSimOutput(`🟢 ML MODEL NORMAL: Purity is at optimal ${purityVal}%.
Density Index: PREMIUM GRADE.
Action: Proceed to cooling cycles.`);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="text-primary" size={24} /> AI in My Work
          </h2>
          <p className="text-muted-foreground text-sm">Personalized artificial intelligence models and predictive tools tailored to your daily operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Active Department:</span>
          <select
            value={selectedDept}
            onChange={e => {
              setSelectedDept(e.target.value);
              setSelectedUseCase(null);
              setSimOutput('Adjust variables to trigger real-time AI modeling...');
            }}
            className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>
                {d} {d === userDept ? '⭐' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left use cases list, Right Details/Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Use cases cards */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Available Models for {selectedDept} ({useCases.length})
          </h3>
          <div className="space-y-3">
            {useCases.map(uc => (
              <div
                key={uc.id}
                onClick={() => {
                  setSelectedUseCase(uc);
                  setSimOutput('Adjust variables to trigger real-time AI modeling...');
                }}
                className={`bg-card border rounded-2xl p-5 hover:border-primary/20 transition-all cursor-pointer flex flex-col justify-between h-40 relative ${selectedUseCase?.id === uc.id ? 'border-primary/50' : 'border-border'}`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBookmark(uc);
                  }}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all z-10"
                  title="Bookmark Use Case"
                >
                  <Bookmark size={12} className={isBookmarked(uc) ? "fill-primary text-primary" : ""} />
                </button>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Cpu size={15} className="text-primary" /> {uc.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {uc.shortDesc}
                  </p>
                </div>
                <div className="text-[10px] font-bold text-primary text-right uppercase tracking-wider mt-2">
                  Explore Model &rarr;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Use case workspaces */}
        <div className="lg:col-span-2 space-y-6">
          {selectedUseCase ? (
            <div className="space-y-6">
              {/* Detailed Specs Panel */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles size={16} className="text-primary fill-primary" /> {selectedUseCase.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">Specialized AI application in {selectedDept}</p>
                  </div>
                </div>

                {/* Explanation details list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs border-t border-border/50 pt-5">
                  <div className="space-y-1">
                    <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">What is it?</span>
                    <p className="text-foreground leading-relaxed font-semibold">{selectedUseCase.whatIsIt}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Why is it useful?</span>
                    <p className="text-foreground leading-relaxed font-semibold">{selectedUseCase.whyUseful}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">How does it apply to this field?</span>
                    <p className="text-foreground leading-relaxed font-semibold">{selectedUseCase.howApplies}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Real-world example</span>
                    <p className="text-foreground leading-relaxed font-semibold">{selectedUseCase.realWorldExample}</p>
                  </div>
                </div>

                {/* References & Recommended courses */}
                <div className="border-t border-border/50 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-muted-foreground">
                  <div className="space-y-2">
                    <span className="text-foreground uppercase font-bold text-[9px] tracking-wider block">Related SOPs</span>
                    <div className="space-y-1">
                      {selectedUseCase.relatedSOPs.map(sop => (
                        <div key={sop} className="flex items-center gap-1 text-[11px] font-mono text-primary bg-primary/5 p-1 rounded border border-primary/10">
                          📋 {sop}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-foreground uppercase font-bold text-[9px] tracking-wider block">Recommended Learning</span>
                    <div className="space-y-1">
                      {selectedUseCase.recommendedCourses.map(course => (
                        <div key={course} className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                          <BookOpen size={11} className="text-primary" /> {course}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex gap-2 border-t border-border/50 pt-4 flex-wrap">
                  <button
                    onClick={() => setPage('learn')}
                    className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <BookOpen size={13} /> Learn Now
                  </button>
                  <button
                    onClick={() => setPage('ai-chat')}
                    className="bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                  >
                    <MessageSquare size={13} /> Ask Kai Chatbot
                  </button>
                </div>
              </div>

              {/* Simulation Sandbox Sandbox */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                  <Activity size={15} className="text-primary animate-pulse" /> Live Telemetry ML Simulator
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Simulation controls */}
                  <div className="space-y-4">
                    {selectedUseCase.simulationType === 'vibration' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Vibration Frequency (Hz)</span>
                          <strong className="text-foreground">{vibrationVal} Hz</strong>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="150"
                          value={vibrationVal}
                          onChange={e => setVibrationVal(Number(e.target.value))}
                          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[8px] text-muted-foreground font-semibold pt-1">
                          <span>10 Hz (Safe)</span>
                          <span>100 Hz (Threshold)</span>
                          <span>150 Hz (Failure risk)</span>
                        </div>
                      </div>
                    )}

                    {selectedUseCase.simulationType === 'loto' && (
                      <div className="space-y-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={hasHelmet}
                            onChange={e => setHasHelmet(e.target.checked)}
                            className="rounded bg-background border-border text-primary focus:ring-0"
                          />
                          <span>Helmet PPE Secured</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={breakerIsolated}
                            onChange={e => setBreakerIsolated(e.target.checked)}
                            className="rounded bg-background border-border text-primary focus:ring-0"
                          />
                          <span>Breaker Isolated (lockout tag on)</span>
                        </label>
                      </div>
                    )}

                    {selectedUseCase.simulationType === 'purity' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Raw Material Purity (%)</span>
                          <strong className="text-foreground">{purityVal}%</strong>
                        </div>
                        <input
                          type="range"
                          min="80"
                          max="100"
                          value={purityVal}
                          onChange={e => setPurityVal(Number(e.target.value))}
                          className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[8px] text-muted-foreground font-semibold pt-1">
                          <span>80% (Poor Quality)</span>
                          <span>95% (Minimum Standard)</span>
                          <span>100% (High Purity)</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleRunSimulation(selectedUseCase)}
                      className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <RefreshCw size={12} /> Run Predictive Inference
                    </button>
                  </div>

                  {/* Prediction Output Display */}
                  <div className="p-4 rounded-xl border border-border/80 bg-background flex flex-col justify-between min-h-[140px]">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground block">
                        Real-time AI Inference Output
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap mt-2">
                        {simOutput}
                      </p>
                    </div>
                    {simOutput.includes('🟢') && (
                      <div className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-center mt-2">
                        ✓ Safety Bounds Clear
                      </div>
                    )}
                    {simOutput.includes('🔴') && (
                      <div className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-center mt-2 animate-pulse">
                        ⚠️ Alert Override Necessary
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center text-muted-foreground">
              <Cpu size={36} className="mx-auto mb-3 opacity-50" />
              <h4 className="text-sm font-bold text-foreground">Select an AI/ML Use Case</h4>
              <p className="text-xs mt-1">Pick any model from the department list on the left to calibrate simulated inputs, view related training modules, and execute predictive ML modeling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
