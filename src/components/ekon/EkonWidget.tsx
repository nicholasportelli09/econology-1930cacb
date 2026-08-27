import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw, TrendingUp, PieChart as PieIcon, ListChecks, Scale, HelpCircle } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

/**
 * Interactive demo widgets Ekon can render inside a chat message.
 * Ekon emits a fenced ```ekon block containing a JSON spec; see parseEkonSegments.
 */

export type EkonSpec =
  | { type: "compound"; title?: string; initial?: number; monthly?: number; years?: number; rate?: number; currency?: string }
  | { type: "budget"; title?: string; income?: number; currency?: string; splits?: { label: string; percent: number }[] }
  | { type: "quiz"; question: string; options: { text: string; correct?: boolean; explain?: string }[] }
  | { type: "compare"; title?: string; unit?: string; options: { label: string; value: number; note?: string }[] }
  | { type: "checklist"; title?: string; steps: string[] };

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--primary) / 0.5)",
];

function money(n: number, currency = "$") {
  const rounded = Math.round(n);
  return `${currency}${rounded.toLocaleString()}`;
}

function Shell({ icon: Icon, title, children }: { icon: typeof TrendingUp; title: string; children: React.ReactNode }) {
  return (
    <div className="my-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4 space-y-4 not-prose">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
          <Icon size={15} />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Interactive</span>
      </div>
      {children}
    </div>
  );
}

function LabelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

/* ---------------- Compound growth ---------------- */
function CompoundWidget(spec: Extract<EkonSpec, { type: "compound" }>) {
  const currency = spec.currency ?? "$";
  const [monthly, setMonthly] = useState(spec.monthly ?? 50);
  const [years, setYears] = useState(spec.years ?? 10);
  const [rate, setRate] = useState(spec.rate ?? 7);
  const initial = spec.initial ?? 0;

  const data = useMemo(() => {
    const rows: { year: number; invested: number; total: number }[] = [];
    let balance = initial;
    let invested = initial;
    const monthlyRate = rate / 100 / 12;
    for (let y = 0; y <= years; y++) {
      if (y > 0) {
        for (let m = 0; m < 12; m++) {
          balance = balance * (1 + monthlyRate) + monthly;
          invested += monthly;
        }
      }
      rows.push({ year: y, invested: Math.round(invested), total: Math.round(balance) });
    }
    return rows;
  }, [initial, monthly, years, rate]);

  const last = data[data.length - 1];

  return (
    <Shell icon={TrendingUp} title={spec.title ?? "See your money grow"}>
      <div className="h-40 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="ekonGrow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={10} stroke="hsl(var(--muted-foreground))" />
            <YAxis tickLine={false} axisLine={false} fontSize={10} width={44} stroke="hsl(var(--muted-foreground))"
              tickFormatter={(v: number) => `${currency}${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
              formatter={(v: number, name: string) => [money(v, currency), name === "total" ? "Balance" : "You put in"]}
              labelFormatter={(l) => `Year ${l}`}
            />
            <Area type="monotone" dataKey="invested" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" fill="none" />
            <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#ekonGrow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <div>
          <LabelRow label="Monthly contribution" value={money(monthly, currency)} />
          <Slider value={[monthly]} min={0} max={1000} step={10} onValueChange={([v]) => setMonthly(v)} className="mt-2" />
        </div>
        <div>
          <LabelRow label="Years" value={`${years}`} />
          <Slider value={[years]} min={1} max={40} step={1} onValueChange={([v]) => setYears(v)} className="mt-2" />
        </div>
        <div>
          <LabelRow label="Annual return" value={`${rate}%`} />
          <Slider value={[rate]} min={0} max={12} step={0.5} onValueChange={([v]) => setRate(v)} className="mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="rounded-lg bg-card border border-border p-2">
          <p className="text-[10px] text-muted-foreground">You put in</p>
          <p className="text-sm font-bold text-foreground tabular-nums">{money(last.invested, currency)}</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-2">
          <p className="text-[10px] text-muted-foreground">Growth</p>
          <p className="text-sm font-bold text-primary tabular-nums">{money(last.total - last.invested, currency)}</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-2">
          <p className="text-[10px] text-muted-foreground">Total</p>
          <p className="text-sm font-bold text-foreground tabular-nums">{money(last.total, currency)}</p>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- Budget split ---------------- */
function BudgetWidget(spec: Extract<EkonSpec, { type: "budget" }>) {
  const currency = spec.currency ?? "$";
  const base = spec.splits?.length ? spec.splits : [
    { label: "Needs", percent: 50 },
    { label: "Wants", percent: 30 },
    { label: "Savings", percent: 20 },
  ];
  const [income, setIncome] = useState(spec.income ?? 1200);
  const [percents, setPercents] = useState<number[]>(base.map((s) => s.percent));
  const total = percents.reduce((a, b) => a + b, 0);

  return (
    <Shell icon={PieIcon} title={spec.title ?? "Split your income"}>
      <div>
        <LabelRow label="Monthly income" value={money(income, currency)} />
        <Slider value={[income]} min={100} max={6000} step={50} onValueChange={([v]) => setIncome(v)} className="mt-2" />
      </div>

      <div className="space-y-3">
        {base.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {s.label} · {percents[i]}%
              </span>
              <span className="font-semibold text-foreground tabular-nums">{money((income * percents[i]) / 100, currency)}</span>
            </div>
            <Slider
              value={[percents[i]]}
              min={0}
              max={100}
              step={1}
              className="mt-2"
              onValueChange={([v]) => setPercents((p) => p.map((x, j) => (j === i ? v : x)))}
            />
          </div>
        ))}
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {base.map((s, i) => (
          <div key={s.label} style={{ width: `${percents[i]}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
        ))}
      </div>
      <p className={`text-xs ${total === 100 ? "text-muted-foreground" : "text-destructive"}`}>
        {total === 100 ? "Nice — that adds up to 100%." : `Currently ${total}% — adjust to reach 100%.`}
      </p>
    </Shell>
  );
}

/* ---------------- Quick quiz ---------------- */
function QuizWidget(spec: Extract<EkonSpec, { type: "quiz" }>) {
  const [picked, setPicked] = useState<number | null>(null);
  const options = spec.options ?? [];

  return (
    <Shell icon={HelpCircle} title="Quick check">
      <p className="text-sm font-medium text-foreground">{spec.question}</p>
      <div className="space-y-2">
        {options.map((o, i) => {
          const isPicked = picked === i;
          const revealed = picked !== null;
          const state = revealed && (isPicked || o.correct)
            ? o.correct ? "correct" : isPicked ? "wrong" : "idle"
            : "idle";
          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => setPicked(i)}
              className={`w-full text-left text-sm rounded-lg border px-3 py-2.5 transition-all flex items-start gap-2 ${
                state === "correct"
                  ? "border-primary bg-primary/10 text-foreground"
                  : state === "wrong"
                  ? "border-destructive/50 bg-destructive/10 text-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40 disabled:opacity-70"
              }`}
            >
              {state === "correct" && <Check size={16} className="mt-0.5 shrink-0 text-primary" />}
              {state === "wrong" && <X size={16} className="mt-0.5 shrink-0 text-destructive" />}
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="space-y-2 animate-fade-in">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {options[picked]?.explain ?? (options[picked]?.correct ? "Correct!" : "Not quite — check the highlighted answer.")}
          </p>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setPicked(null)}>
            <RotateCcw size={12} /> Try again
          </Button>
        </div>
      )}
    </Shell>
  );
}

/* ---------------- Compare options ---------------- */
function CompareWidget(spec: Extract<EkonSpec, { type: "compare" }>) {
  const [active, setActive] = useState(0);
  const options = spec.options ?? [];
  const data = options.map((o) => ({ label: o.label, value: o.value }));

  return (
    <Shell icon={Scale} title={spec.title ?? "Compare the options"}>
      <div className="h-36 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} onClick={(s: { activeTooltipIndex?: number | string }) => { const i = Number(s?.activeTooltipIndex); if (!Number.isNaN(i)) setActive(i); }}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} stroke="hsl(var(--muted-foreground))" />
            <YAxis tickLine={false} axisLine={false} fontSize={10} width={44} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
              formatter={(v: number) => [`${spec.unit ?? ""}${v.toLocaleString()}`, "Value"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => (
          <button
            key={o.label}
            onClick={() => setActive(i)}
            className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
              i === active ? "border-primary bg-primary/10 text-foreground font-medium" : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {options[active]?.note && (
        <p className="text-xs text-muted-foreground leading-relaxed animate-fade-in">{options[active].note}</p>
      )}
    </Shell>
  );
}

/* ---------------- Checklist ---------------- */
function ChecklistWidget(spec: Extract<EkonSpec, { type: "checklist" }>) {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const steps = spec.steps ?? [];
  const count = steps.filter((_, i) => done[i]).length;

  return (
    <Shell icon={ListChecks} title={spec.title ?? "Your action plan"}>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
            className="w-full text-left flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5 hover:border-primary/40 transition-colors"
          >
            <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
              done[i] ? "bg-primary border-primary" : "border-muted-foreground/40"
            }`}>
              {done[i] && <Check size={11} className="text-primary-foreground" />}
            </span>
            <span className={`text-sm leading-snug ${done[i] ? "line-through text-muted-foreground" : "text-foreground"}`}>{s}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${steps.length ? (count / steps.length) * 100 : 0}%` }} />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{count}/{steps.length}</span>
      </div>
    </Shell>
  );
}

export function EkonWidget({ spec }: { spec: EkonSpec }) {
  switch (spec?.type) {
    case "compound": return <CompoundWidget {...spec} />;
    case "budget": return <BudgetWidget {...spec} />;
    case "quiz": return spec.question && spec.options?.length ? <QuizWidget {...spec} /> : null;
    case "compare": return spec.options?.length ? <CompareWidget {...spec} /> : null;
    case "checklist": return spec.steps?.length ? <ChecklistWidget {...spec} /> : null;
    default: return null;
  }
}

const KNOWN_TYPES = ["compound", "budget", "quiz", "compare", "checklist"];

/** Finds a balanced JSON object starting at `start`; returns end index (exclusive) or -1. */
function matchBraces(s: string, start: number): number {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

/** Splits a message into markdown text segments and interactive widget specs. */
export function parseEkonSegments(content: string): ({ kind: "text"; text: string } | { kind: "widget"; spec: EkonSpec })[] {
  const out: ({ kind: "text"; text: string } | { kind: "widget"; spec: EkonSpec })[] = [];
  // Strip fences (```ekon / ```json / ```) so we can scan raw JSON objects uniformly.
  const cleaned = content.replace(/```(?:ekon|json)?/gi, "");

  const push = (text: string) => {
    if (text.trim()) out.push({ kind: "text", text });
  };

  let cursor = 0;
  const re = /\{\s*"type"\s*:\s*"(\w+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    if (!KNOWN_TYPES.includes(m[1])) continue;
    if (m.index < cursor) continue;
    const end = matchBraces(cleaned, m.index);
    if (end === -1) {
      // Incomplete block still streaming — drop the partial JSON.
      push(cleaned.slice(cursor, m.index));
      cursor = cleaned.length;
      break;
    }
    let spec: EkonSpec | null = null;
    try {
      spec = JSON.parse(cleaned.slice(m.index, end)) as EkonSpec;
    } catch {
      spec = null;
    }
    if (spec?.type) {
      push(cleaned.slice(cursor, m.index));
      out.push({ kind: "widget", spec });
      cursor = end;
      re.lastIndex = end;
    }
  }
  push(cleaned.slice(cursor));
  return out.length ? out : [{ kind: "text", text: content }];
}

