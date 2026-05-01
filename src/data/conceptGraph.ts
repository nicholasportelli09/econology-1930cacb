/**
 * Concept Graph — the curriculum map.
 *
 * Every node is one teachable idea. Nodes have a dimension (which placement
 * score they belong to), prerequisites (other concepts that must be mastered
 * first), an optional `deep_dive_slug` pointing to TIP_ARTICLES for "go
 * deeper" reading, a short summary used as the lesson body, and a 3-question
 * quiz used to confirm mastery.
 *
 * The placement diagnostic in src/data/placementQuestions.ts maps each
 * question to one of these concepts so we can mark it mastered/weak/unknown
 * without making the user take a separate full quiz.
 */

export type Dimension =
  | "budgeting"
  | "credit"
  | "investing"
  | "macro"
  | "risk";

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number; // index into options
  explain: string;
}

export interface ConceptNode {
  id: string;
  title: string;
  dimension: Dimension;
  prerequisites: string[];
  deepDiveSlug?: string; // key in TIP_ARTICLES
  /** 150–250 words, used as the lesson body. Plain prose, no markdown. */
  summary: string;
  quiz: [QuizQuestion, QuizQuestion, QuizQuestion];
}

/** Helper for compact quiz authoring. */
const Q = (
  q: string,
  options: string[],
  correct: number,
  explain: string,
): QuizQuestion => ({ q, options, correct, explain });

export const CONCEPTS: ConceptNode[] = [
  // ─── BUDGETING & SAVING ─────────────────────────────────────
  {
    id: "budget-basics",
    title: "What a Budget Actually Is",
    dimension: "budgeting",
    prerequisites: [],
    deepDiveSlug: "budget",
    summary:
      "A budget is just a plan for what your money will do before it arrives. The point isn't to restrict you — it's to make every dollar intentional. Without a budget, money leaks in small amounts you don't notice until the month is over and you're wondering where it went. With one, you know in advance how much can go to rent, food, fun, and savings, and you stop making decisions in panic mode. The simplest budget answers three questions: how much comes in, how much must go out, and what's left over for goals. You don't need an app or a spreadsheet — a single piece of paper with three columns works. The first month you try it, you'll be off. That's normal. The point of month one is to learn what you actually spend, not to hit a target. Adjust in month two.",
    quiz: [
      Q("What is the main purpose of a budget?", ["Restrict spending", "Plan what your money does in advance", "Track receipts", "Prove you're responsible"], 1, "A budget is forward-looking — it directs money before you spend it."),
      Q("Why is your first month of budgeting usually 'wrong'?", ["You're bad at math", "You're learning what you actually spend", "Apps are inaccurate", "Prices change daily"], 1, "Month one is for discovery. Month two is for adjustment."),
      Q("Which of these is NOT a question a basic budget answers?", ["How much comes in", "How much must go out", "What's left for goals", "What stocks to buy"], 3, "Investing decisions come after the budget tells you what's available."),
    ],
  },
  {
    id: "needs-vs-wants",
    title: "Needs vs. Wants",
    dimension: "budgeting",
    prerequisites: ["budget-basics"],
    deepDiveSlug: "budget",
    summary:
      "Needs are expenses you cannot skip without serious consequences: rent, basic groceries, transportation to work, insurance, minimum debt payments, utilities. Wants are everything else — restaurants, streaming, the nicer apartment, the upgrade phone. The line is blurrier than it sounds. A car is a need if you can't get to work without one; a $700/month car payment is mostly a want. The 50/30/20 rule says target 50% of take-home pay for needs, 30% for wants, 20% for savings and extra debt payoff. If your needs are eating 70% of your income, the fix is rarely cutting wants — it's lowering a need (cheaper rent, refinance, switch insurance). Wants are easier to cut, but the math of needs has more leverage. Always audit needs first.",
    quiz: [
      Q("Which is a 'need' under standard budgeting?", ["Streaming subscriptions", "Rent", "Concert tickets", "New phone upgrade"], 1, "Rent is non-negotiable; the others can be skipped without serious consequences."),
      Q("Under the 50/30/20 rule, what percentage goes to wants?", ["20%", "30%", "50%", "10%"], 1, "30% to wants, 50% to needs, 20% to savings."),
      Q("If needs are eating 70% of income, the highest-leverage fix is usually:", ["Cancel Netflix", "Lower a big need like rent or insurance", "Stop buying coffee", "Earn tips"], 1, "Big needs have far more leverage than small wants."),
    ],
  },
  {
    id: "emergency-fund",
    title: "The Emergency Fund",
    dimension: "budgeting",
    prerequisites: ["budget-basics"],
    deepDiveSlug: "emergency",
    summary:
      "An emergency fund is cash set aside for unexpected, urgent expenses — a car repair, a medical bill, a job loss. The standard target is 3–6 months of essential expenses, but that's the destination, not the starting line. Aim for $500 first, then one full month of expenses, then build to three. Keep it in a high-yield savings account (currently 4–5% APY), separate from your checking so you don't spend it accidentally. Don't invest your emergency fund in stocks — when you need it, the market may be down, and you'd be selling at the worst time. The job of this money isn't to grow; it's to be there. Without one, every surprise becomes credit card debt at 22% interest, which compounds the problem. With one, surprises become inconveniences instead of crises.",
    quiz: [
      Q("How much should a starter emergency fund be?", ["6 months of expenses immediately", "$500 first, then build", "One year of salary", "Whatever feels right"], 1, "Start with $500, then scale to one month, then to 3-6 months."),
      Q("Where should an emergency fund live?", ["In stocks", "In a high-yield savings account", "In your checking account", "In crypto"], 1, "Liquid, stable, separate from checking."),
      Q("Why NOT invest your emergency fund in stocks?", ["Stocks are illegal for emergencies", "Markets may be down when you need it", "Brokers charge fees", "Stocks earn too little"], 1, "Selling during a downturn locks in losses at the worst moment."),
    ],
  },
  {
    id: "high-yield-savings",
    title: "High-Yield Savings vs. Regular Savings",
    dimension: "budgeting",
    prerequisites: ["emergency-fund"],
    deepDiveSlug: "highyield",
    summary:
      "A traditional savings account at a big bank typically pays 0.01% to 0.5% APY. A high-yield savings account (HYSA) at an online bank pays 4–5% APY for the same FDIC insurance and the same access to your money. On $5,000, that's the difference between $0.50 and $250 a year. The reason is simple: online banks have no branches, so they pass the savings to depositors. HYSAs are not investments — they are savings accounts. Your money is not at risk, transfers take 1–2 business days, and you keep all the protections of a normal bank. The catch is small: most HYSAs limit you to six withdrawals per month and don't come with an in-person teller. For an emergency fund or short-term savings goal, that's a trivial trade-off for 10x to 100x more interest.",
    quiz: [
      Q("Roughly what APY does a typical big-bank savings account pay?", ["4-5%", "10%", "0.01%-0.5%", "0%"], 2, "Big banks pay almost nothing because depositors don't shop around."),
      Q("How is an HYSA different from an investment?", ["It's not — same risk", "It's FDIC-insured and your principal is safe", "HYSAs lose money in recessions", "HYSAs require minimum $10k"], 1, "HYSAs are savings, not investments."),
      Q("What's the typical trade-off of an HYSA?", ["No FDIC insurance", "1-2 day transfer time and online-only", "Can't withdraw for a year", "High fees"], 1, "Slight friction in exchange for much higher interest."),
    ],
  },
  {
    id: "automation",
    title: "Automating Your Money",
    dimension: "budgeting",
    prerequisites: ["budget-basics"],
    deepDiveSlug: "automate",
    summary:
      "Willpower is a finite resource and a bad financial strategy. Automation removes the decision. Set up an automatic transfer from checking to savings on the day after payday, and savings happens before you can spend it. Set up autopay for every bill, and you never miss a payment (which is the single biggest factor in your credit score). Set up automatic investing in your brokerage, and you're dollar-cost averaging without thinking about it. The goal is to make the right choice the default and the wrong choice require effort. People who automate save more and have higher credit scores than people who 'plan to save' at the end of the month — not because they're more disciplined, but because they've designed discipline out of the equation.",
    quiz: [
      Q("Why does automation beat willpower?", ["Willpower is unreliable; defaults aren't", "Banks reward automation with bonuses", "It's required by law", "Apps say so"], 0, "Defaults compound over years; willpower runs out by Tuesday."),
      Q("When should you automate a transfer to savings?", ["End of the month, with what's left", "Day after payday, before you spend", "Only when you remember", "When the market is up"], 1, "Save first; spend what's left."),
      Q("Why does autopay help your credit score?", ["It pays bills on time, the #1 factor", "Banks like it", "It triggers a bonus", "Lenders see it"], 0, "Payment history is ~35% of a FICO score."),
    ],
  },

  // ─── CREDIT & DEBT ──────────────────────────────────────────
  {
    id: "credit-score-basics",
    title: "What a Credit Score Actually Measures",
    dimension: "credit",
    prerequisites: [],
    deepDiveSlug: "credit",
    summary:
      "A credit score is a 300–850 number that estimates how likely you are to repay borrowed money. It's not a measure of wealth or income — high earners can have terrible scores, and modest earners can have excellent ones. The FICO formula weighs five factors: payment history (35%), how much of your available credit you're using (30%), how long you've had credit (15%), the mix of credit types (10%), and recent applications for new credit (10%). The two factors that move your score the most are paying every bill on time and using a small fraction of your available credit. Everything else is secondary. A score of 740+ unlocks the best mortgage and auto loan rates. A score under 620 makes borrowing expensive or impossible. The score also affects apartment applications, insurance rates, and some employers' background checks.",
    quiz: [
      Q("Which factor weighs most heavily in a FICO score?", ["Income", "Payment history", "Credit mix", "Age"], 1, "Payment history is ~35% of the score."),
      Q("What credit score generally unlocks the best loan rates?", ["620", "680", "740+", "850 only"], 2, "740+ gets you to the top tier; 800+ is marginal improvement."),
      Q("Does income affect your credit score?", ["Yes, directly", "No — it's about repayment behavior, not earnings", "Only above $100k", "Only below $30k"], 1, "FICO doesn't see income — it sees repayment patterns."),
    ],
  },
  {
    id: "credit-utilization",
    title: "Credit Utilization",
    dimension: "credit",
    prerequisites: ["credit-score-basics"],
    deepDiveSlug: "creditcard",
    summary:
      "Credit utilization is the percentage of your available credit you're currently using. If you have a $5,000 limit and a $1,500 balance, your utilization is 30%. It's the second-biggest factor in your credit score (about 30% of the calculation). Keep it under 30% to avoid score damage, and under 10% for the best scores. Critically, the score is calculated from your statement balance, not your end-of-month balance — so if you charge $4,000 on a $5,000 card and pay it off after the statement closes, your reported utilization is still 80%. The fix: pay your card down before the statement date, not just before the due date. Another easy boost: ask for a credit limit increase every 6–12 months. A higher limit lowers utilization without you spending differently.",
    quiz: [
      Q("If you have a $5,000 limit and a $1,500 balance, your utilization is:", ["15%", "30%", "50%", "75%"], 1, "$1,500 / $5,000 = 30%."),
      Q("Why pay your card BEFORE the statement closes?", ["Avoids late fees", "Lowers reported utilization", "Earns more rewards", "Required by law"], 1, "Statement balance is what gets reported to credit bureaus."),
      Q("Asking for a credit limit increase generally:", ["Hurts your score permanently", "Lowers utilization with no spending change", "Triggers IRS audit", "Requires new income proof always"], 1, "More limit, same balance = lower utilization."),
    ],
  },
  {
    id: "good-debt-bad-debt",
    title: "Good Debt vs. Bad Debt",
    dimension: "credit",
    prerequisites: ["credit-score-basics"],
    summary:
      "Not all debt is equal. 'Good debt' typically funds something that grows in value or earning power: a mortgage on a reasonably priced home, federal student loans for a degree with clear earnings upside, or a low-interest business loan. 'Bad debt' funds depreciating assets or current consumption at high interest: credit card balances at 22% APR, payday loans at 300%+, big auto loans on cars that lose 20% of their value the day you drive off. The clearest test: would the asset still be worth something if you had to sell it? A house, usually yes. A vacation on a credit card, no. The other test is the interest rate. Anything above ~8% is hard to justify because most investments don't reliably beat that rate. Pay high-interest debt aggressively; carry low-interest debt comfortably.",
    quiz: [
      Q("Which is most clearly 'bad debt'?", ["A 4% mortgage on a primary home", "A federal student loan at 5%", "Credit card debt at 22%", "A 0% interest car loan"], 2, "22% APR with no asset behind it is the textbook bad-debt case."),
      Q("A reasonable interest-rate threshold for paying off debt aggressively is roughly:", ["1%", "8%+", "20%+", "Any debt at all"], 1, "Above ~8% is hard to beat with reliable investing returns."),
      Q("The 'asset test' for good debt asks:", ["Did a bank approve it?", "Is your credit score high?", "Would the thing still be worth money if you sold it?", "Is the interest tax-deductible?"], 2, "Asset value is the simplest signal that debt is productive."),
    ],
  },
  {
    id: "debt-payoff-strategies",
    title: "Avalanche vs. Snowball",
    dimension: "credit",
    prerequisites: ["good-debt-bad-debt"],
    deepDiveSlug: "debtavalanche",
    summary:
      "When you have multiple debts, two strategies compete. The avalanche method pays minimums on everything and throws extra cash at the debt with the highest interest rate. Mathematically it's optimal — you pay the least total interest. The snowball method pays minimums on everything and throws extra cash at the smallest balance, regardless of rate. You pay slightly more total interest but get a quick win when the first debt vanishes, which keeps people motivated. Research shows snowball-followers actually finish their debt payoff more often than avalanche-followers, even though avalanche is mathematically better. The right answer depends on you. If you're motivated by spreadsheets, avalanche. If you need momentum to stick with it, snowball. Both beat the worst strategy, which is paying equal amounts everywhere and never finishing anything.",
    quiz: [
      Q("The avalanche method targets:", ["Smallest balance first", "Highest interest rate first", "Oldest debt first", "Newest debt first"], 1, "Avalanche = highest rate; snowball = smallest balance."),
      Q("Why does snowball sometimes beat avalanche in real life?", ["Lower interest math", "Quick wins keep people motivated to finish", "Banks prefer it", "It's required by law"], 1, "Behavior beats math when you actually stick with the plan."),
      Q("The worst common strategy is:", ["Avalanche", "Snowball", "Equal payments everywhere with no focus", "Consolidation"], 2, "Spreading focus thin means nothing ever gets paid off."),
    ],
  },

  // ─── INVESTING BASICS ───────────────────────────────────────
  {
    id: "compound-interest",
    title: "Compound Interest",
    dimension: "investing",
    prerequisites: [],
    deepDiveSlug: "compound",
    summary:
      "Compound interest is interest earning interest. If you invest $1,000 at 7%, after one year you have $1,070. The next year you earn 7% on $1,070, not $1,000 — so you get $74.90, not $70. After 10 years you have $1,967. After 30 years, $7,612. After 40, $14,974. The growth curve is hockey-stick shaped: most of the gain happens late, because each year compounds on a bigger base. This is why starting early matters more than the amount you start with. A 22-year-old investing $200/month until 65 ends up with more than a 32-year-old investing $400/month for the same period, despite contributing less in total. Time is the variable that does the heavy lifting. The flip side: high-interest debt compounds against you the same way. A $5,000 credit card balance at 22% becomes $30,000+ in ten years if you only pay minimums.",
    quiz: [
      Q("Compound interest means:", ["Interest paid in cash", "Interest earning interest", "A type of bond", "Interest that compounds quarterly only"], 1, "Each period's interest is added to the base for the next period."),
      Q("Why does starting early matter more than starting big?", ["Banks reward youth", "Time gives compounding more periods to work", "Stocks are cheaper for the young", "Tax laws favor youth"], 1, "More compounding periods = exponentially more growth."),
      Q("Compound interest works against you when you:", ["Save in a HYSA", "Carry a high-interest credit card balance", "Buy index funds", "Pay off debt fast"], 1, "High-rate debt compounds in the lender's favor, not yours."),
    ],
  },
  {
    id: "stocks-vs-bonds",
    title: "Stocks vs. Bonds",
    dimension: "investing",
    prerequisites: ["compound-interest"],
    deepDiveSlug: "bonds",
    summary:
      "A stock makes you a part-owner of a company. If the company grows, your share is worth more, and you might get a piece of the profits as a dividend. Stocks are volatile — they can drop 30%+ in a bad year — but they've historically returned about 10% per year over long periods. A bond is a loan you make to a company or government. They pay you a fixed interest rate and return your principal at the end. Bonds are calmer than stocks but earn less, historically 4–5% per year. The classic portfolio rule of thumb is to subtract your age from 110 and put that percentage in stocks; the rest in bonds. A 25-year-old has a 50-year horizon, can ride out crashes, and should be mostly in stocks. A 70-year-old needs stable income and protection from sequence-of-returns risk, and should hold significant bonds.",
    quiz: [
      Q("Owning a stock means you:", ["Lend money to the company", "Own a piece of the company", "Get a fixed interest rate", "Have a guaranteed return"], 1, "Stocks = ownership; bonds = lending."),
      Q("Which is calmer historically — stocks or bonds?", ["Stocks", "Bonds", "Same volatility", "Depends on the bank"], 1, "Bonds have lower volatility and lower long-run returns."),
      Q("A 25-year-old's portfolio should typically lean toward:", ["Mostly bonds for safety", "Mostly stocks for long-run growth", "All cash", "All crypto"], 1, "Long horizons can ride out volatility for higher returns."),
    ],
  },
  {
    id: "index-funds",
    title: "Index Funds and ETFs",
    dimension: "investing",
    prerequisites: ["stocks-vs-bonds"],
    deepDiveSlug: "index",
    summary:
      "An index fund is a single investment that holds hundreds or thousands of stocks at once, designed to mirror the performance of a market index — like the S&P 500 or the total US stock market. When you buy one share of VOO, you own a slice of all 500 largest US companies. This is instant diversification at almost zero effort. ETFs (exchange-traded funds) are index funds that trade like stocks during the day; mutual funds settle at end-of-day prices. Functionally, for most people, they're equivalent. The huge advantage of index funds is cost: they charge 0.03% per year, versus 1%+ for actively managed funds. Over 30 years, that fee difference compounds into hundreds of thousands of dollars. Studies consistently show that 80–90% of active fund managers fail to beat the index over long periods. For most people, the right move is to pick two or three broad index funds (US total market, international, bonds) and ignore everything else.",
    quiz: [
      Q("An S&P 500 index fund holds:", ["One company", "The 500 largest US companies", "Only tech stocks", "Bonds only"], 1, "Broad ownership across the largest US companies."),
      Q("Roughly what percentage of active fund managers BEAT the index over 15+ years?", ["80%", "50%", "10-20%", "100%"], 2, "The vast majority underperform, mostly due to fees."),
      Q("What's the biggest cost advantage of index funds?", ["No taxes", "Fees of ~0.03% vs ~1% for active funds", "No risk", "Guaranteed returns"], 1, "Tiny fees compound into massive savings over decades."),
    ],
  },
  {
    id: "diversification",
    title: "Diversification",
    dimension: "investing",
    prerequisites: ["index-funds"],
    deepDiveSlug: "diversify",
    summary:
      "Diversification means owning many different investments so that no single failure can wipe you out. If you put your entire $50,000 portfolio into one company's stock and that company goes bankrupt, you lose everything. If you spread it across 500 companies, the worst single bankruptcy costs you 0.2%. The same logic applies across asset classes (stocks, bonds, real estate), geographies (US, international, emerging markets), and sectors (tech, healthcare, energy). A diversified portfolio doesn't maximize returns in any single year — there's always something doing better than your mix — but it dramatically reduces the chance of catastrophic loss. The simplest fully-diversified portfolio is three funds: a US total-market index, an international index, and a bond fund. That's it. You don't need 47 funds to be diversified; in fact, owning too many funds usually means you own the same companies twice.",
    quiz: [
      Q("The main benefit of diversification is:", ["Higher returns every year", "Reducing the chance of catastrophic loss", "Tax savings", "Lower fees"], 1, "Diversification trades peak upside for protection."),
      Q("How many funds do you need to be well-diversified?", ["At least 20", "3 broad index funds is enough for most people", "Exactly 10", "100+"], 1, "Three broad funds cover most of the global market."),
      Q("If your whole portfolio is one stock and it goes bankrupt:", ["You're fine — diversification protects you", "You lose everything", "Insurance covers it", "You owe more"], 1, "Concentration is the opposite of diversification."),
    ],
  },
  {
    id: "dollar-cost-averaging",
    title: "Dollar-Cost Averaging",
    dimension: "investing",
    prerequisites: ["index-funds"],
    deepDiveSlug: "dca",
    summary:
      "Dollar-cost averaging (DCA) means investing the same amount on a regular schedule — say $300 every two weeks — regardless of what the market is doing. When prices are high, your $300 buys fewer shares. When prices are low, the same $300 buys more shares. Over time, you end up with a lower average cost per share than if you tried to time the market. The bigger benefit is psychological: DCA removes the temptation to time the market, which is the single biggest mistake retail investors make. People sell in panic when stocks drop and buy enthusiastically when stocks are expensive — the exact opposite of what works. With DCA on autopilot, you keep buying through crashes, which is when the best long-term returns are made. Almost every long-term investor benefits more from automating consistent contributions than from being clever about entry points.",
    quiz: [
      Q("Dollar-cost averaging means:", ["Investing only when stocks are cheap", "Investing the same amount on a regular schedule", "Selling at the top", "Doubling down on losers"], 1, "Same amount, regular schedule, regardless of price."),
      Q("The biggest benefit of DCA is:", ["Guaranteed profits", "Removing the temptation to time the market", "Tax-free growth", "Higher returns than lump sum, always"], 1, "Behavioral discipline beats market timing for almost everyone."),
      Q("During a market crash, a DCA investor:", ["Sells everything", "Stops buying", "Keeps buying — and buys more shares per dollar", "Switches to bonds"], 2, "Crashes are when DCA quietly does its best work."),
    ],
  },
  {
    id: "retirement-accounts",
    title: "401(k), Roth IRA, and Tax-Advantaged Accounts",
    dimension: "investing",
    prerequisites: ["index-funds"],
    deepDiveSlug: "roth",
    summary:
      "A 401(k) is an employer-sponsored retirement account where you contribute pre-tax money, lowering your current taxes. Many employers match a percentage of your contribution — that's free money, and you should always contribute at least enough to capture the full match. A Roth IRA is funded with after-tax money, but all growth and withdrawals in retirement are completely tax-free. For young earners in low tax brackets, the Roth is usually better because tax rates are likely higher later. The 2025 contribution limits are $23,500 for a 401(k) and $7,000 for a Roth IRA. The standard playbook: contribute to the 401(k) up to the employer match (free money), then max your Roth IRA, then go back and contribute more to the 401(k) up to the limit. Both accounts can hold the same index funds — the difference is the tax wrapper around them.",
    quiz: [
      Q("If your employer matches 401(k) contributions, you should:", ["Skip the 401(k)", "Always contribute at least enough to get the full match", "Only use a Roth", "Wait until you earn more"], 1, "The match is a 100% return on your contribution — free money."),
      Q("In a Roth IRA, withdrawals in retirement are:", ["Taxed as income", "Completely tax-free", "Taxed at 15%", "Taxed only above $50k"], 1, "Pay tax now; nothing later."),
      Q("The standard contribution priority is:", ["Roth first, then 401k", "401k up to match, then max Roth, then more 401k", "Max 401k first", "Cash savings only"], 1, "Capture free money first, then the best tax wrapper, then more pre-tax space."),
    ],
  },

  // ─── MACRO & NEWS LITERACY ──────────────────────────────────
  {
    id: "inflation",
    title: "Inflation",
    dimension: "macro",
    prerequisites: [],
    deepDiveSlug: "inflation",
    summary:
      "Inflation is the rate at which prices rise over time. If inflation is 3% per year, something that costs $100 today costs $103 next year — and your dollar is worth proportionally less. Inflation comes from two main forces: too much money chasing too few goods (demand-pull), and rising input costs like wages or oil (cost-push). The US Federal Reserve targets 2% annual inflation as a healthy level — enough to encourage spending and investing, not so much that it erodes savings dangerously. When inflation runs hot (above 4–5%), the Fed typically raises interest rates to slow the economy and cool prices. Inflation is why holding all your money in cash is a slow loss. Even a 'safe' savings account paying 0.5% loses purchasing power against 3% inflation. Investing in stocks, real estate, or other productive assets is how you outpace inflation over decades.",
    quiz: [
      Q("If inflation is 3%, $100 today will buy what next year?", ["More than $100 of goods", "About $97 of today's goods", "Exactly $100 of goods", "$110 of goods"], 1, "Your dollar's purchasing power shrinks by roughly the inflation rate."),
      Q("What inflation rate does the US Federal Reserve target?", ["0%", "2%", "5%", "10%"], 1, "2% is considered the healthy 'sweet spot.'"),
      Q("How does the Fed typically respond to high inflation?", ["Cuts interest rates", "Prints more money", "Raises interest rates", "Lowers taxes"], 2, "Higher rates slow borrowing and cool the economy."),
    ],
  },
  {
    id: "interest-rates",
    title: "Interest Rates and the Fed",
    dimension: "macro",
    prerequisites: ["inflation"],
    summary:
      "The Federal Reserve sets the federal funds rate — the short-term interest rate banks charge each other. This single number ripples through everything: mortgage rates, credit card APRs, savings account yields, and stock valuations. When the Fed raises rates, borrowing gets more expensive, which slows spending and investment. Stocks usually struggle (especially growth and tech), bonds initially fall in price but offer higher yields, and savings accounts pay more. When the Fed cuts rates, borrowing gets cheaper, the economy speeds up, and stocks usually rally. The Fed has a dual mandate: maximum employment and stable prices (around 2% inflation). When unemployment rises, they tend to cut. When inflation runs hot, they tend to hike. Watching what the Fed says is often more important than watching what it does — markets price in expected moves months ahead of the actual change.",
    quiz: [
      Q("When the Fed raises interest rates, what usually happens to borrowing?", ["Becomes cheaper", "Becomes more expensive", "No effect", "Becomes free"], 1, "Higher rates = more expensive loans = less borrowing."),
      Q("The Fed's 'dual mandate' is:", ["Profits and growth", "Maximum employment and stable prices", "Stocks and bonds", "Banks and consumers"], 1, "Two goals: jobs and ~2% inflation."),
      Q("When the Fed cuts rates, stocks usually:", ["Crash", "Rally — cheaper money flows in", "Stay flat", "Become illegal"], 1, "Lower rates support stock prices through cheaper borrowing and discount-rate math."),
    ],
  },
  {
    id: "recession",
    title: "What a Recession Actually Is",
    dimension: "macro",
    prerequisites: ["interest-rates"],
    deepDiveSlug: "recession",
    summary:
      "A recession is officially declared by the National Bureau of Economic Research after a 'significant decline in economic activity spread across the economy, lasting more than a few months.' The popular shortcut — two consecutive quarters of negative GDP growth — is a rough guide, not the official definition. Recessions usually bring rising unemployment, falling corporate profits, declining consumer spending, and lower stock prices. They typically last 6–18 months. The hard truth: recessions are normal. The US has had about one every 6–7 years since World War II. They feel scary but they end, and markets historically recover and reach new highs within 2–4 years. The worst thing a long-term investor can do during a recession is sell at the bottom out of fear. The best thing they can do is keep buying — recession lows are when future returns are highest. Job security matters more than market timing during downturns, so an emergency fund is your most important defense.",
    quiz: [
      Q("A recession is officially declared by:", ["The President", "Congress", "The National Bureau of Economic Research", "Wall Street"], 2, "NBER calls recessions, looking at multiple economic signals."),
      Q("How often has the US averaged recessions since WWII?", ["Once per century", "Every 6-7 years on average", "Every 25 years", "Never"], 1, "They're recurring features of the business cycle."),
      Q("The single best defense for a long-term investor during a recession is:", ["Sell everything", "Have an emergency fund and keep buying", "Move to crypto", "Switch to bonds at the bottom"], 1, "Cash buffer + behavioral discipline beats panic selling."),
    ],
  },
  {
    id: "yield-curve",
    title: "The Yield Curve",
    dimension: "macro",
    prerequisites: ["interest-rates"],
    summary:
      "The yield curve is a chart of US Treasury bond yields at different maturities — 3 months, 2 years, 10 years, 30 years. Normally it slopes upward: long bonds pay more than short ones, because lenders demand more for tying their money up longer. When the curve 'inverts' — short-term yields rise above long-term yields — it signals that investors expect the Fed to cut rates in the future, which usually happens in response to a slowing economy. An inverted yield curve has preceded every US recession in the last 50+ years, usually by 6–18 months. It's not a perfect predictor, but it's the single most reliable recession signal economists watch. Headlines talking about 'the 2-10 spread' or 'the 3-month/10-year inversion' are referring to this. As of any given moment, you can check it on FRED (Federal Reserve Economic Data) for free.",
    quiz: [
      Q("Normally, the yield curve slopes:", ["Downward — short bonds pay more", "Upward — long bonds pay more", "Flat", "Vertical"], 1, "Lenders demand more compensation for longer time-locks."),
      Q("An inverted yield curve has historically:", ["Predicted nothing", "Preceded most US recessions in the past 50+ years", "Caused recessions directly", "Only happened twice"], 1, "It's an imperfect but reliable leading indicator."),
      Q("Inversion means:", ["The Fed declared a recession", "Short-term yields rose above long-term yields", "All bonds yield zero", "Treasuries defaulted"], 1, "Short > long is the inverted signal."),
    ],
  },

  // ─── RISK TOLERANCE ─────────────────────────────────────────
  {
    id: "risk-vs-reward",
    title: "Risk and Reward",
    dimension: "risk",
    prerequisites: [],
    summary:
      "Higher potential returns always come with higher risk of loss. A US Treasury bond pays 4–5% with effectively zero risk of default. The S&P 500 has averaged about 10% per year, but with regular drops of 20%+ and occasional 50% crashes. Individual stocks can return 1000% or go to zero. Crypto can do both in a month. Risk isn't bad — it's the price you pay for higher returns. The key is matching the risk to your time horizon. Money you need in 6 months has no business being in stocks. Money you won't touch for 30 years has no business sitting in cash, where inflation will quietly destroy it. The trap most people fall into is taking on risk they can't emotionally tolerate, then panic-selling at the worst time. The 'right' level of risk is the most you can take and still sleep at night and stay invested when things get ugly.",
    quiz: [
      Q("Higher potential returns generally come with:", ["Lower risk", "Higher risk", "No risk", "Government guarantees"], 1, "Risk and return are linked — there's no free lunch."),
      Q("Money you need in 6 months should be:", ["In aggressive stocks", "In a savings account or money market", "In crypto", "In a 30-year bond"], 1, "Short horizons need stable, liquid assets."),
      Q("The 'right' level of risk for you is:", ["The maximum possible", "The minimum possible", "What you can take and still stay invested through downturns", "Whatever your friends do"], 2, "If risk makes you sell at lows, you've taken too much."),
    ],
  },
  {
    id: "volatility",
    title: "Volatility",
    dimension: "risk",
    prerequisites: ["risk-vs-reward"],
    summary:
      "Volatility is how much an investment's price swings, up and down, over time. The S&P 500's daily moves average about 1%, but in a wild week it can swing 5%+ daily. Bitcoin can move 10–15% in a single day. Volatility is not the same as risk of permanent loss. A diversified index fund is volatile — it goes up and down constantly — but the chance of permanent loss over 20+ years is very small. A single penny stock has lower daily volatility but a high chance of going to zero permanently. The investor's job is to ignore short-term volatility and pay attention to long-term trajectory. The market's 'noise' on any given week is mostly random; the signal is in years and decades. People who check their portfolio daily underperform people who check it quarterly, because daily checks tempt action and most action is harmful. The best returns go to investors who can tolerate volatility and stay put.",
    quiz: [
      Q("Volatility measures:", ["Risk of bankruptcy", "How much price swings up and down over time", "Total returns", "Tax efficiency"], 1, "Volatility = price movement, not necessarily permanent loss."),
      Q("Which is more volatile day-to-day?", ["A diversified index fund", "Bitcoin", "A money market account", "A US Treasury"], 1, "Crypto's daily swings are much larger than broad stock indexes."),
      Q("People who check their portfolio daily tend to:", ["Outperform", "Underperform — checks tempt harmful actions", "Earn the same", "Avoid taxes"], 1, "Inaction beats action for most long-term investors."),
    ],
  },
  {
    id: "asset-allocation",
    title: "Asset Allocation",
    dimension: "risk",
    prerequisites: ["risk-vs-reward", "stocks-vs-bonds"],
    summary:
      "Asset allocation is how you split your portfolio among broad asset classes — stocks, bonds, cash, sometimes real estate or commodities. It's the single biggest determinant of your long-term risk and return, more important than which specific funds you pick. A 100% stock portfolio is high-growth but can lose 50% in a crash. A 100% bond portfolio is stable but barely beats inflation. The classic rule of thumb: subtract your age from 110 and put that percentage in stocks. A 25-year-old: 85% stocks, 15% bonds. A 60-year-old: 50/50. As you approach goals where you'll need the money (retirement, a house down payment), you shift toward more bonds and cash to reduce the chance that a crash hits at the worst time. This 'glide path' is what target-date retirement funds do automatically — pick the year you'll retire, and the fund gradually de-risks for you.",
    quiz: [
      Q("Asset allocation is:", ["Picking individual stocks", "How you split among stocks, bonds, cash, etc.", "Tax planning", "Choosing a broker"], 1, "It's the high-level mix, not the specific picks."),
      Q("Using the '110 minus age' rule, a 30-year-old should hold roughly:", ["30% stocks", "50% stocks", "80% stocks", "100% bonds"], 2, "110 - 30 = 80% stocks."),
      Q("As you approach a major financial goal, you generally shift toward:", ["More stocks", "More bonds and cash", "More crypto", "All real estate"], 1, "De-risking protects against crashes near the finish line."),
    ],
  },
];

/** Map for fast id lookup. */
export const CONCEPT_BY_ID: Record<string, ConceptNode> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);

/** Concepts grouped by dimension. */
export const CONCEPTS_BY_DIMENSION: Record<Dimension, ConceptNode[]> = {
  budgeting: CONCEPTS.filter((c) => c.dimension === "budgeting"),
  credit: CONCEPTS.filter((c) => c.dimension === "credit"),
  investing: CONCEPTS.filter((c) => c.dimension === "investing"),
  macro: CONCEPTS.filter((c) => c.dimension === "macro"),
  risk: CONCEPTS.filter((c) => c.dimension === "risk"),
};

/**
 * Labels are kept in lock-step with `CURRICULUM_INTERESTS` in
 * `src/types/profile.ts` so the Learn dimension a user sees here is the
 * same string they pick as a topic of interest in onboarding/settings and
 * the same chip they can filter news by. Update both files together.
 */
export const DIMENSION_LABELS: Record<Dimension, string> = {
  budgeting: "Budgeting & Saving",
  credit: "Credit & Debt",
  investing: "Investing Basics",
  macro: "Macro & News",
  risk: "Risk Management",
};