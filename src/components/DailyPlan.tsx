import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, BookOpen, Newspaper, Calculator, MessageCircle, TrendingUp, type LucideIcon } from "lucide-react";
import { getGamification } from "@/lib/gamification";

interface PlanItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  done: boolean;
}

function isToday(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
}

export default function DailyPlan() {
  const navigate = useNavigate();
  const gam = getGamification();

  const items: PlanItem[] = useMemo(() => {
    const todayKey = new Date().toDateString();
    const lessonDone = localStorage.getItem(`econology_daily_lesson_${todayKey}`) === "done";
    const tipRead = isToday(localStorage.getItem("econology_last_tip_read"));
    const newsChecked = isToday(localStorage.getItem("econology_last_news_visit"));
    const ekonAsked = isToday(localStorage.getItem("econology_last_ekon_ask"));
    const budgetUsed = isToday(localStorage.getItem("econology_last_budget_use"));

    return [
      { id: "lesson", label: "Daily lesson", to: "/dashboard", icon: BookOpen, done: lessonDone },
      { id: "tip", label: "Read a topic", to: "/learn", icon: BookOpen, done: tipRead },
      { id: "news", label: "Check the news", to: "/news", icon: Newspaper, done: newsChecked },
      { id: "ekon", label: "Ask Ekon a question", to: "/ask", icon: MessageCircle, done: ekonAsked },
      { id: "budget", label: "Try the budget simulator", to: "/budget", icon: Calculator, done: budgetUsed },
    ];
  }, [gam.xp]);

  const completed = items.filter((i) => i.done).length;

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={13} className="text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Plan</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{completed}/{items.length}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.to)}
                className="w-full flex items-center gap-2.5 text-left text-sm py-1.5 px-2 rounded-md transition-colors hover:bg-muted group"
              >
                {item.done ? (
                  <CheckCircle2 size={15} className="text-accent shrink-0" />
                ) : (
                  <Circle size={15} className="text-muted-foreground shrink-0" />
                )}
                <Icon size={13} className="text-muted-foreground shrink-0" />
                <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}