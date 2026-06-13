# AI Career Playbook — UK Edition · Project Brief

## What this project is

A UK localisation of an open-source US career-planning web app. The original ("AI-Proof Career Playbook Generator" by Babith Bhoopalan) lets a parent answer nine questions about their child and receive a personalised, AI-resistance-scored career playbook with a year-by-year action plan and printable meeting prep. This project rebuilds it for UK families: UK school stages, qualifications, careers terminology, salary data, and support services.

## Origin and licence

- Source repo: `babithbhoop/ai-career-playbook` (MIT licence).
- MIT permits modification and redistribution with attribution retained in the licence file. Original author branding (Quantumleap Insights, Babith Bhoopalan) is being **removed from the UI** but the MIT licence and its copyright notice are **retained in the repo** as required.
- This is a derivative work, not a fork tracking upstream. Clean git history under the user's own GitHub account.

## Audience

Built first for the user's own family, then shared informally with school parent peers and the child's cohort. So: must be robust enough to share publicly (no exposed keys, no broken US references, no personal data collection), but does not need commercial-grade polish or scale.

## Deployment target

Not yet fixed. The user is open to AWS but this is a **personal project** and must not be deployed on any employer/work AWS account. If AWS is used, it must be a separate personal AWS account. Other hosts (Netlify, Vercel, Cloudflare Pages) remain valid options and the original already runs on Netlify. The deployment decision is deferred to Phase 3; the build must not bake in assumptions that tie it to a specific host until then.

Whatever host is chosen, the pattern is the same: static frontend plus a serverless function holding the Anthropic API key server-side. The API key must never reach the client.

## Tech stack (unchanged from original)

- React 19 + Vite 7
- Anthropic Messages API via a server-side function (host TBD)
- Single-file architecture: nearly everything lives in `src/App.jsx` (~1,900 lines incl. inline CSS)
- Voice input via browser Web Speech API
- No database needed (the original Supabase feature-request form is being removed)

## Data sourcing decision

UK salary and job-growth figures are to be **researched during the build** using current UK sources: ONS, NHS Agenda for Change pay bands, Prospects, National Careers Service, HESA, gov.uk apprenticeship data. Figures must be sourced, not invented. Where a reliable UK figure cannot be found, flag it rather than approximate silently.

## What must change (localisation scope)

1. **School stages** — Replace US grades (8th–12th, Freshman/Sophomore/etc.) with UK stages: Years 9–11 (GCSE), Sixth Form / Years 12–13 (A-level / BTEC / T-Level), University, Adult. Update the `GRADES` array, year-plan templates, and all labels.
2. **Qualifications & process** — Replace SAT/ACT/AP/GPA/PSAT/Common App/FAFSA/dual enrolment with GCSEs, A-levels, BTECs, T-Levels, UCAS, personal statement, Student Finance England, and the UK university admissions timeline (UCAS deadlines, results day, Clearing).
3. **Career database** — Replace all USD salaries (BLS-derived) and US growth rates with UK figures (researched, sourced).
4. **Terminology** — "College counselor" → "careers adviser". "College" → "university" where it means tertiary education. Replace US activity examples (DECA, FBLA, varsity, Eagle Scout, honor roll) with UK equivalents (Duke of Edinburgh, NCS, prefect roles, EPQ, etc.).
5. **AI toolkit links** — Replace US-only tools (O*NET, CareerOneStop, Naviance, Common App, College Board BigFuture, Niche, Scoir, Handshake) with UK equivalents (UCAS, National Careers Service, Unifrog, Prospects, Springpod, etc.). Keep genuinely global tools (Claude, ChatGPT, Perplexity, Khan Academy, Google AI Essentials).
6. **The `buildPrompt()` function** — Rewrite so Claude returns UK-contextualised careers, UK salary framing, and "careers adviser" questions rather than US "counselor" questions.
7. **"Parent as Ally" section** — Rewrite the entire phased timeline for the UK admissions calendar (UCAS, not Common App / ED / National Decision Day).
8. **Branding & third-party services** — Remove Supabase feature-request form, Google Analytics tracking ID, and all original-author branding from the UI. Retain MIT licence file.

## What must NOT change

Core architecture, the React/Vite setup, the server-side API-proxy pattern, the visual components (score gauge, timeline, cards), voice input, and the nine-question flow. This is a content and localisation project, not a structural rebuild. Do not re-architect or "improve" working code unless a change is required by the localisation or the Netlify→Amplify port.

## Build phases

**Phase 1 — Baseline.** Get the original running locally unchanged. Confirm `vite dev` works and the API call succeeds with a test key. Establish the repo under the user's GitHub account. No edits to logic yet.

**Phase 2 — Static localisation.** UK-localise all static data and copy: `GRADES`, `CAREER_DB`, `CONCERNS`, `YEAR_TEMPLATES`, `DEMO_INTEREST_TEMPLATES`, `AI_TOOLKIT`, `TALKING_POINTS`, the "Parent as Ally" section, and all UI strings. Research and source UK salary/growth figures here. No structural code changes.

**Phase 3 — Prompt, port, rebrand, deploy.** Rewrite `buildPrompt()` for UK context. Decide the host (personal AWS account, Netlify, Vercel, or Cloudflare Pages — not a work account). Port the serverless function to whatever the chosen host needs. Strip Supabase/GA/branding. Deploy with the Anthropic key as a server-side environment variable.

## Working preferences (how to deliver in this project)

- Structured, staged, step-by-step. Do not skip implementation steps.
- Provide complete files or complete functions, not isolated snippets, when changing `App.jsx`.
- Use exact UI names, menu paths, field names, and settings for any AWS/GitHub/VS Code instruction.
- One clear recommendation over a spread of options.
- Clarify ambiguity before proceeding if it materially affects the outcome.
- The user is technically strong but not a programmer; assume strong technical literacy, limited programming syntax familiarity.
- Implementation happens in Claude Code (VS Code). This project (claude.ai) is for planning, structuring, prompt design, data research, and review. Keep that division.

## Current status

Phase 0 — project just created. Codebase audited. Next action: Phase 1 baseline setup.
