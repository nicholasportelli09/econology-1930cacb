export interface TipArticle {
  id: string;
  title: string;
  paragraphs: string[];
  actionSteps: string[];
}

export const TIP_ARTICLES: Record<string, TipArticle> = {
  budget: {
    id: "budget",
    title: "The 50/30/20 Budget Rule",
    paragraphs: [
      "The 50/30/20 rule is one of the simplest budgeting frameworks out there, popularized by Senator Elizabeth Warren. The idea is straightforward: divide your after-tax income into three buckets. 50% goes to needs — rent, groceries, utilities, insurance, and minimum debt payments. 30% goes to wants — dining out, entertainment, subscriptions, and shopping. The remaining 20% goes straight to savings and extra debt repayment.",
      "For example, if you bring home $2,000 per month, that means $1,000 for needs, $600 for wants, and $400 for savings. The beauty of this rule is its flexibility — you don't need to track every single purchase. Just make sure each category stays within its percentage. Many budgeting apps can categorize your spending automatically.",
      "Here's the key insight: these percentages aren't set in stone. If you're a college student living with your parents, your needs might only be 30%, so you can save more aggressively. If you live in an expensive city, needs might take 60%, and you'd adjust wants down to 20%. The framework is a starting point — adapt it to your reality.",
    ],
    actionSteps: [
      "Calculate your monthly after-tax income and split it into 50/30/20",
      "Track your spending for one month to see where you actually stand",
      "Set up automatic transfers to a savings account on payday",
      "Review and adjust percentages quarterly based on your situation",
    ],
  },
  inflation: {
    id: "inflation",
    title: "Beat Inflation: Protect Your Purchasing Power",
    paragraphs: [
      "Inflation is the gradual increase in prices over time. When inflation runs at 3% per year, something that costs $100 today will cost $103 next year. That might not sound like much, but over a decade, your money loses roughly 26% of its purchasing power. A dollar in your savings account today won't buy a dollar's worth of goods in ten years.",
      "Traditional savings accounts typically offer interest rates between 0.01% and 0.5% — far below the inflation rate. This means your money is actually shrinking in real terms even though the number in your account stays the same. High-yield savings accounts (offering 4-5% currently) can help keep pace with inflation, but they're not a long-term wealth-building strategy.",
      "Investing is how you beat inflation over the long run. The stock market has historically returned about 10% per year on average (7% after inflation). By putting your money into diversified investments like index funds, you're not just preserving your purchasing power — you're growing it. The earlier you start, the more time compound interest has to work in your favor.",
    ],
    actionSteps: [
      "Move emergency savings to a high-yield savings account (4%+ APY)",
      "Open a brokerage account and start investing even $25/month",
      "Learn about index funds as a simple, low-cost way to invest",
      "Check that your savings rate outpaces the current inflation rate",
    ],
  },
  credit: {
    id: "credit",
    title: "Credit Score: Your Financial Reputation",
    paragraphs: [
      "Your credit score is a three-digit number (300-850) that tells lenders how reliable you are with borrowed money. It's calculated from five factors: payment history (35%), credit utilization (30%), length of credit history (15%), credit mix (10%), and new credit inquiries (10%). Payment history is the biggest factor — even one missed payment can drop your score significantly.",
      "Credit utilization is the second most important factor. It measures how much of your available credit you're using. If you have a $1,000 credit limit and carry a $300 balance, your utilization is 30%. Experts recommend keeping this below 30%, and ideally below 10%. A simple strategy: use your credit card for small recurring purchases and pay the full balance every month.",
      "Why does your credit score matter so much? A score of 700+ (considered 'good') versus 620 ('fair') can save you tens of thousands of dollars over your lifetime. On a $250,000 mortgage, the difference could be $50,000+ in total interest. Your score also affects apartment applications, car insurance rates, and even some job applications. Building good credit early is one of the smartest financial moves you can make.",
    ],
    actionSteps: [
      "Check your credit score for free at annualcreditreport.com",
      "Set up autopay for all bills to never miss a payment",
      "Keep credit card utilization below 30% of your limit",
      "Don't close old credit cards — length of history matters",
    ],
  },
  emergency: {
    id: "emergency",
    title: "Emergency Fund: Your Financial Safety Net",
    paragraphs: [
      "An emergency fund is money set aside specifically for unexpected expenses — car repairs, medical bills, job loss, or that surprise $800 laptop replacement. Financial experts recommend saving 3-6 months of living expenses. If your monthly expenses are $1,500, aim for $4,500 to $9,000. This might sound like a lot, but you don't have to get there overnight.",
      "Without an emergency fund, unexpected costs force you into debt — credit cards charging 20%+ interest, personal loans, or borrowing from family. This creates a vicious cycle where you're paying interest on yesterday's emergencies while trying to cover today's bills. An emergency fund breaks this cycle and gives you financial breathing room.",
      "Start small: aim for $500 first, then one month of expenses, then build from there. Keep this money in a high-yield savings account — it earns 4-5% interest while staying accessible within 1-2 business days. Don't invest your emergency fund in stocks; it needs to be stable and liquid. Automate a small weekly transfer ($25-50) and you'll be surprised how fast it grows.",
    ],
    actionSteps: [
      "Calculate your monthly essential expenses (rent, food, transport, bills)",
      "Open a separate high-yield savings account just for emergencies",
      "Set up automatic weekly transfers — even $25/week is $1,300/year",
      "Define what counts as an 'emergency' so you don't dip in for wants",
    ],
  },
  index: {
    id: "index",
    title: "Index Funds: The Simplest Way to Invest",
    paragraphs: [
      "An index fund is a type of investment that tracks a market index — like the S&P 500, which contains the 500 largest U.S. companies. When you buy one share of an S&P 500 index fund, you're essentially buying a tiny piece of Apple, Microsoft, Amazon, Google, and 496 other companies all at once. This instant diversification is the biggest advantage of index funds.",
      "Index funds have two killer features: low fees and consistent performance. Actively managed funds charge 1-2% in annual fees and rarely beat the market. Index funds charge as little as 0.03% — that's $3 per year on a $10,000 investment versus $100-200 for active funds. Over 30 years, that fee difference can cost you hundreds of thousands of dollars. Studies show that over 90% of actively managed funds underperform their benchmark index over 15+ years.",
      "Getting started is easier than you think. Open a brokerage account with Fidelity, Vanguard, or Schwab (all free, no minimums). Look for funds like VTI (total U.S. market), VOO (S&P 500), or VXUS (international). You can start with as little as $1. Set up automatic monthly investments and don't check it obsessively — index investing rewards patience, not activity.",
    ],
    actionSteps: [
      "Open a free brokerage account (Fidelity, Vanguard, or Schwab)",
      "Research broad market index funds like VTI, VOO, or VXUS",
      "Start with an amount you can invest consistently every month",
      "Set up automatic investments and resist checking daily",
    ],
  },
  hustle: {
    id: "hustle",
    title: "Side Hustle: Boost Your Income",
    paragraphs: [
      "A side hustle is any income you earn outside your primary job or studies. The math is compelling: just $200 extra per month adds up to $2,400 per year. Invest that $2,400 annually at a 10% return, and in 10 years you'll have over $38,000. The key is finding something that fits your schedule, skills, and interests so it feels sustainable rather than exhausting.",
      "Popular side hustles for young adults include freelancing (writing, design, tutoring, coding), gig economy work (DoorDash, Instacart), reselling (thrifted items, sneakers), content creation (YouTube, TikTok, blogging), and service-based work (lawn care, pet sitting, photography). The best side hustle builds skills you can use in your career. Freelance writing improves communication; tutoring deepens your subject knowledge; coding side projects build your portfolio.",
      "One important consideration: taxes. Side hustle income is taxable, and if you earn more than $400 in a year from self-employment, you'll owe self-employment tax (about 15.3%) on top of regular income tax. Set aside 25-30% of your side hustle earnings for taxes. Consider opening a separate bank account for side hustle income to keep things organized. Track your expenses too — many are deductible (equipment, software, mileage).",
    ],
    actionSteps: [
      "List your skills and interests that others would pay for",
      "Start with one hustle and commit to it for 30 days before adding more",
      "Open a separate bank account and set aside 30% for taxes",
      "Track all expenses related to your hustle for tax deductions",
    ],
  },
  compound: {
    id: "compound", title: "Compound Interest: The 8th Wonder of the World",
    paragraphs: [
      "Compound interest is what happens when your earnings generate their own earnings. $1,000 at 10% becomes $1,100. Next year you earn 10% on $1,100 — $110, not $100. This snowball accelerates over decades.",
      "$100/month at 10% grows to ~$200,000 in 30 years, though you only contributed $36,000. The other $164,000 is pure compound growth.",
      "Time matters more than amount. Someone investing $200/month from 25-35 then stopping often has MORE at 65 than someone investing $200/month from 35-65.",
    ],
    actionSteps: ["Use a compound interest calculator", "Start investing any amount today", "Reinvest all dividends", "Compare starting now vs. waiting 5 years"],
  },
  automate: {
    id: "automate", title: "Automate Your Savings",
    paragraphs: [
      "The biggest savings obstacle isn't income — it's willpower. Automation removes the decision. Set up auto-transfers on payday.",
      "Start with $50-100 auto-transferred to savings. After a month, you won't notice it's gone.",
      "Automate investments too — most brokerages offer automatic monthly index fund purchases.",
    ],
    actionSteps: ["Set up automatic transfers on payday", "Start small", "Increase by $25 every quarter", "Automate investment contributions too"],
  },
  debtavalanche: {
    id: "debtavalanche", title: "Debt Avalanche Method",
    paragraphs: [
      "Pay highest-interest debt first while making minimums on everything else. A $5,000 balance at 22% costs $1,100/year in interest.",
      "This saves the most money mathematically but requires discipline if your highest-rate debt is also your largest.",
      "Once the first debt is gone, roll that payment into the next highest-rate debt.",
    ],
    actionSteps: ["List all debts with interest rates", "Pay minimums on everything except the highest rate", "Attack the highest-rate debt aggressively", "Roll payments forward as debts are eliminated"],
  },
  debtsnowball: {
    id: "debtsnowball", title: "Debt Snowball Method",
    paragraphs: [
      "Pay smallest debts first for quick psychological wins, regardless of interest rate.",
      "Each eliminated debt frees up more cash for the next one, creating a snowball effect.",
      "Studies show snowball users are more likely to become debt-free despite paying slightly more interest.",
    ],
    actionSteps: ["List debts smallest to largest", "Celebrate each payoff", "Roll payments into the next debt", "Switch to avalanche once you have momentum"],
  },
  roth: {
    id: "roth", title: "Roth IRA: Tax-Free Retirement Growth",
    paragraphs: [
      "Contribute after-tax dollars now, withdraw tax-free in retirement. Perfect for young earners in low tax brackets.",
      "Contribute up to $7,000/year. You can withdraw contributions (not gains) anytime without penalty.",
      "Maxing out from age 22 to 65 at 10% return = over $3.5 million, all tax-free.",
    ],
    actionSteps: ["Open a Roth IRA at Fidelity, Vanguard, or Schwab", "Start with $50-100/month", "Invest in low-cost index funds", "Increase contributions as income grows"],
  },
  etf: {
    id: "etf", title: "ETFs: Flexible Diversification",
    paragraphs: [
      "ETFs trade like stocks but hold baskets of securities. Low fees (0.03-0.20%) and instant diversification.",
      "Popular picks: VTI (total U.S. market), VOO (S&P 500), VXUS (international), BND (bonds).",
      "Most brokerages offer commission-free ETF trading, making them perfect for beginners.",
    ],
    actionSteps: ["Learn ETF vs. mutual fund differences", "Start with VTI or VOO", "Add international exposure with VXUS", "Set up automatic monthly purchases"],
  },
  cryptobasics: {
    id: "cryptobasics", title: "Crypto 101",
    paragraphs: [
      "Cryptocurrency is digital money on blockchain. Bitcoin was first; Ethereum added smart contracts.",
      "Unlike stocks, crypto doesn't represent company ownership. Value comes from supply/demand, making it highly volatile.",
      "Treat crypto as a small speculative allocation. Never invest what you can't afford to lose.",
    ],
    actionSteps: ["Learn blockchain basics first", "Limit crypto to 5-10% of portfolio", "Use established exchanges with 2FA", "Ignore social media hype"],
  },
  cryptorisk: {
    id: "cryptorisk", title: "Crypto Risk Management",
    paragraphs: [
      "Crypto can swing 10-20% in a single day. Without risk management, losses can be severe.",
      "Never invest more than you can afford to lose completely. Keep crypto at 5% or less of your portfolio.",
      "Avoid FOMO buying during spikes and panic selling during dips. Use dollar-cost averaging.",
    ],
    actionSteps: ["Set a max portfolio percentage for crypto", "Use DCA instead of lump-sum buying", "Never use leverage for crypto", "Use a hardware wallet for large holdings"],
  },
  studentloans: {
    id: "studentloans", title: "Student Loan Strategy",
    paragraphs: [
      "Federal loans offer income-driven repayment, forgiveness programs, and deferment. Always exhaust federal options first.",
      "Income-driven plans cap payments at 10-20% of discretionary income. PSLF forgives after 10 years for government/nonprofit work.",
      "Pay minimums on federal (better protections) and attack private loans aggressively.",
    ],
    actionSteps: ["Review loans at studentaid.gov", "Apply for income-driven repayment if needed", "Research PSLF eligibility", "Prioritize private loan payoff"],
  },
  creditcard: {
    id: "creditcard", title: "Your First Credit Card",
    paragraphs: [
      "Treat credit cards like debit cards — never charge more than you can pay off monthly.",
      "Start with a secured card. One small recurring purchase + autopay = steadily growing score.",
      "Keep utilization under 10%, pay full balance, and upgrade to unsecured after 6-12 months.",
    ],
    actionSteps: ["Get a secured card if no credit history", "Set up one charge + autopay", "Keep utilization under 10%", "Request upgrade after 6-12 months"],
  },
  cashback: {
    id: "cashback", title: "Cashback Rewards",
    paragraphs: [
      "1-5% back on purchases. $1,000/month at 2% = $240/year free money.",
      "Only works if you pay in full monthly. 20%+ APR on a balance erases all cashback gains.",
      "Good starters: Discover it (doubles first year), Chase Freedom Flex, Citi Double Cash.",
    ],
    actionSteps: ["Find your top spending categories", "Choose a matching cashback card", "Always pay the full balance", "Redirect cashback to savings"],
  },
  negotiate: {
    id: "negotiate", title: "Salary Negotiation",
    paragraphs: [
      "First offers have 10-20% room. Not negotiating costs $500K+ over a career.",
      "Research market rates on Glassdoor, Levels.fyi, LinkedIn Salary. Bring specific numbers.",
      "Frame it collaboratively and practice beforehand. The worst answer is 'no.'",
    ],
    actionSteps: ["Research salary ranges", "Prepare value examples", "Practice the conversation", "Remember: they won't rescind the offer"],
  },
  taxbasics: {
    id: "taxbasics", title: "Tax Basics",
    paragraphs: [
      "Progressive brackets mean only income above each threshold is taxed higher. A raise never costs you money.",
      "Your W-2 shows earnings and withholdings. Filing reconciles what you owe vs. what was withheld.",
      "Standard deduction ($14,600 single, 2024) is subtracted before taxes. Earn $30K = taxed on $15,400.",
    ],
    actionSteps: ["File even with low income — you may get a refund", "Use free filing services", "Adjust W-4 if refunds are large", "Keep education expense records"],
  },
  taxdeductions: {
    id: "taxdeductions", title: "Tax Deductions & Credits",
    paragraphs: [
      "Deductions reduce taxable income; credits reduce your tax bill directly. Credits are more valuable dollar-for-dollar.",
      "Key credits: American Opportunity ($2,500/year), Lifetime Learning ($2,000/year), Earned Income Tax Credit.",
      "Deductions: student loan interest ($2,500/year max), IRA contributions, self-employment expenses.",
    ],
    actionSteps: ["Check education credit eligibility", "Deduct student loan interest", "Track side hustle expenses year-round", "Use tax software to find all credits"],
  },
  moveout: {
    id: "moveout", title: "Moving Out Checklist",
    paragraphs: [
      "Move-in costs: deposit + first/last rent + furniture + utilities setup = often 3-4x monthly rent.",
      "True monthly costs: rent + utilities + renter's insurance + groceries + transport. First-timers underestimate by 30-40%.",
      "Prepare 3-6 months ahead. Furnish gradually from thrift stores and Marketplace.",
    ],
    actionSteps: ["Calculate total move-in costs", "Budget ALL monthly living costs", "Save 3-4 months rent beforehand", "Get renter's insurance"],
  },
  rentbudget: {
    id: "rentbudget", title: "The 30% Rent Rule",
    paragraphs: [
      "Keep rent under 30% of gross income. At $3,000/month, that's $900 max.",
      "In expensive cities, get roommates or live further out. Each point above 30% comes from savings.",
      "It's a guideline — adjust based on your debt load and savings goals.",
    ],
    actionSteps: ["Calculate 30% of gross income as rent ceiling", "Include utilities in the calculation", "Consider roommates if needed", "Cut elsewhere if rent exceeds 30%"],
  },
  realestate: {
    id: "realestate", title: "Renting vs. Buying",
    paragraphs: [
      "Renting = flexibility and zero maintenance. Buying = equity but mortgage interest, taxes, insurance, and 1-2%/year maintenance.",
      "Breakeven for buying is typically 5-7 years. Moving sooner? Renting is usually cheaper.",
      "To prepare: credit above 740, save 20% down to avoid PMI, research first-time buyer programs.",
    ],
    actionSteps: ["Use a rent vs. buy calculator", "Build credit to 740+", "Save 20% down payment in HYSA", "Research first-time buyer programs"],
  },
  travelbudget: {
    id: "travelbudget", title: "Budget Travel",
    paragraphs: [
      "Book 2-3 months ahead, travel shoulder season, use Google Flights price tracking.",
      "Travel rewards cards earn 2-5x points. Strategic spending = 1-2 free flights/year.",
      "$100/month in a travel fund = $1,200/year. Use budget airlines, hostels, local restaurants.",
    ],
    actionSteps: ["Create a dedicated travel fund", "Automate $50-100/month", "Track flight prices on Google Flights", "Only get rewards cards if paying in full"],
  },
  subscriptions: {
    id: "subscriptions", title: "Subscription Audit",
    paragraphs: [
      "Average person spends $219/month on subscriptions, underestimating by 2-3x.",
      "Check statements. 'Used in last 30 days? Would I sign up today?' If no, cancel.",
      "Share family plans, use student discounts, switch to annual billing (15-20% savings).",
    ],
    actionSteps: ["Review 3 months of statements", "Cancel anything unused in 30 days", "Switch to annual billing", "Repeat audit every 3 months"],
  },
  highyield: {
    id: "highyield", title: "High-Yield Savings",
    paragraphs: [
      "Traditional savings: 0.01%. High-yield: 4-5%. On $5,000, that's $0.50 vs. $250/year.",
      "Online banks (Marcus, Ally, Capital One 360) offer FDIC-insured HYSA. Same safety, 100x more interest.",
      "Use for emergency funds and short-term goals. Long-term wealth still needs the stock market.",
    ],
    actionSteps: ["Open a HYSA at Marcus, Ally, or Capital One", "Transfer your emergency fund", "Set up auto-transfers", "Compare rates quarterly"],
  },
  rule72: {
    id: "rule72", title: "The Rule of 72",
    paragraphs: [
      "72 ÷ return rate = years to double. At 8%: 9 years. At 10%: 7.2 years. At 2%: 36 years.",
      "Works in reverse too: 3% inflation halves purchasing power in 24 years. 2% fees vs. 0.03% dramatically slows growth.",
      "Quick mental math for comparing options and setting realistic expectations.",
    ],
    actionSteps: ["Calculate your doubling time at current rates", "Compare HYSA vs. stock market doubling", "Check how fees affect doubling time", "Set timeline goals using this rule"],
  },
  dca: {
    id: "dca", title: "Dollar-Cost Averaging",
    paragraphs: [
      "Invest a fixed amount at regular intervals. High prices = fewer shares. Low prices = more shares. Averages out your cost.",
      "Removes the impossible task of market timing. Even pros can't do it consistently.",
      "Automate it and ignore daily noise. Time in the market beats timing the market.",
    ],
    actionSteps: ["Choose a fixed monthly amount", "Set up automatic investments", "Don't skip down months — they're your best buys", "Increase amount annually"],
  },
  diversify: {
    id: "diversify", title: "Diversification 101",
    paragraphs: [
      "Spread across asset types, industries, and geographies. One loss gets cushioned by others.",
      "Simple portfolio: 60-70% U.S. stocks (VTI), 20-30% international (VXUS), 10% bonds (BND).",
      "Doesn't eliminate risk but a diversified portfolio loses less and recovers faster in crashes.",
    ],
    actionSteps: ["Audit for concentration in one stock/sector", "Research the three-fund portfolio", "Rebalance annually", "5 tech stocks ≠ diversified"],
  },
  freelance: {
    id: "freelance", title: "Freelancing Income",
    paragraphs: [
      "Monetize writing, design, coding, tutoring on Upwork and Fiverr.",
      "Build 5-10 reviews first, then raise rates. Specialists earn $30-100+/hour.",
      "Builds transferable skills: client communication, time management, self-marketing.",
    ],
    actionSteps: ["Identify 1-2 marketable skills", "Create profiles with a portfolio", "Start competitive, raise rates with reviews", "Track income/expenses for taxes"],
  },
  networking: {
    id: "networking", title: "Networking = Net Worth",
    paragraphs: [
      "70-80% of jobs come through networking. Build genuine relationships early.",
      "Attend meetups, join LinkedIn groups, do informational interviews. Help others before asking for help.",
      "Connect with professors, classmates, and industry pros. Most people are happy to advise motivated young people.",
    ],
    actionSteps: ["Optimize your LinkedIn profile", "Connect with 5 new pros weekly", "Attend one industry event monthly", "Offer value first"],
  },
  carbudget: {
    id: "carbudget", title: "Buying Your First Car",
    paragraphs: [
      "20/4/10 rule: 20% down, max 4-year loan, total car costs under 10% of gross income.",
      "New cars lose 20-30% in 2 years. Certified pre-owned saves big on depreciation.",
      "Hidden costs: insurance ($100-300/month for young drivers), maintenance, gas, parking. A $15K car = $25K+ over 4 years.",
    ],
    actionSteps: ["Get pre-approved before dealership visits", "Research total cost of ownership", "Consider 2-3 year old CPO cars", "Get insurance quotes before buying"],
  },
};
