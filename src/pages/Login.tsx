import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EconologyLogo from "@/components/EconologyLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock } from "lucide-react";
import { Seo } from "@/components/Seo";

export default function Login() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
    // On success, AuthContext's onAuthStateChange handles the redirect.
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
        setGoogleLoading(false);
      }
      // On success the browser redirects to Google; nothing else to do here.
    } catch {
      toast({ title: "Google sign-in failed", description: "An unexpected error occurred", variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
      <Seo title="Log in — Econology" description="Sign in to Econology to continue your daily money and markets routine. Google OAuth or email OTP." path="/login" type="website" />
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <EconologyLogo size={56} />
          <h1 className="text-2xl font-display font-bold" style={{ color: "hsl(240 30% 20%)" }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: "hsl(240 20% 40%)" }}>Sign in to your Econology account</p>
        </div>

        <div className="space-y-4 rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm p-6">
          <Button
            type="button"
            variant="outline"
            className="w-full bg-white/70 border-white/50 hover:bg-white/90"
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
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/60 px-2" style={{ color: "hsl(240 15% 50%)" }}>or</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "hsl(240 20% 25%)" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "hsl(240 15% 50%)" }} />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10 bg-white border-white/60 text-slate-900 placeholder:text-slate-400" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "hsl(240 20% 25%)" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "hsl(240 15% 50%)" }} />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 bg-white border-white/60 text-slate-900 placeholder:text-slate-400" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-bg text-primary-foreground font-semibold shadow-lg glow-shadow transition-all hover:opacity-90 hover:shadow-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </div>

        <div className="text-center space-y-2 text-sm">
          <p style={{ color: "hsl(240 15% 45%)" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign Up</Link>
          </p>
          <Link to="/" className="block transition-colors hover:opacity-80" style={{ color: "hsl(240 15% 45%)" }}>
            ← Back to landing page
          </Link>
        </div>
      </div>
    </div>
  );
}
