import React from 'react';
import { Sparkles, CheckSquare, ShieldCheck, Code, Award, Users, BookOpen } from 'lucide-react';
import { UserRole } from '../types';

export default function AIInMyWorkPage({ role = 'JUNIOR_EMPLOYEE' }: { role?: UserRole }) {
  const getRoleAIToolkit = (userRole: UserRole) => {
    switch (userRole) {
      case 'SHOP_FLOOR_WORKER':
        return {
          title: 'Operational Assistant Toolkit',
          tools: [
            {
              title: 'Safety Drill Simulator',
              desc: 'Simulate emergency valve releases or machine lockouts. Get real-time feedback on safety protocols.',
              icon: <ShieldCheck size={18} />
            },
            {
              title: 'Operational Checklist Builder',
              desc: 'Generate machine setup and startup inspection checksheets tailored to your specific plant tools.',
              icon: <CheckSquare size={18} />
            }
          ]
        };
      case 'JUNIOR_EMPLOYEE':
        return {
          title: 'Junior Developer Toolkit',
          tools: [
            {
              title: 'Code Explainer & Refactorer',
              desc: 'Paste complex functions to generate clean TypeScript types, optimize algorithms, or write unit tests.',
              icon: <Code size={18} />
            },
            {
              title: 'Interactive Study Planner',
              desc: 'Provide your career goals and let Mentora AI generate a personalized timeline of modules and skills.',
              icon: <BookOpen size={18} />
            }
          ]
        };
      case 'SENIOR_EMPLOYEE':
      case 'OFFICER_MANAGER':
        return {
          title: 'Advisory & L&D Management Toolkit',
          tools: [
            {
              title: 'Team Skill Gap Analyst',
              desc: 'Ingest team evaluation logs to isolate specific training courses needed in Pune Plant operations.',
              icon: <Users size={18} />
            },
            {
              title: 'SOP Curriculum Generator',
              desc: 'Input new safety regulations or company policies and instantly output structured learning courses.',
              icon: <Award size={18} />
            }
          ]
        };
      case 'RETIRED_EMPLOYEE':
        return {
          title: 'Legacy Advisory Toolkit',
          tools: [
            {
              title: 'Legacy Knowledge Archiver',
              desc: 'Transcribe hand-written machinery notes or audio transcripts into structured, formal SOP manuals.',
              icon: <Sparkles size={18} />
            }
          ]
        };
      default:
        return {
          title: 'General AI Assistant Toolkit',
          tools: [
            {
              title: 'Q&A Drafting Coach',
              desc: 'Review and refine draft questions or responses for the Q&A exchange to ensure clear wording.',
              icon: <Sparkles size={18} />
            }
          ]
        };
    }
  };

  const toolkit = getRoleAIToolkit(role);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="text-primary" size={24} /> AI in My Work
        </h2>
        <p className="text-muted-foreground text-sm">Role-specific AI assistants and utility agents optimized to streamline daily tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Assistant container */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Sparkles size={14} /> Active Copilot: {toolkit.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            These models are optimized using your specific department guidelines and role-permissions configuration. Select an agent to open its specialized context interface.
          </p>

          <div className="space-y-4">
            {toolkit.tools.map((tool, idx) => (
              <div key={idx} className="border border-border p-4 rounded-xl bg-background flex items-start gap-3 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {tool.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {tool.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic chat helper simulation */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between h-96">
          <div className="space-y-4 overflow-y-auto pr-2">
            <div className="bg-secondary rounded-xl p-3 border border-border/50 text-xs">
              <p className="font-bold text-foreground mb-1">Mentora Copilot</p>
              <p className="text-muted-foreground leading-relaxed">
                Hello! I am ready to support your tasks as a <strong className="text-primary">{role.replace('_', ' ')}</strong>. Pick a template from your active toolkit to start.
              </p>
            </div>
          </div>
          <div className="relative border-t border-border/50 pt-4 mt-4">
            <input
              disabled
              placeholder="Select a toolkit agent to start chatting..."
              className="w-full bg-background border border-border rounded-xl p-3 pl-4 pr-10 text-xs text-foreground placeholder-muted-foreground outline-none cursor-not-allowed opacity-75"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
