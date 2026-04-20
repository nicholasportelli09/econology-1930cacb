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
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card card-shadow overflow-hidden">
      <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-display font-semibold text-foreground">AI News Digest</h3>
            <p className="text-xs text-muted-foreground">A ≤300-word personalized summary across {articles.length} articles.</p>
          </div>
        </div>
        <button
          onClick={handleDigest}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground shadow-md transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Generating...</>
          ) : (
            <><Sparkles size={16} /> {digest ? "Hide Digest" : "Generate AI Digest"}</>
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
