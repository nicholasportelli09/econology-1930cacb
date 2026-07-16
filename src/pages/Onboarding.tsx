import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { track } from "@/lib/analytics";
import StepWelcome from "@/components/onboarding/StepWelcome";
import StepSituation from "@/components/onboarding/StepSituation";
import StepMoney from "@/components/onboarding/StepMoney";
import StepGoals from "@/components/onboarding/StepGoals";
import StepLearning from "@/components/onboarding/StepLearning";

const STEP_TITLES = ["Welcome", "Current Situation", "Money Situation", "Goals", "Learning Preferences"];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const navigate = useNavigate();
  const totalSteps = 5;

  useEffect(() => {
    track("onboarding_started");
  }, []);

  const update = (fields: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  };

  const toggleArrayField = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleFinish = () => {
    localStorage.setItem("econology_profile", JSON.stringify(profile));
    track("onboarding_completed", {
      goals: profile.financialGoals,
      topics: profile.topicsOfInterest,
      learningStyle: profile.learningStyle,
    });
    navigate("/quiz");
  };

  const canProceed = () => {
    switch (step) {
      case 0: return profile.name.trim() !== "" && profile.age.trim() !== "";
      case 1: return profile.studentStatus !== "" && profile.livingSituation !== "";
      case 2: return true;
      case 3: return profile.financialGoals.length > 0;
      case 4: return profile.topicsOfInterest.length > 0 && profile.learningStyle !== "";
      default: return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepWelcome profile={profile} update={update} />;
      case 1: return <StepSituation profile={profile} update={update} />;
      case 2: return <StepMoney profile={profile} update={update} toggleArrayField={toggleArrayField} />;
      case 3: return <StepGoals profile={profile} toggleArrayField={toggleArrayField} />;
      case 4: return <StepLearning profile={profile} update={update} toggleArrayField={toggleArrayField} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-8">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{STEP_TITLES[step]}</span>
        </div>
        <Progress value={((step + 1) / totalSteps) * 100} className="h-2 mb-8 bg-muted [&>div]:gradient-bg" />

        {/* Step content */}
        <div className="flex-1 flex flex-col">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles size={16} /> Finish Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
