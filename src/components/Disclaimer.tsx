import { AlertTriangle } from "lucide-react";

/**
 * Persistent "Educational content only — not financial advice" banner.
 * Use on News, Market Ideas, Ask Ekon, and Watchlist surfaces.
 */
export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      role="note"
      aria-label="Educational content disclaimer"
      className={`flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 ${className}`}
    >
      <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={16} />
      <p className="text-xs text-destructive leading-relaxed">
        <span className="font-bold uppercase tracking-wider">Educational content only — not financial advice.</span>{" "}
        Econology is a learning tool. Nothing here is a recommendation to buy, sell, or hold any security. Do your own research and consult a licensed professional before making financial decisions.
      </p>
    </div>
  );
}