import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bookmark, FileText, BookOpen, User, 
  ShieldAlert, Award, AlertTriangle, AlertCircle, LifeBuoy, 
  CheckCircle2, Link2, Clock, Check
} from 'lucide-react';
import { useApp } from '../../App';
import { supabase } from '../lib/supabaseClient';

export default function SopDetailPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { selectedSopId, savedItems, toggleBookmark, completeMission, activeMissions } = useApp();
  const [sop, setSop] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSopId) {
      setError("No SOP document selected.");
      setLoading(false);
      return;
    }

    const fetchSop = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from("knowledge_articles")
          .select("*")
          .eq("id", selectedSopId)
          .maybeSingle();

        if (fetchErr) throw fetchErr;
        setSop(data);
      } catch (err: any) {
        console.error("Error fetching SOP document:", err);
        setError("Failed to load SOP document: " + (err.message || String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchSop();
  }, [selectedSopId]);

  const isBookmarked = sop && (savedItems || []).some(
    x => String(x.id) === String(sop.id) && x.type === 'sop'
  );

  const handleToggleBookmark = async () => {
    if (!sop) return;
    await toggleBookmark({
      id: String(sop.id),
      type: 'sop',
      title: sop.title,
      desc: sop.is_preserved ? `Preserved by expert ${sop.author}.` : `Official document by ${sop.author}.`,
      category: 'SOPs',
      page: 'knowledge'
    });
  };

  // Check if there is an active daily mission for SOP reading that matches
  const activeSopMission = (activeMissions || []).find(
    (m: any) => m.status === 'in_progress' && m.type === 'SOP_READING'
  );

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-12 bg-muted rounded w-3/4" />
        <div className="h-32 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  if (error || !sop) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <button
          onClick={() => onNavigate('knowledge')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft size={14} /> Back to Knowledge Hub
        </button>
        <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex gap-3 text-rose-400">
          <AlertCircle size={20} className="flex-shrink-0" />
          <div>
            <h4 className="font-bold">Error Loading SOP</h4>
            <p className="text-xs mt-1">{error || "SOP document not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  // Parse structured JSON sections if available
  let structuredContent: any = null;
  let parseFailed = false;

  if (sop.content) {
    if (typeof sop.content === 'object') {
      structuredContent = sop.content;
    } else {
      try {
        structuredContent = JSON.parse(sop.content);
      } catch (e) {
        parseFailed = true;
      }
    }
  }

  const sections = [
    { key: 'purpose', label: '1. Purpose', icon: <FileText size={16} /> },
    { key: 'scope', label: '2. Scope', icon: <BookOpen size={16} /> },
    { key: 'responsibilities', label: '3. Responsibilities', icon: <User size={16} /> },
    { key: 'safetyRequirements', label: '4. Safety Requirements', icon: <ShieldAlert size={16} className="text-amber-500" /> },
    { key: 'prerequisites', label: '5. Prerequisites', icon: <Award size={16} /> },
    { key: 'equipmentPPE', label: '6. Required Equipment / PPE', icon: <ShieldAlert size={16} className="text-rose-500" /> },
    { key: 'procedure', label: '7. Step-by-Step Procedure', icon: <CheckCircle2 size={16} className="text-primary" /> },
    { key: 'warnings', label: '8. Warnings / Precautions', icon: <AlertTriangle size={16} className="text-yellow-500" /> },
    { key: 'emergencyProcedure', label: '9. Emergency / Escalation Procedure', icon: <LifeBuoy size={16} className="text-rose-400" /> },
    { key: 'verificationChecklist', label: '10. Verification Checklist', icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
    { key: 'references', label: '11. References', icon: <Link2 size={16} /> },
    { key: 'revisionHistory', label: '12. Revision History', icon: <Clock size={16} /> }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('knowledge')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Knowledge Hub
        </button>
        <button
          onClick={handleToggleBookmark}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            isBookmarked 
              ? 'bg-primary/10 border-primary/30 text-primary' 
              : 'bg-card border-border hover:bg-muted text-muted-foreground'
          }`}
        >
          <Bookmark size={14} className={isBookmarked ? 'fill-primary text-primary' : ''} />
          {isBookmarked ? 'Bookmarked' : 'Bookmark SOP'}
        </button>
      </div>

      {/* active Daily Mission banner */}
      {activeSopMission && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
              🎯 Active Daily Mission In Progress
            </div>
            <h4 className="text-sm font-bold text-foreground mt-1">{activeSopMission.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{activeSopMission.description}</p>
          </div>
          <button
            onClick={async () => {
              await completeMission(activeSopMission.id);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/20 flex items-center gap-1"
          >
            <Check size={14} /> Confirm SOP Read / Complete Mission
          </button>
        </div>
      )}

      {/* SOP Header Container */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold text-primary tracking-wider uppercase">
                {sop.sop_code || 'SOP-GEN'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${
                sop.is_preserved 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {sop.is_preserved ? 'Preserved Expert Knowledge' : 'Official SOP Document'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-foreground">{sop.title}</h1>
            <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">{sop.description}</p>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/40 text-xs">
          <div>
            <span className="text-muted-foreground font-semibold">Department</span>
            <p className="font-bold text-foreground mt-0.5">{sop.department || 'Operations'}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-semibold">Category</span>
            <p className="font-bold text-foreground mt-0.5">{sop.category || 'General'}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-semibold">Owner / Author</span>
            <p className="font-bold text-foreground mt-0.5">{sop.author}</p>
          </div>
          <div>
            <span className="text-muted-foreground font-semibold">Version &amp; Status</span>
            <p className="font-bold text-foreground mt-0.5">{sop.version || '1.0'} &bull; <span className="text-emerald-400 capitalize">{sop.status || 'active'}</span></p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 pt-1 text-[11px] text-muted-foreground">
          {sop.effective_date && (
            <div>
              <span>Effective Date: <strong>{new Date(sop.effective_date).toLocaleDateString()}</strong></span>
            </div>
          )}
          {sop.last_reviewed_date && (
            <div>
              <span>Last Reviewed: <strong>{new Date(sop.last_reviewed_date).toLocaleDateString()}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Safety Warning Label */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3 text-xs text-amber-500 leading-normal">
        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <strong>Demo / Training SOP Notice:</strong> This document is seeded solely as training content demonstrating the Mentora platform workflow. It is NOT an official Tata Steel operational manual or safety standard.
        </div>
      </div>

      {/* Structured Document Content */}
      <div className="space-y-6">
        {structuredContent && !parseFailed ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map(section => {
              const sectionText = structuredContent[section.key];
              if (!sectionText) return null;

              return (
                <div 
                  key={section.key} 
                  className="bg-card border border-border/80 rounded-2xl p-5 hover:border-border transition-all flex flex-col gap-2.5"
                >
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/40 pb-2">
                    {section.icon}
                    {section.label}
                  </h3>
                  <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap flex-1">
                    {sectionText}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback for raw text content (e.g. preserved Q&A) */
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              💡 Document Content / Transcript
            </h3>
            <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap bg-background/50 p-4 rounded-xl">
              {sop.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
