import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { trackProduct } from "@/lib/productAnalytics";

type ContentType = "ai_news" | "market_idea" | "ai_summary" | "ai_digest" | "ai_tutor";

interface ReportIssueProps {
  contentType: ContentType;
  contentReference: string; // URL, id, or short identifier
  size?: "sm" | "xs";
  className?: string;
  triggerLabel?: string;
}

const REASONS = [
  { value: "inaccurate", label: "Inaccurate or misleading" },
  { value: "outdated", label: "Outdated information" },
  { value: "biased", label: "Biased or one-sided" },
  { value: "harmful", label: "Harmful or unsafe suggestion" },
  { value: "spam", label: "Spam or low quality" },
  { value: "other", label: "Other" },
];

export function ReportIssue({
  contentType,
  contentReference,
  className = "",
  triggerLabel = "Report issue",
}: ReportIssueProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to report content.", variant: "destructive" });
      return;
    }
    if (!reason) {
      toast({ title: "Choose a reason", description: "Select what's wrong with this content.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("content_reports").insert({
      user_id: user.id,
      content_type: contentType,
      content_reference: contentReference.slice(0, 2000),
      reason,
      details: details.trim() ? details.trim().slice(0, 2000) : null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't submit", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Thanks for the report", description: "We review flagged content and act on patterns we see." });
    void trackProduct("content_reported", { surface: contentType, reason_bucket: reason });
    void trackProduct("feedback_submitted", { surface: contentType });
    setOpen(false);
    setReason("");
    setDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors ${className}`}
          title="Report an issue with this content"
        >
          <Flag size={12} /> {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription>
            Tell us what's wrong with this AI-generated content. Your report is private to you and our team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details (optional)</label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="What's inaccurate or problematic? (max 2000 chars)"
              maxLength={2000}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || !reason}>
            {submitting ? <><Loader2 size={14} className="animate-spin mr-2" /> Sending…</> : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}