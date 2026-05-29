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
        const errorText = await response.text();
        let errorMsg = 'Gagal menghubungi KeJar AI Engine';
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) errorMsg = errorData.error;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON from server. Response starts with: ${responseText.slice(0, 50)}...`);
      }
      setResults(prev => ({ ...prev, [activeTab]: data.text }));
    } catch (error: any) {
      setResults(prev => ({ ...prev, [activeTab]: `error\nTerjadi kesalahan: ${error.message}` }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-green-500 selection:bg-green-500/30 selection:text-white font-mono bg-black">
      {/* Header */}
      <header className="h-14 bg-[#0a0a0a] border-b border-green-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-900/50 border border-green-500/30 rounded flex items-center justify-center font-bold text-green-400 text-sm">{">_"}</div>
            <h1 className="text-lg font-bold tracking-tight text-green-500">KeJar <span className="text-green-700 font-light">| Kendali Jaringan</span></h1>
          </div>
          <div className="h-4 w-[1px] bg-green-900/50 mx-2"></div>
          <div className="flex items-center gap-2 text-xs font-mono bg-[#050505] px-3 py-1 rounded border border-green-900/50">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-500 uppercase tracking-wider">Core System Operational</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-medium">
          <div className="flex flex-col items-end">
            <span className="text-green-700">Service Uptime</span>
            <span className="text-green-400">99.982%</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-green-700">AI Confidence</span>
            <span className="text-green-400">97.2%</span>
          </div>
          <div className="h-8 w-8 rounded bg-[#050505] border border-green-900/50 flex items-center justify-center text-green-500 text-[10px]">
             AI
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-56 bg-[#0a0a0a] border-r border-green-900/50 flex flex-col py-4 shrink-0">
          <div className="px-4 mb-6 text-[10px] uppercase tracking-[0.2em] text-green-700 font-bold">Main Console</div>
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
                      ? 'bg-green-900/20 text-green-400 border-l-2 border-green-500 font-bold' 
                      : 'hover:bg-green-900/10 text-green-600 border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto px-4 py-4 border-t border-green-900/50">
            <div className="bg-[#050505] rounded p-3 border border-green-900/50">
              <div className="text-[10px] text-green-700 mb-1 uppercase font-mono">System Load</div>
              <div className="h-1 bg-black rounded-full overflow-hidden border border-green-900/30">
                <div className="w-1/3 h-full bg-green-500"></div>
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-mono">
                <span className="text-green-700">AI Compute</span>
                <span className="text-green-400">32%</span>
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
                <div className="w-1/3 flex flex-col bg-[#050505] border border-green-900/50 rounded shrink-0 shadow-sm overflow-hidden">
                  <div className="p-3 border-b border-green-900/50 bg-[#0a0a0a] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-green-500">
                       <activeTabData.icon className="w-4 h-4" />
                       Command Input
                    </h3>
                  </div>
                  <div className="flex-1 p-3 flex flex-col gap-3">
                    <textarea
                      autoFocus
                      className="flex-1 w-full bg-black border border-green-900/50 rounded p-3 text-xs text-green-400 font-mono focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-colors resize-none placeholder:text-green-900 leading-relaxed custom-scrollbar"
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
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-green-900/20 border border-green-500/30 hover:bg-green-900/40 hover:border-green-500 text-green-400 disabled:bg-[#0a0a0a] disabled:border-green-900/30 disabled:text-green-900 disabled:cursor-not-allowed text-xs uppercase tracking-wider font-bold rounded transition-colors shrink-0"
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
                    <div className="text-[10px] text-green-800 text-center font-mono uppercase">
                      [Ctrl + Enter] to execute
                    </div>
                  </div>
                </div>

                {/* Output Panel */}
                <div className="flex-1 bg-[#050505] border border-green-900/50 rounded flex flex-col shadow-sm overflow-hidden min-w-0">
                  <div className="p-3 border-b border-green-900/50 bg-[#0a0a0a] flex justify-between items-center shrink-0">
                     <h3 className="text-xs font-bold uppercase tracking-wider text-green-500">AI Insight Terminal</h3>
                     {results[activeTab] && (
                       <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px] border border-green-500/20 font-mono">
                         OUTPUT GENERATED
                       </span>
                     )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-green-500">
                    {isLoading ? (
                      <div className="h-full flex flex-col items-center justify-center font-mono text-[10px] uppercase space-y-4">
                        <div className="relative w-8 h-8">
                           <div className="w-8 h-8 border-2 border-green-900/50 rounded border-dashed animate-[spin_3s_linear_infinite]"></div>
                           <div className="w-8 h-8 border-2 border-green-500 rounded border-t-transparent animate-spin absolute inset-0"></div>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-green-600">
                          <p className="animate-pulse">Analyzing & Computing Model...</p>
                        </div>
                      </div>
                    ) : results[activeTab] ? (
                      <div className="font-mono text-sm leading-relaxed">
                        <MarkdownRenderer content={results[activeTab]!} />
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-green-900 font-mono text-xs border border-dashed border-green-900/30 rounded mx-4 my-8 bg-green-900/5">
                        <Server className="w-8 h-8 mb-3 opacity-50" />
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
      <footer className="h-8 bg-black border-t border-green-900/50 px-4 flex items-center justify-between text-[10px] text-green-700 font-mono shrink-0">
        <div>SERVER: ASIA-SOUTHEAST1-A</div>
        <div className="flex gap-6">
          <span>MODEL: GEMINI-3.5-FLASH</span>
          <span>VERSION: KJ.1.0-STABLE</span>
        </div>
      </footer>
    </div>
  );
}
