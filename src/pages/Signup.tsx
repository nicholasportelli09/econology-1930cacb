import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import logoSrc from "@/assets/econology-logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Sparkles, Flame, Trophy } from "lucide-react";
import { Seo } from "@/components/Seo";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a 6-digit verification code." });
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) {
        toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
        setGoogleLoading(false);
      }
      // Browser redirects to Google on success.
    } catch {
      toast({ title: "Google sign-in failed", description: "An unexpected error occurred", variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
      <Seo title="Sign up — Econology" description="Create your free Econology account and start mastering money and markets with daily lessons and AI tutoring." path="/signup" type="website" />
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md space-y-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={logoSrc} alt="Econology logo" width={80} height={80} className="object-contain w-[80px] h-[80px] animate-float" />
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight gradient-text leading-none">
            Create Account
          </h1>
          <p className="text-sm font-semibold" style={{ color: "hsl(240 20% 40%)" }}>
            Start mastering money and markets — free, forever.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Sparkles, label: "5-min daily lesson" },
              { icon: Flame, label: "Build a streak" },
              { icon: Trophy, label: "Earn XP" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                style={{ background: "rgba(255,255,255,0.6)", borderColor: "rgba(0,0,0,0.08)", color: "hsl(240 30% 25%)" }}
              >
                <Icon size={11} className="text-accent" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div
          className="space-y-4 rounded-2xl border p-6 md:p-7"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(255,255,255,0.8)",
            boxShadow: "0 30px 80px -20px hsla(245, 60%, 40%, 0.25)",
          }}
        >
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 bg-white border-white/60 hover:bg-white/90 font-semibold"
            style={{ color: "hsl(240 20% 25%)" }}
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            )}
            Continue with Google
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-black/10" /></div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-semibold"><span className="bg-white px-3" style={{ color: "hsl(240 15% 50%)" }}>or with email</span></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(240 20% 35%)" }}>Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "hsl(240 15% 50%)" }} />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="pl-10 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/40" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(240 20% 35%)" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "hsl(240 15% 50%)" }} />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/40" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(240 20% 35%)" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "hsl(240 15% 50%)" }} />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="pl-10 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/40" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 mt-2 gradient-bg text-primary-foreground font-display font-semibold text-base shadow-lg glow-shadow transition-all hover:opacity-90 hover:shadow-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Free Account"}
            </Button>
          </form>

          <p className="text-[11px] text-center pt-1" style={{ color: "hsl(240 15% 50%)" }}>
            By signing up you agree to our Terms & Privacy Policy.
          </p>
        </div>

        <div className="text-center space-y-2 text-sm">
          <p style={{ color: "hsl(240 15% 45%)" }}>
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">Sign In</Link>
          </p>
          <Link to="/" className="block transition-colors hover:opacity-80" style={{ color: "hsl(240 15% 45%)" }}>
            ← Back to landing page
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
