import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type UserProfile, defaultProfile } from "@/types/profile";

interface TopicCard {
  id: string;
  title: string;
  description: string;
  category: string;
}

const ALL_TOPICS: TopicCard[] = [
  { id: "budget", title: "The 50/30/20 Budget Rule", description: "Split your income into needs, wants, and savings with this simple framework.", category: "Budgeting" },
  { id: "inflation", title: "Beat Inflation", description: "Learn why your savings lose value over time and how investing fights back.", category: "Investing" },
  { id: "credit", title: "Credit Score Matters", description: "Understand the factors behind your score and how it impacts your financial life.", category: "Credit" },
  { id: "emergency", title: "Emergency Fund", description: "Build a financial safety net for life's unexpected expenses.", category: "Savings" },
  { id: "index", title: "Index Funds 101", description: "Buy 500 companies at once with low fees — the easiest way to start investing.", category: "Investing" },
  { id: "hustle", title: "Side Hustle Power", description: "Turn extra hours into extra income and accelerate your financial goals.", category: "Earning" },
];

const categoryColor: Record<string, string> = {
  Budgeting: "bg-primary/20 text-primary",
  Investing: "bg-secondary/20 text-secondary",
  Credit: "bg-accent/20 text-accent",
  Savings: "bg-primary/20 text-primary",
  Earning: "bg-accent/20 text-accent",
};

const Learn = () => {
  const navigate = useNavigate();
  const stored = localStorage.getItem("econology_profile");
  const profile: UserProfile = stored ? JSON.parse(stored) : defaultProfile;

  const [order, setOrder] = useState<number[]>(() =>
    ALL_TOPICS.map((_, i) => i)
  );

  const shuffleTopics = () => {
    setOrder((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  const topics = useMemo(() => order.map((i) => ALL_TOPICS[i]), [order]);

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader initials={initials} />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Learning Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore financial topics and level up your money skills.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={shuffleTopics}
            className="gap-2"
          >
            <RefreshCw size={16} /> New Topics
          </Button>
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="group rounded-xl border border-border bg-card p-6 card-shadow flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_hsl(270_70%_55%/0.15)]"
            >
              <div className="space-y-3">
                <Badge
                  variant="secondary"
                  className={`${categoryColor[topic.category] ?? ""} border-0 text-xs font-medium`}
                >
                  {topic.category}
                </Badge>
                <h3 className="text-lg font-display font-semibold text-foreground">
                  {topic.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {topic.description}
                </p>
              </div>
              <Button
                variant="ghost"
                className="mt-5 justify-start px-0 text-primary hover:text-primary/80 gap-1 hover:bg-primary/10"
                onClick={() => navigate(`/tip/${topic.id}`)}
              >
                Learn More <ArrowRight size={16} />
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Learn;
