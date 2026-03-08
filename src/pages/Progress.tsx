import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { HealthScoreRing } from "@/components/HealthScoreRing";
import { type UserProfile, defaultProfile, TOPICS_OF_INTEREST } from "@/types/profile";
import {
  getGamification,
  getLevel,
  ALL_BADGES,
  recordDailyLogin,
  computeHealthScore,
} from "@/lib/gamification";
import { BookOpen, Brain, Flame, Lightbulb, Star, Trophy, Zap, Target } from "lucide-react";

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
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
  const quizLevel =
    quizScore === null ? "Not taken" : quizScore >= 4 ? "Advanced" : quizScore >= 2 ? "Intermediate" : "Beginner";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <section>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Progress</h1>
          <p className="text-muted-foreground">Track your financial learning journey</p>
        </section>

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
                <p className="text-sm text-muted-foreground">{gam.xp} XP total</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <Flame size={16} className="text-destructive" />
              <span className="text-sm font-display font-bold text-destructive">{gam.streak}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
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

        {/* Financial Health Score + Stats side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Score */}
          <div className="rounded-xl border border-border bg-card p-6 card-shadow flex flex-col items-center">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target size={20} className="text-primary" />
              Financial Health Score
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
              { icon: Brain, label: "Quiz Score", value: quizScore !== null ? `${quizScore}/5` : "N/A", color: "text-primary" },
              { icon: BookOpen, label: "Topics Selected", value: `${profile.topicsOfInterest.length}/${TOPICS_OF_INTEREST.length}`, color: "text-secondary" },
              { icon: Lightbulb, label: "Tips Explored", value: tipsExplored.length, color: "text-accent" },
              { icon: Zap, label: "Total XP", value: gam.xp, color: "text-primary" },
              { icon: Trophy, label: "Badges", value: `${gam.badges.length}/${ALL_BADGES.length}`, color: "text-accent" },
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
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Badges</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {ALL_BADGES.map((badge) => {
              const earned = gam.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                    earned
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30 opacity-40"
                  }`}
                  title={badge.description}
                >
                  <span className="text-2xl mb-1">{badge.emoji}</span>
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
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Tips Explored</h2>
            <div className="flex flex-wrap gap-2">
              {tipsExplored.map((tip) => (
                <span key={tip} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/30 capitalize">
                  {tip.replace(/-/g, " ")}
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
            <h3 className="text-lg font-display font-semibold text-foreground">Try the Budget Simulator</h3>
            <p className="text-sm text-muted-foreground">Drag sliders to plan your spending and see savings projections!</p>
          </div>
        </button>
      </main>
    </div>
  );
};

export default Progress;
