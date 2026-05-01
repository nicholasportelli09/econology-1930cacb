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
    steps: [
      {
        popover: {
          title: "Welcome to Econology 👋",
          description:
            "Quick 60-second tour of everything you can do here. You'll learn money, markets, and build real financial habits — daily.",
          side: "over",
          align: "center",
        },
      },
      {
        element: '[data-tour="daily-lesson"]',
        popover: {
          title: "Your Daily Lesson 📚",
          description:
            "Every day a fresh micro-lesson: explanation → real example → quick check. Your streak builds here.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="daily-plan"]',
        popover: {
          title: "Today's Plan ✅",
          description:
            "A short checklist of money habits to do today. Tick them off as you go.",
          side: "left",
          align: "start",
        },
      },
      {
        element: navSel("nav-learn"),
        popover: {
          title: "Learn Hub",
          description:
            "Dozens of deep-dive articles on budgeting, investing, credit, taxes, and more. Search any topic.",
          side: isMobile ? "bottom" : "bottom",
          align: "center",
        },
      },
      {
        element: navSel("nav-news"),
        popover: {
          title: "Economic News 📰",
          description:
            "Live market headlines + AI insights tailored to YOUR portfolio. Add tickers, see live charts, get short-term tactical moves.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: navSel("nav-market"),
        popover: {
          title: "Market Ideas 💡",
          description:
            "Ideas to explore — see how an analyst might frame a company or theme. Educational only, not financial advice.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: navSel("nav-videos"),
        popover: {
          title: "Curated Videos 🎥",
          description:
            "Hand-picked finance YouTubers — no clickbait, no get-rich-quick. Refresh anytime for new picks.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: navSel("nav-ask"),
        popover: {
          title: "Ask Ekon 🤖",
          description:
            "Your personal AI tutor. Ask anything — from 'what's a Roth IRA?' to 'should I refinance my loans?' — and get answers tailored to YOU.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="progress-btn"]',
        popover: {
          title: "Track Your Progress 📈",
          description:
            "See your XP, streak, level, and Financial Health Score. Earn badges as you build money skills.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="hub-grid"]',
        popover: {
          title: "Quick Hub Access",
          description:
            "These cards jump you into any section in one click. You can replay this tour anytime from Settings.",
          side: "top",
          align: "center",
        },
      },
      {
        popover: {
          title: "You're all set! 🎉",
          description:
            "Tap a daily lesson, add a stock, or just ask Ekon a question to get started. Welcome aboard.",
          side: "over",
          align: "center",
        },
      },
    ],
  });

  d.drive();
}