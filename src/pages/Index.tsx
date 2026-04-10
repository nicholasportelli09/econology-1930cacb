import { useNavigate } from "react-router-dom";
import EconologyLogo from "@/components/EconologyLogo";
import FeatureCard from "@/components/FeatureCard";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Lightbulb, BookOpen, Newspaper } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <EconologyLogo size={40} />
          <span className="font-display text-xl font-bold gradient-text">Econology</span>
        </div>
        {user ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg glow-shadow"
          >
            Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg glow-shadow"
          >
            Sign In
          </button>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-20 md:pt-24 md:pb-28 w-full max-w-7xl mx-auto">
        <div className="mb-2">
          <EconologyLogo size={160} />
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-4 leading-tight">
          <span className="gradient-text">Econology</span>
        </h1>
        <p className="text-lg md:text-2xl text-foreground mb-3 max-w-2xl font-bold">
          A daily system for mastering money and markets
        </p>
        <p className="text-base md:text-lg text-foreground/70 mb-10 max-w-2xl leading-relaxed font-semibold">
          Learn faster with simple explanations, real examples, and daily progress.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="group flex items-center gap-2 px-8 py-4 rounded-xl text-base font-display font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-xl glow-shadow"
        >
          Start Your Journey
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 px-6 md:px-12 pb-24 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <FeatureCard
            icon={<Lightbulb size={24} />}
            title="Daily Tips"
            description="Bite-sized financial wisdom personalized to your goals. Learn one concept every day."
          />
          <FeatureCard
            icon={<BookOpen size={24} />}
            title="Deep Dives"
            description="Comprehensive guides with real examples and actionable steps you can take today."
          />
          <FeatureCard
            icon={<Newspaper size={24} />}
            title="Economic News"
            description="Current events explained simply and tailored to your situation and interests."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Econology · The science of smart money</p>
      </footer>
    </div>
  );
};

export default Index;
