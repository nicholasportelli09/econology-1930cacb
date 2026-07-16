import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { CONCEPT_BY_ID, DIMENSION_LABELS } from "@/data/conceptGraph";
import { completeLesson, loadStreak } from "@/lib/lessons";
import { ArrowRight, BookOpen, CheckCircle2, XCircle, Flame, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Seo } from "@/components/Seo";
import { trackProduct } from "@/lib/productAnalytics";

type Phase = "read" | "quiz" | "result" | "testFailed";

const Lesson = () => {
  const { conceptId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const testOut = searchParams.get("testOut") === "1";
  const { user } = useAuth();
  const navigate = useNavigate();
  const concept = CONCEPT_BY_ID[conceptId];

  const [phase, setPhase] = useState<Phase>(testOut ? "quiz" : "read");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    streakNow: number;
    usedFreeze: boolean;
    xp: number;
  } | null>(null);

  useEffect(() => {
    setPhase(testOut ? "quiz" : "read");
    setQIdx(0);
    setAnswers([]);
    setResult(null);
    if (conceptId) void trackProduct("lesson_started", { concept_id: conceptId });
  }, [conceptId, testOut]);

  const score = useMemo(
    () => answers.reduce((acc, a, i) => acc + (a === concept?.quiz[i].correct ? 1 : 0), 0),
    [answers, concept],
  );

  if (!concept) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Lesson not found</h1>
          <p className="text-muted-foreground mb-6">That concept doesn't exist.</p>
          <Link to="/learn" className="text-primary hover:underline">Back to Learn</Link>
        </main>
      </div>
    );
  }

  const handleAnswer = (optionIdx: number) => {
    const next = [...answers];
    next[qIdx] = optionIdx;
    setAnswers(next);
  };

  const handleNextQuestion = async () => {
    if (qIdx < concept.quiz.length - 1) {
      setQIdx(qIdx + 1);
      return;
    }
    // Last question — submit
    if (!user) {
      toast({ title: "Sign in to save your progress" });
      navigate("/login");
      return;
    }
    // Test-out mode: only mark complete on a perfect score.
    if (testOut && score < concept.quiz.length) {
      setPhase("testFailed");
      return;
    }
    setSubmitting(true);
    try {
      const res = await completeLesson(user.id, concept.id, score, concept.quiz.length);
      setResult({
        score,
        total: concept.quiz.length,
        streakNow: res.streak.current,
        usedFreeze: res.usedFreeze,
        xp: res.xpAwarded,
      });
      setPhase("result");
    } catch (e) {
      console.error(e);
      toast({ title: "Could not save progress", description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Lesson — Econology" description="A short, focused Econology lesson with examples and a quick check for understanding." path="/lesson" type="article" jsonLd={{"@context":"https://schema.org","@type":"Course","name":"Lesson — Econology","description":"A short, focused Econology lesson with examples and a quick check for understanding.","provider":{"@type":"Organization","name":"Econology","url":"https://econology.lovable.app/"}}} />
      <DashboardHeader />
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-10 space-y-8">
        <div>
          <Link to="/learn" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
            ← Back to Learn
          </Link>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <span>{DIMENSION_LABELS[concept.dimension]}</span>
            {testOut && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Zap size={11} /> Test-out challenge
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {concept.title}
          </h1>
          {testOut && phase === "quiz" && (
            <p className="text-sm text-muted-foreground mt-2">
              Answer all {concept.quiz.length} questions correctly to mark this lesson complete and unlock what's next.
            </p>
          )}
        </div>

        {phase === "read" && (
          <div className="space-y-6">
            <article className="prose prose-sm md:prose-base max-w-none text-foreground/90 leading-relaxed">
              <p className="whitespace-pre-line">{concept.summary}</p>
            </article>
            {concept.deepDiveSlug && (
              <Link
                to={`/tip/${concept.deepDiveSlug}`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <BookOpen size={14} /> Go deeper on this topic
              </Link>
            )}
            <button
              onClick={() => setPhase("quiz")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)]"
            >
              Take the 3-question quiz <ArrowRight size={16} />
            </button>
          </div>
        )}

        {phase === "quiz" && (
          <QuizStep
            quiz={concept.quiz[qIdx]}
            qIdx={qIdx}
            total={concept.quiz.length}
            selected={answers[qIdx]}
            onSelect={handleAnswer}
            onNext={handleNextQuestion}
            submitting={submitting}
          />
        )}

        {phase === "result" && result && (
          <ResultStep
            result={result}
            onContinue={() => navigate("/learn")}
          />
        )}

        {phase === "testFailed" && (
          <div className="text-center space-y-6 py-6">
            <div className="text-5xl">📚</div>
            <div>
              <h2 className="text-2xl font-display font-bold mb-1">Worth studying this one</h2>
              <p className="text-muted-foreground">
                You got {score} of {concept.quiz.length}. Test-out needs a perfect score — read the lesson and try the regular quiz.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/lesson/${concept.id}`)}
                className="px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90"
              >
                Read the lesson
              </button>
              <Link
                to="/learn"
                className="px-6 py-3 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-muted transition-colors"
              >
                Back to Learn
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function QuizStep({
  quiz, qIdx, total, selected, onSelect, onNext, submitting,
}: {
  quiz: { q: string; options: string[]; correct: number; explain: string };
  qIdx: number;
  total: number;
  selected: number | undefined;
  onSelect: (i: number) => void;
  onNext: () => void;
  submitting: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    setRevealed(false);
  }, [qIdx]);

  const submit = () => {
    if (selected === undefined) return;
    if (!revealed) {
      setRevealed(true);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-muted-foreground">
        Question {qIdx + 1} of {total}
      </div>
      <h2 className="text-lg md:text-xl font-display font-semibold">{quiz.q}</h2>
      <div className="space-y-3">
        {quiz.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === quiz.correct;
          let className =
            "w-full text-left rounded-xl border p-4 transition-all flex items-start gap-3 ";
          if (revealed) {
            if (isCorrect) className += "border-green-500 bg-green-500/10 ";
            else if (isSelected) className += "border-red-500 bg-red-500/10 ";
            else className += "border-border bg-card opacity-60 ";
          } else if (isSelected) {
            className += "border-primary bg-primary/10 ";
          } else {
            className += "border-border bg-card hover:bg-muted/40 hover:border-primary/30 ";
          }
          return (
            <button
              key={i}
              onClick={() => !revealed && onSelect(i)}
              disabled={revealed}
              className={className}
            >
              {revealed && isCorrect && <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />}
              {revealed && !isCorrect && isSelected && <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />}
              <span className="text-sm md:text-base">{opt}</span>
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="rounded-xl bg-muted/40 border border-border p-4 text-sm">
          <span className="font-semibold">Why: </span>
          {quiz.explain}
        </div>
      )}
      <button
        onClick={submit}
        disabled={selected === undefined || submitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {!revealed
          ? "Check answer"
          : qIdx === total - 1
          ? submitting ? "Saving…" : "Finish lesson"
          : "Next question"}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function ResultStep({
  result, onContinue,
}: {
  result: { score: number; total: number; streakNow: number; usedFreeze: boolean; xp: number };
  onContinue: () => void;
}) {
  const perfect = result.score === result.total;
  return (
    <div className="text-center space-y-6 py-6">
      <div className="text-5xl">{perfect ? "🎉" : "✓"}</div>
      <div>
        <h2 className="text-2xl font-display font-bold mb-1">
          {perfect ? "Perfect score!" : "Lesson complete"}
        </h2>
        <p className="text-muted-foreground">
          You got {result.score} of {result.total} right.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 max-w-sm mx-auto space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">XP earned</span>
          <span className="font-semibold">+{result.xp}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Flame size={14} className="text-orange-500" /> Current streak
          </span>
          <span className="font-semibold">{result.streakNow} days</span>
        </div>
        {result.usedFreeze && (
          <div className="text-xs text-amber-600 dark:text-amber-400">
            🧊 A freeze token kept your streak alive.
          </div>
        )}
      </div>
      <button
        onClick={onContinue}
        className="px-6 py-3 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90"
      >
        Continue
      </button>
    </div>
  );
}

export default Lesson;