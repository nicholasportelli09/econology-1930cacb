import { useNavigate } from "react-router-dom";
import EconologyLogo from "@/components/EconologyLogo";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Flame, BookOpen, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <EconologyLogo size={36} />
          <span className="font-display text-lg font-bold text-foreground">Econology</span>
        </div>
        {user ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground transition-all hover:opacity-90"
          >
            Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground transition-all hover:opacity-90"
          >
            Sign In
          </button>
        )}
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-24 md:pt-28 md:pb-32 w-full max-w-3xl mx-auto">
        <div className="mb-8">
          <EconologyLogo size={80} />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-5 leading-tight">
          A daily system for mastering money and markets
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
          Learn faster with simple explanations, real examples, and daily progress.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="group flex items-center gap-2 px-8 py-4 rounded-xl text-base font-display font-semibold bg-primary text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg"
        >
          Start Your Journey
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 pb-24 w-full max-w-5xl mx-auto">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto">
              <Flame size={22} />
            </div>
            <h3 className="text-base font-display font-semibold text-foreground">Daily lessons</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Short explanations with real examples. One concept per day, designed to stick.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto">
              <BookOpen size={22} />
            </div>
            <h3 className="text-base font-display font-semibold text-foreground">Test your understanding</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each lesson ends with a question. Get instant feedback and build real knowledge.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto">
              <BarChart3 size={22} />
            </div>
            <h3 className="text-base font-display font-semibold text-foreground">Track your progress</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Streaks, levels, and a health score that reflects what you've actually learned.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Econology</p>
      </footer>
    </div>
  );
};

export default Index;
