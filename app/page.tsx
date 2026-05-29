'use client';

import { useState } from 'react';
import { Server, Shield, Activity, Network, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

type TabType = 'architect' | 'security' | 'doctor';

const TABS: { id: TabType; label: string; icon: any; placeholder: string }[] = [
  {
    id: 'architect',
    label: 'NetArchitect',
    icon: Network,
    placeholder: 'Contoh: Buatkan rancangan jaringan untuk 3 divisi: HR 20 host, IT 50 host, Tamu 100 host dengan IP awal 192.168.1.0/24'
  },
  {
    id: 'security',
    label: 'SecGuard',
    icon: Shield,
    placeholder: 'Contoh: Buatkan skrip MikroTik untuk blokir ping eksternal, buka port web, dan forward port 8080 ke 10.0.0.5'
  },
  {
    id: 'doctor',
    label: 'NetDoctor',
    icon: Activity,
    placeholder: 'Tempelkan (paste) baris log error asli dari router atau server di sini...'
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('architect');
  const [inputs, setInputs] = useState<Record<TabType, string>>({
    architect: '',
    security: '',
    doctor: ''
  });
  const [results, setResults] = useState<Record<TabType, string | null>>({
    architect: null,
    security: null,
    doctor: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const activeTabData = TABS.find(t => t.id === activeTab)!;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputs[activeTab].trim() || isLoading) return;

    setIsLoading(true);
    setResults(prev => ({ ...prev, [activeTab]: null }));

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputs[activeTab],
          type: activeTab
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menghubungi KeJar AI Engine');
      }

      const data = await response.json();
      setResults(prev => ({ ...prev, [activeTab]: data.text }));
    } catch (error: any) {
      setResults(prev => ({ ...prev, [activeTab]: `error\nTerjadi kesalahan: ${error.message}` }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-slate-300 selection:bg-blue-500/30 selection:text-white font-sans bg-[#0f1115]">
      {/* Header */}
      <header className="h-14 bg-[#161920] border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-sm">KJ</div>
            <h1 className="text-lg font-semibold tracking-tight text-white">KeJar <span className="text-slate-500 font-light">| Kendali Jaringan</span></h1>
          </div>
          <div className="h-4 w-[1px] bg-slate-700 mx-2"></div>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1 rounded border border-slate-800">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="text-emerald-500 uppercase tracking-wider">Core System Operational</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-medium">
          <div className="flex flex-col items-end">
            <span className="text-slate-500">Service Uptime</span>
            <span className="text-white">99.982%</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-500">AI Confidence</span>
            <span className="text-white">97.2%</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-[10px]">
             AI
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-56 bg-[#161920] border-r border-slate-800 flex flex-col py-4 shrink-0">
          <div className="px-4 mb-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Main Console</div>
          <div className="flex flex-col gap-1 px-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-600 font-medium' 
                      : 'hover:bg-slate-800 text-slate-400 border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto px-4 py-4 border-t border-slate-800">
            <div className="bg-slate-900 rounded p-3 border border-slate-800">
              <div className="text-[10px] text-slate-500 mb-1 uppercase font-mono">System Load</div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-blue-500"></div>
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">AI Compute</span>
                <span className="text-white">32%</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Workspace */}
        <section className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col gap-4 overflow-hidden"
            >
              <div className="flex gap-4 h-full overflow-hidden">
                
                {/* Input Panel */}
                <div className="w-1/3 flex flex-col bg-[#1c202a] border border-slate-800 rounded shrink-0 shadow-sm overflow-hidden">
                  <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                       <activeTabData.icon className="w-4 h-4 text-blue-400" />
                       Command Input
                    </h3>
                  </div>
                  <div className="flex-1 p-3 flex flex-col gap-3">
                    <textarea
                      autoFocus
                      className="flex-1 w-full bg-[#0a0c10] border border-slate-800 rounded p-3 text-xs text-slate-300 font-mono focus:border-blue-500 focus:outline-none transition-colors resize-none placeholder:text-slate-600 leading-relaxed shadow-inner"
                      placeholder={activeTabData.placeholder}
                      value={inputs[activeTab]}
                      onChange={(e) => setInputs(prev => ({ ...prev, [activeTab]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          handleSubmit();
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSubmit()}
                      disabled={!inputs[activeTab].trim() || isLoading}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs uppercase tracking-wider font-bold rounded transition-colors shrink-0 shadow-sm"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          Execute Sequence
                        </>
                      )}
                    </button>
                    <div className="text-[10px] text-slate-500 text-center font-mono uppercase">
                      [Ctrl + Enter] to execute
                    </div>
                  </div>
                </div>

                {/* Output Panel */}
                <div className="flex-1 bg-[#1c202a] border border-slate-800 rounded flex flex-col shadow-sm overflow-hidden min-w-0">
                  <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
                     <h3 className="text-xs font-bold uppercase tracking-wider">AI Insight Terminal</h3>
                     {results[activeTab] && (
                       <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] border border-emerald-500/20 font-mono">
                         OUTPUT GENERATED
                       </span>
                     )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {isLoading ? (
                      <div className="h-full flex flex-col items-center justify-center font-mono text-[10px] uppercase space-y-4">
                        <div className="relative w-8 h-8">
                           <div className="w-8 h-8 border-2 border-slate-800 rounded-full"></div>
                           <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <p className="animate-pulse">Analyzing & Computing Model...</p>
                        </div>
                      </div>
                    ) : results[activeTab] ? (
                      <div className="font-mono text-sm">
                        <MarkdownRenderer content={results[activeTab]!} />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono text-xs border border-dashed border-slate-800 rounded mx-4 my-8">
                        <Server className="w-8 h-8 mb-3 opacity-20" />
                        [ READY FOR INSTRUCTION ]
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-8 bg-[#0a0c10] border-t border-slate-800 px-4 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
        <div>SERVER: ASIA-SOUTHEAST1-A</div>
        <div className="flex gap-6">
          <span>MODEL: GEMINI-3.5-FLASH</span>
          <span>VERSION: KJ.1.0-STABLE</span>
        </div>
      </footer>
    </div>
  );
}
