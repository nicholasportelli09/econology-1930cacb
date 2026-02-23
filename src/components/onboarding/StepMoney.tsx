import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { type UserProfile, DEBT_TYPES } from "@/types/profile";
import { Wallet } from "lucide-react";

interface Props {
  profile: UserProfile;
  update: (fields: Partial<UserProfile>) => void;
  toggleArrayField: (field: keyof UserProfile, value: string) => void;
}

const StepMoney = ({ profile, update, toggleArrayField }: Props) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-primary">
        <Wallet size={28} />
      </div>
      <h2 className="text-3xl font-display font-bold text-foreground">Money Situation</h2>
      <p className="text-muted-foreground">No judgment — this helps us give relevant advice.</p>
    </div>

    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="income">Monthly Income</Label>
        <Input
          id="income"
          placeholder="$500"
          value={profile.monthlyIncome}
          onChange={(e) => update({ monthlyIncome: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="savings">Current Savings</Label>
        <Input
          id="savings"
          placeholder="$100"
          value={profile.currentSavings}
          onChange={(e) => update({ currentSavings: e.target.value })}
        />
      </div>
      <div className="space-y-3">
        <Label>Any Debt? (select all that apply)</Label>
        <div className="grid grid-cols-1 gap-3">
          {DEBT_TYPES.map((debt) => (
            <label
              key={debt}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer transition-colors hover:border-primary/40"
            >
              <Checkbox
                checked={profile.debtTypes.includes(debt)}
                onCheckedChange={() => toggleArrayField("debtTypes", debt)}
              />
              <span className="text-sm text-foreground">{debt}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default StepMoney;
