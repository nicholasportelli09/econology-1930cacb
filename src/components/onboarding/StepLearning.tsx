import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type UserProfile, CURRICULUM_INTERESTS, EXTRA_INTERESTS, LEARNING_STYLES } from "@/types/profile";
import { BookOpen, GraduationCap, Newspaper, Check } from "lucide-react";

interface Props {
  profile: UserProfile;
  update: (fields: Partial<UserProfile>) => void;
  toggleArrayField: (field: keyof UserProfile, value: string) => void;
}

const StepLearning = ({ profile, update, toggleArrayField }: Props) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-primary">
        <BookOpen size={28} />
      </div>
      <h2 className="text-3xl font-display font-bold text-slate-900">Learning Preferences</h2>
      <p className="text-slate-600">Almost done! Tell us how you like to learn.</p>
    </div>

    <div className="space-y-5 pt-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-primary" />
          <Label>Learning topics — what you want lessons on</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {CURRICULUM_INTERESTS.map((t) => {
            const active = profile.topicsOfInterest.includes(t.label);
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => toggleArrayField("topicsOfInterest", t.label)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  active
                    ? "bg-primary/15 text-primary border-primary/40 shadow-sm"
                    : "bg-card text-foreground border-border hover:border-primary/40"
                }`}
              >
                {active && <Check size={14} />} {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-secondary" />
          <Label>Also interested in — for news only</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXTRA_INTERESTS.map((t) => {
            const active = profile.topicsOfInterest.includes(t.label);
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => toggleArrayField("topicsOfInterest", t.label)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  active
                    ? "bg-secondary/20 text-secondary border-secondary/40 shadow-sm"
                    : "bg-card text-foreground border-border hover:border-secondary/40"
                }`}
              >
                {active && <Check size={14} />} {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferred Learning Style</Label>
        <Select value={profile.learningStyle} onValueChange={(v) => update({ learningStyle: v })}>
          <SelectTrigger><SelectValue placeholder="How do you like to learn?" /></SelectTrigger>
          <SelectContent>
            {LEARNING_STYLES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export default StepLearning;
