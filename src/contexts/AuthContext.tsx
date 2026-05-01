import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem("econology_guest") === "true");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isInitialLoad = true;
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem("econology_guest");
      }
      // Only flip loading off on the very first event to avoid re-showing the
      // full-screen loader (which causes a flicker) on subsequent token refreshes.
      if (isInitialLoad) {
        setLoading(false);
        isInitialLoad = false;
      }

      // Soft-redirect on fresh sign-in from auth pages only.
      if (event === "SIGNED_IN" && session?.user) {
        // Notify admin once per new user. We treat "new" as
        // created_at within ~2 minutes of last_sign_in_at, and use a
        // localStorage guard so token refreshes don't re-fire.
        try {
          const u = session.user;
          const created = u.created_at ? new Date(u.created_at).getTime() : 0;
          const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : Date.now();
          const isFresh = created > 0 && Math.abs(lastSignIn - created) < 120_000;
          const guardKey = `econology_signup_notified_${u.id}`;
          if (isFresh && !localStorage.getItem(guardKey)) {
            localStorage.setItem(guardKey, "1");
            const provider =
              (u.app_metadata as any)?.provider ||
              (u.identities?.[0] as any)?.provider ||
              "email";
            // Fire-and-forget — don't block the redirect.
            supabase.functions
              .invoke("send-transactional-email", {
                body: {
                  templateName: "new-signup",
                  templateData: {
                    email: u.email ?? "(no email)",
                    userId: u.id,
                    signedUpAt: u.created_at ?? new Date().toISOString(),
                    provider,
                  },
                },
              })
              .catch((err) => console.warn("signup notify failed", err));
          }
        } catch (err) {
          console.warn("signup notify error", err);
        }

        const currentPath = window.location.pathname;
        if (currentPath === "/login" || currentPath === "/signup" || currentPath === "/verify-email") {
          const profile = localStorage.getItem("econology_profile");
          // Use history API to avoid a full reload flash. ProtectedRoute will
          // pick up the new auth state without unmounting the app shell.
          const target = profile ? "/dashboard" : "/onboarding";
          window.history.replaceState({}, "", target);
          // Trigger react-router to react to the URL change.
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      isInitialLoad = false;
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    localStorage.removeItem("econology_guest");
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem("econology_guest", "true");
  };

  return (
    <AuthContext.Provider value={{ user, session, isGuest, loading, signOut, enterGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
