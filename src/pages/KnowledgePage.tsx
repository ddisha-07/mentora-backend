import React, { useState } from 'react';
import { Database, Search, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

export default function KnowledgePage() {
  const [search, setSearch] = useState('');
  const articles = [
    { id: 1, title: 'Standard Boiler Valve Override Procedure', dept: 'Maintenance', views: 320, author: 'D. Prasad' },
    { id: 2, title: 'Modbus Gateway Telemetry Configuration Guidelines', dept: 'R&D / IT', views: 180, author: 'A. Mehta' },
    { id: 3, title: 'Safe Lockout/Tagout (LOTO) Protocols 2026', dept: 'Safety & EHS', views: 540, author: 'S. Chen' },
    { id: 4, title: 'Turbine Thermal Expansion & Shaft Vibration Safety Limits', dept: 'Engineering', views: 210, author: 'D. Prasad' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="text-primary" size={24} /> Knowledge Hub
        </h2>
        <p className="text-muted-foreground text-sm">Access verified Standard Operating Procedures (SOPs), manuals, and engineering guidelines.</p>
      </div>

      {/* Main Search */}
      <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="relative max-w-2xl mx-auto z-10 text-center py-6">
          <h3 className="text-lg font-bold text-foreground mb-3">Search Internal Knowledge Repository</h3>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search SOPs, manuals, legacy guidelines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-background border border-border rounded-2xl pl-12 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground w-full outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories & Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left list: Featured articles */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Verified SOP Documents</h3>
          <div className="space-y-3">
            {articles
              .filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
              .map(article => (
                <div key={article.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {article.title} <ShieldCheck size={14} className="text-emerald-400" />
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Dept: {article.dept} &bull; Author: {article.author}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{article.views} reads</span>
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right side: Categories / Statistics */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="text-sm font-bold text-foreground mb-3">Popular Directories</h4>
            <div className="space-y-2 text-xs">
              {['Safety & EHS SOPs (14)', 'Mechanical Maintenance (22)', 'Electrical & PLC Manuals (18)', 'Software Architecture Guides (8)', 'Retired Expert Logs (35)'].map(dir => (
                <div key={dir} className="p-2.5 rounded-xl border border-border hover:bg-muted/40 transition-all cursor-pointer text-muted-foreground hover:text-foreground">
                  {dir}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
