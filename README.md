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

### Graduate outcomes and returns
- **IFS "New estimates of the impact of undergraduate degrees on lifetime earnings" (June 2026)** — net lifetime earnings returns by subject, using DfE LEO data (supersedes the 2020 edition)
- **DfE Longitudinal Education Outcomes (LEO) dataset** — graduate earnings and employment outcomes by subject and institution
- **DfE Graduate Labour Market Statistics 2024** — graduate vs non-graduate median earnings (final edition; DfE discontinued this series from 2025, with LEO as the successor)
- **Discover Uni (discoveruni.gov.uk)** — official graduate outcome data by course and provider

### AI and future of work
- **WEF Future of Jobs Report 2025** — global job creation and displacement projections
- **PwC Global AI Jobs Barometer 2026** — wage premium for AI skills (62%, up from 57%)
- **PwC "Will robots really steal our jobs?" (2018)** — UK automation risk by sector
- **Institute of Student Employers (ISE)** — graduate recruitment survey, including tech/digital hiring trends
- **Anthropic** — AI capability context

### UK education and careers
- **UCAS** — application deadlines, personal statement guidance, Clearing process
- **National Careers Service (nationalcareers.service.gov.uk)** — job profiles and skills assessments
- **Prospects (prospects.ac.uk)** — graduate career paths and salary data
- **Student Finance England (gov.uk/student-finance)** — tuition fee loans and maintenance loan terms

## Origin

Built on [AI Career Playbook Generator](https://github.com/babithbhoop/ai-career-playbook) by Babith Bhoopalan (MIT licence). This is a substantially rebuilt UK version, not a fork tracking upstream. MIT licence retained in this repo as required.

## Licence

MIT — see LICENSE file.

---

Built by [Zero Conditional](https://github.com/graha)
