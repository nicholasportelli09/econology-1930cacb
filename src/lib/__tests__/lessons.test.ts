import { describe, it, expect } from "vitest";
import {
  FREEZE_TOKEN_EVERY,
  FREEZE_TOKEN_MAX,
  LESSON_XP,
  PERFECT_LESSON_XP,
  nextStreakAfterLesson,
  type StreakState,
} from "@/lib/lessons";

const baseState = (overrides: Partial<StreakState> = {}): StreakState => ({
  current: 0,
  longest: 0,
  lastLessonDate: null,
  freezeTokens: 0,
  totalLessons: 0,
  totalXp: 0,
  totalVideos: 0,
  videoXp: 0,
  ...overrides,
});

// Fixed calendar for deterministic tests.
const TODAY = "2026-07-16";
const YESTERDAY = "2026-07-15";
const TWO_DAYS_AGO = "2026-07-14";
const A_WEEK_AGO = "2026-07-09";

describe("nextStreakAfterLesson", () => {
  it("first lesson ever: streak 0 → 1, awards base XP, bumps totalLessons", () => {
    const { next, xpAwarded, usedFreeze } = nextStreakAfterLesson(
      baseState(),
      3,
      5,
      true,
      TODAY,
      YESTERDAY,
    );
    expect(next.current).toBe(1);
    expect(next.longest).toBe(1);
    expect(next.totalLessons).toBe(1);
    expect(next.lastLessonDate).toBe(TODAY);
    expect(xpAwarded).toBe(LESSON_XP);
    expect(next.totalXp).toBe(LESSON_XP);
    expect(usedFreeze).toBe(false);
  });

  it("repeated quiz attempt (same concept, same day) does NOT re-bump totalLessons or streak", () => {
    const prev = baseState({
      current: 3,
      longest: 3,
      lastLessonDate: TODAY,
      totalLessons: 5,
      totalXp: 100,
    });
    const { next, xpAwarded } = nextStreakAfterLesson(prev, 5, 5, false, TODAY, YESTERDAY);
    expect(next.current).toBe(3); // unchanged
    expect(next.totalLessons).toBe(5); // isNewLesson=false
    expect(xpAwarded).toBe(LESSON_XP + PERFECT_LESSON_XP);
    expect(next.totalXp).toBe(100 + LESSON_XP + PERFECT_LESSON_XP);
  });

  it("next-day completion: streak increments by 1", () => {
    const prev = baseState({
      current: 4,
      longest: 4,
      lastLessonDate: YESTERDAY,
      totalLessons: 6,
    });
    const { next, usedFreeze } = nextStreakAfterLesson(prev, 2, 3, true, TODAY, YESTERDAY);
    expect(next.current).toBe(5);
    expect(next.longest).toBe(5);
    expect(usedFreeze).toBe(false);
  });

  it("missed-day reset with no freeze token: streak resets to 1", () => {
    const prev = baseState({
      current: 10,
      longest: 10,
      lastLessonDate: A_WEEK_AGO,
      freezeTokens: 0,
      totalLessons: 12,
    });
    const { next, usedFreeze } = nextStreakAfterLesson(prev, 3, 5, true, TODAY, YESTERDAY);
    expect(next.current).toBe(1);
    expect(next.longest).toBe(10); // longest preserved
    expect(usedFreeze).toBe(false);
  });

  it("missed exactly one day WITH a freeze token: streak continues, token burned", () => {
    const prev = baseState({
      current: 7,
      longest: 7,
      lastLessonDate: TWO_DAYS_AGO,
      freezeTokens: 1,
      totalLessons: 8,
    });
    const { next, usedFreeze } = nextStreakAfterLesson(prev, 2, 5, true, TODAY, YESTERDAY);
    expect(next.current).toBe(8);
    expect(next.freezeTokens).toBe(0);
    expect(usedFreeze).toBe(true);
  });

  it("awards a freeze token every FREEZE_TOKEN_EVERY new lessons, capped at MAX", () => {
    const prev = baseState({
      current: 4,
      longest: 4,
      lastLessonDate: YESTERDAY,
      freezeTokens: 0,
      totalLessons: FREEZE_TOKEN_EVERY - 1,
    });
    const { next } = nextStreakAfterLesson(prev, 4, 5, true, TODAY, YESTERDAY);
    expect(next.totalLessons).toBe(FREEZE_TOKEN_EVERY);
    expect(next.freezeTokens).toBe(1);

    // At cap already: no more tokens awarded.
    const capped = baseState({
      lastLessonDate: YESTERDAY,
      freezeTokens: FREEZE_TOKEN_MAX,
      totalLessons: FREEZE_TOKEN_EVERY - 1,
    });
    const capNext = nextStreakAfterLesson(capped, 1, 5, true, TODAY, YESTERDAY).next;
    expect(capNext.freezeTokens).toBe(FREEZE_TOKEN_MAX);
  });

  it("perfect quiz XP: awards LESSON_XP + PERFECT_LESSON_XP", () => {
    const { xpAwarded } = nextStreakAfterLesson(baseState(), 5, 5, true, TODAY, YESTERDAY);
    expect(xpAwarded).toBe(LESSON_XP + PERFECT_LESSON_XP);
  });

  it("non-perfect quiz XP: awards only LESSON_XP", () => {
    const { xpAwarded } = nextStreakAfterLesson(baseState(), 3, 5, true, TODAY, YESTERDAY);
    expect(xpAwarded).toBe(LESSON_XP);
  });

  it("does not touch video counters", () => {
    const prev = baseState({ totalVideos: 4, videoXp: 90, lastLessonDate: YESTERDAY });
    const { next } = nextStreakAfterLesson(prev, 5, 5, true, TODAY, YESTERDAY);
    expect(next.totalVideos).toBe(4);
    expect(next.videoXp).toBe(90);
  });
});

describe("video learning activity (contract)", () => {
  it("recordVideoWatch never advances the lesson streak — enforced by not calling nextStreakAfterLesson", () => {
    // This is a documentation-style test: importing recordVideoWatch shouldn't
    // pull in nextStreakAfterLesson-driven mutations. The file is thin enough
    // that a source-level grep is a reliable contract check.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const src = require("fs").readFileSync(
      require("path").resolve(__dirname, "../videoLessons.ts"),
      "utf8",
    ) as string;
    expect(src).not.toMatch(/nextStreakAfterLesson/);
    // Must not write last_lesson_date, current_streak from a "new" computation.
    expect(src).not.toMatch(/nextCurrent\s*=/);
  });
});