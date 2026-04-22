

## Better experience for existing logged-in users

Right now `/` always shows "Sign In" in the top right, even for users who are already authenticated. That's fine for new visitors but a small friction for returning users — they have to click Sign In and get bounced through the auth flow before reaching the dashboard.

Here's a cleaner pattern that keeps the hero as the default landing page (per your earlier decision) while making things smoother for existing users.

### Proposed behavior

**Top-right button on `/` (hero page):**
- **Logged out** → "Sign In" (navigates to `/login`) — unchanged
- **Logged in** → "Go to Dashboard" (navigates to `/dashboard`) — new

**Hero CTA buttons ("Start Your Journey" / "Get Started — It's Free"):**
- **Logged out** → keep as "Start Your Journey" → `/signup` (unchanged)
- **Logged in** → swap label to "Continue to Dashboard" → `/dashboard`

**No auto-redirect.** The hero page stays visible to everyone. Logged-in users just get a contextually correct button instead of being told to "Sign In" when they already are.

### Why this is better than alternatives

| Option | Trade-off |
|---|---|
| Auto-redirect logged-in users to `/dashboard` | You explicitly rejected this — hero must remain the default landing page |
| Always show "Sign In" (current state) | Confusing for logged-in users; makes them think they're signed out |
| **Conditional button (proposed)** | Hero stays default, logged-in users get a clear path forward in one click |

### Technical details

- File: `src/pages/Index.tsx`
- Add `import { useAuth } from "@/contexts/AuthContext"` and read `user` + `isGuest`
- Treat `user || isGuest` as "has a session"
- Conditionally render the nav button label/destination and the two hero CTAs
- No changes to routing, `ProtectedRoute`, or `AuthContext`

