import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_KEY = "econology_tour_completed_v1";

export function hasSeenTour(): boolean {
  return localStorage.getItem(TOUR_KEY) === "true";
}

export function markTourSeen() {
  localStorage.setItem(TOUR_KEY, "true");
}

export function resetTour() {
  localStorage.removeItem(TOUR_KEY);
}

/**
 * Starts the interactive product tour. Anchors to elements via [data-tour="..."]
 * attributes already placed across the app. Falls back gracefully if an element
 * isn't on the current page (driver.js skips missing selectors).
 */
export function startProductTour(opts?: { onFinish?: () => void }) {
  // Detect mobile so we anchor on the visible mobile nav, not the
  // hidden desktop nav. Re-evaluated each time the tour starts.
  const isMobile =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const navSel = (key: string) =>
    isMobile ? `[data-tour="m-${key}"]` : `[data-tour="${key}"]`;

  const d = driver({
    showProgress: true,
    allowClose: true,
    overlayOpacity: 0.65,
    stagePadding: 6,
    stageRadius: 12,
    popoverClass: "econology-tour-popover",
    progressText: "Step {{current}} of {{total}}",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Let's go! 🚀",
    onDestroyed: () => {
      markTourSeen();
      opts?.onFinish?.();
    },
    onPopoverRender: (popover) => {
      // Inject a "Skip tour" button into every step's footer.
      const footer = popover.wrapper.querySelector(".driver-popover-footer");
      if (!footer || footer.querySelector(".econology-tour-skip")) return;
      const skip = document.createElement("button");
      skip.textContent = "Skip tour";
      skip.className = "econology-tour-skip";
      skip.type = "button";
      skip.addEventListener("click", () => d.destroy());
      footer.prepend(skip);
    },
    steps: [
      {
        popover: {
          title: "Welcome to Econology 👋",
          description:
            "Take a quick tour (about 90 seconds) to see everything Econology can do — daily lessons, AI insights, market ideas, and more. Hit <b>Skip tour</b> anytime to jump straight in.",
          side: "over" as unknown as "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="daily-lesson"]',
        popover: {
          title: "Your Daily Lesson 📚",
          description:
            "A fresh 3-minute micro-lesson every day: explanation → real example → quick check. Finishing one builds your streak and earns XP.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="news-hero"]',
        popover: {
          title: "Today's Market Story 📈",
          description:
            "An AI-generated headline tied to whatever you're learning right now — so the news always connects to the concept on your plate.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="daily-plan"]',
        popover: {
          title: "Today's Plan ✅",
          description:
            "A 5-step daily checklist that mixes learning, market awareness, and habits. Complete it to keep your streak alive.",
          side: "left",
          align: "start",
        },
      },
      {
        element: '[data-tour="summary"]',
        popover: {
          title: "At-a-glance Summary",
          description:
            "Your portfolio movers, current streak, and level/XP — all in one strip so you know where you stand instantly.",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="reading"]',
        popover: {
          title: "Recommended Reading 📖",
          description:
            "Three deep-dive articles picked just for you based on your placement and goals. Refresh anytime to get a new set.",
          side: "top",
          align: "center",
        },
      },
      {
        element: navSel("nav-learn"),
        popover: {
          title: "Learn Hub",
          description:
            "Your full curriculum: dozens of micro-lessons across budgeting, credit, investing, macro, and risk. Lessons unlock as you master prerequisites.",
          side: isMobile ? "bottom" : "bottom",
          align: "center",
        },
      },
      {
        element: navSel("nav-news"),
        popover: {
          title: "Economic News 📰",
          description:
            "Live headlines + AI insights tailored to <b>your</b> portfolio. Add tickers, see live quotes, and get short-term tactical takes — plus a daily digest.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: navSel("nav-market"),
        popover: {
          title: "Market Ideas 💡",
          description:
            "Three fresh ideas every day with thesis, risks, and what to watch. See how an analyst frames a company or theme. Educational only — not financial advice.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: navSel("nav-videos"),
        popover: {
          title: "Curated Videos 🎥",
          description:
            "Hand-picked finance YouTubers — no clickbait, no get-rich-quick schemes. Watch one, answer a quick check, earn XP.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: navSel("nav-ask"),
        popover: {
          title: "Ask Ekon 🤖",
          description:
            "Your personal AI tutor. Ask anything — from \"what's a Roth IRA?\" to \"should I refinance my loans?\" — and get answers tailored to your profile and goals.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="notifications"]',
        popover: {
          title: "Notifications 🔔",
          description:
            "Daily lesson reminders, market alerts on your tickers, and digest emails. Tweak frequency anytime in Settings.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="theme-toggle"]',
        popover: {
          title: "Light & Dark 🌗",
          description:
            "Flip between light and dark mode whenever you want. We default to light to keep things crisp.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="progress-btn"]',
        popover: {
          title: "Track Your Progress 📈",
          description:
            "See your XP, streak, level, and mastery by dimension. Earn achievements as you build real money skills over time.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="profile-menu"]',
        popover: {
          title: "Settings & Placement",
          description:
            "Open this menu anytime to update your profile, re-take the placement diagnostic, or replay this tour from Settings.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="hub-grid"]',
        popover: {
          title: "Quick Hub Access",
          description:
            "Shortcut cards into Learn, Markets, Videos, and the Budget Simulator — one click to anywhere in the app.",
          side: "top",
          align: "center",
        },
      },
      {
        popover: {
          title: "You're all set! 🎉",
          description:
            "Tap today's lesson, add a stock, or ask Ekon anything to get started. You can replay this tour anytime from <b>Settings → Replay tour</b>. Welcome aboard.",
          side: "over" as unknown as "top",
          align: "center",
        },
      },
    ],
  });

  d.drive();
}