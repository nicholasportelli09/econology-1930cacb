import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2, XCircle, ArrowRight, Trophy, SkipForward } from "lucide-react";
import { QUIZ_QUESTIONS, QUIZ_QUESTIONS_2 } from "@/types/quiz";
import { type UserProfile } from "@/types/profile";

type Phase = "intro" | "question" | "results";

const Quiz = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quizSet = searchParams.get("set") === "2" ? 2 : 1;
  const questions = quizSet === 2 ? QUIZ_QUESTIONS_2 : QUIZ_QUESTIONS;

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const question = questions[currentQ];
  const total = questions.length;
  const isCorrect = selectedIndex === question?.correctIndex;

  const handleAnswer = useCallback(
    (index: number) => {
      if (answered) return;
      setSelectedIndex(index);
      setAnswered(true);
      if (index === question.correctIndex) {
        setScore((s) => s + 1);
      }
    },
    [answered, question],
  );

  const handleNext = () => {
    if (currentQ < total - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedIndex(null);
      setAnswered(false);
    } else {
      setPhase("results");
      saveScore(score);
    }
  };

  const handleSkip = () => {
    saveScore(null);
    navigate("/dashboard");
  };

  const saveScore = (finalScore: number | null) => {
    const stored = localStorage.getItem("econology_profile");
    if (stored) {
      const profile: UserProfile = JSON.parse(stored);
      if (quizSet === 2) {
        profile.quizScore2 = finalScore;
      } else {
        profile.quizScore = finalScore;
      }
      localStorage.setItem("econology_profile", JSON.stringify(profile));
    }
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  const quizTitle = quizSet === 2 ? "Advanced Knowledge Check" : "Quick Knowledge Check";
  const quizSubtitle = quizSet === 2
    ? "5 deeper questions on investing & finance. Let's see what you've learned!"
    : "Optional 5-question quiz to help us personalize your learning path.";

  // Intro screen
  if (phase === "intro") {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px] animate-pulse-glow [animation-delay:1.5s]" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-6 text-center">
          <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-8 glow-shadow">
            <Sparkles size={40} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">{quizTitle}</h1>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            {quizSubtitle}{" "}
            <span className="text-foreground font-medium">No pressure!</span>
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => setPhase("question")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)]"
            >
              <Sparkles size={16} /> Let's Go!
            </button>
            <button
              onClick={handleSkip}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <SkipForward size={16} /> Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (phase === "results") {
    const percentage = Math.round((score / total) * 100);
    const emoji = score === 5 ? "🎉" : score >= 3 ? "👏" : "💪";
    const message =
      score === 5
        ? "Perfect score! You've got a solid foundation!"
        : score >= 3
          ? "Great job! You know more than you think!"
          : "Good start! We'll help you learn the rest!";

    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px] animate-pulse-glow [animation-delay:1.5s]" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-6 text-center">
          <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-6 glow-shadow">
            <Trophy size={40} className="text-primary-foreground" />
          </div>
          <p className="text-5xl mb-4">{emoji}</p>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Quiz Complete!</h1>
          <p className="text-muted-foreground text-lg mb-8">{message}</p>

          <div className="w-full max-w-xs mb-8">
            <div className="rounded-xl border border-border bg-card p-6 card-shadow">
              <p className="text-5xl font-display font-bold gradient-text mb-1">
                {score}/{total}
              </p>
              <p className="text-muted-foreground text-sm">{percentage}% correct</p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)]"
          >
            Continue to Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Question screen
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px] animate-pulse-glow [animation-delay:1.5s]" />

      <div className="relative z-10 flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-8">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQ + 1} of {total}
          </span>
          <span className="font-medium text-accent">
            Score: {score}/{currentQ + (answered ? 1 : 0)}
          </span>
        </div>
        <Progress value={((currentQ + (answered ? 1 : 0)) / total) * 100} className="h-2 mb-8 bg-muted [&>div]:gradient-bg" />

        {/* Question */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl font-display font-bold text-foreground mb-6 leading-snug">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, i) => {
              let classes =
                "w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-200 ";

              if (!answered) {
                classes +=
                  "border-border bg-card hover:border-primary/50 hover:bg-muted cursor-pointer text-foreground";
              } else if (i === question.correctIndex) {
                classes +=
                  "border-accent bg-accent/10 text-accent";
              } else if (i === selectedIndex) {
                classes +=
                  "border-destructive bg-destructive/10 text-destructive";
              } else {
                classes += "border-border bg-card text-muted-foreground opacity-50";
              }

              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={answered} className={classes}>
                  <span className="flex items-center gap-3">
                    {answered && i === question.correctIndex && <CheckCircle2 size={18} className="shrink-0" />}
                    {answered && i === selectedIndex && i !== question.correctIndex && (
                      <XCircle size={18} className="shrink-0" />
                    )}
                    {!answered && (
                      <span className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div
              className={`mt-6 rounded-xl border p-4 text-sm leading-relaxed ${
                isCorrect
                  ? "border-accent/30 bg-accent/5 text-accent"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              <p className="font-semibold mb-1">{isCorrect ? "✅ Correct!" : "❌ Not quite!"}</p>
              <p className="opacity-90">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-end pt-6 mt-auto">
          {answered && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)]"
            >
              {currentQ < total - 1 ? (
                <>
                  Next Question <ArrowRight size={16} />
                </>
              ) : (
                <>
                  See Results <Trophy size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
