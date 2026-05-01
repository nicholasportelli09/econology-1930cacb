import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { type UserProfile, defaultProfile } from "@/types/profile";
import {
  CURATED_VIDEOS,
  VIDEO_BY_ID,
  type CuratedVideo,
  type VideoLevel,
  isVideoAllowed,
  maxLevelForScore,
  pickNextVideo,
} from "@/data/curatedVideos";
import {
  CONCEPT_BY_ID,
  DIMENSION_LABELS,
  type Dimension,
} from "@/data/conceptGraph";
import { loadLiteracyProfile, type LiteracyProfile } from "@/lib/literacy";
import {
  loadWatchedVideoIds,
  recordVideoWatch,
  VIDEO_XP_CORRECT,
  VIDEO_XP_WATCHED,
} from "@/lib/videoLessons";
import { loadLessonProgress } from "@/lib/lessons";
import {
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  Info,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

const LEVEL_BADGE: Record<VideoLevel, string> = {
  beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const ALL_DIMENSIONS: Dimension[] = [
  "budgeting",
  "credit",
  "investing",
  "macro",
  "risk",
];

const Videos = () => {
  const { user } = useAuth();
  const profile = useMemo(getProfile, []);
  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const [literacy, setLiteracy] = useState<LiteracyProfile | null>(null);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [completedConcepts, setCompletedConcepts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filterDim, setFilterDim] = useState<Dimension | "all">("all");
  const [activeVideo, setActiveVideo] = useState<CuratedVideo | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const [lp, w, prog] = await Promise.all([
        loadLiteracyProfile(user.id),
        loadWatchedVideoIds(user.id),
        loadLessonProgress(user.id),
      ]);
      setLiteracy(lp);
      setWatched(w);
      setCompletedConcepts(
        new Set(prog.map((p) => p.conceptId).filter((id) => !id.startsWith("video:"))),
      );
      setLoading(false);
    })();
  }, [user]);

  /** Per-concept max video level the user is allowed to watch. */
  const conceptMaxLevel = (conceptId: string): VideoLevel => {
    if (!literacy) return "beginner";
    const concept = CONCEPT_BY_ID[conceptId];
    if (!concept) return "beginner";
    // If already mastered the concept (lesson completed), open everything.
    if (completedConcepts.has(conceptId)) return "advanced";
    const score = literacy.scores[concept.dimension] ?? 0;
    return maxLevelForScore(score);
  };

  const allowed = (v: CuratedVideo) => isVideoAllowed(v, conceptMaxLevel);

  // "Because you finished X" rail — videos for the most recent lesson.
  const recommendedAfterLesson = useMemo(() => {
    if (completedConcepts.size === 0) return null;
    // Pick the last-completed concept that has at least one allowed video.
    const completedIds = Array.from(completedConcepts);
    for (let i = completedIds.length - 1; i >= 0; i--) {
      const cid = completedIds[i];
      const vids = CURATED_VIDEOS.filter(
        (v) => v.concepts.includes(cid) && allowed(v) && !watched.has(v.id),
      );
      if (vids.length > 0) {
        return { conceptId: cid, videos: vids.slice(0, 3) };
      }
    }
    return null;
  }, [completedConcepts, watched, literacy]);

  const filteredVideos = useMemo(() => {
    return CURATED_VIDEOS.filter((v) => {
      if (filterDim === "all") return true;
      return v.concepts.some((c) => CONCEPT_BY_ID[c]?.dimension === filterDim);
    });
  }, [filterDim]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 py-8 space-y-10">
        {/* Header */}
        <section className="flex items-start justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Watch & Learn
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Hand-picked videos, tagged to your curriculum. Watch one, answer a
              quick check, earn XP. We pick what's next — not YouTube.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
                <Info size={18} />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">How this works</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Every video is <strong className="text-foreground">tagged to a concept</strong> in your learning graph — same taxonomy as lessons and news.
                </p>
                <p>
                  Videos are <strong className="text-foreground">level-matched</strong> to your placement scores. As you master concepts, harder videos unlock.
                </p>
                <p>
                  After you watch, answer one quick-check to earn{" "}
                  <strong className="text-foreground">{VIDEO_XP_CORRECT} XP</strong> ({VIDEO_XP_WATCHED} XP for trying).
                </p>
                <p>
                  When a video ends, we suggest a related lesson or another vetted video — never YouTube's autoplay.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Active video player */}
        {activeVideo && (
          <ActiveVideoCard
            video={activeVideo}
            allowed={allowed}
            watchedIds={watched}
            onClose={() => setActiveVideo(null)}
            onComplete={async (correct) => {
              if (!user) {
                toast({
                  title: "Sign in to earn XP",
                  description: "Your watch history doesn't save without an account.",
                });
                return;
              }
              const { xpAwarded, firstTime } = await recordVideoWatch(
                user.id,
                activeVideo.id,
                correct,
              );
              setWatched((s) => new Set(s).add(activeVideo.id));
              if (firstTime) {
                toast({
                  title: correct ? `+${xpAwarded} XP — nice!` : `+${xpAwarded} XP — at least you watched`,
                  description: correct
                    ? "Quick-check correct."
                    : "Try the lesson on this concept to lock it in.",
                });
              }
            }}
            onPickNext={(next) => setActiveVideo(next)}
          />
        )}

        {/* Because you finished X */}
        {!loading && recommendedAfterLesson && !activeVideo && (
          <section className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-xl font-display font-semibold text-foreground">
                Because you finished{" "}
                <span className="text-primary">
                  {CONCEPT_BY_ID[recommendedAfterLesson.conceptId]?.title}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedAfterLesson.videos.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  watched={watched.has(v.id)}
                  locked={false}
                  onPlay={() => setActiveVideo(v)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Dimension filter */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterDim("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterDim === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All topics
            </button>
            {ALL_DIMENSIONS.map((d) => (
              <button
                key={d}
                onClick={() => setFilterDim(d)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterDim === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {DIMENSION_LABELS[d]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideos.map((v, i) => {
                const locked = !allowed(v);
                return (
                  <VideoCard
                    key={v.id}
                    video={v}
                    watched={watched.has(v.id)}
                    locked={locked}
                    delayMs={i * 30}
                    onPlay={() => !locked && setActiveVideo(v)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

/* ───────────── Cards ───────────── */

function VideoCard({
  video,
  watched,
  locked,
  delayMs = 0,
  onPlay,
}: {
  video: CuratedVideo;
  watched: boolean;
  locked: boolean;
  delayMs?: number;
  onPlay: () => void;
}) {
  const dim = CONCEPT_BY_ID[video.concepts[0]]?.dimension;
  return (
    <div
      className={`group rounded-xl border bg-card overflow-hidden card-shadow transition-all duration-200 animate-fade-in ${
        locked
          ? "border-border opacity-60"
          : "border-border hover:-translate-y-0.5 hover:border-primary/30"
      }`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <button
        onClick={onPlay}
        disabled={locked}
        className="w-full text-left disabled:cursor-not-allowed"
      >
        <div className="relative aspect-video bg-muted">
          <img
            src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {locked ? (
              <div className="w-14 h-14 rounded-full bg-background/80 flex items-center justify-center">
                <Lock size={22} className="text-muted-foreground" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                <Play size={24} className="text-primary-foreground ml-1" />
              </div>
            )}
          </div>
          {watched && (
            <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} /> Watched
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <Clock size={11} /> {video.minutes}m
          </div>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate">
              {video.channel}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${LEVEL_BADGE[video.level]}`}
            >
              {video.level}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {video.concepts.slice(0, 2).map((c) => (
              <span
                key={c}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {CONCEPT_BY_ID[c]?.title ?? c}
              </span>
            ))}
          </div>
          {locked && dim && (
            <p className="text-[11px] text-muted-foreground pt-1">
              Master more {DIMENSION_LABELS[dim]} concepts to unlock
            </p>
          )}
        </div>
      </button>
    </div>
  );
}

/* ───────────── Active player + quick-check ───────────── */

type Phase = "watch" | "check" | "result";

function ActiveVideoCard({
  video,
  allowed,
  watchedIds,
  onClose,
  onComplete,
  onPickNext,
}: {
  video: CuratedVideo;
  allowed: (v: CuratedVideo) => boolean;
  watchedIds: Set<string>;
  onClose: () => void;
  onComplete: (correct: boolean) => Promise<void>;
  onPickNext: (next: CuratedVideo) => void;
}) {
  const [phase, setPhase] = useState<Phase>("watch");
  const [pick, setPick] = useState<number | null>(null);

  // Reset when video changes
  useEffect(() => {
    setPhase("watch");
    setPick(null);
  }, [video.id]);

  const correct = pick === video.quickCheck.correct;
  const nextVideo = useMemo(
    () => pickNextVideo(video, watchedIds, allowed),
    [video, watchedIds, allowed],
  );
  const relatedConcept = video.concepts[0];

  return (
    <section className="rounded-2xl border border-primary/30 bg-card overflow-hidden card-shadow animate-fade-in">
      <div className="grid lg:grid-cols-[1fr_360px]">
        {/* Player */}
        <div className="relative aspect-video bg-black">
          {/* rel=0 + modestbranding kills YouTube's "next up" overlay/algorithm */}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Side panel */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
                {video.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {video.channel} · {video.minutes} min
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>

          {phase === "watch" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                When you're done, answer one quick check to lock it in and earn XP.
              </p>
              <button
                onClick={() => setPhase("check")}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                I finished — quick check <ArrowRight size={15} />
              </button>
            </div>
          )}

          {phase === "check" && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                {video.quickCheck.q}
              </p>
              <div className="space-y-2">
                {video.quickCheck.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setPick(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                      pick === i
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                disabled={pick === null}
                onClick={async () => {
                  await onComplete(correct);
                  setPhase("result");
                }}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                Submit
              </button>
            </div>
          )}

          {phase === "result" && (
            <div className="space-y-3">
              <div
                className={`flex items-start gap-2 rounded-lg p-3 ${
                  correct
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                }`}
              >
                {correct ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={18} className="mt-0.5 shrink-0" />
                )}
                <div className="text-sm">
                  <p className="font-medium">
                    {correct ? "Correct" : "Not quite"}
                  </p>
                  <p className="opacity-80 mt-0.5">{video.quickCheck.explain}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                  Watch next
                </p>
                {nextVideo ? (
                  <button
                    onClick={() => onPickNext(nextVideo)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {nextVideo.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {nextVideo.channel} · {nextVideo.minutes} min
                    </p>
                  </button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No related video left — try a lesson instead.
                  </p>
                )}
                {relatedConcept && CONCEPT_BY_ID[relatedConcept] && (
                  <Link
                    to={`/lesson/${relatedConcept}`}
                    className="block w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                      Lesson
                    </p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {CONCEPT_BY_ID[relatedConcept].title}
                    </p>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Videos;