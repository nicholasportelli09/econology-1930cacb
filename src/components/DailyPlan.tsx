import { useMemo, useState } from "react";
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

const MANUAL_KEY = () => `econology_daily_plan_manual_${new Date().toDateString()}`;

function getManual(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(MANUAL_KEY());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function DailyPlan() {
  const navigate = useNavigate();
  const gam = getGamification();
  const [manual, setManual] = useState<Record<string, boolean>>(() => getManual());

  const items: PlanItem[] = useMemo(() => {
    const todayKey = new Date().toDateString();
    const lessonDone = localStorage.getItem(`econology_daily_lesson_${todayKey}`) === "done";
    const tipRead = isToday(localStorage.getItem("econology_last_tip_read"));
    const newsChecked = isToday(localStorage.getItem("econology_last_news_visit"));
    const ekonAsked = isToday(localStorage.getItem("econology_last_ekon_ask"));
    const budgetUsed = isToday(localStorage.getItem("econology_last_budget_use"));

    return [
      { id: "lesson", label: "Daily lesson", to: "/dashboard", icon: BookOpen, done: lessonDone || !!manual.lesson },
      { id: "tip", label: "Read a topic", to: "/learn", icon: BookOpen, done: tipRead || !!manual.tip },
      { id: "news", label: "Check the news", to: "/news", icon: Newspaper, done: newsChecked || !!manual.news },
      { id: "ekon", label: "Ask Ekon a question", to: "/ask", icon: MessageCircle, done: ekonAsked || !!manual.ekon },
      { id: "budget", label: "Try the budget simulator", to: "/budget", icon: Calculator, done: budgetUsed || !!manual.budget },
    ];
  }, [gam.xp, manual]);

  const completed = items.filter((i) => i.done).length;

  const toggle = (id: string, currentlyDone: boolean) => {
    const next = { ...manual, [id]: !currentlyDone };
    if (!next[id]) delete next[id];
    setManual(next);
    localStorage.setItem(MANUAL_KEY(), JSON.stringify(next));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 card-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          <h3 className="text-sm font-display font-semibold text-foreground">Today's Plan</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{completed}/{items.length}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex items-center gap-1 rounded-md transition-colors hover:bg-muted">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(item.id, item.done);
                }}
                className="p-1.5 shrink-0"
                aria-label={item.done ? `Mark ${item.label} incomplete` : `Mark ${item.label} complete`}
              >
                {item.done ? (
                  <CheckCircle2 size={15} className="text-accent" />
                ) : (
                  <Circle size={15} className="text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>
              <button
                onClick={() => navigate(item.to)}
                className="flex-1 flex items-center gap-2.5 text-left text-sm py-1.5 pr-2"
              >
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