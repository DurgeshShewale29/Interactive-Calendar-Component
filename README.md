# Interactive Calendar Component

Frontend engineering challenge submission built with Next.js + React + Tailwind CSS.

## Objective

Recreate a wall-calendar inspired UI from a static reference and turn it into a polished, interactive, and responsive web component.

## Implemented Features

- Wall-calendar aesthetic with hero image and paper-card composition
- Monthly calendar grid with previous/next month navigation
- Date range selection:
  - pick start and end date
  - clear visual states for start, end, and in-between days
  - hover preview while selecting range
- Integrated notes section (month-specific memo area)
- Client-side persistence using `localStorage` (no backend)
- Responsive layout:
  - desktop: segmented hero + calendar panel
  - mobile: stacked layout with touch-friendly controls
- Additional polish:
  - month-based accent color changes
  - current day indicator

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Project Structure

- `src/app/page.tsx` - main interactive calendar component
- `public/calendar-hero.png` - hero image used in the wall calendar design

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

- Selecting a second date earlier than the first auto-adjusts the range.
- Notes are saved per month using keys like `calendar-notes-YYYY-MM`.
- No server/API/database is used (challenge scope kept strictly frontend).

## Submission Checklist

- [ ] Public repository link
- [ ] Short demo video showing:
  - [ ] date range selection
  - [ ] notes usage
  - [ ] desktop and mobile responsiveness
- [ ] Optional live deployment link (recommended)
