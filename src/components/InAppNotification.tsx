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

const DIGEST_TIPS = [
  { title: "Market Update", body: "S&P 500 futures are up — tech stocks leading gains today." },
  { title: "Savings Tip", body: "Automate your savings: even $25/week adds up to $1,300/year." },
  { title: "Economic Insight", body: "The Fed held rates steady — here's what it means for your wallet." },
  { title: "Student Finance", body: "Tax season is here — students can claim education credits." },
  { title: "Investing 101", body: "Dollar-cost averaging reduces risk — invest a fixed amount regularly." },
];

const MARKET_ALERTS = [
  { title: "Market Alert", body: "Volatility index (VIX) spiked 8% — markets may see turbulence." },
  { title: "Earnings Season", body: "Big tech earnings this week could move the market significantly." },
  { title: "Rate Watch", body: "Bond yields are rising — keep an eye on interest rate-sensitive stocks." },
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getStorageKey(type: string) {
  return `econology_notif_dismissed_${type}`;
}

function wasDismissedToday(type: string): boolean {
  const val = localStorage.getItem(getStorageKey(type));
  if (!val) return false;
  const dismissed = new Date(val);
  const now = new Date();
  return dismissed.toDateString() === now.toDateString();
}

export function InAppNotification() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    supabase
      .from("notification_preferences")
      .select("daily_digest, market_news_alerts")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const notifs: Notification[] = [];

        if ((data?.daily_digest ?? true) && !wasDismissedToday("digest")) {
          const tip = getRandomItem(DIGEST_TIPS);
          notifs.push({ id: "digest", type: "digest", ...tip });
        }

        if ((data?.market_news_alerts ?? true) && !wasDismissedToday("market")) {
          const alert = getRandomItem(MARKET_ALERTS);
          notifs.push({ id: "market", type: "market", ...alert });
        }

        // Stagger: show first immediately, second after delay
        if (notifs.length > 0) {
          setNotifications([notifs[0]]);
          if (notifs.length > 1) {
            setTimeout(() => {
              if (!cancelled) setNotifications((prev) => [...prev, notifs[1]]);
            }, 3000);
          }
        }
      });

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
