import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Newspaper, Loader2, Target, Lightbulb, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { loadLiteracyProfile, pickNextConcept } from "@/lib/literacy";
import { loadLessonProgress } from "@/lib/lessons";
import { CONCEPT_BY_ID, DIMENSION_LABELS, type Dimension } from "@/data/conceptGraph";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface NewsItem {
  title: string;
  summary: string;
  impact: string;
  action: string;
  category: string;
}

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

/**
 * Dashboard hero: pulls the most relevant macro headline and ties it to the
 * user's current lesson dimension. This is the differentiator surface — it has
 * to land on first glance.
 */
export default function NewsInsightHero() {
  const { user } = useAuth();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [tieIn, setTieIn] = useState<{ dim: Dimension; conceptId: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        // Figure out the user's current learning context.
        const [profile, progress] = await Promise.all([
          loadLiteracyProfile(user.id),
          loadLessonProgress(user.id),
        ]);
        if (profile) {
          const completed = new Set(progress.map((p) => p.conceptId));
          const pick = pickNextConcept(profile, completed);
          if (pick) {
            const c = CONCEPT_BY_ID[pick.conceptId];
            if (!cancelled) setTieIn({ dim: c.dimension, conceptId: c.id, title: c.title });
          }
        }

        // Pull personalized news.
        const userProfile = getProfile();
        const { data, error } = await supabase.functions.invoke("economic-news", {
          body: { profile: userProfile, portfolio: [] },
        });
        if (cancelled) return;
        if (error || !data?.news?.length) {
          setError(true);
          return;
        }
        // Prefer a story whose category overlaps the user's current dimension.
        const news: NewsItem[] = data.news;
        const dimToCats: Record<Dimension, string[]> = {
          macro: ["Interest Rates", "Inflation", "Policy"],
          investing: ["Markets"],
          credit: ["Interest Rates"],
          budgeting: ["Inflation"],
          risk: ["Markets"],
        };
        const preferred = tieIn
          ? news.find((n) => dimToCats[tieIn.dim].some((c) => n.category?.includes(c)))
          : null;
        setItem(preferred ?? news[0]);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <section className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-5 flex items-center gap-3">
        <Loader2 size={16} className="animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Pulling today's market story…</span>
      </section>
    );
  }

  if (error || !item) {
    return (
      <Link
        to="/news"
        className="block rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors group"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
          <Sparkles size={13} className="text-primary" /> Today's market story
        </div>
        <p className="text-sm font-display font-semibold">Open AI Insights to see today's headlines tied to your learning.</p>
      </Link>
    );
  }

  return (
    <>
    <section className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/8 via-card to-accent/8 p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
          <Sparkles size={13} /> Today's market story
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
          {item.category}
        </span>
      </div>
      <h3 className="text-base md:text-lg font-display font-semibold text-foreground mb-1 leading-snug">
        {item.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.summary}</p>
      {tieIn && (
        <div className="flex items-center gap-2 text-xs text-foreground/80 bg-background/60 rounded-lg px-3 py-2 mb-3">
          <Newspaper size={13} className="text-primary shrink-0" />
          <span>
            Ties to <span className="font-semibold">{DIMENSION_LABELS[tieIn.dim]}</span> — your current lesson
            <span className="text-muted-foreground"> · {tieIn.title}</span>
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-3 py-1.5 transition-colors"
        >
          Read the 2-minute explainer <ArrowRight size={14} />
        </button>
        <Link
          to="/news"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          See all headlines <ExternalLink size={12} />
        </Link>
      </div>
    </section>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-primary mb-1">
            <Sparkles size={12} /> 2-minute explainer · {item.category}
          </div>
          <DialogTitle className="text-xl font-display leading-snug">{item.title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed pt-2">
            {item.summary}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
              <Target size={14} className="text-primary" /> Why it matters
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{item.impact}</p>
          </div>
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
              <Lightbulb size={14} className="text-accent" /> What you can do
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{item.action}</p>
          </div>
          {tieIn && (
            <div className="flex items-start gap-2 text-xs text-foreground/80 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2.5">
              <Newspaper size={14} className="text-primary shrink-0 mt-0.5" />
              <span>
                Ties to your current lesson on <span className="font-semibold">{tieIn.title}</span>
                <span className="text-muted-foreground"> ({DIMENSION_LABELS[tieIn.dim]})</span>.
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              to="/news"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              See all headlines <ArrowRight size={12} />
            </Link>
            {tieIn && (
              <Link
                to={`/lesson/${tieIn.conceptId}`}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                Open the related lesson <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}