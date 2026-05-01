import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loadLiteracyProfile, pickNextConcept } from "@/lib/literacy";
import { loadLessonProgress, loadStreak, hasDoneTodaysLesson } from "@/lib/lessons";
import { CONCEPT_BY_ID, DIMENSION_LABELS } from "@/data/conceptGraph";

/**
 * Daily lesson card on the dashboard.
 * Pulls from the placement-aware curriculum engine.
 */
export default function DailyLesson() {
  const { user } = useAuth();
  const [next, setNext] = useState<{ id: string; rationale: string } | null>(null);
  const [doneToday, setDoneToday] = useState(false);
  const [streakNum, setStreakNum] = useState(0);
  const [needsPlacement, setNeedsPlacement] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profile, progress, streak] = await Promise.all([
        loadLiteracyProfile(user.id),
        loadLessonProgress(user.id),
        loadStreak(user.id),
      ]);
      if (!profile) {
        setNeedsPlacement(true);
        setLoading(false);
        return;
      }
      const completed = new Set(progress.map((p) => p.conceptId));
      const pick = pickNextConcept(profile, completed);
      setNext(pick ? { id: pick.conceptId, rationale: pick.rationale } : null);
      setDoneToday(hasDoneTodaysLesson(streak));
      setStreakNum(streak.current);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 animate-pulse h-40" />
    );
  }

  if (needsPlacement) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 space-y-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <Sparkles size={16} /> Placement diagnostic
        </div>
        <h3 className="text-lg font-display font-semibold">Take 2 minutes to set your starting point</h3>
        <p className="text-sm text-muted-foreground">
          10 questions across 5 dimensions. We'll unlock the right lessons for you.
        </p>
        <Link
          to="/placement"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-all"
        >
          Start placement <ArrowRight size={14} />
        </Link>
      </section>
    );
  }

  if (!next) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 space-y-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <CheckCircle2 size={16} /> All caught up
        </div>
        <h3 className="text-lg font-display font-semibold">You've finished every available lesson</h3>
        <p className="text-sm text-muted-foreground">New concepts coming soon.</p>
      </section>
    );
  }

  const concept = CONCEPT_BY_ID[next.id];

  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <Flame size={16} /> Today's lesson
          </div>
          {streakNum > 0 && (
            <span className="text-xs text-muted-foreground">{streakNum}-day streak</span>
          )}
        </div>
        {doneToday && (
          <div className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 size={16} /> Done today
          </div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
          {DIMENSION_LABELS[concept.dimension]}
        </div>
        <h3 className="text-lg font-display font-semibold mb-1">{concept.title}</h3>
        <p className="text-sm text-muted-foreground">{next.rationale}</p>
      </div>

      <Link
        to={`/lesson/${concept.id}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-all"
      >
        {doneToday ? "Do another lesson" : "Start 3-minute lesson"} <ArrowRight size={14} />
      </Link>
    </section>
  );
}