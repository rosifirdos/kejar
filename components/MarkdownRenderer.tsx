'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

function MermaidDiagram({ chart }: { chart: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [svgStr, setSvgStr] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        const id = `mermaid-svg-${Math.round(Math.random() * 10000000)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgStr(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to render diagram');
          console.error("Mermaid error:", err);
        }
      }
    };
    renderDiagram();
    return () => { isMounted = false; };
  }, [chart]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded text-red-600 font-mono text-sm">
        <p>Mermaid Syntax Error:</p>
        <pre className="mt-2 whitespace-pre-wrap">{error}</pre>
        <p className="mt-2 text-xs">Chart source:</p>
        <pre className="mt-1 whitespace-pre-wrap opacity-50">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      className="my-6 p-4 bg-white border border-slate-200 rounded-md shadow-sm overflow-x-auto flex justify-center"
      ref={chartRef}
      dangerouslySetInnerHTML={{ __html: svgStr || '<div class="text-slate-500 animate-pulse">Rendering diagram...</div>' }}
    />
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const {children, className, node, ...rest} = props
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : null;
            
            if (language === 'mermaid') {
              return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
            }
            
            return (
              <code {...rest} className={className}>
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

