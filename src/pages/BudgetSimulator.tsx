import { useState, useMemo, useCallback, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { type UserProfile, defaultProfile } from "@/types/profile";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { recordBudgetSim, getGamification } from "@/lib/gamification";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DollarSign, PiggyBank, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Seo } from "@/components/Seo";

function getProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("econology_profile");
    return stored ? JSON.parse(stored) : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

interface Category {
  key: string;
  label: string;
  color: string;
  recommended: number; // recommended % of income
}

const CATEGORIES: Category[] = [
  { key: "housing", label: "Housing & Rent", color: "hsl(270, 70%, 55%)", recommended: 30 },
  { key: "food", label: "Food & Groceries", color: "hsl(220, 70%, 50%)", recommended: 15 },
  { key: "transport", label: "Transportation", color: "hsl(155, 60%, 45%)", recommended: 10 },
  { key: "entertainment", label: "Entertainment", color: "hsl(340, 65%, 55%)", recommended: 10 },
  { key: "savings", label: "Savings & Investments", color: "hsl(45, 85%, 55%)", recommended: 20 },
  { key: "other", label: "Other / Misc", color: "hsl(200, 15%, 55%)", recommended: 15 },
];

const BudgetSimulator = () => {
  const profile = useMemo(getProfile, []);
  const [income, setIncome] = useState(2000);
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    CATEGORIES.forEach((c) => (initial[c.key] = c.recommended));
    return initial;
  });
  const [hasUsed, setHasUsed] = useState(false);

  const totalPercent = useMemo(
    () => Object.values(allocations).reduce((a, b) => a + b, 0),
    [allocations]
  );

  const remaining = 100 - totalPercent;

  const handleSlider = useCallback((key: string, val: number[]) => {
    setAllocations((prev) => ({ ...prev, [key]: val[0] }));
    if (!hasUsed) {
      setHasUsed(true);
      recordBudgetSim();
    }
  }, [hasUsed]);

  const chartData = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: c.label,
        value: Math.round((allocations[c.key] / 100) * income),
        percent: allocations[c.key],
        color: c.color,
      })).filter((d) => d.value > 0),
    [allocations, income]
  );

  const savingsAmount = Math.round((allocations.savings / 100) * income);
  const yearlySavings = savingsAmount * 12;
  const fiveYearGrowth = Math.round(savingsAmount * 12 * 5 * 1.07); // ~7% annual return simplified

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Budget simulator — Econology" description="Allocate income across needs, wants, and savings, and project five years of compounded savings." path="/budget" type="website" />
      <DashboardHeader initials={initials} />

      <main className="max-w-[1320px] mx-auto px-4 md:px-10 lg:px-6 py-8 space-y-8">
        <section>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Budget Simulator</h1>
          <p className="text-muted-foreground">Drag the sliders to see how your money allocation affects your savings over time.</p>
        </section>

        {/* Income Input */}
        <div className="rounded-xl border border-border bg-card p-6 card-shadow">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
            <DollarSign size={18} className="text-primary" />
            Monthly Income (after taxes)
          </label>
          <Input
            type="number"
            value={income}
            onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
            className="max-w-xs text-lg font-display font-bold"
            min={0}
            step={100}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sliders */}
          <div className="rounded-xl border border-border bg-card p-6 card-shadow space-y-6">
            <h2 className="text-lg font-display font-semibold text-foreground">Allocate Your Budget</h2>

            {CATEGORIES.map((cat) => (
              <div key={cat.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-display font-bold text-foreground">
                      {allocations[cat.key]}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (${Math.round((allocations[cat.key] / 100) * income)})
                    </span>
                  </div>
                </div>
                <Slider
                  value={[allocations[cat.key]]}
                  onValueChange={(val) => handleSlider(cat.key, val)}
                  max={60}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  Recommended: {cat.recommended}%
                </div>
              </div>
            ))}

            {/* Total indicator */}
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${
              remaining === 0
                ? "border-accent/30 bg-accent/10 text-accent"
                : remaining < 0
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/30 bg-primary/10 text-primary"
            }`}>
              {remaining === 0 ? (
                <CheckCircle2 size={18} />
              ) : remaining < 0 ? (
                <AlertTriangle size={18} />
              ) : (
                <PiggyBank size={18} />
              )}
              <span className="text-sm font-medium">
                {remaining === 0
                  ? "Budget perfectly balanced!"
                  : remaining > 0
                  ? `${remaining}% unallocated ($${Math.round((remaining / 100) * income)})`
                  : `${Math.abs(remaining)}% over budget!`}
              </span>
            </div>
          </div>

          {/* Visualization */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 card-shadow">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">Spending Breakdown</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`$${value}`, name]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Savings Projection */}
            <div className="rounded-xl border border-border bg-card p-6 card-shadow space-y-4">
              <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" />
                Savings Projection
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-foreground">${savingsAmount}</p>
                  <p className="text-xs text-muted-foreground">Monthly</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-foreground">${yearlySavings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Yearly</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-accent">${fiveYearGrowth.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">5yr (7% return)</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                * 5-year projection assumes 7% average annual return if invested. Actual results may vary.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BudgetSimulator;
