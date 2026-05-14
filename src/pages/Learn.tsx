import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
import { Seo } from "@/components/Seo";
  CONCEPTS_BY_DIMENSION,
  DIMENSION_LABELS,
  type Dimension,
  type ConceptNode,
  CONCEPT_BY_ID,
} from "@/data/conceptGraph";
import {
  loadLiteracyProfile,
  pickNextConcept,
  shouldOfferRetake,
  type LiteracyProfile,
} from "@/lib/literacy";
import { loadLessonProgress, loadStreak, type LessonProgressRow, type StreakState } from "@/lib/lessons";
import { CheckCircle2, Lock, Sparkles, ArrowRight, Flame, RotateCcw, PlayCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Learn = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LiteracyProfile | null>(null);
  const [progress, setProgress] = useState<LessonProgressRow[]>([]);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    (async () => {
      const [p, pr, s] = await Promise.all([
        loadLiteracyProfile(user.id),
        loadLessonProgress(user.id),
        loadStreak(user.id),
      ]);
      setProfile(p);
      setProgress(pr);
      setStreak(s);
      setLoadingData(false);
      if (!p) navigate("/placement");
    })();
  }, [user, loading, navigate]);

  if (loadingData || !profile || !streak) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-3xl mx-auto px-6 py-16 text-center text-muted-foreground">
          Loading your learning path…
        </main>
      </div>
    );
  }

  const completedSet = new Set(progress.map((p) => p.conceptId));
  const next = pickNextConcept(profile, completedSet);
  const offerRetake = shouldOfferRetake(profile.takenAt, streak.totalLessons);

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Learn — Econology" description="Browse 55+ deep dives across investing, markets, macro, and personal finance. Pick a topic and start learning." path="/learn" type="website" jsonLd={{"@context":"https://schema.org","@type":"Course","name":"Learn — Econology","description":"Browse 55+ deep dives across investing, markets, macro, and personal finance. Pick a topic and start learning.","provider":{"@type":"Organization","name":"Econology","url":"https://econology.lovable.app/"}}} />
      <DashboardHeader />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Learn</h1>
          <p className="text-muted-foreground text-sm">
            Personalized to your placement. Lessons unlock as you master prerequisites.
          </p>
        </div>

        {/* Watch & Learn promo — mirrors the Economic News banner on Markets */}
        <Link
          to="/videos"
          className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-accent/10 p-5 hover:border-primary/50 hover:from-primary/20 transition-all card-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <PlayCircle className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                Watch & Learn
                <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">Daily picks</Badge>
              </h2>
              <p className="text-sm text-muted-foreground">
                Hand-picked videos tagged to your curriculum. Watch one, answer a quick check, earn XP.
              </p>
            </div>
          </div>
          <ArrowRight className="text-primary shrink-0 group-hover:translate-x-1 transition-transform" size={20} />
        </Link>

        {/* Streak + lessons completed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard icon={<Flame size={18} className="text-orange-500" />} label="Current streak" value={`${streak.current} days`} />
          <StatCard icon={<Sparkles size={18} className="text-primary" />} label="Lessons completed" value={`${streak.totalLessons}`} />
        </div>

        {/* Next up */}
        {next ? (
          <NextLessonCard
            conceptId={next.conceptId}
            rationale={next.rationale}
            onStart={() => navigate(`/lesson/${next.conceptId}`)}
          />
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <h3 className="font-display font-semibold mb-1">You've completed every available lesson 🎉</h3>
            <p className="text-sm text-muted-foreground">
              New concepts will be added regularly. Try a re-take to see what's changed.
            </p>
          </div>
        )}

        {offerRetake && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Time for a re-take?</p>
              <p className="text-xs text-muted-foreground">
                You've completed {streak.totalLessons} lessons since your last placement. Re-test to refresh your path.
              </p>
            </div>
            <button
              onClick={() => navigate("/placement")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
            >
              <RotateCcw size={14} /> Re-take
            </button>
          </div>
        )}

        {/* Per-dimension grids */}
        {(["budgeting", "credit", "investing", "macro", "risk"] as Dimension[]).map((dim) => (
          <DimensionSection
            key={dim}
            dim={dim}
            score={profile.scores[dim]}
            concepts={CONCEPTS_BY_DIMENSION[dim]}
            completedSet={completedSet}
          />
        ))}
      </main>
    </div>
  );
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-display font-semibold">{value}</div>
      </div>
    </div>
  );
}

function NextLessonCard({
  conceptId, rationale, onStart,
}: {
  conceptId: string;
  rationale: string;
  onStart: () => void;
}) {
  const concept = CONCEPT_BY_ID[conceptId];
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
      <div className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">
        Next up
      </div>
      <h2 className="text-xl md:text-2xl font-display font-bold mb-1">{concept.title}</h2>
      <p className="text-sm text-muted-foreground mb-5">{rationale}</p>
      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)]"
      >
        Start lesson <ArrowRight size={16} />
      </button>
    </div>
  );
}

function DimensionSection({
  dim, score, concepts, completedSet,
}: {
  dim: Dimension;
  score: number;
  concepts: ConceptNode[];
  completedSet: Set<string>;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold">{DIMENSION_LABELS[dim]}</h2>
        <span className="text-xs text-muted-foreground">Placement: {score}%</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {concepts.map((c) => {
          const done = completedSet.has(c.id);
          const locked = c.prerequisites.some((p) => !completedSet.has(p));
          return (
            <ConceptTile key={c.id} concept={c} done={done} locked={locked && !done} />
          );
        })}
      </div>
    </section>
  );
}

function ConceptTile({ concept, done, locked }: { concept: ConceptNode; done: boolean; locked: boolean }) {
  const cardBase = `rounded-xl border p-4 h-full transition-all ${
    done
      ? "border-green-500/30 bg-green-500/5"
      : locked
      ? "border-border bg-card"
      : "border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
  }`;

  const header = (
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-display font-semibold text-sm">{concept.title}</h3>
      {done ? (
        <CheckCircle2 size={16} className="text-green-600 shrink-0" />
      ) : locked ? (
        <Lock size={14} className="text-muted-foreground shrink-0" />
      ) : null}
    </div>
  );

  if (locked) {
    return (
      <div className={cardBase}>
        {header}
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Locked — finish prerequisites first.
        </p>
        <Link
          to={`/lesson/${concept.id}?testOut=1`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Zap size={12} /> Test out (3/3 to skip)
        </Link>
      </div>
    );
  }

  if (done) return <div className={cardBase}>{header}</div>;
  return <Link to={`/lesson/${concept.id}`}><div className={cardBase}>{header}</div></Link>;
}

export default Learn;