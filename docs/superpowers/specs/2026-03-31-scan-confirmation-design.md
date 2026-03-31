# Scan Submission Confirmation State

**Date:** 2026-03-31
**Status:** Approved

## Problem

After submitting a scan, the user sees a static green text label below the form. The form stays visible, creating a flat, anticlimactic experience for what should feel like a meaningful action.

## Solution

Replace the form with an animated confirmation state on successful submission. The confirmation shows a drawn checkmark, confirmation copy, and an outline button to scan another website.

## Behavior

### On submit success

1. **Form exits** (opacity 0, y -8, ~200ms ease-out)
2. **Confirmation enters** after ~150ms delay:
   - SVG checkmark: circle stroke draws in (~400ms), then checkmark path draws in (~200ms). Color: emerald-600.
   - Title: "Scan submitted" - fades in after checkmark completes
   - Subtitle: "We'll email you when your results are ready." - fades in 100ms after title
   - Outline button: "Scan another website" - fades in 100ms after subtitle
3. All content is center-aligned, occupying the same space as the form to prevent layout shift.

### On reset

Clicking "Scan another website" clears the form state, swaps back to the form with a reverse animation (confirmation fades out, form fades in).

### Error state

Unchanged. Errors still display as red text below the form.

## Components

### New: `apps/web/src/features/scan/scan-confirmation.tsx`

- Receives `onReset` callback prop
- Renders the animated checkmark SVG, title, subtitle, and outline button
- Uses `motion/react` for entrance animations
- SVG checkmark uses `stroke-dasharray` / `stroke-dashoffset` for the draw-in effect

### Modified: `apps/web/src/features/scan/scan-form.tsx`

- Add `submitted` boolean state, set to `true` on mutation success
- Wrap form and confirmation in `AnimatePresence mode="wait"` to swap between them
- `onReset`: sets `submitted` to `false`, calls `mutation.reset()` and `form.reset()`

## Copy

### English (`en.json` hero section)

- `confirmationTitle`: "Scan submitted"
- `confirmationSubtitle`: "We'll email you when your results are ready."
- `scanAnother`: "Scan another website"

### Swedish (`sv.json` hero section)

- `confirmationTitle`: "Analys skickad"
- `confirmationSubtitle`: "Vi mejlar er när resultaten är klara."
- `scanAnother`: "Analysera en till webbplats"

## Design tokens

- Checkmark color: `text-emerald-600` / `stroke-emerald-600`
- Checkmark size: 48px (circle radius ~20, stroke-width 2)
- Title: `font-heading text-lg font-bold`
- Subtitle: `text-sm text-muted-foreground`
- Button: outline variant, same width behavior as the submit button

## Constraints

- No new dependencies. Uses existing `motion/react` and hand-drawn SVG.
- Confirmation state must fit in the same bounding box as the form to avoid layout shift in the hero section.
- Works in both `hero` and `compact` form variants.
- Accessible: checkmark is decorative (`aria-hidden`), status text has `role="status"`, button is focusable.
