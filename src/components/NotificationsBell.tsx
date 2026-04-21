import { useState, useEffect } from "react";
import { Bell, Newspaper, TrendingUp, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { defaultProfile, UserProfile } from "@/types/profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  type: "digest" | "market";
  title: string;
  body: string;
}

interface CachedNotifs {
  digest: { title: string; body: string };
  market: { title: string; body: string };
}

const READ_KEY = () => `econology_notif_read_${new Date().toDateString()}`;
const CACHE_KEY = (hash: string) =>
  `econology_notif_cache_${new Date().toDateString()}_${hash}`;

function getProfile(): UserProfile {
  try {
    const raw = localStorage.getItem("econology_profile");
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

function profileHash(p: UserProfile): string {
  const key = JSON.stringify({
    a: p.age,
    s: p.studentStatus,
    l: p.livingSituation,
    g: p.financialGoals,
    t: p.topicsOfInterest,
    d: p.debtTypes,
  });
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY());
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function setReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY(), JSON.stringify(Array.from(ids)));
}

export function NotificationsBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadState] = useState<Set<string>>(() => getReadIds());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("daily_digest, market_news_alerts")
        .eq("user_id", user!.id)
        .maybeSingle();

      const wantsDigest = prefs?.daily_digest ?? true;
      const wantsMarket = prefs?.market_news_alerts ?? true;
      if (!wantsDigest && !wantsMarket) return;

      const profile = getProfile();
      const cacheKey = CACHE_KEY(profileHash(profile));

      let cached: CachedNotifs | null = null;
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) cached = JSON.parse(raw);
      } catch {
        /* ignore */
      }

      if (!cached) {
        try {
          const { data, error } = await supabase.functions.invoke(
            "daily-notifications",
            { body: { profile } }
          );
          if (error) throw error;
          if (data?.digest && data?.market) {
            cached = data as CachedNotifs;
            localStorage.setItem(cacheKey, JSON.stringify(cached));
          }
        } catch (e) {
          console.error("Failed to fetch notifications:", e);
          return;
        }
      }

      if (cancelled || !cached) return;

      const next: Notification[] = [];
      if (wantsDigest && cached.digest) next.push({ id: "digest", type: "digest", ...cached.digest });
      if (wantsMarket && cached.market) next.push({ id: "market", type: "market", ...cached.market });
      setNotifications(next);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllRead = () => {
    const all = new Set(notifications.map((n) => n.id));
    setReadIds(all);
    setReadState(all);
  };

  const markRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    setReadState(next);
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-md ring-2 ring-background"
              style={{
                background: "linear-gradient(135deg, hsl(265 85% 60%), hsl(290 80% 55%))",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-display font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span
                className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                style={{
                  background: "linear-gradient(135deg, hsl(265 85% 60%), hsl(290 80% 55%))",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell size={20} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">You're all caught up</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = readIds.has(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-0 transition-colors hover:bg-muted/50 ${
                    isRead ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {n.type === "digest" ? (
                        <Newspaper size={14} className="text-primary" />
                      ) : (
                        <TrendingUp size={14} className="text-secondary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                        {!isRead && (
                          <span
                            className="shrink-0 w-1.5 h-1.5 rounded-full"
                            style={{
                              background: "linear-gradient(135deg, hsl(265 85% 60%), hsl(290 80% 55%))",
                            }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-3">
                        {n.body}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
