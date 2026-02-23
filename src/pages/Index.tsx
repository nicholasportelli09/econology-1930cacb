import { useNavigate } from "react-router-dom";
import EconologyLogo from "@/components/EconologyLogo";
import FeatureCard from "@/components/FeatureCard";
import { Lightbulb, BookOpen, Newspaper, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] animate-pulse-glow [animation-delay:1s]" />
      <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px] animate-pulse-glow [animation-delay:2s]" />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <EconologyLogo size={44} />
            <span className="font-display text-xl font-bold gradient-text">Econology</span>
          </div>
          <button className="px-5 py-2 rounded-lg text-sm font-medium gradient-bg text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)]">
            Sign In
          </button>
        </nav>

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 pt-16 pb-24 md:pt-24 md:pb-32 max-w-4xl mx-auto">
          <div className="animate-float mb-8">
            <EconologyLogo size={96} />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-4">
            <span className="gradient-text">Econology</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-display font-medium mb-6 tracking-wide">
            The science of smart money
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Personalized financial education for students. Daily tips, market insights, economic news, and AI tutoring — all tailored to <span className="text-accent font-semibold">YOU</span>.
          </p>
          <button onClick={() => navigate("/onboarding")} className="group flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-display font-semibold gradient-bg text-primary-foreground transition-all duration-300 hover:shadow-[0_0_40px_hsl(270_70%_55%/0.4)] hover:scale-105">
            Start Your Journey
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </section>

        {/* Features */}
        <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Lightbulb size={24} />}
              title="Daily Tips"
              description="Bite-sized financial wisdom personalized to your goals. Learn something new every day."
            />
            <FeatureCard
              icon={<BookOpen size={24} />}
              title="Deep Dives"
              description="Comprehensive guides with actionable steps to master budgeting, investing, and more."
            />
            <FeatureCard
              icon={<Newspaper size={24} />}
              title="Economic News"
              description="Current events explained for your situation. Stay informed without the jargon."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Econology. The science of smart money.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
