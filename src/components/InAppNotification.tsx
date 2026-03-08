import { useState, useEffect } from "react";
import { X, TrendingUp, Newspaper } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: "digest" | "market";
  title: string;
  body: string;
}

function getStorageKey(type: string) {
  return `econology_notif_dismissed_${type}`;
}

function getCacheKey() {
  return `econology_notif_cache_${new Date().toDateString()}`;
}

function wasDismissedToday(type: string): boolean {
  const val = localStorage.getItem(getStorageKey(type));
  if (!val) return false;
  return new Date(val).toDateString() === new Date().toDateString();
}

interface CachedNotifs {
  digest: { title: string; body: string };
  market: { title: string; body: string };
}

export function InAppNotification() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      // Check user preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("daily_digest, market_news_alerts")
        .eq("user_id", user!.id)
        .maybeSingle();

      const wantsDigest = (prefs?.daily_digest ?? true) && !wasDismissedToday("digest");
      const wantsMarket = (prefs?.market_news_alerts ?? true) && !wasDismissedToday("market");

      if (!wantsDigest && !wantsMarket) return;

      // Check cache first
      let cached: CachedNotifs | null = null;
      try {
        const raw = localStorage.getItem(getCacheKey());
        if (raw) cached = JSON.parse(raw);
      } catch { /* ignore */ }

      if (!cached) {
        try {
          const { data, error } = await supabase.functions.invoke("daily-notifications");
          if (error) throw error;
          if (data?.digest && data?.market) {
            cached = data as CachedNotifs;
            localStorage.setItem(getCacheKey(), JSON.stringify(cached));
          }
        } catch (e) {
          console.error("Failed to fetch notifications:", e);
          return;
        }
      }

      if (cancelled || !cached) return;

      const notifs: Notification[] = [];
      if (wantsDigest && cached.digest) {
        notifs.push({ id: "digest", type: "digest", ...cached.digest });
      }
      if (wantsMarket && cached.market) {
        notifs.push({ id: "market", type: "market", ...cached.market });
      }

      if (notifs.length > 0) {
        setNotifications([notifs[0]]);
        if (notifs.length > 1) {
          setTimeout(() => {
            if (!cancelled) setNotifications((prev) => [...prev, notifs[1]]);
          }, 2000);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  const dismiss = (id: string) => {
    localStorage.setItem(getStorageKey(id), new Date().toISOString());
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto bg-card border border-border rounded-xl p-4 shadow-lg animate-in slide-in-from-right-5 fade-in duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {n.type === "digest" ? (
                <Newspaper size={16} className="text-primary" />
              ) : (
                <TrendingUp size={16} className="text-secondary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
