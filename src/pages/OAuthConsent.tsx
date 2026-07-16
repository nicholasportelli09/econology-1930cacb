import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import EconologyLogo from "@/components/EconologyLogo";

// Beta namespace wrapper — @supabase/supabase-js exposes it at runtime
// but the type surface may not include it yet.
type OAuthNS = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
};
function oauthNS(): OAuthNS {
  return (supabase.auth as unknown as { oauth: OAuthNS }).oauth;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id in the request URL.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauthNS().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) return setError(error.message);
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        if (active) setError(e?.message ?? "Failed to load authorization details.");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauthNS().approveAuthorization(authorizationId)
        : await oauthNS().denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        return setError(error.message);
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        return setError("No redirect returned by the authorization server.");
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Something went wrong.");
    }
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an app";
  const redirectUri: string | undefined = details?.client?.redirect_uris?.[0] ?? details?.client?.redirect_uri;
  const scopes: string[] = Array.isArray(details?.scopes)
    ? details.scopes
    : typeof details?.scope === "string"
      ? details.scope.split(/\s+/).filter(Boolean)
      : [];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(255 45% 90%), hsl(230 50% 88%), hsl(245 40% 91%))" }}>
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/50 bg-white/75 backdrop-blur-md p-6 md:p-7 shadow-xl">
          <div className="flex flex-col items-center text-center gap-2 mb-4">
            <EconologyLogo size={48} />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
              <ShieldCheck size={12} /> Authorize connection
            </div>
          </div>

          {error ? (
            <div className="space-y-3">
              <h1 className="text-lg font-display font-bold text-slate-900">Could not load this request</h1>
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          ) : !details ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-xl font-display font-bold text-slate-900 text-center">
                Connect <span className="text-primary">{clientName}</span> to Econology
              </h1>
              <p className="text-sm text-slate-600 text-center">
                This lets {clientName} use Econology as you. It can call the app's enabled tools while you're signed in.
              </p>

              {redirectUri && (
                <div className="text-xs text-slate-500 break-all bg-white/60 border border-slate-200 rounded-lg p-2.5">
                  <span className="font-semibold text-slate-600">Returns to:</span> {redirectUri}
                </div>
              )}

              {scopes.length > 0 && (
                <div className="text-xs text-slate-600">
                  <div className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 mb-1">Requested permissions</div>
                  <ul className="space-y-1">
                    {scopes.map((s) => (
                      <li key={s} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[11px] text-slate-500 text-center">
                This does not bypass Econology's permissions or backend policies.
              </p>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 gradient-bg text-primary-foreground font-semibold" disabled={busy} onClick={() => decide(true)}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}