import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { type UserProfile, defaultProfile, STUDENT_STATUSES, LIVING_SITUATIONS, FINANCIAL_GOALS, TOPICS_OF_INTEREST, LEARNING_STYLES } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Save, RotateCcw, Trash2 } from "lucide-react";

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getProfile);
  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const update = (patch: Partial<UserProfile>) => setProfile((p) => ({ ...p, ...patch }));

  const toggleArray = (field: "financialGoals" | "topicsOfInterest" | "debtTypes", value: string) => {
    setProfile((p) => {
      const arr = p[field];
      return { ...p, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const saveProfile = () => {
    localStorage.setItem("econology_profile", JSON.stringify(profile));
    toast({ title: "Profile saved!", description: "Your preferences have been updated." });
  };

  const resetQuiz = () => {
    const updated = { ...profile, quizScore: null };
    setProfile(updated);
    localStorage.setItem("econology_profile", JSON.stringify(updated));
    toast({ title: "Quiz reset", description: "You can retake the quiz now." });
  };

  const clearDismissedTips = () => {
    localStorage.removeItem("econology_dismissed_tips");
    toast({ title: "Tips restored", description: "All dismissed tips are visible again." });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <section>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </section>

        {/* Profile Info */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow space-y-5">
          <h2 className="text-lg font-display font-semibold text-foreground">Profile Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={profile.name} onChange={(e) => update({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input value={profile.age} onChange={(e) => update({ age: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={profile.studentStatus} onValueChange={(v) => update({ studentStatus: v })}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {STUDENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Living Situation</Label>
              <Select value={profile.livingSituation} onValueChange={(v) => update({ livingSituation: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {LIVING_SITUATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monthly Income</Label>
              <Input value={profile.monthlyIncome} onChange={(e) => update({ monthlyIncome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Current Savings</Label>
              <Input value={profile.currentSavings} onChange={(e) => update({ currentSavings: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Learning Style</Label>
              <Select value={profile.learningStyle} onValueChange={(v) => update({ learningStyle: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {LEARNING_STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <Label>Financial Goals</Label>
            <div className="flex flex-wrap gap-2">
              {FINANCIAL_GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleArray("financialGoals", g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    profile.financialGoals.includes(g)
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <Label>Topics of Interest</Label>
            <div className="flex flex-wrap gap-2">
              {TOPICS_OF_INTEREST.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleArray("topicsOfInterest", t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    profile.topicsOfInterest.includes(t)
                      ? "bg-secondary/20 text-secondary border-secondary/30"
                      : "bg-muted text-muted-foreground border-border hover:border-secondary/30"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={saveProfile} className="w-full">
            <Save size={16} /> Save Profile
          </Button>
        </div>

        {/* Actions */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow space-y-4">
          <h2 className="text-lg font-display font-semibold text-foreground">Actions</h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={resetQuiz} className="flex-1">
              <RotateCcw size={16} /> Reset Quiz
            </Button>
            <Button variant="outline" onClick={clearDismissedTips} className="flex-1">
              <Trash2 size={16} /> Restore Dismissed Tips
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/quiz")}
            className="w-full"
          >
            Retake Quiz
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
