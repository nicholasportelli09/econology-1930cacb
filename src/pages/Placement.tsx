import { Seo } from "@/components/Seo";
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
      <Seo title="Placement quiz — Econology" description="Take the placement quiz so Econology can tailor your daily lessons to your current knowledge level." path="/placement" type="website" />
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

function PlacementResults({
  profile,
  onContinue,
}: {
  profile: LiteracyProfile;
  onContinue: () => void;
}) {
  const correct = profile.mastered.length;
  const wrong = profile.weak.length;
  const skipped = profile.unknown.length;
  const total = correct + wrong + skipped;

  const dims = useMemo(() => {
    const entries = Object.entries(profile.scores) as [keyof typeof profile.scores, number][];
    entries.sort((a, b) => a[1] - b[1]);
    return entries;
  }, [profile]);
  const weakest = dims[0];
  const strongest = dims[dims.length - 1];

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

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{correct >= 7 ? "🎯" : correct >= 4 ? "👏" : "🌱"}</div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            You scored {correct} / {total}
          </h1>
          <p className="text-muted-foreground">
            Here's where you're starting from. We'll point you at the right lessons next.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-3 text-center">
            <CheckCircle2 size={18} className="mx-auto mb-1 text-green-600" />
            <div className="text-xl font-display font-bold">{correct}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-3 text-center">
            <XCircle size={18} className="mx-auto mb-1 text-red-500" />
            <div className="text-xl font-display font-bold">{wrong}</div>
            <div className="text-xs text-muted-foreground">Missed</div>
          </div>
          <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-3 text-center">
            <MinusCircle size={18} className="mx-auto mb-1 text-muted-foreground" />
            <div className="text-xl font-display font-bold">{skipped}</div>
            <div className="text-xs text-muted-foreground">Skipped</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-5 mb-6 space-y-3">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            By area
          </h2>
          {dims.map(([dim, score]) => (
            <div key={dim}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground">{DIMENSION_LABELS[dim]}</span>
                <span className="text-muted-foreground font-medium">{score}%</span>
              </div>
              <Progress value={score} className="h-1.5 bg-muted [&>div]:gradient-bg" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6 text-sm text-foreground">
          <span className="font-semibold">Start here: </span>
          We'll begin with{" "}
          <span className="font-semibold">{DIMENSION_LABELS[weakest[0]]}</span>
          {strongest[1] > 0 && (
            <>
              {" "}— you're already strong in{" "}
              <span className="font-semibold">{DIMENSION_LABELS[strongest[0]]}</span>, so we'll skip ahead there.
            </>
          )}
        </div>

        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)]"
        >
          <Sparkles size={16} /> Continue to dashboard <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}