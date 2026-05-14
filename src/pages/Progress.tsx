import { useMemo, useState } from "react";
import { TIP_ARTICLES } from "@/data/tipArticles";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { HealthScoreRing } from "@/components/HealthScoreRing";
import { type UserProfile, defaultProfile, TOPICS_OF_INTEREST, normalizeTopicLabels } from "@/types/profile";
import {
import { Seo } from "@/components/Seo";
  getGamification,
  getLevel,
  ALL_BADGES,
  recordDailyLogin,
  computeHealthScore,
} from "@/lib/gamification";
import { BookOpen, Brain, Flame, Lightbulb, Star, Trophy, Zap, Target, HelpCircle } from "lucide-react";
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

function getDaysActive(): number {
  const first = localStorage.getItem("econology_first_visit");
  if (!first) {
    localStorage.setItem("econology_first_visit", new Date().toISOString());
    return 1;
  }
  const diff = Date.now() - new Date(first).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getTipsExplored(): string[] {
  try {
    return JSON.parse(localStorage.getItem("econology_tips_explored") || "[]");
  } catch {
    return [];
  }
}

const Progress = () => {
  const navigate = useNavigate();
  const profile = useMemo(getProfile, []);
  const daysActive = useMemo(getDaysActive, []);
  const tipsExplored = useMemo(getTipsExplored, []);

  // Record daily login for streak
  const gam = useMemo(() => {
    const { state } = recordDailyLogin();
    return state;
  }, []);

  const level = useMemo(() => getLevel(gam.xp), [gam.xp]);
  const health = useMemo(() => computeHealthScore(profile, gam), [profile, gam]);

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const quizScore = profile.quizScore;
  const QUIZ_TOTAL = 5;
  const placementPct = quizScore === null ? null : Math.round((quizScore / QUIZ_TOTAL) * 100);
  const quizLevel =
    quizScore === null ? "Not taken" : quizScore >= 4 ? "Advanced" : quizScore >= 2 ? "Intermediate" : "Beginner";

  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Progress — Econology" description="Track your XP, streaks, completed lessons, and Financial Health Score over time." path="/progress" type="website" />
      <DashboardHeader initials={initials} />

      <main className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-6 py-8 space-y-8">
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
                <h3 className="font-semibold mb-1.5">Learning Progress Score (0–100)</h3>
                <p className="text-muted-foreground mb-2">A composite metric reflecting four key dimensions of your financial development:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><span className="font-medium text-foreground">Knowledge (25 pts)</span> — Based on your best assessment score. Higher scores indicate stronger foundational understanding.</li>
                  <li><span className="font-medium text-foreground">Engagement (25 pts)</span> — Measures consistency: insights studied, login streak, simulator usage, and assessments completed.</li>
                  <li><span className="font-medium text-foreground">Goals (25 pts)</span> — Reflects how clearly you've defined your financial objectives. Setting 3+ goals earns full marks.</li>
                  <li><span className="font-medium text-foreground">Diversification (25 pts)</span> — Tracks breadth of topics explored. Selecting 4+ interest areas earns full marks.</li>
                </ul>
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

        {/* Learning Progress Score + Stats side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Learning Progress Score */}
          <div className="rounded-xl border border-border bg-card p-6 card-shadow flex flex-col items-center">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target size={20} className="text-primary" />
              Learning Progress Score
            </h2>
            <div className="relative">
              <HealthScoreRing score={health.score} />
            </div>
            <div className="w-full mt-6 space-y-2">
              {health.breakdown.map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24">{b.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(b.value / b.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-10 text-right">{b.value}/{b.max}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 content-start">
            {[
              { icon: Flame, label: "Days Active", value: daysActive, color: "text-destructive" },
              { icon: Brain, label: "Placement", value: placementPct !== null ? `${quizScore}/${QUIZ_TOTAL} · ${placementPct}%` : "N/A", color: "text-primary" },
              { icon: BookOpen, label: "Topics Selected", value: `${profile.topicsOfInterest.length}/${TOPICS_OF_INTEREST.length}`, color: "text-secondary" },
              { icon: Lightbulb, label: "Insights Studied", value: tipsExplored.length, color: "text-accent" },
              { icon: Zap, label: "Total XP", value: gam.xp, color: "text-primary" },
              { icon: Trophy, label: "Achievements", value: `${gam.badges.length}/${ALL_BADGES.length}`, color: "text-accent" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-border bg-card p-4 card-shadow text-center space-y-1.5">
                  <Icon size={22} className={`mx-auto ${s.color}`} />
                  <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Achievements</h2>
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

        {/* Knowledge Level */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Knowledge Level</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full gradient-bg transition-all duration-500"
                  style={{ width: `${((quizScore ?? 0) / 5) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-foreground">{quizLevel}</span>
          </div>
        </div>

        {/* Topics */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Selected Topics</h2>
          <div className="flex flex-wrap gap-2">
            {TOPICS_OF_INTEREST.map((topic) => {
              const selected = profile.topicsOfInterest.includes(topic);
              return (
                <span
                  key={topic}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selected
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {topic}
                </span>
              );
            })}
          </div>
        </div>

        {/* Tips Explored */}
        {tipsExplored.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 card-shadow">
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Insights Studied</h2>
            <div className="flex flex-wrap gap-2">
              {tipsExplored.map((tip) => (
                <span key={tip} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/30">
                  {TIP_ARTICLES[tip]?.title ?? tip}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Budget Simulator CTA */}
        <button
          onClick={() => navigate("/budget")}
          className="w-full rounded-xl border border-border bg-card p-6 card-shadow text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <span className="text-2xl">💰</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-display font-semibold text-foreground">Budget Simulator</h3>
            <p className="text-sm text-muted-foreground">Model your spending allocation and visualize long-term savings projections.</p>
          </div>
        </button>
      </main>
    </div>
  );
};

export default Progress;
