import { useState } from "react";
import { ExternalLink, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { type UserProfile } from "@/types/profile";
import ReactMarkdown from "react-markdown";

interface Article {
  title: string;
  text: string;
  url: string;
  image: string;
  site: string;
  publishedDate: string;
  symbol: string;
}

interface ArticleCardProps {
  article: Article;
  profile: UserProfile;
  formatDate: (d: string) => string;
}

export function ArticleCard({ article, profile, formatDate }: ArticleCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSummarize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (summary) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    setExpanded(true);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-article", {
        body: { article, profile, mode: "single" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSummary(data.summary);
    } catch {
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-4 p-4 hover:bg-muted/30 transition-colors"
      >
        {article.image && (
          <img
            src={article.image}
            alt=""
            className="w-24 h-24 md:w-32 md:h-24 rounded-lg object-cover shrink-0 bg-muted"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <ExternalLink size={14} className="shrink-0 text-muted-foreground mt-0.5" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.text}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {article.symbol && <Badge variant="outline" className="text-xs">{article.symbol}</Badge>}
            <span className="text-xs text-muted-foreground">{article.site}</span>
            <span className="text-xs text-muted-foreground">· {formatDate(article.publishedDate)}</span>
          </div>
        </div>
      </a>

      {/* Summary button */}
      <div className="border-t border-border px-4 py-2">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Summarizing...</>
          ) : (
            <>
              <Sparkles size={14} />
              {summary ? "AI Summary" : "Explain This Article"}
              {summary && (expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
            </>
          )}
        </button>
      </div>

      {/* Summary content */}
      {expanded && (loading || summary) && (
        <div className="border-t border-primary/20 bg-primary/5 px-4 py-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={14} className="animate-spin" /> Generating personalized summary...
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown>{summary!}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
