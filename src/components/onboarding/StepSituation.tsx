import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type UserProfile, STUDENT_STATUSES, LIVING_SITUATIONS } from "@/types/profile";
import { GraduationCap } from "lucide-react";

interface Props {
  profile: UserProfile;
  update: (fields: Partial<UserProfile>) => void;
}

const StepSituation = ({ profile, update }: Props) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-primary">
        <GraduationCap size={28} />
      </div>
      <h2 className="text-3xl font-display font-bold text-slate-900">Current Situation</h2>
      <p className="text-slate-600">This helps us tailor content to your life stage.</p>
    </div>

    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Student / Work Status</Label>
        <Select value={profile.studentStatus} onValueChange={(v) => update({ studentStatus: v })}>
          <SelectTrigger><SelectValue placeholder="Select your status" /></SelectTrigger>
          <SelectContent>
            {STUDENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Living Situation</Label>
        <Select value={profile.livingSituation} onValueChange={(v) => update({ livingSituation: v })}>
          <SelectTrigger><SelectValue placeholder="Select your living situation" /></SelectTrigger>
          <SelectContent>
            {LIVING_SITUATIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export default StepSituation;
