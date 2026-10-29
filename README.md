# Blunt Agent

Blunt turns long engineering messages into short, decision-ready communication.

It produces the same facts in three forms:

- **Blunt:** paste-ready text at no more than 20% of the source length
- **Bullets:** three to five scannable lines
- **Skeleton:** one verdict, one evidence line and one ask

The evaluator makes the contract measurable. It checks structure, compression, protected facts, the single ask and the complete absence of em dashes.

## Why this exists

Engineering work often has a detailed record and a simple decision. Mixing both into one message hides the verdict. Blunt keeps the record available while making the action obvious.

## Try the evaluator

```sh
pnpm install
pnpm evaluate fixtures/long-review/input.md fixtures/long-review/output.md
```

The command prints a JSON report and exits with a non-zero status when the output breaks the contract.

```json
{
  "passed": true,
  "inputWords": 198,
  "bluntWords": 17,
  "reductionPercent": 91,
  "checks": {
    "shape": true,
    "compression": true,
    "emDashFree": true,
    "singleAsk": true,
    "protectedFacts": true
  }
}
```

## Use the skill

Copy [`SKILL.md`](./SKILL.md) into a compatible skills directory, or use the contract as the system instruction for an agent of your choice.

The skill supports three modes:

- `/blunt <text>` compresses an existing draft.
- `/blunt say <intent>` drafts from an intent.
- `/blunt read <url>` returns a five-line status brief.

## Evaluation contract

The evaluator requires:

1. `Blunt`, `Bullets` and `Skeleton` sections in that order.
2. The Blunt section to contain no more than 20% of the source word count.
3. No em dash character anywhere in the output.
4. Exactly one `Ask:` line in the Skeleton section.
5. Every URL and number marked in the source to remain present in the output.

Prefix a source line with `[keep]` when its URLs or numbers are material and must survive compression. The marker is evaluation metadata and does not belong in the output.

## Development

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Licence

MIT
