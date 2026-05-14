import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Send, Sparkles, Info, PiggyBank, CreditCard, TrendingUp, LineChart, Wand2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { defaultProfile, type UserProfile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";

const DAILY_LIMIT = 10;

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED_QUESTIONS: { q: string; icon: typeof PiggyBank; tint: string }[] = [
  { q: "How should I split my first paycheck?", icon: PiggyBank, tint: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400" },
  { q: "Credit vs. debit — which should I use?", icon: CreditCard, tint: "from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400" },
  { q: "Should I start investing with $50?", icon: TrendingUp, tint: "from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400" },
  { q: "How do interest rates affect me?", icon: LineChart, tint: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({ messages, profile, accessToken, onDelta, onDone, onError }: {
  messages: Msg[];
  profile: UserProfile;
  accessToken?: string | null;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, profile }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(err.error || "Something went wrong");
    return;
  }
  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });
    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  if (buffer.trim()) {
    for (let raw of buffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {}
    }
  }
  onDone();
}

export default function AskEkon() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const topicSentRef = useRef(false);
  const [usedToday, setUsedToday] = useState<number | null>(null);

  // Load today's usage from the backend (RLS-scoped to the user)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setUsedToday(null); return; }
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("ekon_usage")
        .select("message_count")
        .eq("user_id", user.id)
        .eq("usage_date", today)
        .maybeSingle();
      if (!cancelled) setUsedToday(data?.message_count ?? 0);
    })();
    return () => { cancelled = true; };
  }, []);

  const profile: UserProfile = (() => {
    try {
      const saved = localStorage.getItem("econology_profile");
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch { return defaultProfile; }
  })();

  const initials = profile.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await streamChat({
        messages: updatedMessages,
        profile,
        accessToken: session?.access_token ?? null,
        onDelta: upsert,
        onDone: () => {
          setIsLoading(false);
          setUsedToday((n) => (n == null ? n : n + 1));
        },
        onError: (msg) => {
          setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
          setIsLoading(false);
        },
      });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Something went wrong. Please try again." }]);
      setIsLoading(false);
    }
    inputRef.current?.focus();
  }, [messages, isLoading, profile]);

  // Auto-send topic-related prompt from TipArticle
  useEffect(() => {
    const topic = searchParams.get("topic");
    if (topic && !topicSentRef.current && messages.length === 0) {
      topicSentRef.current = true;
      send(`I just read about "${topic}". Can you explain this topic in more detail and give me practical tips?`);
    }
  }, [searchParams, send, messages.length]);

  const hasMessages = messages.length > 0;

  return (
    <>
      <Seo title="Ask Ekon — Econology" description="Chat with Ekon, your AI tutor for money, markets, and economics. Get clear answers grounded in real data." path="/ask" type="website" />
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-0">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/3 -right-32 w-[26rem] h-[26rem] rounded-full bg-accent/15 blur-3xl animate-pulse" style={{ animationDuration: "10s" }} />
      </div>

      <DashboardHeader initials={initials} />

      <div className="flex-1 overflow-hidden flex flex-col max-w-3xl mx-auto w-full relative z-10">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[65vh] gap-8 animate-fade-in">
              {/* Glowing avatar */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-2xl opacity-60 animate-pulse" style={{ animationDuration: "3s" }} />
                <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-xl ring-4 ring-background">
                  <Sparkles className="h-11 w-11 text-primary-foreground" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background shadow-md" title="Online" />
              </div>

              <div className="text-center space-y-3 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <Wand2 size={11} /> AI Money Tutor
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent">
                  Hey, I'm Ekon.
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Budgeting, credit, investing, markets — explained in plain English and tailored to your profile. I can even pull live stock quotes on request.
                </p>
              </div>

              <div className="w-full max-w-xl space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground text-center font-semibold">Try asking</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_QUESTIONS.map(({ q, icon: Icon, tint }) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="group relative text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${tint} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className="relative flex items-start gap-3">
                        <div className={`shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-sm font-medium text-foreground leading-snug pt-1.5">{q}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4 pt-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md ring-2 ring-background">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  {msg.role === "user" ? (
                    <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm bg-gradient-to-br from-primary to-primary/90 text-primary-foreground whitespace-pre-wrap shadow-md">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 bg-card border border-border text-foreground shadow-sm">
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-end gap-2 justify-start animate-fade-in">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md ring-2 ring-background">
                    <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 text-sm flex items-center gap-1.5 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm p-4">
          {usedToday != null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Info className="h-3 w-3" />
              {Math.max(0, DAILY_LIMIT - usedToday)} of {DAILY_LIMIT} messages left today
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="relative flex items-center gap-2 rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 transition-all px-2 py-1.5">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about budgeting, investing, credit scores…"
              disabled={isLoading}
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="rounded-xl h-9 w-9 bg-gradient-to-br from-primary to-accent hover:opacity-90 disabled:opacity-40 shadow-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
