# Application sample data — build context

Checkpoint of the synthetic organisation dataset being built under `public/application/`.
Read this before continuing the work so decisions aren't re-litigated or silently reversed.

## Goal

A comprehensive, realistic sample dataset representing a real-world organisation, built up over time.
Company premise: based in Spain, offices worldwide. Target: 15,000–20,000 employees, hired/terminated
over 10+ years, headcount growing from a base of 10 along a realistic irregular path that has been
slowing for roughly the last 4 years.

**Hard requirement:** identifiers and generated attributes (names, birthdates, gender, ethnicity, location)
must stay the same across regenerations unless something specific is deliberately changed. This is why
generation is done with `@snaplet/copycat` (deterministic, keyed by id) rather than plain seeded `faker`.

## Current files (Phase 1 + Phase 2 of the original plan)

| File | Columns | Notes |
|---|---|---|
| `public/application/people.csv` | `personId, firstName, lastName, birthDate, genderId, ethnicBackgroundId, locationId` | 27,424 rows (incl. header); `personId` = `P000001`… |
| `public/application/locations.csv` | `locationId, country, city, sizeTier` | 20 offices, `locationId` = `L01`…`L20`; `L01` = Madrid HQ |
| `public/application/organisations.csv` | `organisationId, name` | Single row: `O001`, "Vilanova Global Group, S.A." (fictional employer) |
| `public/application/hr/workforce/engagements.csv` | `employmentId, personId, employerId, hireDate, terminationDate` | `employmentId` = `EM0000001`…; one row per person (no rehires yet); `terminationDate` empty = still active |

Latest generation run: 27,423 people ever hired, **16,325 currently active** (within the 15k–20k target).

## Generator

- Script: `scripts/generateGlobalWorkforce.ts` (compiles via the existing `tsconfig.scripts.json` pipeline).
- Run with: `npm run generate:globalWorkforce` (runs `tsc` then `node dist-scripts/generateGlobalWorkforce.js`).
- After regenerating, also run `npm run build` to refresh `public/applicationIndex.json`.
- Re-running with no code changes reproduces byte-identical output (verified).

### How it works

1. Builds a monthly timeline from Jan 2016 to the current month.
2. Target headcount per month = a single logistic curve (`GROWTH_STEEPNESS = 6.5`, `GROWTH_INFLECTION = 0.58`,
   `START_HEADCOUNT = 10` → `FINAL_TARGET = 17,500`) plus a bounded random-walk noise term
   (`NOISE_STEP = 0.03`, `MAX_NOISE = 0.1`) for the "irregular ups and downs."
   - Note: an earlier two-phase (logistic-then-decay) curve was tried and rejected — it produced an
     artificial flat plateau mid-timeline instead of one smooth accelerating-then-decelerating curve.
     Single logistic is the current, working approach.
3. Each month: existing active people roll against a tenure-based attrition hazard
   (`hazardForTenure`, ~13%/year blended, bathtub-shaped: elevated in year 1, lower mid-tenure, retirement
   ramp from age 63+). Then hires or extra layoffs reconcile actual headcount to that month's target.
4. All per-person attributes are derived via `copycat`/`fictional.oneOfWeighted` keyed on `personId` (or
   `locationId`/month index for simulation-flow randomness) — so tuning the curve/attrition parameters
   changes *who gets hired when*, but a given `personId`'s name/birthdate/gender/ethnicity/location stays
   fixed as long as that id still gets generated at all.
5. Names are locale-aware: each location has a weighted set of `@faker-js/faker` locale instances (e.g.
   Madrid mostly `es`, Tokyo mostly `ja`), seeded deterministically per person via `faker.seed(...)`.
6. Ethnic background: 9-category taxonomy (`white`, `black`, `eastAsian`, `southAsian`, `southeastAsian`,
   `hispanicLatino`, `middleEastern`, `indigenous`, `mixed`), each location has its own weighted distribution
   correlated with realistic local demographics (per user decision — not independent of location).

### Locations (20 total, weighted by size)

Madrid (HQ, largest) and Barcelona in Spain; major hubs in London, New York, Mexico City; medium offices in
Paris, Berlin, Milan, Lisbon, Amsterdam, São Paulo, Bogotá, Singapore, Tokyo, Mumbai, Dubai; small satellites
in Dublin, Buenos Aires, Sydney, Johannesburg. Full list with country/city/sizeTier in `locations.csv`.

## Key decisions already made (don't re-ask)

- New parallel dataset, not a reuse/extension of the old `people.csv`/`organisations.csv` stub data (that
  legacy scaffolding — `personId` `P00001`-style with no names — was moved by the user to top-level
  `public/people.csv` and `public/workforce/`, outside `application/`, and is unrelated/unused now).
- Split person-identity vs employment-event tables (not one flat file) — matches the old
  `HR_Workforce.png` ER diagram (Person / Person Employment).
- Tooling: `@snaplet/copycat` + `@faker-js/faker` (both installed as devDependencies).
- Id schemes: `personId` = `P######` (6-digit), `locationId` = `L##`, `organisationId` = `O###`,
  `employmentId` = `EM#######` (7-digit).
- Naming: "office" → renamed to "location" throughout (files, columns, code) per user request.
  "employments.csv" → renamed to "engagements.csv" and moved to `hr/workforce/` per user request.
  "employeeId"/"employee" → renamed to "personId"/"person" throughout per user request.
  "humanResources" directory → renamed to "hr".

## Open / not yet done (future phases from the original plan)

- Jobs / positions, org hierarchy beyond a single flat employer, compensation, contracts.
- Growth-curve fine-tuning is expected/welcome later — the tunable constants are all at the top of
  `scripts/generateGlobalWorkforce.ts` (`GROWTH_STEEPNESS`, `GROWTH_INFLECTION`, `ANNUAL_ATTRITION_RATE`,
  `NOISE_STEP`, `MAX_NOISE`, `FINAL_TARGET`).

## Environment quirk (unrelated to this dataset, but observed repeatedly)

Something in this environment auto-commits and pushes version-bump commits (`vX.Y.Z`) to `origin/main`
shortly after `npm install`/file changes — not triggered by Claude directly. Don't be surprised by commits
on `main` that weren't explicitly requested in a conversation.
