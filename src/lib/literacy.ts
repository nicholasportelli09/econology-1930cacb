import { supabase } from "@/integrations/supabase/client";
import {
  CONCEPT_BY_ID,
  CONCEPTS_BY_DIMENSION,
  type Dimension,
} from "@/data/conceptGraph";
import { PLACEMENT_QUESTIONS } from "@/data/placementQuestions";

export interface LiteracyProfile {
  scores: Record<Dimension, number>; // 0–100 per dimension
  mastered: string[]; // concept ids
  weak: string[];
  unknown: string[];
  takenAt: string;
  count: number;
}

export type PlacementAnswers = Record<string, number | null>; // questionId → option index, null = skipped

/** Score the placement answers into a literacy profile. */
export function scorePlacement(answers: PlacementAnswers): LiteracyProfile {
  const mastered: string[] = [];
  const weak: string[] = [];
  const unknown: string[] = [];

  // Track per-dimension counts
  const dimCorrect: Record<Dimension, number> = {
    budgeting: 0, credit: 0, investing: 0, macro: 0, risk: 0,
  };
  const dimTotal: Record<Dimension, number> = {
    budgeting: 0, credit: 0, investing: 0, macro: 0, risk: 0,
  };

  for (const q of PLACEMENT_QUESTIONS) {
    dimTotal[q.dimension] += 1;
    const ans = answers[q.id];
    if (ans === null || ans === undefined) {
      unknown.push(q.conceptId);
    } else if (ans === q.correct) {
      mastered.push(q.conceptId);
      dimCorrect[q.dimension] += 1;
    } else {
      weak.push(q.conceptId);
    }
  }

  const scores: Record<Dimension, number> = {
    budgeting: dimTotal.budgeting ? Math.round((dimCorrect.budgeting / dimTotal.budgeting) * 100) : 0,
    credit: dimTotal.credit ? Math.round((dimCorrect.credit / dimTotal.credit) * 100) : 0,
    investing: dimTotal.investing ? Math.round((dimCorrect.investing / dimTotal.investing) * 100) : 0,
    macro: dimTotal.macro ? Math.round((dimCorrect.macro / dimTotal.macro) * 100) : 0,
    risk: dimTotal.risk ? Math.round((dimCorrect.risk / dimTotal.risk) * 100) : 0,
  };

  return {
    scores,
    mastered,
    weak,
    unknown,
    takenAt: new Date().toISOString(),
    count: 1,
  };
}

/** Save a literacy profile to Supabase (upsert, increments count on retake). */
export async function saveLiteracyProfile(
  userId: string,
  profile: LiteracyProfile,
): Promise<void> {
  // Read existing to increment count
  const { data: existing } = await supabase
    .from("literacy_profiles")
    .select("diagnostic_count")
    .eq("user_id", userId)
    .maybeSingle();

  const nextCount = (existing?.diagnostic_count ?? 0) + 1;

  const { error } = await supabase.from("literacy_profiles").upsert(
    {
      user_id: userId,
      score_budgeting: profile.scores.budgeting,
      score_credit: profile.scores.credit,
      score_investing: profile.scores.investing,
      score_macro: profile.scores.macro,
      score_risk: profile.scores.risk,
      mastered_concepts: profile.mastered,
      weak_concepts: profile.weak,
      unknown_concepts: profile.unknown,
      diagnostic_taken_at: profile.takenAt,
      diagnostic_count: nextCount,
    },
    { onConflict: "user_id" },
  );

  if (error) throw error;
}

export async function loadLiteracyProfile(
  userId: string,
): Promise<LiteracyProfile | null> {
  const { data, error } = await supabase
    .from("literacy_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    scores: {
      budgeting: data.score_budgeting,
      credit: data.score_credit,
      investing: data.score_investing,
      macro: data.score_macro,
      risk: data.score_risk,
    },
    mastered: data.mastered_concepts ?? [],
    weak: data.weak_concepts ?? [],
    unknown: data.unknown_concepts ?? [],
    takenAt: data.diagnostic_taken_at,
    count: data.diagnostic_count,
  };
}

/** Identify the weakest dimension(s) for "start here" prompts. */
export function weakestDimensions(profile: LiteracyProfile): Dimension[] {
  const entries = Object.entries(profile.scores) as [Dimension, number][];
  entries.sort((a, b) => a[1] - b[1]);
  const lowest = entries[0][1];
  return entries.filter(([, v]) => v === lowest).map(([d]) => d);
}

/**
 * Find the next concept the user should learn.
 * Strategy: walk weakest dimension first, return the first concept whose
 * prerequisites are all in `completedConceptIds` and that isn't already done.
 * Falls back across all dimensions if the weakest is exhausted.
 */
export function pickNextConcept(
  profile: LiteracyProfile,
  completedConceptIds: Set<string>,
): { conceptId: string; rationale: string } | null {
  const dimsByPriority: Dimension[] = [
    ...weakestDimensions(profile),
    ...(["budgeting", "credit", "investing", "macro", "risk"] as Dimension[]).filter(
      (d) => !weakestDimensions(profile).includes(d),
    ),
  ];

  const weakSet = new Set(profile.weak);

  for (const dim of dimsByPriority) {
    const concepts = CONCEPTS_BY_DIMENSION[dim];
    // Prioritize concepts the user got wrong on the diagnostic
    const ordered = [
      ...concepts.filter((c) => weakSet.has(c.id)),
      ...concepts.filter((c) => !weakSet.has(c.id)),
    ];
    for (const c of ordered) {
      if (completedConceptIds.has(c.id)) continue;
      const prereqsMet = c.prerequisites.every((p) => completedConceptIds.has(p));
      if (!prereqsMet) continue;
      const rationale = weakSet.has(c.id)
        ? `You missed this on the placement — let's nail it.`
        : `Builds on what you already know in ${dim}.`;
      return { conceptId: c.id, rationale };
    }
  }
  return null;
}

/** All concepts the user can currently start (prereqs met, not done). */
export function unlockedConcepts(
  completedConceptIds: Set<string>,
): string[] {
  return Object.values(CONCEPT_BY_ID)
    .filter((c) => !completedConceptIds.has(c.id))
    .filter((c) => c.prerequisites.every((p) => completedConceptIds.has(p)))
    .map((c) => c.id);
}

/** Should we prompt for a re-take? Every 10 lessons or on demand. */
export function shouldOfferRetake(
  lastTakenAt: string,
  lessonsCompleted: number,
): boolean {
  return lessonsCompleted > 0 && lessonsCompleted % 10 === 0;
}