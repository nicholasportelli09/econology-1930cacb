import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type UserProfile, FINANCIAL_GOALS } from "@/types/profile";
import { Target } from "lucide-react";

interface Props {
  profile: UserProfile;
  toggleArrayField: (field: keyof UserProfile, value: string) => void;
}

const StepGoals = ({ profile, toggleArrayField }: Props) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-primary">
        <Target size={28} />
      </div>
      <h2 className="text-3xl font-display font-bold text-foreground">Your Goals</h2>
      <p className="text-muted-foreground">What do you want to achieve? Pick at least one.</p>
    </div>

    <div className="space-y-3 pt-4">
      <Label>Financial Goals</Label>
      <div className="grid grid-cols-1 gap-3">
        {FINANCIAL_GOALS.map((goal) => (
          <label
            key={goal}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer transition-colors hover:border-primary/40"
          >
            <Checkbox
              checked={profile.financialGoals.includes(goal)}
              onCheckedChange={() => toggleArrayField("financialGoals", goal)}
            />
            <span className="text-sm text-foreground">{goal}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

export default StepGoals;
