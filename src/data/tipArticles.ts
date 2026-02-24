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
};
