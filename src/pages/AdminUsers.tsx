import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Download, Users as UsersIcon } from "lucide-react";

interface AppUser {
  user_id: string;
  email: string | null;
  provider: string;
  email_confirmed: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  lessons_completed: number;
  onboarded: boolean;
  guest_mode: boolean;
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtDateTime(d: string | null): string {
  if (!d) return "Never";
  return new Date(d).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initialsFor(email: string | null): string {
  if (!email) return "?";
  const parts = email.split("@")[0].split(/[._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function AdminUsers() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<AppUser[] | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server-side role check (never trust a client flag).
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error }) => setIsAdmin(!error && !!data));
  }, [user]);

  const load = async (q: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc("admin_list_users", {
      p_limit: 500,
      p_offset: 0,
      p_search: q.trim() ? q.trim() : null,
    });
    if (error) setError(error.message);
    else setUsers((data as unknown as AppUser[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void load("");
  }, [isAdmin]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const exportCsv = () => {
    if (!users) return;
    const header = ["email", "provider", "email_confirmed", "signup_date", "last_sign_in", "lessons_completed", "onboarded"];
    const rows = users.map((u) => [
      u.email ?? "",
      u.provider,
      u.email_confirmed ? "yes" : "no",
      u.created_at.slice(0, 10),
      u.last_sign_in_at ?? "never",
      String(u.lessons_completed),
      u.onboarded ? "yes" : "no",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `econology_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-end gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UsersIcon className="h-7 w-7 text-primary" /> Users
            </h1>
            <p className="text-sm text-muted-foreground">
              Admin only. {users ? `${users.length} account${users.length === 1 ? "" : "s"}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void load(search);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email…"
                className="px-3 py-2 rounded-md border bg-background text-sm w-48"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-md border text-sm font-semibold hover:bg-muted"
                aria-label="Search users"
              >
                <Search size={16} />
              </button>
            </form>
            <button
              onClick={() => void load(search)}
              disabled={loading}
              className="px-4 py-2 rounded-md gradient-bg text-primary-foreground text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
            <button
              onClick={exportCsv}
              disabled={!users?.length}
              className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold disabled:opacity-50"
            >
              <Download size={16} /> CSV
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive p-4 text-sm">
            {error}
          </div>
        )}

        <div className="rounded-xl border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Signed up</th>
                <th className="px-4 py-3 font-medium">Last sign-in</th>
                <th className="px-4 py-3 font-medium text-right">Lessons</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && !users ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : users && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No users found{search ? ` for “${search}”` : ""}.
                  </td>
                </tr>
              ) : (
                users?.map((u) => (
                  <tr key={u.user_id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                          {initialsFor(u.email)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[240px]">{u.email ?? "(no email)"}</div>
                          {!u.email_confirmed && (
                            <div className="text-xs text-muted-foreground">Email not confirmed</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs capitalize">
                        {u.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(u.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(u.last_sign_in_at)}</td>
                    <td className="px-4 py-3 text-right font-mono">{u.lessons_completed}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.onboarded && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            Onboarded
                          </span>
                        )}
                        {u.guest_mode && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                            Guest
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
