import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { type UserProfile, defaultProfile, STUDENT_STATUSES, LIVING_SITUATIONS, FINANCIAL_GOALS, CURRICULUM_INTERESTS, EXTRA_INTERESTS, LEARNING_STYLES, normalizeTopicLabels } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Save, RotateCcw, Trash2, Bell, Mail, Youtube, Plus, X, Compass } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { type YouTubeCreator, DEFAULT_CREATORS, getCreators, saveCreators } from "@/data/youtubeCreators";
import { resetTour, startProductTour } from "@/lib/productTour";

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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(getProfile);
  const [notifEmail, setNotifEmail] = useState("");
  const [dailyDigest, setDailyDigest] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const [creators, setCreatorsState] = useState<YouTubeCreator[]>(getCreators);
  const [newChannelId, setNewChannelId] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [addingCreator, setAddingCreator] = useState(false);
  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // Load notification preferences
  useEffect(() => {
    if (!user) return;
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setNotifEmail(data.email || "");
          setDailyDigest(data.daily_digest ?? true);
          setMarketAlerts(data.market_news_alerts ?? true);
        } else if (user.email) {
          setNotifEmail(user.email);
        }
      });
  }, [user]);

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
    const updated = { ...profile, quizScore: null, quizScore2: null };
    setProfile(updated);
    localStorage.setItem("econology_profile", JSON.stringify(updated));
    toast({ title: "Quiz reset", description: "You can retake the quiz now." });
  };

  const saveNotificationPrefs = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save notification preferences.", variant: "destructive" });
      return;
    }
    if (!notifEmail) {
      toast({ title: "Email required", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    setNotifLoading(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          email: notifEmail,
          daily_digest: dailyDigest,
          market_news_alerts: marketAlerts,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (error) throw error;
      toast({ title: "Notifications saved!", description: "Your email notification preferences have been updated." });
    } catch (e: any) {
      console.error("Save notification prefs error:", e);
      toast({ title: "Error", description: e.message || "Failed to save preferences.", variant: "destructive" });
    } finally {
      setNotifLoading(false);
    }
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

          {/* Topics — split into curriculum dimensions and extras */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Learning topics</Label>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Drives lessons & news</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CURRICULUM_INTERESTS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleArray("topicsOfInterest", t.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      profile.topicsOfInterest.includes(t.label)
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Also interested in</Label>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">News only</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXTRA_INTERESTS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleArray("topicsOfInterest", t.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      profile.topicsOfInterest.includes(t.label)
                        ? "bg-secondary/20 text-secondary border-secondary/30"
                        : "bg-muted text-muted-foreground border-border hover:border-secondary/30"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={saveProfile} className="w-full">
            <Save size={16} /> Save Profile
          </Button>
        </div>

        {/* Email Notifications */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow space-y-5">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">Email Notifications</h2>
          </div>

          {!user && (
            <p className="text-sm text-muted-foreground">Sign in to enable email notifications.</p>
          )}

          <div className="space-y-2">
            <Label>Email Address</Label>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={notifEmail}
                onChange={(e) => setNotifEmail(e.target.value)}
                disabled={!user}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Daily Digest</p>
                <p className="text-xs text-muted-foreground">Receive a daily summary of key financial news</p>
              </div>
              <Switch checked={dailyDigest} onCheckedChange={setDailyDigest} disabled={!user} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Market News Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified about significant market events</p>
              </div>
              <Switch checked={marketAlerts} onCheckedChange={setMarketAlerts} disabled={!user} />
            </div>
          </div>

          <Button onClick={saveNotificationPrefs} className="w-full" disabled={!user || notifLoading}>
            <Save size={16} /> {notifLoading ? "Saving..." : "Save Notification Preferences"}
          </Button>
        </div>

        {/* YouTube Creators */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow space-y-5">
          <div className="flex items-center gap-2">
            <Youtube size={20} className="text-destructive" />
            <h2 className="text-lg font-display font-semibold text-foreground">YouTube Creators</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage the trusted financial educators whose videos appear on your Videos page.
          </p>

          <div className="space-y-2">
            {creators.map((c) => (
              <div
                key={c.channelId}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border bg-muted/30"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{c.channelId}</p>
                </div>
                <button
                  onClick={() => {
                    const updated = creators.filter((cr) => cr.channelId !== c.channelId);
                    setCreatorsState(updated);
                    saveCreators(updated);
                    toast({ title: "Creator removed", description: `${c.name} has been removed.` });
                  }}
                  className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add creator */}
          {addingCreator ? (
            <div className="space-y-3 border border-border rounded-lg p-4">
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input
                  placeholder="e.g. Graham Stephan"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Channel ID</Label>
                <Input
                  placeholder="e.g. UCVjlpEjEY9GpksqbEesJnNA"
                  value={newChannelId}
                  onChange={(e) => setNewChannelId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Find the channel ID: go to the YouTube channel → View Page Source → search for "channelId"
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    if (!newChannelId.trim() || !newChannelName.trim()) {
                      toast({ title: "Fill in both fields", variant: "destructive" });
                      return;
                    }
                    if (creators.some((c) => c.channelId === newChannelId.trim())) {
                      toast({ title: "Creator already exists", variant: "destructive" });
                      return;
                    }
                    const updated = [...creators, { channelId: newChannelId.trim(), name: newChannelName.trim(), tags: [] }];
                    setCreatorsState(updated);
                    saveCreators(updated);
                    setNewChannelId("");
                    setNewChannelName("");
                    setAddingCreator(false);
                    toast({ title: "Creator added!", description: `${newChannelName.trim()} will now appear in your Videos feed.` });
                  }}
                  className="flex-1"
                >
                  <Plus size={14} /> Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setAddingCreator(false); setNewChannelId(""); setNewChannelName(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setAddingCreator(true)} className="w-full">
              <Plus size={16} /> Add Creator
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCreatorsState(DEFAULT_CREATORS);
              saveCreators(DEFAULT_CREATORS);
              toast({ title: "Creators reset", description: "Restored to default creator list." });
            }}
            className="text-xs"
          >
            <RotateCcw size={14} /> Reset to Defaults
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

          <Button
            variant="outline"
            onClick={() => {
              resetTour();
              startProductTour();
              toast({ title: "Tutorial restarted", description: "Walking you through the app again." });
            }}
            className="w-full"
          >
            <Compass size={16} /> Replay Product Tour
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
