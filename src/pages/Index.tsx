import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import EconologyLogo from "@/components/EconologyLogo";
import logoSrc from "@/assets/econology-logo.png";
import FeatureCard from "@/components/FeatureCard";
import { ArrowRight, Lightbulb, BookOpen, Newspaper, CheckCircle, BarChart3, Brain, LineChart } from "lucide-react";
import { Sparkles, TrendingUp, MessageCircle, Flame, Trophy, Zap } from "lucide-react";
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: "hsl(245 35% 96%)" }}>
      <Seo title="Econology — The Science of Smart Money" description="Master money and markets with daily lessons, live market insights, AI-curated economic news, and an AI tutor built for students and young investors." path="/" type="website" jsonLd={{"@context":"https://schema.org","@type":"WebSite","name":"Econology","url":"https://www.econology.app/"}} />

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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg glow-shadow active:scale-[0.98]"
          >
            {hasSession ? "Go to Dashboard" : "Sign In"}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden z-10 px-6 pt-6 pb-16 md:pt-10 md:pb-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
          className="relative z-10 w-full max-w-7xl mx-auto"
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-2 items-center"
          >
            {/* Left proof bubbles */}
            <motion.div variants={fadeUp} className="hidden lg:flex lg:col-span-3 flex-col items-end gap-5 pr-2">
              {[
                { icon: Flame, label: "5-min daily lesson", delay: "0s", duration: "6s", offsetY: "-16px", rotate: "-1.5deg" },
                { icon: TrendingUp, label: "Live market data", delay: "1.2s", duration: "7s", offsetY: "18px", rotate: "1deg" },
              ].map(({ icon: Icon, label, delay, duration, offsetY, rotate }) => (
                <div
                  key={label}
                  className="group flex items-center gap-3 px-4 py-3 rounded-2xl border bg-card card-shadow transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                  style={{ animation: `float ${duration} ease-in-out infinite`, animationDelay: delay, transform: `translateY(${offsetY}) rotate(${rotate})` }}
                >
                  <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary-foreground" />
                  </div>
                  <span className="text-sm font-display font-semibold whitespace-nowrap text-foreground">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Center hero content */}
            <div className="lg:col-span-6 flex flex-col items-center text-center">
              <motion.div variants={fadeUp} className="-mb-4 md:-mb-6">
                <img src={logoSrc} alt="Econology logo" width={180} height={180} className="shrink-0 object-contain w-[120px] h-[120px] md:w-[180px] md:h-[180px] animate-float" loading="eager" />
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
                className="group flex items-center gap-2 px-8 py-4 rounded-xl text-base font-display font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-xl glow-shadow active:scale-[0.98]"
              >
                {ctaLabel}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </motion.button>

              {/* Mobile proof bubbles — prominent row below CTA */}
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap lg:hidden items-center justify-center gap-3 max-w-2xl">
                {[
                  { icon: Flame, label: "5-min daily lesson", size: "lg" },
                  { icon: TrendingUp, label: "Live market data", size: "sm" },
                  { icon: MessageCircle, label: "AI tutor — Ask Ekon", size: "lg" },
                  { icon: Trophy, label: "XP + streaks", size: "sm" },
                  { icon: Zap, label: "Free forever", size: "md" },
                ].map(({ icon: Icon, label, size }) => {
                  const sizeClasses = {
                    lg: "px-4 py-2.5 gap-2 text-sm",
                    md: "px-3.5 py-2 gap-1.5 text-xs",
                    sm: "px-3 py-1.5 gap-1.5 text-xs",
                  }[size];
                  const iconSize = size === "lg" ? 15 : 13;
                  return (
                    <span
                      key={label}
                      className={`inline-flex items-center rounded-xl font-display font-semibold border bg-card card-shadow transition-all hover:-translate-y-0.5 hover:border-primary/30 ${sizeClasses}`}
                      style={{ color: "hsl(240 30% 25%)" }}
                    >
                      <Icon size={iconSize} className="text-primary" />
                      {label}
                    </span>
                  );
                })}
              </motion.div>
            </div>

            {/* Right proof bubbles */}
            <motion.div variants={fadeUp} className="hidden lg:flex lg:col-span-3 flex-col items-start gap-5 pl-2">
              {[
                { icon: MessageCircle, label: "AI tutor — Ask Ekon", delay: "0.8s", duration: "5.5s", offsetY: "-20px", rotate: "-1deg" },
                { icon: Trophy, label: "XP + streaks", delay: "2s", duration: "6.2s", offsetY: "6px", rotate: "2deg" },
                { icon: Zap, label: "Free forever", delay: "0.3s", duration: "7.5s", offsetY: "22px", rotate: "-2deg" },
              ].map(({ icon: Icon, label, delay, duration, offsetY, rotate }) => (
                <div
                  key={label}
                  className="group flex items-center gap-3 px-4 py-3 rounded-2xl border bg-card card-shadow transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                  style={{ animation: `float ${duration} ease-in-out infinite`, animationDelay: delay, transform: `translateY(${offsetY}) rotate(${rotate})` }}
                >
                  <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary-foreground" />
                  </div>
                  <span className="text-sm font-display font-semibold whitespace-nowrap text-foreground">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Product preview — shows what the app actually looks/feels like */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-12 lg:mt-16 w-full max-w-5xl mx-auto"
          >
            <div
              className="rounded-3xl border p-4 md:p-6"
              style={{
                background: "#ffffff",
                borderColor: "hsl(240 20% 92%)",
                boxShadow: "0 30px 80px -20px hsla(245, 60%, 40%, 0.16)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Daily lesson card */}
                <div className="rounded-2xl p-5 text-left border" style={{ background: "white", borderColor: "rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                      <Sparkles size={15} className="text-primary-foreground" />
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(270 60% 50%)" }}>
                      Today's Lesson
                    </div>
                  </div>
                  <div className="font-display font-bold text-base mb-1" style={{ color: "hsl(240 30% 20%)" }}>
                    Compound interest, demystified
                  </div>
                  <div className="text-xs mb-4 leading-relaxed" style={{ color: "hsl(240 15% 45%)" }}>
                    Why $50/month at 19 beats $200/month at 35.
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="flex items-center gap-1" style={{ color: "hsl(240 20% 40%)" }}>
                      <Flame size={12} className="text-orange-500" /> 7-day streak
                    </span>
                    <span style={{ color: "hsl(270 60% 50%)" }}>+25 XP</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(240 20% 92%)" }}>
                    <div className="h-full gradient-bg" style={{ width: "68%" }} />
                  </div>
                </div>

                {/* Live markets card */}
                <div className="rounded-2xl p-5 text-left border" style={{ background: "white", borderColor: "rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(150 60% 45%)" }}>
                      <TrendingUp size={15} className="text-white" />
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(150 60% 35%)" }}>
                      Your Watchlist
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { sym: "AAPL", px: "232.41", chg: "+1.24%", up: true },
                      { sym: "NVDA", px: "178.06", chg: "+3.12%", up: true },
                      { sym: "TSLA", px: "289.55", chg: "-0.84%", up: false },
                    ].map((r) => (
                      <div key={r.sym} className="flex items-center justify-between text-sm">
                        <span className="font-bold" style={{ color: "hsl(240 30% 20%)" }}>{r.sym}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs" style={{ color: "hsl(240 15% 45%)" }}>${r.px}</span>
                          <span className="text-xs font-semibold" style={{ color: r.up ? "hsl(150 60% 40%)" : "hsl(0 70% 50%)" }}>
                            {r.chg}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t text-[11px] font-semibold" style={{ borderColor: "rgba(0,0,0,0.06)", color: "hsl(240 20% 40%)" }}>
                    Live quotes · explained in plain English
                  </div>
                </div>

                {/* Ask Ekon card */}
                <div className="rounded-2xl p-5 text-left border" style={{ background: "white", borderColor: "rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(270 60% 55%)" }}>
                      <MessageCircle size={15} className="text-white" />
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "hsl(270 60% 50%)" }}>
                      Ask Ekon
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="inline-block max-w-full rounded-2xl rounded-tl-sm px-3 py-2 font-medium" style={{ background: "hsl(240 20% 94%)", color: "hsl(240 30% 25%)" }}>
                      Should I open a Roth IRA at 18?
                    </div>
                    <div className="inline-block max-w-full rounded-2xl rounded-tr-sm px-3 py-2 ml-auto font-medium gradient-bg text-primary-foreground">
                      Yes — tax-free growth for 47+ years. Start with $25/mo in a low-fee index fund.
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-[11px] font-semibold" style={{ borderColor: "rgba(0,0,0,0.06)", color: "hsl(240 20% 40%)" }}>
                    Personalized to your goals & age
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
          How it works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { step: "1", title: "Tell us about you", desc: "Answer a few questions about your financial goals, situation, and what you want to learn.", icon: Brain },
            { step: "2", title: "Get your daily plan", desc: "Receive personalized tips, lessons, and market insights matched to your interests.", icon: BarChart3 },
            { step: "3", title: "Track your growth", desc: "Earn XP, level up, and watch your financial literacy score improve every week.", icon: LineChart },
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
        <div className="max-w-4xl mx-auto rounded-2xl p-8 md:p-12" style={{ background: "#ffffff", boxShadow: "0 10px 40px -16px hsla(245, 60%, 40%, 0.12)" }}>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8" style={{ color: "hsl(240 30% 20%)" }}>
            What you'll learn
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
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-display font-semibold gradient-bg text-primary-foreground transition-all hover:opacity-90 hover:shadow-xl glow-shadow active:scale-[0.98]"
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
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              { q: "What is Econology?", a: "Econology is a daily learning system that helps young adults and students master money and markets through bite-sized lessons, real market insights, and an AI tutor." },
              { q: "Is it free to use?", a: "Yes — Econology is completely free. Create an account and start building your financial confidence right away." },
              { q: "How does the daily lesson work?", a: "Each day you get one short, personalized lesson based on your goals and current knowledge. Complete it, earn XP, and watch your literacy score grow." },
              { q: "Can I track real stocks?", a: "Absolutely. Add tickers to your portfolio, get live quotes, and see relevant news filtered to your investments." },
              { q: "How does Econology handle my data?", a: "We use encryption in transit, row-level database security, and only share data with the service providers we need to run each feature (see our Privacy Notice). No online service can promise perfect security, but we work to keep the risk low and only collect what a feature actually needs." },
              { q: "How do I reset my learning progress?", a: "Head to Settings and you can reset your quiz scores or topic selections at any time." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border px-4 md:px-6" style={{ borderColor: "hsl(240 20% 90%)", background: "#ffffff" }}>
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
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="Econology logo" width={36} height={36} className="object-contain" />
              <span className="font-display text-lg font-bold text-white">Econology</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-sm" style={{ color: "hsl(230 20% 70%)" }}>
              <button onClick={() => navigate("/learn")} className="hover:text-white transition-colors">Learn</button>
              <button onClick={() => navigate("/market")} className="hover:text-white transition-colors">Markets</button>
              <button onClick={() => navigate("/news")} className="hover:text-white transition-colors">News</button>
              <button onClick={() => navigate("/ask")} className="hover:text-white transition-colors">Ask Ekon</button>
              <button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors">FAQ</button>
              <button onClick={() => navigate("/login")} className="hover:text-white transition-colors">Sign In</button>
              <button onClick={() => navigate("/privacy")} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors">Terms</button>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-xs uppercase tracking-wider hover:text-white transition-colors"
              style={{ color: "hsl(230 18% 60%)" }}
            >
              Back to Top ↑
            </button>
          </div>

          <div className="mt-8 pt-5 border-t text-center text-xs" style={{ borderColor: "hsl(232 30% 25%)", color: "hsl(230 18% 60%)" }}>
            <p>© 2026 Econology · The science of smart money</p>
            <p className="mt-2">Educational content only — not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
