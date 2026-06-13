# AI Career Playbook — Source Reference & UK Localisation Map

This document is the working reference for Phase 2. It extracts every data structure in `src/App.jsx` that contains US-specific content, shows the original, and records the agreed UK replacement approach. The full file lives in the local repo / Claude Code; this is the planning surface.

All structures below live in one file: `src/App.jsx` (~1,900 lines, inline CSS). Line numbers are from the original and will drift once editing begins — treat them as a guide, not an anchor.

---

## The answer object (what the app collects)

The nine-question flow populates an object `a` with this shape. Knowing it matters because `buildPrompt()` and the templates read from it.

```
{
  grade,            // school stage id (e.g. "8th", "9th"…) — TO BE UK-MAPPED
  interests: [],    // array of interest ids
  priority,         // single priority id
  techComfort,      // tech comfort id
  concern,          // single concern id
  subjects: [],     // subject ids (legacy multi-select)
  subjectText,      // free text / voice answer about subjects
  activities,       // free text
  accomplishments,  // free text
  specificCareer,   // optional free text — a career they're considering
  extraContext,     // optional free text
  studentName,      // optional
}
```

UK note: `grade` is the single biggest structural id change. Every id used as a key in `YEAR_TEMPLATES` and `getYearPlan()` must stay consistent with whatever new ids we choose.

---

## 1. GRADES (school stages) — `~line 47`

**Original (US):**
| id | label | years |
|----|-------|-------|
| 8th | 8th Grade or Below | 5 |
| 9th | 9th Grade (Freshman) | 4 |
| 10th | 10th Grade (Sophomore) | 3 |
| 11th | 11th Grade (Junior) | 2 |
| 12th | 12th Grade (Senior) | 1 |
| college | Already in College | 0 |
| adult | Adult exploring for myself | 0 |

**UK replacement (proposed):**
| id | label | years |
|----|-------|-------|
| y9 | Year 9 or below | 5 |
| y10 | Year 10 (GCSE) | 4 |
| y11 | Year 11 (GCSE) | 3 |
| y12 | Year 12 (Sixth Form / Lower Sixth) | 2 |
| y13 | Year 13 (Sixth Form / Upper Sixth) | 1 |
| university | Already at university | 0 |
| adult | Adult exploring for myself | 0 |

Decision needed: keep five pre-18 stages (Y9–Y13) to mirror the original's five-stage ladder. `years` = years until leaving school, used to slice the year plan. Mapping holds.

---

## 2. INTERESTS — `~line 57`

Mostly transferable. Only the example text (`ex`) needs light UK tuning. The ids and labels are fine. Example: "Public Service & Emergency" examples reference "military, EMT" — EMT → paramedic.

No structural change. Minor copy edits only.

---

## 3. PRIORITIES, TECHC — `~line 70, 77`

Fully transferable. No change.

---

## 4. CONCERNS — `~line 84`

**Original** references "College debt won't pay off". UK note: UK student finance is income-contingent loan repayment, not US-style debt. The "debt_roi" concern should be reframed:
- `debt_roi` label → "University costs won't pay off in this economy" or reframed around tuition fees + maintenance loans and graduate outcomes.

Other four concerns transfer cleanly.

---

## 5. SUBJECTS & SUBJECT_KEYWORDS — `~line 92, 100`

Subjects list is fine (Math → "Maths" label change). Keyword map is US-spelled in places ("math") — keep "math" AND add "maths" to the keyword array so both match. Add UK subject terms: "further maths", "btec", "epq". Low effort.

---

## 6. CAREER_DB — `~line 133` — **biggest data task**

31 careers, each with `score`, `growth` (US %), `salary` (USD, BLS-derived), `sector`, `superpower`. The scores and sectors are model-judgments and can stay. **Growth % and salary must be replaced with UK figures (researched, sourced — per brief).**

Original entries (score / US growth / US salary):
- Mental Health Counselor 98 / 22% / $48,520
- Firefighter / EMT 97 / 4% / $50,700
- Physician / Surgeon 96 / 3% / $229,300+
- School Counselor 96 / 11% / $60,140
- Diplomat / FSO 95 / Stable / $75–180K
- Special Education Teacher 95 / 4% / $62,950
- Nurse Practitioner 94 / 45.7% / $120,680
- Electrician 94 / 11% / $60,240+
- Plumber / HVAC Tech 94 / 12–16% / $59,880
- Social Worker 93 / 7% / $55,350
- Renewable Energy Tech 92 / 22–44% / $56,900+
- AI Governance Diplomat 92 / New field / $90–160K
- Performing Artist 91 / 6% / $40–80K
- CEO / Executive 90 / 3% / $189,520+
- K-12 Teacher 89 / 4% / $61,690
- Cybersecurity Professional 88 / 32% / $112,000
- Military / Defense 88 / Stable / $45–120K
- Construction Manager 87 / 8% / $101,480
- Environmental Scientist 86 / 6% / $76,530
- Creative Director 85 / 6% / $100,000+
- Robotics Engineer 85 / 15% / $100,000+
- Biomedical Engineer 83 / 5% / $99,550
- Trial Lawyer 82 / 8% / $135,740
- Research Scientist 80 / 8% / $83,000+
- AI/ML Engineer 78 / 36% / $130,000+
- UX/UI Designer 78 / 16% / $83,000+
- Financial Advisor 76 / 13% / $95,390
- Content Creator 65 / Shifting / $48–80K
- Software Developer 62 / Variable / $127,260
- Accountant / Auditor 45 / Declining / $78,000
- Paralegal 35 / Declining / $59,200

UK localisation tasks for this table:
1. **Rename** US-specific titles: "School Counselor" → "School Careers Adviser" or "Pastoral Lead"; "K-12 Teacher" → "Secondary School Teacher"; "Firefighter / EMT" → "Firefighter / Paramedic"; "Diplomat / FSO" → "Diplomat (FCDO)"; "Plumber / HVAC Tech" → "Plumber / Heating Engineer".
2. **Salary** → UK figures (£), sourced from ONS ASHE, NHS Agenda for Change bands, Prospects, gov.uk.
3. **Growth** → UK direction/figures where available; otherwise a qualitative UK label ("Strong demand", "Stable", "Declining") rather than an unsourced %.
4. Scores/sectors/superpowers: keep.

Research output will be a separate sourced table before any code change.

---

## 7. SECTOR_MAP — `~line 167`

Transferable. No change.

---

## 8. buildPrompt() — `~line 178`

The compact JSON prompt. Currently:
- Embeds a US careers shortlist in the prompt text.
- Asks for `"qs":["counselor question"]` — US "counselor".
- Frames careers/salary in US terms implicitly.

UK rewrite needs:
- Replace the embedded careers shortlist with the UK-renamed list.
- `"counselor question"` → `"careers adviser question"`.
- Add an instruction to use UK salary framing (£, UK context) and UK qualifications where the model references next steps.
- Keep the strict "return only JSON" formatting rules exactly — they prevent parsing failures.

Full rewrite drafted in Phase 3, not Phase 2.

---

## 9. YEAR_TEMPLATES + getYearPlan() — `~line 195`

A single base template keyed `"8th"` holds six year-rows; `getYearPlan()` slices it from the student's current stage. Each row has: `year`, `courses`, `activities`, `summer`, `portfolio`, `aiMilestone`.

Heavy US content:
- Year labels ("8th Grade"… "College Year 1") → UK ("Year 9"… "University Year 1").
- "Honors/AP track", "dual enrollment", "SAT/ACT prep" → "GCSE options", "A-level / BTEC choices", "UCAS prep", "EPQ".
- "college essays" / "college applications" → "personal statement" / "UCAS application".
- "Summer camp / pre-college program" → UK equivalents (summer schools, university taster days, NCS, work experience).

The base template must be rebuilt for UK with the new stage ids. `getYearPlan()`'s `gradeOrder` array must match the new GRADES ids.

---

## 10. DEMO_INTEREST_TEMPLATES — `~line 215`

Per-interest activity suggestions. US-specific items to replace:
- "DECA, FBLA" (business clubs) → "Young Enterprise, school enterprise society".
- "Habitat for Humanity" → UK volunteering (e.g. local community projects, NCS).
- "Red Cross first aid / CPR certification" → "St John Ambulance first aid course".
- "Model UN" → keep (exists in UK), can add "debating society / ESU".
- "union apprenticeship / trade school" → "college apprenticeship / T-Level / local FE college".
- "school paper op-ed" → fine (UK schools have these).
- General: "colleges value" → "universities value"; "admissions" → "UCAS / admissions tutors".

All ten interest categories need a copy pass. Structure unchanged.

---

## 11. TALKING_POINTS — `~line 283`

Three stat-based talking points for the careers-adviser meeting. Already partially UK-aware (one cites "in the UK"). Verify all three stats against current UK-applicable sources and keep attribution honest. The PwC +56%, WEF 170m/92m, and Goldman tech-grad figures should be checked and dated.

---

## 12. AI_TOOLKIT — `~line 744` — **large link-replacement task**

Nine sections (keyed 1–9, one per question step), four tools each. Replace US-only services; keep genuinely global ones.

**Keep (global):** ChatGPT, Claude, Perplexity, Google AI Essentials, Khan Academy + Khanmigo, MIT OCW, GitHub Copilot, NotebookLM, Wolfram Alpha, Grammarly, LinkedIn, Glassdoor, WEF Future of Jobs.

**Replace (US-only) → UK equivalent:**
- Coach by CareerVillage (US HS) → UCAS career quiz / Springpod.
- O*NET Interest Profiler / mynextmove → National Careers Service skills assessment (nationalcareers.service.gov.uk).
- CareerOneStop (BLS) → National Careers Service / ONS / LMI for All.
- O*NET Online → National Careers Service job profiles.
- Burning Glass / Lightcast → keep (global, has UK data) or Lightcast UK.
- Naviance → Unifrog (UK school platform) or Start Profile.
- Handshake → Prospects (prospects.ac.uk) / RateMyApprenticeship.
- Common App Activities guide → UCAS personal statement guidance.
- College Board BigFuture → UCAS course search.
- Niche.com → Unistats / Discover Uni (discoveruni.gov.uk) / The Student Room.
- FAFSA (studentaid.gov) → Student Finance England (gov.uk/student-finance).
- Teal / resume builder → keep but reframe "resume" → "CV".
- YouScience → Morrisby (UK aptitude assessment used in schools).
- Google Career Dreamer → keep if UK-available; else Springpod.

Also: every "resume" → "CV"; "college" → "university"; "counselor" → "careers adviser" throughout the tool descriptions.

---

## 13. Branding & third-party services to strip — various lines

- `trackEvent()` / Google Analytics ID (`~line 29`) — remove or replace with own.
- Supabase feature-request form — remove entirely (DB dependency, original author's).
- "Quantumleap Insights" / "Babith Bhoopalan" branding in the UI — remove.
- MIT licence file — **retain** in repo (attribution requirement).
- API model string check: original calls `claude-sonnet-4-20250514` (`~line 997`). Confirm current model string at build time via the product-self-knowledge skill / docs before deploy.

---

## Phase 2 work order (recommended)

1. GRADES + getYearPlan ids (structural — do first, everything keys off it).
2. YEAR_TEMPLATES rebuild (depends on 1).
3. CAREER_DB — research UK salary/growth table, then replace.
4. AI_TOOLKIT link replacement.
5. DEMO_INTEREST_TEMPLATES copy pass.
6. CONCERNS, SUBJECTS/keywords, INTERESTS examples, TALKING_POINTS — copy passes.
7. Strip branding/Supabase/GA.

`buildPrompt()` rewrite and the host port are Phase 3.

---

## Open decisions to confirm before Phase 2 coding

1. GRADES ids: use `y9`–`y13` + `university` + `adult`? (proposed above)
2. CAREER_DB growth: use sourced UK % where available, else qualitative label? (proposed: yes)
3. Any careers to add/remove for UK relevance? (e.g. add "Solicitor" distinct from "Trial Lawyer/Barrister"; "GP" distinct from "Surgeon")
