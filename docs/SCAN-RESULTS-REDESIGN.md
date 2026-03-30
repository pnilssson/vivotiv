# Scan Results Page Redesign

Implementation plan for turning the scan results page from a passive technical report into a conversion-focused experience that naturally leads visitors toward contacting us.

## Guiding principles

- "Diagnose before you prescribe." The scan is the X-ray. This page is where we walk through what we see and naturally offer the treatment.
- Sell outcomes, not technology. Every piece of copy ties back to a business consequence.
- The funnel should be invisible. Every element provides value to the visitor. Selling is a side effect of being helpful.
- No glow effects, pulsing elements, or animated urgency. No em dashes. No AI-sounding copy.
- Swedish copy must feel natural, not translated from English.

## Emotional arc

1. **Concern** - the scores create urgency
2. **Understanding** - business impact explains why it matters
3. **Relief** - someone can fix this
4. **Action** - clear, low-friction next step

---

## Tasks

### 1. Add SiteHeader to scan results page

The scan results page currently has no navigation. Add the same `SiteHeader` used on the landing page. The user arrives here from an email link, so they need proper navigation to feel oriented.

Add `SiteHeader` to the scan page route (`app/[locale]/scan/[id]/page.tsx`), or create a shared layout for the scan route that includes it. Keep it consistent with the landing page header.

---

### 2. Fix accordion overflow on mobile

**Bug:** On mobile, the CheckItem button row (status icon + check name + value text + chevron arrow) overflows horizontally. The title and value text push the chevron out of the box.

**Fix:** On small screens, restructure the CheckItem layout:
- First row: status icon + check name + chevron (aligned right)
- Second row (below name): value text, if present

Use a responsive breakpoint or flex-wrap approach so the value moves below the name on narrow viewports. The chevron must always remain visible and tappable.

---

### 3. Add toggle to hide passing checks

Add a toggle/filter control near the top of the CheckList (or per category) that hides all checks with status `pass`. Default state: passing checks hidden. Label: "Show passing checks" or similar.

This keeps focus on the problems and reduces scroll length. The toggle lets curious users see everything if they want.

---

### 4. Dynamic page header with issue summary

**Current:** Generic "Scan Results" title with scanned URL.

**Replace with:** A dynamic headline based on overall score:
- Score 0-49: "Your website has critical issues that need attention"
- Score 50-89: "Your website has room for improvement"
- Score 90+: "Your website is in good shape"

Below the headline, add a one-line summary counting failed and warning checks across all categories. Example: "We found 12 issues across 4 categories, including 5 critical ones."

This frames the conversation around problems that need solving.

---

### 5. Sticky score overview on desktop + category navigation

On the `md:grid-cols-5` layout, make the left column (ScoreOverview) sticky (`sticky top-24`) so it stays visible as the user scrolls through categories.

Make category bars in the ScoreOverview clickable. Clicking a category scrolls to that category's section in the CheckList. This turns the score overview into a navigation element and removes the "wall of text" feeling.

---

### 6. Business context lines on category scores

After each category progress bar in the ScoreOverview, show a one-line business consequence for non-green scores (< 90). Examples:

- Performance 38: "Slow load times are driving visitors away before they see your content"
- Legal 22: "Missing cookie consent can lead to fines up to SEK 10M"
- SEO 55: "Search engines are having trouble reading your pages"
- Accessibility 44: "Your site may not meet EU accessibility requirements"
- Security 61: "Missing security headers leave your site exposed"
- Standards 48: "Outdated code signals a neglected online presence"

These translate scores into real consequences. Pull from the category descriptions already on the landing page. Add corresponding translation keys for both `en` and `sv`.

---

### 7. Category-level summary cards

At the top of each CategorySection, add a compact summary before the check groups:
- Score badge (colored circle with number)
- Count of failed/warning/passing checks
- One-sentence interpretation of what this category score means for the business

This gives people who scroll fast the key takeaway without expanding every check.

---

### 8. Visual polish

- **Score circle:** Increase from 96px to 120px. Show the score level label visibly (not just sr-only). A red "Critical" under a score of 38 hits harder than just the number.
- **Category sections:** Add a subtle top border in the score color to each category section for visual separation and traffic-light reinforcement.
- **Failed checks:** Give `fail` status checks a subtle tinted background (`bg-red-500/5`) so they stand out from warnings and passes. Critical issues should look critical.
- **Progress bars:** Increase height from `h-1.5` to `h-2` for better visual weight.

---

### 9. Bottom CTA section (the prescription)

After all categories, add a "What's next?" section. Two options ordered by commitment level:

1. **"Talk to us about fixing this"** (primary CTA). A button that opens a contact/booking form or links to a scheduling tool. Frame as a free consultation: "We've helped Swedish businesses fix exactly these issues. Book a 15-minute call to walk through your results." No commitment, no pressure.

2. **"Learn how we fix this"** (secondary, for researchers). Links to a page explaining the migration/rebuild offer. For now, can be a simple explainer section or placeholder.

The user already submitted their email (they got here from an email link), so "send report by email" is unnecessary.

The copy must follow the marketing guidelines: outcome-focused, specific, human. No "unlock your potential" or "let us supercharge your site."

---

### 10. Sticky bottom bar for long pages

When a scan has many issues, the user scrolls far. Once the score overview scrolls out of view, show a subtle sticky bar at the bottom of the viewport:
- Overall score badge (small, colored)
- Single text CTA: "Discuss your results with us"

Must be:
- Small and muted, not a popup or banner
- Easy to dismiss (X button or auto-hide)
- Only appears after scrolling past the score overview
- Does not appear on mobile (the bottom CTA section is sufficient there)

---

### 11. Trust footer before the CTA

Before the bottom CTA section, add a simple trust line: "Vivotiv is a Swedish company helping businesses modernize their websites." With contact email. No testimonials yet, but a human touchpoint (location, reachability) builds trust.

---

### 12. Issue-level business impact text

For checks with status `fail` or `warn`, show a brief business-impact sentence in the expanded view, visually distinct from the technical description. This connects each individual issue to a real consequence.

This may require adding a `businessImpact` field to check results from the scan pipeline, or deriving it on the frontend based on check ID/category. Evaluate which approach is cleaner.

Lower priority since the category-level business context (task 6 and 7) covers most of the value.

---

## Implementation order

| Priority | Task | Reason |
|----------|------|--------|
| 1 | Task 1: SiteHeader | Navigation is broken without it |
| 2 | Task 2: Fix accordion mobile overflow | Existing bug, must fix |
| 3 | Task 3: Hide passing checks | Focuses attention on problems |
| 4 | Task 4: Dynamic header + issue count | Small change, big framing impact |
| 5 | Task 5: Sticky overview + category nav | Core UX improvement |
| 6 | Task 8: Visual polish | Strengthens the emotional impact of scores |
| 7 | Task 6: Business context lines | Translates numbers into consequences |
| 8 | Task 7: Category summary cards | Better scanning experience |
| 9 | Task 9: Bottom CTA section | The conversion element |
| 10 | Task 11: Trust footer | Supports the CTA |
| 11 | Task 10: Sticky bottom bar | Enhancement once CTA exists |
| 12 | Task 12: Issue-level business impact | Nice-to-have, lower ROI |

## Notes

- All new copy needs both `en` and `sv` translation keys.
- All new components go in `apps/web/src/features/scan-results/`, not shared `/components`.
- Track CTA interactions with PostHog events.
- Keep `robots: { index: false }` on the scan page. These are private results.
