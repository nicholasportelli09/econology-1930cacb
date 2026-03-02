import { useState } from "react";
import { Sparkles, Loader2, FileText } from "lucide-react";
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

interface NewsDigestProps {
  articles: Article[];
  profile: UserProfile;
}

export function NewsDigest({ articles, profile }: NewsDigestProps) {
  const [digest, setDigest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDigest = async () => {
    if (digest) {
      setDigest(null);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-article", {
        body: { article: articles, profile, mode: "digest" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDigest(data.summary);
    } catch {
      setDigest("Failed to generate digest. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (articles.length < 2) return null;

  return (
    <div className="rounded-xl border border-border bg-card card-shadow overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">News Digest</h3>
          <span className="text-xs text-muted-foreground">({articles.length} articles)</span>
        </div>
        <button
          onClick={handleDigest}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Generating...</>
          ) : (
            <><Sparkles size={14} /> {digest ? "Hide Digest" : "Generate AI Digest"}</>
          )}
        </button>
      </div>

      {(loading || digest) && (
        <div className="border-t border-primary/20 bg-primary/5 px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing all articles and personalizing for you...</p>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown>{digest!}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
