# Scan Scoring Notes

Internal notes on how scoring and result display differ between categories.

## Two scoring models

**Checklist-based categories** (legal, SEO, performance, security, standards): A fixed set of checks runs every time. Each check always produces a result (pass, warn, or fail). The category score is a weighted average of individual check scores. The user always sees the full list regardless of how the site performs.

**Deduction-based category** (accessibility): Uses axe-core, which reports violations and incomplete findings. It does not produce a "passed" result for every rule it evaluated. The score starts at 100 and deducts per violation:

- Critical: -15 points (capped at 5 node multiplier)
- Serious: -10 points
- Moderate: -5 points
- Minor: -2 points

## Display gap

A site with good accessibility may show only 1-2 items, while other categories always show 8-10 checks. This makes accessibility results look thin by comparison even when the score is high.

This is a known UX gap worth addressing. Options to consider:

- Show a summary line ("axe-core evaluated X rules, found Y violations")
- Surface pass counts alongside violations
- Add context text when few violations are found
