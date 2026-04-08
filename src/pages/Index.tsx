import { useNavigate } from "react-router-dom";
import EconologyLogo from "@/components/EconologyLogo";
import FeatureCard from "@/components/FeatureCard";
import { useAuth } from "@/contexts/AuthContext";
import { Lightbulb, BookOpen, Newspaper, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, enterGuestMode } = useAuth();
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(260 50% 12%), hsl(240 40% 16%), hsl(220 50% 14%))" }}>
      {/* Vibrant gradient orbs */}
      <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] rounded-full blur-[140px] animate-pulse-glow" style={{ background: "hsl(270 80% 50% / 0.25)" }} />
      <div className="absolute top-[10%] right-[-8%] w-[600px] h-[600px] rounded-full blur-[130px] animate-pulse-glow [animation-delay:1s]" style={{ background: "hsl(220 80% 55% / 0.2)" }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-glow [animation-delay:2s]" style={{ background: "hsl(200 70% 50% / 0.15)" }} />
      <div className="absolute top-[50%] right-[20%] w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse-glow [animation-delay:1.5s]" style={{ background: "hsl(270 60% 45% / 0.12)" }} />

      <div className="relative z-10 w-full">
        {/* Nav - full width */}
        <nav className="flex items-center justify-between px-8 md:px-16 lg:px-24 py-6 w-full">
          <div className="flex items-center gap-3">
            <EconologyLogo responsive />
            <span className="font-display text-xl font-bold text-white">Econology</span>
          </div>
          {user ? (
            <button onClick={() => navigate("/dashboard")} className="px-5 py-2 rounded-lg text-sm font-medium gradient-bg text-white transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.4)]">
              Dashboard
            </button>
          ) : (
            <button onClick={() => navigate("/login")} className="px-5 py-2 rounded-lg text-sm font-medium gradient-bg text-white transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_hsl(270_70%_55%/0.4)]">
              Sign In
            </button>
          )}
        </nav>

        {/* Hero - full width */}
        <section className="flex flex-col items-center text-center px-8 pt-16 pb-24 md:pt-24 md:pb-32 w-full max-w-5xl mx-auto">
          <div className="animate-float mb-8">
            <EconologyLogo size={96} />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-4">
            <span className="gradient-text">Econology</span>
          </h1>
          <p className="text-xl md:text-2xl font-display font-medium mb-6 tracking-wide" style={{ color: "hsl(220 30% 75%)" }}>
            The science of smart money
          </p>
          <p className="text-base md:text-lg max-w-2xl mb-10 leading-relaxed" style={{ color: "hsl(220 20% 65%)" }}>
            Personalized financial education for students. Daily tips, market insights, economic news, and AI tutoring — all tailored to <span className="text-accent font-semibold">YOU</span>.
          </p>
          <button onClick={() => navigate("/signup")} className="group flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-display font-semibold gradient-bg text-white transition-all duration-300 hover:shadow-[0_0_40px_hsl(270_70%_55%/0.5)] hover:scale-105">
            Start Your Journey
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => {
              enterGuestMode();
              navigate("/onboarding");
            }}
            className="mt-4 text-sm hover:text-white transition-colors underline underline-offset-4"
            style={{ color: "hsl(220 20% 55%)" }}
          >
            Continue as Guest (limited features)
          </button>
        </section>

        {/* Features - full width */}
        <section className="px-8 md:px-16 lg:px-24 pb-24 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
        <footer className="border-t py-8 text-center text-sm w-full" style={{ borderColor: "hsl(240 20% 20%)", color: "hsl(220 20% 50%)" }}>
          <p>© 2026 Econology. The science of smart money.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
