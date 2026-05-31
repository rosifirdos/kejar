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
        throw new Error(`Invalid JSON dari server. Response: ${responseText.slice(0, 50)}...`);
      }
      setResults(prev => ({ ...prev, [activeTab]: data.text }));
    } catch (error: any) {
      setResults(prev => ({ ...prev, [activeTab]: `error\nTerjadi kesalahan: ${error.message}` }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-slate-900 flex flex-col justify-center px-6 shrink-0 shadow-sm z-10 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-500" />
              KeJar
            </h1>
            <div className="h-5 w-[1px] bg-slate-700 mx-2"></div>
            <span className="text-sm text-slate-400 font-medium">Workload & Network Optimizer</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="text-slate-300">System Normal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation (Tabs) */}
      <div className="bg-white border-b border-slate-200 px-6 shrink-0 flex items-end">
        <div className="flex gap-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  isActive 
                    ? 'border-cyan-600 text-cyan-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace */}
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex gap-6 h-full min-h-0 overflow-hidden"
          >
            {/* Left Column: Input Panel */}
            <div className="w-1/3 flex flex-col bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden shrink-0">
              <div className="py-3 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  Query Configuration
                </h3>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-4 bg-white">
                <div className="flex flex-col gap-1.5 h-full">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {activeTabData.label} Prompt
                  </label>
                  <textarea
                    autoFocus
                    className="flex-1 w-full bg-white border border-slate-300 rounded-md p-3 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors resize-none placeholder:text-slate-400"
                    placeholder={activeTabData.placeholder}
                    value={inputs[activeTab]}
                    onChange={(e) => setInputs(prev => ({ ...prev, [activeTab]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSubmit();
                      }
                    }}
                  />
                </div>
                
                <button
                  onClick={() => handleSubmit()}
                  disabled={!inputs[activeTab].trim() || isLoading}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border shadow-sm disabled:shadow-none disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-all shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Execute Task
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Output Panel */}
            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden min-w-0 h-full min-h-0">
              <div className="py-3 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <h3 className="text-sm font-semibold text-slate-800">
                  Execution Results
                </h3>
                  {results[activeTab] && (
                    <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-md text-xs font-medium">
                      Completed
                    </span>
                  )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                    <p className="text-sm text-slate-500 font-medium">Processing request with AI Engine...</p>
                  </div>
                ) : results[activeTab] ? (
                  <div className="text-base text-slate-800">
                    <MarkdownRenderer content={results[activeTab]!} />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-md bg-slate-50/50 p-8 text-center max-w-sm mx-auto my-8">
                    <Server className="w-10 h-10 mb-4 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600 mb-1">Awaiting Configuration</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Enter your {activeTabData.label.toLowerCase()} requirements in the configuration panel to generate infrastructure code and insights.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
