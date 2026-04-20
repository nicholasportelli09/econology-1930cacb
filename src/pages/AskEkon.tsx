import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Send, MessageCircle, Sparkles, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { defaultProfile, type UserProfile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";

const DAILY_LIMIT = 10;

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED_QUESTIONS = [
  "How should I split my first paycheck?",
  "What's the difference between credit and debit cards?",
  "Should I start investing with $50?",
  "How do interest rates affect me?",
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
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader initials={initials} />

      <div className="flex-1 overflow-hidden flex flex-col max-w-3xl mx-auto w-full">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-2 max-w-md">
                <h2 className="text-xl font-display font-semibold">Meet Ekon — your AI money tutor</h2>
                <p className="text-sm text-muted-foreground">
                  I explain budgeting, credit, investing, and markets in plain English — personalized to your profile. I can also fetch live stock prices on request.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => send(q)} className="text-left p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-muted transition-colors text-sm text-foreground">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm bg-primary text-primary-foreground whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 bg-muted text-foreground">
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-md px-4 py-3 text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse text-primary" /> Ekon is thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-4">
          {usedToday != null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Info className="h-3 w-3" />
              {Math.max(0, DAILY_LIMIT - usedToday)} of {DAILY_LIMIT} messages left today
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about budgeting, investing, credit scores..." disabled={isLoading} className="flex-1" />
            <Button type="submit" disabled={!input.trim() || isLoading} size="icon"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>
    </div>
  );
}
