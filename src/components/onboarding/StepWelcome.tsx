import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type UserProfile } from "@/types/profile";
import { Hand } from "lucide-react";

interface Props {
  profile: UserProfile;
  update: (fields: Partial<UserProfile>) => void;
}

const StepWelcome = ({ profile, update }: Props) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-primary">
        <Hand size={28} />
      </div>
      <h2 className="text-3xl font-display font-bold text-foreground">Welcome to Econology</h2>
      <p className="text-muted-foreground">Let's personalize your experience. Tell us a bit about yourself.</p>
    </div>

    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">What's your name?</Label>
        <Input
          id="name"
          placeholder="Enter your name"
          value={profile.name}
          onChange={(e) => update({ name: e.target.value })}
          maxLength={100}
          className="bg-white text-slate-900 placeholder:text-slate-400 border-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="age">How old are you?</Label>
        <Input
          id="age"
          type="number"
          placeholder="18"
          min={13}
          max={120}
          value={profile.age}
          onChange={(e) => update({ age: e.target.value })}
          className="bg-white text-slate-900 placeholder:text-slate-400 border-input"
        />
      </div>
    </div>
  </div>
);

export default StepWelcome;
