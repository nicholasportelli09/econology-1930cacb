import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, SkipForward, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PLACEMENT_QUESTIONS } from "@/data/placementQuestions";
import {
  scorePlacement,
  saveLiteracyProfile,
  type PlacementAnswers,
  type LiteracyProfile,
} from "@/lib/literacy";
import { DIMENSION_LABELS } from "@/data/conceptGraph";
import { toast } from "@/hooks/use-toast";

const Placement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PlacementAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<LiteracyProfile | null>(null);

  const total = PLACEMENT_QUESTIONS.length;
  const q = PLACEMENT_QUESTIONS[step];
  const selected = answers[q.id];

  const choose = (i: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: i }));
  };
  const skip = () => {
    setAnswers((prev) => ({ ...prev, [q.id]: null }));
    if (step < total - 1) setStep(step + 1);
  };

  const finish = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Sign in to save your placement." });
      navigate("/login");
      return;
    }
    setSubmitting(true);
    try {
      const profile = scorePlacement(answers);
      await saveLiteracyProfile(user.id, profile);
      // Clear legacy onboarding state so users start fresh.
      localStorage.removeItem("econology_profile");
      localStorage.removeItem("econology_quiz_score");
      localStorage.removeItem("econology_quiz_score_2");
      localStorage.setItem("econology_placement_done", "true");
      setResults(profile);
    } catch (e) {
      console.error(e);
      toast({ title: "Could not save placement", description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const isLast = step === total - 1;
  const canProceed = selected !== undefined;

  if (results) {
    return <PlacementResults profile={results} onContinue={() => navigate("/dashboard")} />;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))",
      }}
    >
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {step + 1} of {total}</span>
          <span>{DIMENSION_LABELS[q.dimension]}</span>
        </div>
        <Progress
          value={((step + 1) / total) * 100}
          className="h-2 mb-8 bg-muted [&>div]:gradient-bg"
        />

        {step === 0 && (
          <div className="mb-6 rounded-xl bg-card/60 backdrop-blur p-5 border border-border">
            <h2 className="font-display font-semibold mb-1">Placement diagnostic</h2>
            <p className="text-sm text-muted-foreground">
              10 quick questions across 5 areas. We'll use your answers to unlock the
              right lessons — you'll skip what you already know and start where you actually need it. Skip anything you're not sure about.
            </p>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <h1 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-6">
            {q.question}
          </h1>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isActive = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:bg-muted/40 hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm md:text-base">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 mt-auto">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={skip}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <SkipForward size={14} /> Skip
            </button>
            {!isLast ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={16} /> {submitting ? "Saving…" : "See my placement"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Placement;