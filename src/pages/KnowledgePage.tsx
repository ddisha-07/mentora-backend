import React, { useState } from 'react';
import { Database, Search, FileText, ExternalLink, ShieldCheck, Bookmark, ArrowRight } from 'lucide-react';
import { useApp } from '../../App';
import { Card } from '../components/reusable';

export default function KnowledgePage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [search, setSearch] = useState('');
  const { preservedKnowledge } = useApp();

  const baseArticles = [
    { id: 1, title: 'Standard Boiler Valve Override Procedure', dept: 'Maintenance', views: 320, author: 'Devendra Prasad', content: 'Manual mechanical lock overrides: isolation of breaker panel 4B is required before using the override lever beneath the pressure gauge.' },
    { id: 2, title: 'Modbus Gateway Telemetry Configuration Guidelines', dept: 'R&D / IT', views: 180, author: 'Arjun Mehta', content: 'Standard configuration steps for mapping Modbus registers into the SCADA console over RS-485 interfaces.' },
    { id: 3, title: 'Safe Lockout/Tagout (LOTO) Protocols 2026', dept: 'Safety & EHS', views: 540, author: 'Sarah Chen', content: 'Centralized safety regulations detailing key-lock placements and color-coded tag indicators.' },
    { id: 4, title: 'Turbine Thermal Expansion & Shaft Vibration Safety Limits', dept: 'Engineering', views: 210, author: 'Devendra Prasad', content: 'A guidelines memo outlining maximum operational vibration limits and temperature cooldown periods.' }
  ];

  // Combine default articles with expert preserved Q&A entries
  const allArticles = [
    ...baseArticles,
    ...(preservedKnowledge || []).map((pk: any) => ({
      id: 'preserved_' + pk.id,
      title: pk.title,
      dept: pk.dept || 'Expert Archive',
      views: pk.views || 45,
      author: pk.author || 'Retired Expert',
      content: pk.content,
      isPreserved: true
    }))
  ];

  const filteredArticles = allArticles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase()) ||
    a.author.toLowerCase().includes(search.toLowerCase())
  );

  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="text-primary" size={24} /> Knowledge Hub
          </h2>
          <p className="text-muted-foreground text-sm">Access verified Standard Operating Procedures (SOPs), manuals, and preserved expert answers.</p>
        </div>
        <button
          onClick={() => onNavigate('knowledge-exchange')}
          className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/25 transition-all flex items-center gap-1.5 active:scale-95"
        >
          Go to Knowledge Exchange <ArrowRight size={14} />
        </button>
      </div>

      {/* Main Search */}
      <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="relative max-w-2xl mx-auto z-10 text-center py-6">
          <h3 className="text-base font-bold text-foreground mb-3">Search Internal Knowledge Repository</h3>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search SOPs, manuals, legacy guidelines, or preserved expert Q&As..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm text-foreground placeholder-muted-foreground w-full outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories & Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left list: Featured articles */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            SOP &amp; Preserved Knowledge Base ({filteredArticles.length})
          </h3>
          <div className="space-y-3">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className={`bg-card border rounded-2xl p-4 flex flex-col hover:border-primary/30 transition-all cursor-pointer ${activeArticle?.id === article.id ? 'border-primary/50' : 'border-border'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${article.isPreserved ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                        {article.title}
                        {article.isPreserved ? (
                          <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 border border-primary/20 rounded-full font-bold flex items-center gap-0.5">
                            <Bookmark size={9} /> Preserved Q&amp;A
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded-full font-bold flex items-center gap-0.5">
                            <ShieldCheck size={9} /> Official SOP
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Dept: {article.dept} &bull; Contributor: {article.author}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                    <span>{article.views} views</span>
                  </div>
                </div>

                {activeArticle?.id === article.id && (
                  <div className="mt-4 border-t border-border/50 pt-3 text-xs leading-relaxed text-muted-foreground bg-background/50 p-3.5 rounded-xl whitespace-pre-wrap">
                    <h5 className="font-bold text-foreground mb-1.5 uppercase text-[10px] tracking-wider">Document Content:</h5>
                    {article.content}
                  </div>
                )}
              </div>
            ))}

            {filteredArticles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl">
                <Search size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">No documents match your query.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Directories & Preservation Architecture */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              📋 Standard Directories
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Safety & EHS SOPs', count: 14 },
                { name: 'Mechanical Maintenance', count: 22 },
                { name: 'Electrical & PLC Manuals', count: 18 },
                { name: 'Software Architecture Guides', count: 8 },
                { name: 'Preserved Legacy Logs', count: baseArticles.length + (preservedKnowledge?.length || 0) }
              ].map(dir => (
                <div
                  key={dir.name}
                  onClick={() => setSearch(dir.name === 'Preserved Legacy Logs' ? 'Preserved Q&A' : dir.name)}
                  className="p-2.5 rounded-xl border border-border hover:bg-muted/40 transition-all cursor-pointer flex justify-between items-center text-muted-foreground hover:text-foreground"
                >
                  <span>{dir.name}</span>
                  <span className="bg-background px-2 py-0.5 rounded border border-border text-[9px]">{dir.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preservation System details */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-foreground">💡 Preservation System</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When senior employees or retired expert advisors mark a Q&amp;A thread as <strong>"Preserved in Knowledge Base"</strong>, it automatically archives the solution as a community SOP reference article.
            </p>
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl text-[10px] text-muted-foreground leading-normal">
              <strong>Future Plan Architecture:</strong> Hooks are configured to route preservation requests to the Admin review queue where peer experts can cast verification votes before converting answers into permanent factory manuals.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
