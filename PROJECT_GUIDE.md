# SQL Learning Arena Guide

## What This Project Does

SQL Learning Arena is an interactive Next.js application that helps you learn SQL progressively through game-like missions.

It covers:
- Relational SQL (filters, joins, grouping, many-to-many)
- Analytical SQL (window functions, CTEs, conditional aggregation)
- Object SQL (JSON/JSONB extraction and filtering)
- Spatial SQL (PostGIS distance/intersection)
- SGBD dialect differences (PostgreSQL vs SQL Server patterns)

Core learning mechanics:
- 15 campaign levels with unlock progression
- Rule-based mission validation and mastery score
- Live SQL coach feedback and clause-by-clause explanation
- Anti-pattern detection (`SELECT *`, implicit joins, `= NULL`, etc.)
- Mission quiz with bonus XP
- XP, stars, streak, lives, and countdown timer

## How To Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open in browser:

```text
http://localhost:3000
```

4. Run lint:

```bash
npm run lint
```

5. Build for production:

```bash
npm run build
```

## How To Play

1. Start at Level 1 and read the mission objective.
2. Edit the SQL query in the command console.
3. Click `Run Mission Check`.
4. Use hints only when needed (they reduce max score).
5. Review coach output and explanation panel.
6. Solve quiz for extra XP.
7. Move to next unlocked level.

## Project Structure

- `app/page.tsx`: game UI and state orchestration
- `app/lib/missions.ts`: all missions and learning content
- `app/lib/sql-coach.ts`: evaluation, scoring, explanation, and stats logic
- `app/lib/game-types.ts`: shared TypeScript types
- `app/globals.css`: visual theme and game styling

## Notes

- This MVP currently validates SQL structure with rule matching and learning heuristics.
- Next upgrade path: execute queries in a sandbox database for result-based validation.
