import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfile from "./tools/get-profile";
import getProgress from "./tools/get-progress";
import listPortfolio from "./tools/list-portfolio";
import addPortfolioTicker from "./tools/add-portfolio-ticker";
import listPinnedArticles from "./tools/list-pinned-articles";

// Build the OAuth issuer from the project ref so it matches the issuer Supabase's
// discovery document publishes. Never derive from SUPABASE_URL — Lovable Cloud
// may proxy that host, and mcp-js rejects any mismatch.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "econology-mcp",
  title: "Econology",
  version: "0.1.0",
  instructions:
    "Tools for Econology, a daily money and markets learning app. Use these to read the signed-in user's literacy profile, learning progress and streak, portfolio watchlist, and pinned news articles, and to add tickers to their watchlist.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfile, getProgress, listPortfolio, addPortfolioTicker, listPinnedArticles],
});