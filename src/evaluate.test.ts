import { describe, expect, it } from "vitest";
import {
  countWords,
  evaluateBluntOutput,
  extractSections,
  getProtectedFacts,
} from "./evaluate.js";

const LONG_INPUT = `${"Context about the implementation and review findings. ".repeat(30)}
[keep] The change affects 16 pull requests as of 19 Aug.
[keep] Evidence is recorded at https://example.com/review/16.`;

const VALID_OUTPUT = `## Blunt
Block release. Fix the 16 affected pull requests from 19 Aug, then request review at https://example.com/review/16.

## Bullets
- Block release until the defects are fixed.
- 16 pull requests are affected.
- Evidence: https://example.com/review/16.

## Skeleton
Verdict: Block release.
Evidence: 16 pull requests from 19 Aug at https://example.com/review/16.
Ask: Fix the defects, then request review.`;

describe("countWords", () => {
  it("counts words separated by any whitespace", () => {
    expect(countWords("one\n two\tthree")).toBe(3);
  });

  it("returns zero for empty text", () => {
    expect(countWords("   ")).toBe(0);
  });
});

describe("extractSections", () => {
  it("extracts the three required shapes in order", () => {
    expect(extractSections(VALID_OUTPUT)).toEqual({
      blunt:
        "Block release. Fix the 16 affected pull requests from 19 Aug, then request review at https://example.com/review/16.",
      bullets:
        "- Block release until the defects are fixed.\n- 16 pull requests are affected.\n- Evidence: https://example.com/review/16.",
      skeleton:
        "Verdict: Block release.\nEvidence: 16 pull requests from 19 Aug at https://example.com/review/16.\nAsk: Fix the defects, then request review.",
    });
  });

  it("rejects sections in the wrong order", () => {
    expect(
      extractSections(
        "## Bullets\n- One\n## Blunt\nOne\n## Skeleton\nAsk: One",
      ),
    ).toBeUndefined();
  });
});

describe("getProtectedFacts", () => {
  it("extracts unique numbers, units and URLs from keep lines", () => {
    expect(
      getProtectedFacts(
        "[keep] 16 PRs on 19 Aug: https://example.com/16\nIgnore 20",
      ),
    ).toEqual(["16", "19", "https://example.com/16"]);
  });
});

describe("evaluateBluntOutput", () => {
  it("accepts a concise, complete response", () => {
    expect(evaluateBluntOutput(LONG_INPUT, VALID_OUTPUT)).toMatchObject({
      passed: true,
      checks: {
        shape: true,
        compression: true,
        emDashFree: true,
        singleAsk: true,
        protectedFacts: true,
      },
      missingFacts: [],
    });
  });

  it("rejects an em dash and multiple asks", () => {
    const invalidOutput = VALID_OUTPUT.replace(
      "Block release.",
      "Block release — now.",
    ).replace(
      "Ask: Fix the defects, then request review.",
      "Ask: Fix the defects.\nAsk: Request review.",
    );
    const result = evaluateBluntOutput(LONG_INPUT, invalidOutput);

    expect(result.passed).toBe(false);
    expect(result.checks.emDashFree).toBe(false);
    expect(result.checks.singleAsk).toBe(false);
  });

  it("reports a protected fact removed during compression", () => {
    const invalidOutput = VALID_OUTPUT.replaceAll("19 Aug", "the deadline");
    const result = evaluateBluntOutput(LONG_INPUT, invalidOutput);

    expect(result.passed).toBe(false);
    expect(result.checks.protectedFacts).toBe(false);
    expect(result.missingFacts).toEqual(["19"]);
  });

  it("rejects a Blunt section longer than 20% of the source", () => {
    const shortInput = "one two three four five six seven eight nine ten";
    const output = `## Blunt
one two three
## Bullets
- one
## Skeleton
Verdict: one
Evidence: two
Ask: three`;
    const result = evaluateBluntOutput(shortInput, output);

    expect(result.passed).toBe(false);
    expect(result.checks.compression).toBe(false);
  });
});
