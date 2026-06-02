import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import EconologyLogo from "@/components/EconologyLogo";
import logoSrc from "@/assets/econology-logo.png";
import FeatureCard from "@/components/FeatureCard";
import { ArrowRight, Lightbulb, BookOpen, Newspaper, CheckCircle, BarChart3, Brain, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Seo } from "@/components/Seo";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const Index = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const hasSession = Boolean(user) || isGuest;
  const ctaLabel = hasSession ? "Continue to Dashboard" : "Start Your Journey";
  const ctaTarget = hasSession ? "/dashboard" : "/signup";
  const secondaryCtaLabel = hasSession ? "Continue to Dashboard" : "Get Started — It's Free";

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
  };
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };

  // Scroll-reveal preset: sections fade + rise as they enter the viewport
  const reveal = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
  };
  const revealViewport = { once: true, amount: 0.2 };

  const taglineFull = "A daily system for mastering money and markets";
  const subFull = "Learn faster with simple explanations, real examples, and daily progress.";
  const [tagline, setTagline] = useState("");
  const [sub, setSub] = useState("");
  const [phase, setPhase] = useState<"idle" | "tagline" | "sub" | "done">("idle");

  useEffect(() => {
    const start = setTimeout(() => setPhase("tagline"), 900);
    return () => clearTimeout(start);
  }, []);

  useEffect(() => {
    if (phase !== "tagline") return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTagline(taglineFull.slice(0, i));
      if (i >= taglineFull.length) {
        clearInterval(id);
        setTimeout(() => setPhase("sub"), 300);
      }
    }, 35);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "sub") return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setSub(subFull.slice(0, i));
      if (i >= subFull.length) {
        clearInterval(id);
        setPhase("done");
      }
    }, 20);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
      <Seo title="Econology — The Science of Smart Money" description="Master money and markets with daily lessons, live market insights, AI-curated economic news, and an AI tutor built for students and young investors." path="/" type="website" jsonLd={{"@context":"https://schema.org","@type":"WebSite","name":"Econology","url":"https://econology.lovable.app/"}} />
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 w-full">
        <div className="flex items-center gap-3">
          <EconologyLogo size={40} />
          <span className="font-display text-xl font-bold gradient-text">Econology</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            className="text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: "hsl(240 30% 25%)" }}
          >
            FAQ
          </button>
          <button
            onClick={() => navigate(hasSession ? "/dashboard" : "/login")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg glow-shadow"
          >
            {hasSession ? "Go to Dashboard" : "Sign In"}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-6 pb-16 md:pt-10 md:pb-20 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeUp} className="-mb-4 md:-mb-6">
            <img src={logoSrc} alt="Econology logo" width={180} height={180} className="shrink-0 object-contain w-[120px] h-[120px] md:w-[180px] md:h-[180px] animate-float" loading="eager" fetchPriority="high" />
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-3 leading-none">
            <span className="gradient-text">Econology</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-2xl mb-3 max-w-2xl font-bold min-h-[1.75rem] md:min-h-[2.25rem]" style={{ color: "hsl(240 30% 25%)" }}>
            {tagline}
            {phase !== "done" && phase !== "sub" && (
              <span className="inline-block w-[2px] h-[1em] align-middle ml-0.5 bg-current animate-pulse" />
            )}
          </motion.p>
          <motion.p variants={fadeUp} className="text-base md:text-lg mb-10 max-w-2xl leading-relaxed font-semibold min-h-[1.75rem]" style={{ color: "hsl(240 20% 40%)" }}>
            {sub}
            {phase === "sub" && (
              <span className="inline-block w-[2px] h-[1em] align-middle ml-0.5 bg-current animate-pulse" />
            )}
          </motion.p>
          <motion.button
            variants={fadeUp}
            onClick={() => navigate(ctaTarget)}
            className="group flex items-center gap-2 px-8 py-4 rounded-xl text-base font-display font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-xl glow-shadow"
          >
            {ctaLabel}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </section>

      {/* Feature cards */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        className="relative z-10 px-6 md:px-12 lg:px-20 pb-20 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <motion.div variants={reveal}>
          <FeatureCard
            icon={<Lightbulb size={24} />}
            title="Daily Tips"
            description="Bite-sized financial wisdom personalized to your goals. Learn one concept every day."
          />
          </motion.div>
          <motion.div variants={reveal}>
          <FeatureCard
            icon={<BookOpen size={24} />}
            title="Deep Dives"
            description="Comprehensive guides with real examples and actionable steps you can take today."
          />
          </motion.div>
          <motion.div variants={reveal}>
          <FeatureCard
            icon={<Newspaper size={24} />}
            title="Economic News"
            description="Current events explained simply and tailored to your situation and interests."
          />
          </motion.div>
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        className="relative z-10 px-6 md:px-12 lg:px-20 pb-20 w-full"
      >
        <motion.h2 variants={reveal} className="text-2xl md:text-3xl font-display font-bold text-center mb-12" style={{ color: "hsl(240 30% 20%)" }}>
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { step: "1", title: "Tell us about you", desc: "Answer a few questions about your financial goals, situation, and what you want to learn.", icon: Brain },
            { step: "2", title: "Get your daily plan", desc: "Receive personalized tips, lessons, and market insights matched to your interests.", icon: BarChart3 },
            { step: "3", title: "Track your growth", desc: "Earn XP, level up, and watch your financial literacy score improve every week.", icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.step} variants={reveal} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-4">
                  <Icon size={24} className="text-primary-foreground" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "hsl(270 60% 50%)" }}>
                  Step {item.step}
                </div>
                <h3 className="text-lg font-display font-bold mb-2" style={{ color: "hsl(240 30% 20%)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(240 15% 45%)" }}>{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* What you'll learn */}
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        className="relative z-10 px-6 md:px-12 lg:px-20 pb-20 w-full"
      >
        <div className="max-w-4xl mx-auto rounded-2xl p-8 md:p-12" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8" style={{ color: "hsl(240 30% 20%)" }}>
            What You'll Learn
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Budgeting strategies that actually work",
              "How the stock market really works",
              "Building & protecting your credit score",
              "Investing with as little as $50/month",
              "Understanding economic news & trends",
              "Debt payoff strategies (avalanche vs snowball)",
              "Emergency fund & savings automation",
              "Retirement planning for young adults",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle size={18} className="text-accent shrink-0 mt-0.5" />
                <span className="text-sm font-medium" style={{ color: "hsl(240 20% 30%)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        className="relative z-10 px-6 md:px-12 lg:px-20 pb-20 w-full"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4" style={{ color: "hsl(240 30% 20%)" }}>
            Ready to take control of your finances?
          </h2>
          <p className="text-base mb-8" style={{ color: "hsl(240 15% 45%)" }}>
            Join thousands of young adults building financial confidence — one day at a time.
          </p>
          <button
            onClick={() => navigate(ctaTarget)}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-display font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-xl glow-shadow"
          >
            {secondaryCtaLabel}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        id="faq"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        className="relative z-10 px-6 md:px-12 lg:px-20 pb-20 w-full scroll-mt-20"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10" style={{ color: "hsl(240 30% 20%)" }}>
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              { q: "What is Econology?", a: "Econology is a daily learning system that helps young adults and students master money and markets through bite-sized lessons, real market insights, and an AI tutor." },
              { q: "Is it free to use?", a: "Yes — Econology is completely free. Create an account and start building your financial confidence right away." },
              { q: "How does the daily lesson work?", a: "Each day you get one short, personalized lesson based on your goals and current knowledge. Complete it, earn XP, and watch your literacy score grow." },
              { q: "Can I track real stocks?", a: "Absolutely. Add tickers to your portfolio, get live quotes, and see relevant news filtered to your investments." },
              { q: "Is my data secure?", a: "We use industry-standard encryption and never share your personal data with third parties. Your privacy is our priority." },
              { q: "How do I reset my learning progress?", a: "Head to Settings and you can reset your quiz scores or topic selections at any time." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border px-4 md:px-6" style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.5)" }}>
                <AccordionTrigger className="text-sm md:text-base font-semibold text-left py-4" style={{ color: "hsl(240 30% 20%)" }}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed pb-4" style={{ color: "hsl(240 15% 45%)" }}>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 mt-8" style={{ background: "hsl(232 38% 16%)", color: "hsl(230 25% 85%)" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
            {/* Brand + CTA */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-5">
                <img src={logoSrc} alt="Econology logo" width={44} height={44} className="object-contain" />
                <span className="font-display text-2xl font-bold text-white">Econology</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: "hsl(230 20% 70%)" }}>
                A daily system for mastering money and markets — simple explanations, real examples, and steady progress.
              </p>
              <button
                onClick={() => navigate(ctaTarget)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: "hsl(230 80% 88%)", color: "hsl(232 50% 18%)" }}
              >
                {hasSession ? "Open Dashboard" : "Get Started Free"}
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Link columns */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Learn</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => navigate("/learn")} className="hover:text-white transition-colors">Deep Dives</button></li>
                <li><button onClick={() => navigate("/market")} className="hover:text-white transition-colors">Market Ideas</button></li>
                <li><button onClick={() => navigate("/news")} className="hover:text-white transition-colors">Economic News</button></li>
                <li><button onClick={() => navigate("/videos")} className="hover:text-white transition-colors">Videos</button></li>
                <li><button onClick={() => navigate("/budget")} className="hover:text-white transition-colors">Budget Simulator</button></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Account</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => navigate("/signup")} className="hover:text-white transition-colors">Sign Up</button></li>
                <li><button onClick={() => navigate("/login")} className="hover:text-white transition-colors">Sign In</button></li>
                <li><button onClick={() => navigate("/dashboard")} className="hover:text-white transition-colors">Dashboard</button></li>
                <li><button onClick={() => navigate("/settings")} className="hover:text-white transition-colors">Settings</button></li>
                <li><button onClick={() => navigate("/progress")} className="hover:text-white transition-colors">Progress</button></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">FAQ</button></li>
                <li><button onClick={() => navigate("/ask")} className="hover:text-white transition-colors">Ask Ekon (AI Tutor)</button></li>
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white transition-colors">Back to Top</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: "hsl(232 30% 25%)", color: "hsl(230 18% 65%)" }}>
            <p>© 2026 Econology · The science of smart money</p>
            <p>Built for students and young investors.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
