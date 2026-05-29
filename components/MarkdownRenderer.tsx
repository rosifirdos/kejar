'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  fontFamily: 'inherit'
});

function MermaidChart({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      const id = `mermaid-${Math.random().toString(36).substring(7)}`;
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      }).catch(err => {
        console.error("Mermaid Render Error", err);
        if (ref.current) {
          ref.current.innerHTML = `<div class="text-red-500 border border-red-500 p-4 rounded bg-red-500/10">Failed to render diagram</div>`;
        }
      });
    }
  }, [chart]);

  return <div ref={ref} className="my-6 overflow-x-auto flex justify-center" />;
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body font-mono text-green-500 leading-relaxed space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match && match[1] === "mermaid") {
              return <MermaidChart chart={String(children).replace(/\n$/, "")} />;
            }
            if (!inline && match) {
              return (
                <div className="relative border border-green-900/50 rounded bg-[#0a0a0a]">
                  <div className="text-[10px] text-green-700 absolute right-3 top-2 uppercase font-mono">{match[1]}</div>
                  <code className={`${className} block overflow-x-auto text-green-400 p-3 pt-6 my-0 text-xs font-mono`} {...props}>
                    {children}
                  </code>
                </div>
              );
            }
            if (!inline) {
               return (
                <code className="block overflow-x-auto bg-[#0a0a0a] text-green-400 p-3 rounded border border-green-900/50 my-2 text-xs font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-green-900/30 text-green-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <pre className="my-4">{children}</pre>;
          },
          h1: ({children}) => <h1 className="text-xl font-bold text-green-400 mt-6 mb-3 tracking-tight">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg font-bold text-green-400 mt-5 mb-2 tracking-tight">{children}</h2>,
          h3: ({children}) => <h3 className="text-sm font-bold uppercase tracking-wider text-green-600 mt-4 mb-2">{children}</h3>,
          p: ({children}) => <p className="mb-3 text-sm">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1 text-sm">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1 text-sm">{children}</ol>,
          table: ({children}) => (
            <div className="overflow-x-auto my-4 border border-green-900/50 rounded">
              <table className="w-full text-xs text-left text-green-500 border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({children}) => <thead className="text-[10px] uppercase text-green-700 font-mono border-b border-green-900/50 bg-[#0a0a0a]">{children}</thead>,
          th: ({children}) => <th className="px-3 py-2 border-b border-green-900/50">{children}</th>,
          td: ({children}) => <td className="px-3 py-2 border-b border-green-900/30">{children}</td>,
          tr: ({children}) => <tr className="hover:bg-green-900/10">{children}</tr>,
          blockquote: ({children}) => <blockquote className="p-3 my-3 border-l-2 border-green-500 bg-green-500/10 rounded-r text-sm text-green-600 italic">{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
