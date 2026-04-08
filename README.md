# Interactive Calendar Component

Frontend engineering challenge submission built with Next.js + React + Tailwind CSS.

## Objective

Recreate a wall-calendar inspired UI from a static reference and turn it into a polished, interactive, and responsive web component.

## Implemented Features

- **Single wall-calendar sheet** — One vertical page (like a printed calendar you hang): hero image on top, month ribbon overlay, then notes + date grid on the same card (not a separate “image panel” beside the calendar).
- **Monthly grid** with **Prev / Next** navigation and Monday-first week layout.
- **Date range selection** — Click start, then end; in-between days and hover preview while choosing; **Clear range** resets selection.
- **Integrated notes** — Text area tied to the current month; persisted in **`localStorage`** under a single JSON blob (`calendar-notes`) with per-month keys like `calendar-notes-YYYY-MM`.
- **Month change transition** — Outgoing sheet animates away while the next month renders underneath; the active month updates on **`animationend`** so timing stays aligned with CSS (no fixed-delay “pause” in the middle).
- **Visual polish** — Month-based accent colors on the ribbon, today ring on the current date, light press/hover feedback on controls, optional intro motion on first load.
- **Responsive** — Narrow max width matches a portrait wall calendar; layout stacks naturally on small screens.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Custom keyframe animations in global CSS

## Project Structure

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Main interactive calendar: grid, notes, range selection, month flip state |
| `src/app/globals.css` | Animations (card enter, page peel, underlay reveal, day pop) |
| `public/calendar-hero.png` | Hero artwork for the top of the calendar sheet |
| `public/ref-frames/` | Sample PNG frames extracted from a reference flip video (optional; for design comparison only) |

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## UX Notes

- Selecting a second date earlier than the first swaps so the range stays valid.
- Notes are per displayed month; switching months shows that month’s memo (or empty).
- No server, API, or database — strictly frontend, as required by the brief.
- Rapid repeated **Prev/Next** clicks are ignored while a month transition is in progress.

## Submission Checklist

- [ ] Public repository link
- [ ] Short demo video showing:
  - [ ] date range selection
  - [ ] notes usage
  - [ ] month change animation
  - [ ] desktop and mobile responsiveness
- [ ] Optional live deployment link (recommended)
