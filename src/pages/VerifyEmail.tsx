import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EconologyLogo from "@/components/EconologyLogo";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";
import { Seo } from "@/components/Seo";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email verified!", description: "Welcome to Econology." });
      navigate("/onboarding");
    }
  };

  const handleResend = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);
    if (error) {
      toast({ title: "Could not resend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Code resent", description: "Check your inbox for a new verification code." });
    }
  };

  return (
    <>
      <Seo title="Verify email — Econology" description="Confirm your email address to finish setting up your Econology account." path="/verify-email" type="website" />
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <EconologyLogo size={64} />
          <h1 className="text-3xl font-display font-bold gradient-text">Verify Your Email</h1>
          <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(240 15% 45%)" }}>
            <Mail className="h-4 w-4" />
            <span>We sent a 6-digit code to <strong style={{ color: "hsl(240 20% 25%)" }}>{email}</strong></span>
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm p-6">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm" style={{ color: "hsl(240 15% 50%)" }}>Enter the verification code</p>
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full gradient-bg text-primary-foreground hover:opacity-90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Email"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
            >
              {resending ? "Sending..." : "Didn't receive a code? Resend"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
