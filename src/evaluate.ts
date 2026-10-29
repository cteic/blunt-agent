const BLUNT_HEADING = "## Blunt";
const BULLETS_HEADING = "## Bullets";
const SKELETON_HEADING = "## Skeleton";
const EM_DASH = "\u2014";

interface BluntChecks {
  shape: boolean;
  compression: boolean;
  emDashFree: boolean;
  singleAsk: boolean;
  protectedFacts: boolean;
}

interface BluntEvaluation {
  passed: boolean;
  inputWords: number;
  bluntWords: number;
  reductionPercent: number;
  checks: BluntChecks;
  missingFacts: string[];
}

interface Sections {
  blunt: string;
  bullets: string;
  skeleton: string;
}

function countWords(text: string): number {
  const normalised = text.trim();

  if (normalised.length === 0) {
    return 0;
  }

  return normalised.split(/\s+/u).length;
}

function extractSections(output: string): Sections | undefined {
  const bluntStart = output.indexOf(BLUNT_HEADING);
  const bulletsStart = output.indexOf(BULLETS_HEADING);
  const skeletonStart = output.indexOf(SKELETON_HEADING);

  if (
    bluntStart < 0 ||
    bulletsStart <= bluntStart ||
    skeletonStart <= bulletsStart
  ) {
    return undefined;
  }

  return {
    blunt: output.slice(bluntStart + BLUNT_HEADING.length, bulletsStart).trim(),
    bullets: output
      .slice(bulletsStart + BULLETS_HEADING.length, skeletonStart)
      .trim(),
    skeleton: output.slice(skeletonStart + SKELETON_HEADING.length).trim(),
  };
}

function getProtectedFacts(input: string): string[] {
  const protectedLines = input
    .split("\n")
    .filter((line) => line.trimStart().startsWith("[keep]"))
    .map((line) => line.replace(/^\s*\[keep\]\s*/u, ""));

  const facts = new Set<string>();

  for (const line of protectedLines) {
    const matches = line.match(
      /https?:\/\/[^\s)]+|(?<![\p{L}\p{N}])\d[\d.,]*(?:%|[\p{L}]+)?/gu,
    );

    if (matches === null) {
      continue;
    }

    for (const match of matches) {
      facts.add(match);
    }
  }

  return [...facts];
}

function countAskLines(skeleton: string): number {
  return skeleton.split("\n").filter((line) => /^Ask:\s+\S/u.test(line.trim()))
    .length;
}

function calculateReduction(inputWords: number, bluntWords: number): number {
  if (inputWords === 0) {
    return 0;
  }

  return Math.floor(((inputWords - bluntWords) * 100) / inputWords);
}

function evaluateBluntOutput(input: string, output: string): BluntEvaluation {
  const sections = extractSections(output);
  const inputWords = countWords(input);
  const bluntWords = sections === undefined ? 0 : countWords(sections.blunt);
  const reductionPercent = calculateReduction(inputWords, bluntWords);
  const protectedFacts = getProtectedFacts(input);
  const missingFacts = protectedFacts.filter((fact) => !output.includes(fact));

  const checks: BluntChecks = {
    shape: sections !== undefined,
    compression:
      sections !== undefined && inputWords > 0 && reductionPercent >= 80,
    emDashFree: !output.includes(EM_DASH),
    singleAsk: sections !== undefined && countAskLines(sections.skeleton) === 1,
    protectedFacts: missingFacts.length === 0,
  };

  return {
    passed: Object.values(checks).every((check) => check),
    inputWords,
    bluntWords,
    reductionPercent,
    checks,
    missingFacts,
  };
}

export { countWords, evaluateBluntOutput, extractSections, getProtectedFacts };
export type { BluntChecks, BluntEvaluation, Sections };
