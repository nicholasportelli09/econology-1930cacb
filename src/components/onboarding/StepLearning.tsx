import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type UserProfile, TOPICS_OF_INTEREST, LEARNING_STYLES } from "@/types/profile";
import { BookOpen } from "lucide-react";

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

    <div className="space-y-4 pt-4">
      <div className="space-y-3">
        <Label>Topics of Interest (pick all that apply)</Label>
        <div className="grid grid-cols-1 gap-3">
          {TOPICS_OF_INTEREST.map((topic) => (
            <label
              key={topic}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer transition-colors hover:border-primary/40"
            >
              <Checkbox
                checked={profile.topicsOfInterest.includes(topic)}
                onCheckedChange={() => toggleArrayField("topicsOfInterest", topic)}
              />
              <span className="text-sm text-foreground">{topic}</span>
            </label>
          ))}
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
