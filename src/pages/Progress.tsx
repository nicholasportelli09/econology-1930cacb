import { useMemo } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { type UserProfile, defaultProfile, TOPICS_OF_INTEREST } from "@/types/profile";
import { BookOpen, Brain, Flame, Lightbulb } from "lucide-react";

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
  const profile = useMemo(getProfile, []);
  const daysActive = useMemo(getDaysActive, []);
  const tipsExplored = useMemo(getTipsExplored, []);

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const quizScore = profile.quizScore;
  const quizLevel = quizScore === null ? "Not taken" : quizScore >= 4 ? "Advanced" : quizScore >= 2 ? "Intermediate" : "Beginner";

  const topicsCompleted = profile.topicsOfInterest.length;
  const totalTopics = TOPICS_OF_INTEREST.length;

  const stats = [
    { icon: Flame, label: "Days Active", value: daysActive, color: "text-destructive" },
    { icon: Brain, label: "Quiz Score", value: quizScore !== null ? `${quizScore}/5` : "N/A", color: "text-primary" },
    { icon: BookOpen, label: "Topics Selected", value: `${topicsCompleted}/${totalTopics}`, color: "text-secondary" },
    { icon: Lightbulb, label: "Tips Explored", value: tipsExplored.length, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <section>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Progress</h1>
          <p className="text-muted-foreground">Track your financial learning journey</p>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5 card-shadow text-center space-y-2">
                <Icon size={28} className={`mx-auto ${s.color}`} />
                <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quiz Level */}
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
      </main>
    </div>
  );
};

export default Progress;
