

## Merge Market News + Company News into one tab

Right now the News page has three tabs: **Market News** (general macro headlines), **Company News** (ticker-specific), and **AI Insights**. The first two pull from the same Finnhub backend with slightly different inputs, so combining them into a single smarter "Headlines" tab will reduce friction and feel more like one coherent newsroom.

### What the user will see

A simplified News page with **two tabs**:

1. **Headlines** (replaces Market + Company)
2. **AI Insights** (unchanged)

Inside Headlines:

```text
┌──────────────────────────────────────────────────────────┐
│ [🔍 Search ticker (AAPL) or topic (forex, crypto)…] [Go] │
│                                                          │
│ Quick filters:  [All]  [My Portfolio]  [Crypto] [Forex]  │
│                                                          │
│ ─── Showing: General market headlines ───                │
│ • Article card                                           │
│ • Article card                                           │
└──────────────────────────────────────────────────────────┘
```

Behavior:
- **Empty search** → general market news (current Market tab default).
- **Looks like a ticker** (1–5 uppercase letters, e.g. `AAPL`, `TSLA`) → company news for that ticker.
- **Looks like a category word** (`forex`, `crypto`, `merger`, `general`) → category news.
- **"My Portfolio" chip** → fetches news for all saved portfolio tickers, merged and de-duplicated.
- A small label above the results tells the user what mode they're in ("Showing: AAPL company news", "Showing: your portfolio (AAPL, MSFT)", etc.).

A single **NewsDigest** summary appears above results regardless of source, so the AI digest works for both macro and company news.

### Technical changes

Frontend only — **no backend/edge function changes required**.

**`src/pages/EconomicNews.tsx`**
- Remove the `BarChart3` "Company News" tab; rename "Market News" → "Headlines".
- Collapse the two state pairs (`marketArticles`/`stockArticles`, `marketLoading`/`stockLoading`, `marketError`/`stockError`, `marketSearch`/`tickerSearch`) into a single `headlinesArticles`, `headlinesLoading`, `headlinesError`, `query` set.
- Add a `mode` state: `"general" | "category" | "ticker" | "portfolio"` plus a derived label string.
- New `fetchHeadlines(query, usePortfolio?)` function:
  - If `usePortfolio` → call `fmp-stock-news` with `tickers: portfolioTickers.join(",")`, then for multi-ticker, loop or call once per ticker (Finnhub company-news takes one symbol at a time — same approach already in `fmp-stock-news/index.ts`), merge + dedupe by URL, sort by `publishedDate` desc.
  - Else if query matches `/^[A-Z]{1,5}$/i` → call `fmp-stock-news` with `tickers`.
  - Else if query is non-empty → call `stock-news` with `category`.
  - Else → call `stock-news` with default category `general`.
- Keep `diversifyBySource` post-processing.
- Keep pin/unpin logic untouched (works on the unified `headlinesArticles`).
- Update the `<TabsList>` to `grid-cols-2` and adjust the icon (use `Newspaper` for Headlines, keep `Sparkles` for AI Insights).
- Add chip row beneath the search input for quick filters (`All`, `My Portfolio`, `Crypto`, `Forex`, `Mergers`).

**Optional small follow-up (not required for this task):** if portfolio multi-ticker fetches feel slow, add a `tickers` array fan-out inside `fmp-stock-news/index.ts` server-side. Skipping for now — client-side fan-out keeps the change purely frontend.

### Out of scope
- AI Insights tab stays exactly as-is.
- PortfolioManager and PinnedArticles cards stay where they are.
- No DB migrations, no edge function redeploys.

