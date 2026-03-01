import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { TIP_ARTICLES } from "@/data/tipArticles";
import { Button } from "@/components/ui/button";

const TipArticle = () => {
  const { tipId } = useParams<{ tipId: string }>();
  const navigate = useNavigate();
  const article = tipId ? TIP_ARTICLES[tipId] : undefined;

  // Track explored tips
  if (tipId) {
    try {
      const explored: string[] = JSON.parse(localStorage.getItem("econology_tips_explored") || "[]");
      if (!explored.includes(tipId)) {
        explored.push(tipId);
        localStorage.setItem("econology_tips_explored", JSON.stringify(explored));
      }
    } catch { /* ignore */ }
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Article not found.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
          {article.title}
        </h1>

        {/* Paragraphs */}
        <div className="space-y-5">
          {article.paragraphs.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>

        {/* Action Steps */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground">
            Action Steps
          </h2>
          <ul className="space-y-3">
            {article.actionSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Ask Ekon */}
        <Button
          onClick={() => navigate("/ask")}
          className="w-full gap-2"
          size="lg"
        >
          <MessageCircle size={18} /> Ask Ekon About This Topic
        </Button>
      </div>
    </div>
  );
};

export default TipArticle;
