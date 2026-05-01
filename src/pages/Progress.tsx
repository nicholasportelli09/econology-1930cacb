import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { type UserProfile, defaultProfile, normalizeTopicLabels } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";
import { loadLiteracyProfile, type LiteracyProfile } from "@/lib/literacy";
import { DIMENSION_LABELS, type Dimension } from "@/data/conceptGraph";
import { getLevel, ALL_BADGES, recordDailyLogin } from "@/lib/gamification";
import { Flame, Star, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    if (!stored) return defaultProfile;
    const parsed = JSON.parse(stored) as UserProfile;
    return { ...parsed, topicsOfInterest: normalizeTopicLabels(parsed.topicsOfInterest) };
  } catch {
    return defaultProfile;
  }
}

const Progress = () => {
  const { user } = useAuth();
  const profile = useMemo(getProfile, []);

  // Record daily login for streak
  const gam = useMemo(() => {
    const { state } = recordDailyLogin();
    return state;
  }, []);

  const level = useMemo(() => getLevel(gam.xp), [gam.xp]);

  const [literacy, setLiteracy] = useState<LiteracyProfile | null>(null);
  useEffect(() => {
    if (!user) return;
    loadLiteracyProfile(user.id).then(setLiteracy).catch(() => setLiteracy(null));
  }, [user]);

  const dimensionScores = useMemo(() => {
    const dims: Dimension[] = ["budgeting", "credit", "investing", "macro", "risk"];
    return dims.map((d) => ({
      dim: d,
      label: DIMENSION_LABELS[d],
      value: literacy?.scores[d] ?? 0,
    }));
  }, [literacy]);

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 py-8 space-y-8">
        <section className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Progress Overview</h1>
            <p className="text-muted-foreground">Your financial literacy development at a glance</p>
          </div>
          <button
            onClick={() => setShowMethodology(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <HelpCircle size={16} />
            <span className="hidden sm:inline">How it works</span>
          </button>
        </section>

        {/* Methodology Dialog */}
        <Dialog open={showMethodology} onOpenChange={setShowMethodology}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-display">How Your Progress is Measured</DialogTitle>
              <DialogDescription>
                Understanding the metrics behind your financial literacy journey.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 text-sm text-foreground">
              <div>
                <h3 className="font-semibold mb-1.5">Experience Points (XP)</h3>
                <p className="text-muted-foreground mb-2">XP measures your overall engagement with the platform. You earn XP through consistent usage and completing educational activities.</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex justify-between"><span>Daily login</span><span className="font-medium text-foreground">+15 XP</span></li>
                  <li className="flex justify-between"><span>Complete an assessment</span><span className="font-medium text-foreground">+30 XP</span></li>
                  <li className="flex justify-between"><span>Perfect assessment score</span><span className="font-medium text-foreground">+50 XP</span></li>
                  <li className="flex justify-between"><span>Study a financial insight</span><span className="font-medium text-foreground">+10 XP</span></li>
                  <li className="flex justify-between"><span>Use Budget Simulator</span><span className="font-medium text-foreground">+20 XP</span></li>
                  <li className="flex justify-between"><span>Consult Ekon AI</span><span className="font-medium text-foreground">+10 XP</span></li>
                </ul>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-1.5">Knowledge by Dimension</h3>
                <p className="text-muted-foreground">Each bar shows your mastery (0–100) in one of the five financial literacy dimensions, based on your placement assessment and lessons completed.</p>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-1.5">Levels & Achievements</h3>
                <p className="text-muted-foreground">As you accumulate XP, you advance through 8 proficiency levels — from <span className="font-medium text-foreground">Foundation</span> to <span className="font-medium text-foreground">Authority</span>. Achievements are awarded for specific milestones such as maintaining engagement streaks or completing a set number of assessments.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* XP & Level Bar */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                <Star size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">
                  Level {level.level} — {level.title}
                </h2>
                <p className="text-sm text-muted-foreground">{gam.xp} XP accumulated</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <Flame size={16} className="text-destructive" />
              <span className="text-sm font-display font-bold text-destructive">{gam.streak}</span>
              <span className="text-xs text-muted-foreground">day{gam.streak !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gradient-bg transition-all duration-700"
              style={{ width: `${level.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-muted-foreground">Level {level.level}</span>
            <span className="text-xs text-muted-foreground">
              {level.nextLevel ? `${level.nextLevel.minXP - gam.xp} XP to Level ${level.nextLevel.level}` : "Max Level!"}
            </span>
          </div>
        </div>

        {/* Knowledge by Dimension */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <h2 className="text-lg font-display font-semibold text-foreground mb-1">Knowledge by Dimension</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {literacy
              ? "Mastery across the five financial literacy dimensions."
              : "Take the placement assessment to see your dimension breakdown."}
          </p>
          <div className="space-y-4">
            {dimensionScores.map((d) => (
              <div key={d.dim}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm font-medium text-foreground">{d.label}</span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">{d.value}/100</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-bg transition-all duration-700"
                    style={{ width: `${Math.max(2, d.value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Achievements</h2>
            <span className="text-xs text-muted-foreground tabular-nums">{gam.badges.length}/{ALL_BADGES.length}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {ALL_BADGES.map((badge) => {
              const earned = gam.badges.includes(badge.id);
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all gap-2 ${
                    earned
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30 opacity-40"
                  }`}
                  title={badge.description}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <span className="text-[10px] font-medium text-foreground text-center leading-tight">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Progress;
