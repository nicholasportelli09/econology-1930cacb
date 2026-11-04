# Econology: direct acquisition test

Prepared November 4, 2026. Proposed page: `/money-challenge.html`. Publish the page and check its production URL before using the launch copy below. These are drafts, not published posts.

## First experiment

Offer a three-minute money challenge before asking people to create an account. Six questions include explanations; the score can be shared with a friend. Continue into the existing free signup flow after the result. No ambassadors, paid ads, or school adoption claims.

Run one LinkedIn launch post and one relevant public-community post where current rules explicitly permit a founder to share a free resource. Answer comments personally and disclose founder affiliation. Do not bulk-post, scrape private groups, message individual students, or imply moderator endorsement. Candidate public community: r/SideProject; eligibility and current rules must be checked at posting time. This is a usability/word-of-mouth test, not proof that its audience matches student learners.

Use one channel-tagged challenge URL per post. URL tags alone do not implement analytics or establish attribution.

LinkedIn URL after deployment:
https://www.econology.app/money-challenge.html?utm_source=linkedin&utm_medium=organic_social&utm_campaign=challenge_launch

Community URL after deployment:
https://www.econology.app/money-challenge.html?utm_source=sideproject&utm_medium=community&utm_campaign=challenge_launch

## LinkedIn launch draft

You lose 50% on an investment. How much do you need to gain to break even?

It’s 100%. Questions like this are why I built Econology: learning about money should feel useful before it feels complicated.

I’ve put together a free three-minute money challenge covering inflation, compound interest and investing. Six questions, explanations after each answer, and no account needed.

Try it, then send it to a friend and compare scores:
[Insert the verified live LinkedIn challenge URL]

I’m the founder, and I’d appreciate specific feedback: which explanation was useful, and where did you get stuck?

## Public-community draft

Title: I built a free money challenge you can try without signing up

I’m a high school student building Econology, a free money-and-markets learning app. I’ve been asking educators to share it, but that leaves a lot of steps between hearing about it and actually learning something.

So I built a six-question public challenge. It explains each answer before asking you to create an account. It covers things like why a 50% loss needs a 100% recovery, and why two 20% discounts don’t add up to 40%.

I’d value feedback on the experience: does it teach something useful, and does the next step feel clear?

[Insert the verified live community challenge URL]

I’m the founder. The challenge is free and requires no account.

## Two short-video scripts

1. “Your investment falls 50%. Is a 50% gain enough to recover? No. 100 becomes 50, then a 50% gain takes it to 75. You need a 100% gain to get back to 100. I built six short questions like this into Econology’s free money challenge. Try it before creating an account.”

2. “A shop takes 20% off, then another 20% off. That’s not 40% off. Start at 100: first you pay 80, then 64. The total discount is 36%. The base changes. Try the free Econology money challenge for five more questions.”

## Measurement and decision

Primary outcome: new external accounts completing a real personalized lesson. Secondary: challenge completion, signup, and seven-day activity. Challenge completion is not a core lesson completion and must never increment or be presented as `first_lesson_completed`.

This initial static page does not send analytics and does not save answers. UTM links identify intended campaign sources only; signup attribution persistence and event aggregation remain unimplemented. The existing metrics connection also remains unavailable. Do not claim measured channel conversions until those are working.

Before scaling, implement and verify separate `challenge_started`, `challenge_completed`, `challenge_share_clicked` and `challenge_signup_clicked` events, plus first-touch campaign persistence through signup, with the existing backend’s access and privacy controls. Do not treat opening a share sheet as a confirmed share, or a copied link as a referred user. Filter repeat visits and self-tests from outcome counts.

Initial learning target, not a forecast: 100 qualified visits, 30 challenge completions and 10 real first lessons over seven days. Fewer visits means insufficient distribution; visits without completions means examine the challenge; completions without real lessons means examine signup and activation. No paid spending until attribution and the core completion event work.

## Operational status

- Public challenge: proposed in a GitHub branch, not verified deployed.
- Launch posts and video scripts: prepared, not posted.
- Social publishing: requires a connected account; Metricool is an available option.
- Community distribution: requires an authorized account and verified current posting rules.
- Existing cold outreach: separate, unchanged.
- Automated growth review: add direct-content, community and referral experiments alongside outreach; report actual executions separately from queued drafts.
