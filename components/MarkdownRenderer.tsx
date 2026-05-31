'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Mermaid = ({ text }: { text: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ref.current) {
      import('mermaid').then((mermaidModule) => {
        const mermaid = mermaidModule.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          fontFamily: 'inherit'
        });
        
        mermaid.render('mermaid-svg-' + Math.random().toString(36).substr(2, 9), text)
          .then((result) => {
            if (ref.current) {
              ref.current.innerHTML = result.svg;
              setError(null);
            }
          })
          .catch((e) => {
            setError(e.message);
          });
      });
    }
  }, [text]);

  return (
    <div className="mermaid flex justify-center py-4 overflow-x-auto bg-white border border-slate-200 rounded-md shadow-sm my-4">
      {error && (
        <div className="text-red-500 text-xs border border-red-500/20 bg-red-400/10 p-2 rounded">
          Failed to render diagram<br/>{error}
        </div>
      )}
      <div ref={ref} />
    </div>
  );
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body font-sans text-slate-800 leading-relaxed space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match && match[1] === 'mermaid') {
              return <Mermaid text={String(children).replace(/\n$/, '')} />;
            }
            if (!inline && match) {
              return (
                <div className="relative border border-slate-200 rounded-md bg-slate-50">
                  <div className="text-[10px] text-slate-400 absolute right-3 top-2 uppercase font-mono">{match[1]}</div>
                  <code className={`${className} block overflow-x-auto whitespace-pre text-slate-800 p-3 pt-6 my-0 text-xs font-mono`} {...props}>
                    {children}
                  </code>
                </div>
              );
            }
            if (!inline) {
               return (
                <code className="block overflow-x-auto whitespace-pre bg-slate-50 text-slate-800 p-3 rounded-md border border-slate-200 my-2 text-xs font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200" {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <div className="my-4 overflow-hidden max-w-full">{children}</div>;
          },
          h1: ({children}) => <h1 className="text-xl font-bold text-slate-900 mt-6 mb-3 tracking-tight">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg font-bold text-slate-900 mt-5 mb-2 tracking-tight">{children}</h2>,
          h3: ({children}) => <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mt-4 mb-2">{children}</h3>,
          p: ({children}) => <p className="mb-3 text-sm text-slate-700">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1 text-sm text-slate-700">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1 text-sm text-slate-700">{children}</ol>,
          table: ({children}) => (
            <div className="overflow-x-auto my-4 border border-slate-200 rounded-md shadow-sm">
              <table className="w-full text-xs text-left text-slate-700 border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({children}) => <thead className="text-[10px] uppercase text-slate-500 font-mono border-b border-slate-200 bg-slate-50">{children}</thead>,
          th: ({children}) => <th className="px-3 py-2 border-slate-200 font-semibold">{children}</th>,
          td: ({children}) => <td className="px-3 py-2 border-t border-slate-100">{children}</td>,
          tr: ({children}) => <tr className="hover:bg-slate-50">{children}</tr>,
          blockquote: ({children}) => <blockquote className="p-3 my-3 border-l-2 border-cyan-500 bg-cyan-50 rounded-r text-sm text-slate-600 italic">{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
