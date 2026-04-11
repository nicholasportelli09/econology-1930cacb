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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem("econology_guest");
      }
      setLoading(false);

      // After OAuth sign-in, redirect appropriately
      if (event === "SIGNED_IN" && session?.user) {
        const currentPath = window.location.pathname;
        // Only redirect if on landing, login, or signup pages
        if (currentPath === "/" || currentPath === "/login" || currentPath === "/signup") {
          const profile = localStorage.getItem("econology_profile");
          if (!profile) {
            window.location.href = "/onboarding";
          } else {
            window.location.href = "/dashboard";
          }
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
