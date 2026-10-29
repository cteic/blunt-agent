---
name: blunt
description: Compress long outbound engineering messages into decision-ready text, or turn a pull request or ticket into a five-line status brief.
---

# Blunt: say it in 20% of the words

Long messages often contain a useful record but bury the decision. Blunt separates them: the message goes first at no more than 20% of the input, while detailed evidence moves into a collapsed block or linked record.

## Modes

| Invocation            | Input                        | Output                            |
| --------------------- | ---------------------------- | --------------------------------- |
| `/blunt <text>`       | a pasted draft               | three shapes and a measured ratio |
| `/blunt say <intent>` | an intent, audience and ask  | three shapes                      |
| `/blunt read <url>`   | a pull request or ticket URL | the five-line brief below         |

## Output contract for `/blunt` and `/blunt say`

Return these sections in this order, with no preamble:

```text
## Blunt
<paste-ready text. Verdict first. One ask. No more than 20% of the input.>

## Bullets
- <three to five one-line bullets containing the same facts>

## Skeleton
Verdict: <one line>
Evidence: <one line or link>
Ask: <one line>
```

Measure only the Blunt section. When working from an existing draft, reduce its word count by at least 80%. If it is still too long, cut again or move evidence into a collapsed block.

## Output contract for `/blunt read`

```text
What: <the change or problem, one line>
State: <shipped, merged, in review, draft, blocked or to do>
Blocked: <the one blocker, or "nothing">
Next: <one action that can start now>
Link: <the source URL>
```

Return exactly five lines. Read the complete source before compressing it.

## Rules

1. Put the verdict in the first sentence.
2. Include one ask. Split two asks into two messages.
3. Preserve material numbers, dates, units and links.
4. Do not use an em dash. Hyphens and en dashes are allowed.
5. Remove process narration from the message. Keep it in the evidence record.
6. Use status words precisely: shipped means deployed; merged means present in the base branch; in review means the pull request is open; draft means it is not ready.
7. Do not remove a safety condition to satisfy the word limit.

## Where detailed evidence goes

| Destination | Put the record in           |
| ----------- | --------------------------- |
| GitHub      | a collapsed `details` block |
| Linear      | an evidence toggle          |
| Slack       | a thread reply              |
| Standup     | the linked ticket           |

Do not delete the record. Fold it.
