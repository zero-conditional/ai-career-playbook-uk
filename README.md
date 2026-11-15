# AI Career Playbook UK

A web app for UK parents and students to explore AI-resistant career paths,
built around the UK education system — school years, GCSEs, A-levels, UCAS,
and UK salary data.

Answer nine questions about a student's interests, subjects, and priorities.
The app generates a personalised career playbook with AI-resistance scores,
a year-by-year action plan, a careers adviser meeting kit, and a guide to
supporting your child through the UK education system.

## What it does

- Suggests careers ranked by AI-resistance, matched to the student's profile
- Shows UK salary ranges and growth outlook for each career, sourced from UK labour market data
- Generates a year-by-year plan from the student's current school year through to university or further education
- Provides a careers adviser meeting kit with AI-tailored questions
- Includes a six-phase guide to the UK education journey from Years 7–8 through to A-level Results Day, UCAS, and Clearing
- Supports voice input via the browser's Web Speech API

## Tech stack

- React 19 + Vite 7
- Anthropic Messages API (Claude Sonnet 4.6) via a serverless proxy
- Netlify (static frontend + edge function)
- Voice input via Web Speech API (browser-native, no external dependency)

## Deployment

Requires an Anthropic API key set as `ANTHROPIC_API_KEY` in your Netlify environment variables. The key is held server-side in the edge function and is never exposed to the client.

## Scoring method

### AI resilience score (out of 100)
Each career is rated 0–4 on five factors; ratings are multiplied by 5 and added (maximum 100). Equal weighting. Higher means more resilient to AI taking over the role. It is a points total — not a percentage, probability or rank — and not a prediction for any individual.

| Factor | 0 = | 4 = |
|---|---|---|
| In-person and physical work | Fully screen-based | Core work needs physical presence or manual skill in variable real-world settings |
| Human trust and relationships | No personal relationship central | Outcome depends on trust with a specific person |
| Accountability and regulation | Unregulated | Regulated profession, legally accountable |
| Non-routine judgement | Mostly routine information processing | Mostly novel, context-dependent decisions |
| Entry-level resilience | Junior tasks are research, drafting and admin AI now does | Junior tasks are hands-on, supervised practice |

Scores are cross-checked (not sourced) against DfE "The impact of AI on UK jobs and training" (2023), PwC's 2026 Global AI Jobs Barometer, and ISE/Prospects 2026 entry-level research. Where they disagree, the reason is recorded in the project's scoring reference.

### How AI changes the role
- **Mostly human** — AI is a minor support tool; the core work stays human
- **Augmented** — AI takes on parts of the work; human judgement stays central and AI skills raise the person's value
- **Reshaped** — AI can do much of today's task mix; the role continues in fewer, more senior or more specialised forms

Assigned from PwC's 2026 classification where it covers the occupation (professionalised → Augmented; democratised → Reshaped), otherwise by a fixed rule on the factor ratings.

### Demand outlook
- **Strong demand** — a named Skills England 2026 priority occupation in a sector projected to grow about 20% or more to 2035, in critical demand (Skills England Occupations in Demand 2025), or in an occupational group projected to grow fastest (NFER/Warwick)
- **Stable** — no strong growth signal; openings mainly replace people who leave
- **Emerging** — a new occupation growing from a small base
- **Variable** — mainly freelance or project-based work (overrides Strong demand)

## Data sources

### Salary and labour market data
- **ONS Annual Survey of Hours and Earnings (ASHE)** — median salary figures by occupation (SOC codes), 2026 (provisional results, released October 2026)
- **NHS Agenda for Change pay bands** — 2026/27 rates (effective 1 April 2026) for healthcare roles (Bands 6, 7, 8a)
- **NHS Doctors and Dentists Review Body (DDRB)** — consultant and GP pay, 2026/27
- **DfE School Teachers' Review Body (STRB)** — teacher pay scales, 2026/27
- **Police Remuneration Review Body** — police officer pay scales, 2026/27
- **NJC "Grey Book"** — firefighter pay rates, 2026
- **JIB (Joint Industry Board)** — electrician pay rates, 2026
- **CIPHE** — plumber and heating engineer shortage data
- **MoD Armed Forces Pay Review Body (AFPRB)** — military pay scales, 2026/27
- **FCDO / Civil Service** — Fast Stream and senior civil service salary ranges
- **Glassdoor UK, Indeed UK, CV-Library, talent.com, Robert Half** — advertised salary ranges for technology, creative, legal, and business roles, 2026
- **ICAEW** — accountancy salary benchmarks, 2026
- **Bar Council / Prospects.ac.uk** — barrister and solicitor earnings data
- **National Careers Service job profiles** — salary ranges for careers added in Phase 5 (journalist/broadcaster, civil servant/policy, engineering, architect, carpentry/joinery/bricklaying, agricultural/horticultural, animation/VFX, games development, photography/film and TV, management consultancy/economics)
- **Skills England occupational maps** — median salary reference for animation/VFX roles
- **Prospects** — policy adviser progression salaries

### Graduate outcomes and returns
- **IFS "New estimates of the impact of undergraduate degrees on lifetime earnings" (June 2026)** — net lifetime earnings returns by subject, using DfE LEO data (supersedes the 2020 edition)
- **DfE Longitudinal Education Outcomes (LEO) dataset** — graduate earnings and employment outcomes by subject and institution
- **DfE Graduate Labour Market Statistics 2024** — graduate vs non-graduate median earnings (final edition; DfE discontinued this series from 2025, with LEO as the successor)
- **Discover Uni (discoveruni.gov.uk)** — official graduate outcome data by course and provider

### AI and future of work
- **WEF Future of Jobs Report 2025** — global job creation and displacement projections
- **PwC Global AI Jobs Barometer 2026 and UK analysis** — UK AI skills wage premium (34.2%, up from 11%); global average 62%; professionalised vs democratised occupations
- **DfE Unit for Future Skills, "The impact of AI on UK jobs and training" (November 2023)** — occupational AI exposure (cross-check)
- **Skills England Annual Skills Report and Sector Skills Needs Assessments 2026; Occupations in Demand 2025** — demand outlook
- **DCMS / Warwick IER, "AI Skills for Life and Work: labour market and skills projections" (January 2026)** — AI-related occupation projections
- **NFER / Warwick IER, The Skills Imperative 2035** — long-run occupational projections
- **ISE Student Development Survey 2026; Prospects & ISE "AI and Early Careers" (April 2026)** — entry-level impact of AI
- **DWP "Young people and work: interim report" (Milburn Review, May 2026)** — entry-level labour market
- **Institute of Student Employers (ISE)** — graduate recruitment survey, including tech/digital hiring trends
- **Anthropic** — AI capability context

### UK education and careers
- **UCAS** — application deadlines, personal statement guidance, Clearing process
- **National Careers Service (nationalcareers.service.gov.uk)** — job profiles and skills assessments
- **Prospects (prospects.ac.uk)** — graduate career paths and salary data
- **Student Finance England (gov.uk/student-finance)** — tuition fee loans and maintenance loan terms
- **DfE post-16 qualifications reform** — V Levels from September 2027

## Origin

Built on [AI Career Playbook Generator](https://github.com/babithbhoop/ai-career-playbook) by Babith Bhoopalan (MIT licence). This is a substantially rebuilt UK version, not a fork tracking upstream. MIT licence retained in this repo as required.

## Licence

MIT — see LICENSE file.

---

Built by [Zero Conditional](https://github.com/graha)
