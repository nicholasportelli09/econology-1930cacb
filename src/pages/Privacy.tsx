import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import logoSrc from "@/assets/econology-logo.png";

const LAST_UPDATED = "16 July 2026";

/**
 * Missing owner-supplied details are rendered as [TO BE PROVIDED BY OPERATOR]
 * so the beta launches without invented legal entities, addresses, jurisdictions,
 * age minimums, or contact emails.
 */
const TBD = (label: string) => (
  <span className="inline-flex items-center rounded-md bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/40 px-2 py-0.5 text-[11px] font-semibold">
    [TO BE PROVIDED — {label}]
  </span>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Privacy — Econology"
        description="How Econology collects, uses, and shares data during our closed student beta."
        path="/privacy"
        type="website"
      />
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSrc} alt="Econology" width={32} height={32} className="object-contain" />
            <span className="font-display font-bold text-foreground">Econology</span>
          </Link>
          <div className="text-xs text-muted-foreground">Last updated: {LAST_UPDATED}</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 prose prose-slate dark:prose-invert">
        <h1>Privacy Notice</h1>

        <p className="lead">
          Econology is an educational product currently in a closed student beta. This notice
          describes what data we collect, why we collect it, and who processes it on our behalf.
          It is written to describe the product honestly rather than to make marketing claims.
        </p>

        <div className="not-prose rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm">
          <p className="m-0 text-yellow-800 dark:text-yellow-300">
            <strong>Draft for beta:</strong> Items marked <em>[TO BE PROVIDED]</em> require the
            operator (legal entity, address, jurisdiction, age minimum, contact email) to be
            filled in before general release.
          </p>
        </div>

        <h2>1. Who we are</h2>
        <p>
          Econology is operated by {TBD("legal entity name")} (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
          Registered address: {TBD("registered address")}. Governing jurisdiction:{" "}
          {TBD("jurisdiction")}. Data protection contact: {TBD("privacy contact email")}.
        </p>

        <h2>2. Who this service is for</h2>
        <p>
          Econology is offered to students during this closed beta. Minimum age to use the
          service: {TBD("minimum age")}. If you are below the applicable minimum age in your
          jurisdiction, please do not create an account.
        </p>

        <h2>3. What we collect</h2>
        <p>We collect only the data needed to run the features you use:</p>
        <ul>
          <li>
            <strong>Authentication information.</strong> Email address, hashed password (for
            email sign-in), and — if you use Google sign-in — the Google account email and
            display name Google returns to us. We do not receive your Google password.
          </li>
          <li>
            <strong>Onboarding and literacy profile.</strong> Answers you give during onboarding
            and the placement quiz (goals, situation, learning preferences, money knowledge
            level, topics of interest).
          </li>
          <li>
            <strong>Lesson progress, streaks, and XP.</strong> Which lessons you complete, dates,
            streak counts, and experience points earned.
          </li>
          <li>
            <strong>Watchlist tickers.</strong> Stock or ETF symbols you add to your watchlist.
          </li>
          <li>
            <strong>Pinned articles.</strong> News articles you pin and the metadata we cache
            (title, source, URL, symbol, image, snippet, published date).
          </li>
          <li>
            <strong>Notification preferences.</strong> Your choices about email and in-app
            notifications, and unsubscribe tokens generated for one-click opt-out.
          </li>
          <li>
            <strong>AI tutor usage.</strong> Messages you send to the Ask Ekon tutor and the
            responses generated for you, plus per-day usage counters that enforce rate limits.
          </li>
          <li>
            <strong>Product analytics.</strong> Once product analytics is implemented, we will
            record aggregated event data such as page views, feature interactions, signup
            funnels, and error events tied to your account id. We will update this notice with
            the analytics provider and retention when it is turned on.
          </li>
          <li>
            <strong>Basic technical data.</strong> IP address at request time, user agent, and
            timestamps needed to operate authentication, rate limiting, and abuse prevention.
          </li>
        </ul>

        <h2>4. How we use it</h2>
        <ul>
          <li>Create and secure your account, and let you sign in.</li>
          <li>Personalize lessons, market ideas, news insights, and tutor answers.</li>
          <li>Track your streaks, XP, and progress so you can see it on your dashboard.</li>
          <li>Send transactional and — if you opt in — periodic learning emails.</li>
          <li>Detect abuse, debug problems, and improve the product.</li>
          <li>Comply with legal obligations.</li>
        </ul>

        <h2>5. Service providers we rely on</h2>
        <p>
          Econology runs on third-party infrastructure. These providers act as processors for
          the personal data we send them. During the beta we use:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — hosted Postgres database, authentication, edge functions,
            and email delivery infrastructure. Stores your account, profile, progress, watchlist,
            pinned articles, notification preferences, and tutor usage.
          </li>
          <li>
            <strong>Vercel</strong> — hosts the web application and serves static assets and
            server-rendered routes. Receives standard request metadata (IP, user agent).
          </li>
          <li>
            <strong>Google (Sign-in with Google)</strong> — used only if you choose Google
            sign-in. Google returns basic account information to us; your Google password is
            never shared with Econology.
          </li>
          <li>
            <strong>Market data providers</strong> — Financial Modeling Prep (FMP) and Finnhub,
            used to fetch quotes and company news for tickers you look up or add to your
            watchlist. Requests contain the ticker symbol; they do not receive your account id.
          </li>
          <li>
            <strong>News providers</strong> — NewsAPI, Marketaux, and FMP, used to fetch macro
            and company news headlines. Requests contain topic keywords or ticker symbols.
          </li>
          <li>
            <strong>YouTube</strong> — used to fetch metadata for a curated set of finance
            education videos through YouTube RSS and YouTube&rsquo;s public interfaces. When you
            play an embedded YouTube video, YouTube (Google) may set its own cookies.
          </li>
          <li>
            <strong>TradingView</strong> — used to embed public charts and tickers. When a
            TradingView widget loads, TradingView may set its own cookies.
          </li>
          <li>
            <strong>AI model providers</strong> — used to power AI summaries, news insights,
            market ideas, and the Ask Ekon tutor. Prompts include the tutor conversation, the
            article being summarized, and relevant fields of your profile (for example your
            learning level and topics of interest). We do not send your email, password, or
            watchlist to these providers unless the feature you are using explicitly requires it.
          </li>
        </ul>

        <h2>6. Sharing</h2>
        <p>
          We do not sell your personal data. We share it with the service providers listed
          above only to the extent needed to operate the features you use, and we may disclose
          data when we are legally required to do so. We are not in a position to guarantee
          absolute security or that data will never be accessed inappropriately — we work to
          reduce that risk with row-level security, encryption in transit, and access controls,
          but no online service can promise perfect security.
        </p>

        <h2>7. Data retention</h2>
        <p>
          We retain account and product data for as long as your account is active. If you
          delete your account (see &ldquo;Your choices&rdquo; below), we delete or anonymize
          associated records within a reasonable period, except where we must keep records for
          legal or fraud-prevention reasons. Specific retention windows will be published when
          the operator details above are finalized.
        </p>

        <h2>8. Your choices</h2>
        <ul>
          <li>You can update your profile and notification preferences in Settings.</li>
          <li>You can unsubscribe from email at any time via the link in every email.</li>
          <li>
            You can request access to, correction of, or deletion of your data by contacting{" "}
            {TBD("privacy contact email")}. Depending on where you live you may also have rights
            under GDPR, UK GDPR, CCPA, or similar laws.
          </li>
        </ul>

        <h2>9. Cookies and local storage</h2>
        <p>
          Econology uses browser storage to keep you signed in, remember your onboarding
          profile, and cache lesson state. Embedded third-party widgets (YouTube, TradingView)
          may set their own cookies when they load. We do not currently use advertising cookies.
        </p>

        <h2>10. International transfers</h2>
        <p>
          Our providers may process data in countries other than yours. Where this involves a
          transfer outside your jurisdiction, we rely on the safeguards each provider offers
          (for example standard contractual clauses).
        </p>

        <h2>11. Educational use only</h2>
        <p>
          Econology is an educational tool. Nothing shown in lessons, market ideas, news
          insights, or the AI tutor is financial, legal, tax, or investment advice. See our{" "}
          <Link to="/terms" className="text-primary hover:underline">Terms of Use</Link> for
          more.
        </p>

        <h2>12. Changes</h2>
        <p>
          We will update this page as the product changes. The &ldquo;Last updated&rdquo; date
          at the top reflects the most recent revision.
        </p>

        <h2>13. Contact</h2>
        <p>
          Questions about this notice or your data: {TBD("privacy contact email")}.
        </p>

        <hr />
        <p className="text-sm">
          <Link to="/terms" className="text-primary hover:underline">Terms of Use</Link> ·{" "}
          <Link to="/" className="text-primary hover:underline">Back to home</Link>
        </p>
      </main>
    </div>
  );
}