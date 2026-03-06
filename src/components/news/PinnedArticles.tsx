import { ExternalLink, Pin, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PinnedArticle {
  id: string;
  title: string;
  url: string;
  image: string;
  site: string;
  symbol: string;
  published_date: string;
  snippet: string;
}

interface PinnedArticlesProps {
  articles: PinnedArticle[];
  loading: boolean;
  onUnpin: (id: string) => void;
  formatDate: (d: string) => string;
}

export function PinnedArticles({ articles, loading, onUnpin, formatDate }: PinnedArticlesProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
        <Loader2 size={14} className="animate-spin" /> Loading pinned articles...
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Pin size={14} className="text-primary" />
        <span className="text-sm font-semibold text-foreground">Pinned Articles</span>
        <span className="text-xs text-muted-foreground">({articles.length})</span>
      </div>
      <div className="grid gap-2">
        {articles.map((article) => (
          <div key={article.id} className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            {article.image && (
              <img
                src={article.image}
                alt=""
                className="w-12 h-12 rounded-md object-cover shrink-0 bg-muted"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="flex-1 min-w-0">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1 flex items-center gap-1"
              >
                {article.title}
                <ExternalLink size={12} className="shrink-0 text-muted-foreground" />
              </a>
              <div className="flex items-center gap-2 mt-0.5">
                {article.symbol && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{article.symbol}</Badge>}
                <span className="text-[10px] text-muted-foreground">{article.site}</span>
                {article.published_date && (
                  <span className="text-[10px] text-muted-foreground">· {formatDate(article.published_date)}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => onUnpin(article.id)}
              className="shrink-0 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Unpin"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
