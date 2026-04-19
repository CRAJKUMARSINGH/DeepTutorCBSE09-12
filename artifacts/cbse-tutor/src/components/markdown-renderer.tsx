import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const isHindi = /[\u0900-\u097F]/.test(content);
  
  return (
    <div className={`prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-p:text-lg prose-p:leading-relaxed ${isHindi ? 'hindi-text' : ''} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className={`text-3xl font-bold mt-8 mb-4 text-foreground ${isHindi ? 'hindi-text' : ''}`}>{children}</h1>,
          h2: ({ children }) => <h2 className={`text-2xl font-bold mt-6 mb-3 text-foreground ${isHindi ? 'hindi-text' : ''}`}>{children}</h2>,
          h3: ({ children }) => <h3 className={`text-xl font-bold mt-5 mb-2 text-foreground ${isHindi ? 'hindi-text' : ''}`}>{children}</h3>,
          p: ({ children }) => <p className={`text-lg leading-relaxed text-muted-foreground mb-4 ${isHindi ? 'hindi-text' : ''}`}>{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
          li: ({ children }) => <li className={`text-muted-foreground ${isHindi ? 'hindi-text' : ''}`}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-6">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary font-medium">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-6 shadow-inner">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
