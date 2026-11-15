# AI Career Playbook — UK Edition
## Phase 5: Security, Scoring Method, Career Expansion & Data Refresh — Claude Code Handoff

This handoff is additive to the Phase 2 Implementation Reference and the Phase 4 Feedback Handoff. The decisions and evidence behind it are in **Phase5-Scoring-Reference.md** (v2) in the claude.ai project.

Work through the stages **in order**. Each stage is one commit. Build-check (`npx vite build`) before every commit. Stop after each commit and wait for Graham's confirmation before starting the next stage. Items marked **⚠ STRUCTURAL** change data shapes or downstream logic — handle with care and test end to end.

---

## Before starting — decisions and manual steps (all resolved)

**D1 — Model: CONFIRMED by Graham (15 Nov 2026).** Use `claude-sonnet-5-5`, replacing `claude-opus-4-8`. From Stage 1 the model is set only in the edge function (`MODEL` constant). If the Stage 7 quality comparison shows noticeably weaker output than Opus 4.8, revert by changing that one constant.

**D2 — Gauge colour thresholds: AGREED (confirm visually in Stage 4).** The new scores run lower, so the old thresholds (green ≥85, amber ≥70, red below) would paint most desk professions red. New: green ≥75, amber 45–74, deep orange below 45 (no red — a low score is not "avoid").

**M1 — Spending ceiling: RESOLVED.** Graham uses a $25 prepaid Anthropic credit balance. Graham to confirm **auto-reload is off** in the Anthropic Console billing settings, so the balance is the hard ceiling. No separate spend limit needed.

---

## Stage 1 — Lock down the edge function ⚠ STRUCTURAL (request contract)

**Problem:** `netlify/edge-functions/generate.js` passes the browser's `model`, `max_tokens` and `messages` straight to Anthropic. Anyone who finds `/api/generate` can run any prompt on any model using the key.

**Fix:**
1. Model and token limit set server-side only; anything the browser sends for them is ignored.
2. Only a single user message containing a string under 12,000 characters is accepted.
3. Netlify's built-in rate limiting (supported in code on all plans): 5 requests per 60 seconds per IP.

### 1a. Replace `netlify/edge-functions/generate.js` entirely with:

```javascript
// Server-side settings — the browser cannot change these.
const MODEL = "claude-sonnet-5-5"; // D1 confirmed 15 Nov 2026 (was claude-opus-4-8)
const MAX_TOKENS = 2000;
const MAX_PROMPT_CHARS = 12000;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async (req, context) => {
  if (req.method === "GET") {
    return json({ status: "ok" });
  }

  if (req.method !== "POST") {
    return json({ error: { message: "Use POST" } }, 405);
  }

  try {
    const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return json({ error: { message: "API key not set" } }, 500);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: { message: "Invalid request." } }, 400);
    }

    // Accept exactly one user message containing a string prompt.
    const messages = body && Array.isArray(body.messages) ? body.messages : [];
    const first = messages[0];
    if (
      messages.length !== 1 ||
      !first ||
      first.role !== "user" ||
      typeof first.content !== "string" ||
      first.content.trim().length === 0
    ) {
      return json({ error: { message: "Invalid request." } }, 400);
    }
    if (first.content.length > MAX_PROMPT_CHARS) {
      return json(
        { error: { message: "Your answers are too long. Please shorten them and try again." } },
        400
      );
    }

    // Use streaming to send first byte quickly and avoid 40s header timeout
    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        messages: [{ role: "user", content: first.content }],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return json({ error: { message: errText } }, apiResponse.status);
    }

    // Stream: collect all text chunks, then return as standard API format
    // We use a TransformStream to start the response immediately
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process stream in background
    (async () => {
      try {
        const reader = apiResponse.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        // Process one complete SSE line. Deltas whose "data:" line is split
        // across network chunks must be buffered first (see buffer handling
        // below) or their text is silently lost, corrupting the JSON.
        const handleLine = (line) => {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) return;
          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta && parsed.delta.text) {
              fullText += parsed.delta.text;
            }
          } catch {
            // skip non-JSON lines (event:, pings, blank lines)
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Keep any incomplete trailing line in the buffer for the next read.
          buffer += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            handleLine(buffer.slice(0, idx));
            buffer = buffer.slice(idx + 1);
          }
        }
        // Flush any final line left without a trailing newline.
        handleLine(buffer);

        // Write the complete response as standard API format
        const result = JSON.stringify({ content: [{ type: "text", text: fullText }] });
        await writer.write(encoder.encode(result));
      } catch (err) {
        const errResult = JSON.stringify({ error: { message: String(err) } });
        await writer.write(encoder.encode(errResult));
      } finally {
        await writer.close();
      }
    })();

    // Return streaming response immediately (first byte sent right away)
    return new Response(readable, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return json({ error: { message: String(err) } }, 500);
  }
};

export const config = {
  path: "/api/generate",
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
```

### 1b. `src/App.jsx` — update the fetch in `generate()`

Find:
```javascript
        body: JSON.stringify({ model: "claude-opus-4-8", max_tokens: 2000, messages: [{ role: "user", content: buildPrompt(a) }] }),
      });
      const data = await res.json();
```
Replace with:
```javascript
        body: JSON.stringify({ messages: [{ role: "user", content: buildPrompt(a) }] }),
      });
      if (res.status === 429) {
        setError("Too many requests from your connection. Please wait a minute and try again.");
        setStep(11); setLoading(false); return;
      }
      const data = await res.json();
```

### 1c. Test
- `vite dev` does not run edge functions. Either run `npx netlify dev` locally (needs `ANTHROPIC_API_KEY` in a local `.env` file — confirm `.env` is in `.gitignore` before creating it; never commit it), or push and test on the live site.
- Complete one playbook end to end — it must still generate.
- After deploy, check the Anthropic Console usage page shows only `claude-sonnet-5-5` being called.
- Rate limit: submit six playbooks within a minute from one device; the sixth should show the "Too many requests" message.

**Commit:** `Lock edge function: server-side model, input validation, rate limiting`

---

## Stage 2 — Replace `CAREER_DB` (44 careers, new scores, labels, growth) ⚠ STRUCTURAL

Changes:
- New five-factor AI resilience scores (out of 100 — not percentages).
- New field `ai`: "Mostly human" | "Augmented" | "Reshaped".
- `growth` re-sourced (Skills England 2026 / DCMS-Warwick 2026 / NFER).
- 11 new careers (salaries from National Careers Service job profiles; Physiotherapist from NHS Agenda for Change 2026/27 Bands 5–7).
- New optional field `note` (currently Software Developer only), shown on the career card in Stage 4.
- New sector value `"Media"`.
- Salaries for the existing 33 are unchanged.

### 2a. Replace the entire `CAREER_DB` constant with:

```javascript
// Full career database embedded in client.
// score = AI resilience points out of 100 (five-factor rubric — see README "Scoring method"). Not a percentage.
// ai = how AI changes the role (PwC 2026 classification first, then rubric rule).
// growth = demand outlook (Skills England 2026, DCMS/Warwick 2026, NFER).
const CAREER_DB = {
  "Advanced Nurse Practitioner": { score: 95, ai: "Mostly human", growth: "Strong demand", salary: "£49,000–£65,000", sector: "Healthcare", superpower: "Emotional Intelligence" },
  "Police Officer": { score: 95, ai: "Mostly human", growth: "Stable", salary: "£32,000–£52,000", sector: "Public Service", superpower: "Ethical Judgment" },
  "Armed Forces / Military": { score: 95, ai: "Mostly human", growth: "Stable", salary: "£27,000–£75,000", sector: "Public Service", superpower: "Physical Dexterity" },
  "Physiotherapist": { score: 95, ai: "Mostly human", growth: "Strong demand", salary: "£32,000–£56,500", sector: "Healthcare", superpower: "Physical Dexterity" },
  "Firefighter / Paramedic": { score: 90, ai: "Mostly human", growth: "Stable", salary: "£31,500–£48,000", sector: "Public Service", superpower: "Physical Dexterity" },
  "Physician / Surgeon": { score: 90, ai: "Mostly human", growth: "Strong demand", salary: "£113,500–£150,500+", sector: "Healthcare", superpower: "Ethical Judgment" },
  "Social Worker": { score: 90, ai: "Mostly human", growth: "Strong demand", salary: "£34,000–£52,000", sector: "Public Service", superpower: "Emotional Intelligence" },
  "Mental Health Therapist / Counsellor": { score: 85, ai: "Mostly human", growth: "Strong demand", salary: "£38,000–£75,000", sector: "Healthcare", superpower: "Emotional Intelligence" },
  "Special Educational Needs Teacher (SEN/SENCO)": { score: 85, ai: "Mostly human", growth: "Stable", salary: "£34,000–£58,000", sector: "Education", superpower: "Emotional Intelligence" },
  "Electrician": { score: 85, ai: "Mostly human", growth: "Strong demand", salary: "£36,000–£55,000", sector: "Trades", superpower: "Physical Dexterity" },
  "Plumber / Heating Engineer": { score: 85, ai: "Mostly human", growth: "Strong demand", salary: "£30,000–£55,000", sector: "Trades", superpower: "Physical Dexterity" },
  "Secondary School Teacher": { score: 80, ai: "Mostly human", growth: "Stable", salary: "£34,000–£53,000", sector: "Education", superpower: "Emotional Intelligence" },
  "Construction Manager": { score: 80, ai: "Reshaped", growth: "Strong demand", salary: "£52,000–£90,000", sector: "Trades", superpower: "Physical Dexterity" },
  "Renewable Energy Technician": { score: 75, ai: "Mostly human", growth: "Strong demand", salary: "£31,000–£50,000", sector: "Trades", superpower: "Physical Dexterity" },
  "Carpenter / Joiner / Bricklayer": { score: 75, ai: "Mostly human", growth: "Strong demand", salary: "£24,000–£45,000", sector: "Trades", superpower: "Physical Dexterity" },
  "Biomedical Engineer": { score: 70, ai: "Augmented", growth: "Strong demand", salary: "£28,000–£55,000", sector: "Science", superpower: "Creative Vision" },
  "Barrister": { score: 70, ai: "Augmented", growth: "Stable", salary: "£25,000–£100,000+", sector: "Law", superpower: "Ethical Judgment (note: bimodal — criminal legal aid vs. commercial earnings differ sharply)" },
  "School Careers Adviser / Pastoral Lead": { score: 65, ai: "Augmented", growth: "Stable", salary: "£28,000–£46,000", sector: "Education", superpower: "Emotional Intelligence" },
  "Diplomat (FCDO)": { score: 65, ai: "Augmented", growth: "Stable", salary: "£31,500–£55,000", sector: "Diplomacy", superpower: "Ethical Judgment" },
  "Performing Artist": { score: 65, ai: "Augmented", growth: "Variable", salary: "£20,000–£60,000", sector: "Creative", superpower: "Creative Vision" },
  "Business Leader / Senior Executive": { score: 65, ai: "Augmented", growth: "Strong demand", salary: "£85,000–£200,000+", sector: "Business", superpower: "Ethical Judgment" },
  "Financial Adviser (IFA)": { score: 65, ai: "Augmented", growth: "Stable", salary: "£40,000–£90,000", sector: "Business", superpower: "Emotional Intelligence" },
  "Civil / Mechanical Engineer": { score: 65, ai: "Augmented", growth: "Strong demand", salary: "£26,000–£63,000", sector: "Technology", superpower: "Creative Vision" },
  "Architect": { score: 65, ai: "Augmented", growth: "Strong demand", salary: "£31,000–£58,000", sector: "Technology", superpower: "Creative Vision" },
  "Agricultural / Horticultural Technician": { score: 65, ai: "Mostly human", growth: "Stable", salary: "£24,000–£38,000", sector: "Trades", superpower: "Physical Dexterity" },
  "Robotics Engineer": { score: 60, ai: "Augmented", growth: "Strong demand", salary: "£37,000–£75,000", sector: "Technology", superpower: "Creative Vision" },
  "Solicitor": { score: 55, ai: "Augmented", growth: "Stable", salary: "£40,000–£90,000", sector: "Law", superpower: "Ethical Judgment" },
  "Research Scientist": { score: 55, ai: "Augmented", growth: "Strong demand", salary: "£35,000–£60,000", sector: "Science", superpower: "Creative Vision" },
  "AI Governance / Policy Specialist": { score: 50, ai: "Augmented", growth: "Emerging", salary: "£45,000–£95,000", sector: "Diplomacy", superpower: "Ethical Judgment" },
  "Environmental Scientist": { score: 50, ai: "Augmented", growth: "Stable", salary: "£30,000–£55,000", sector: "Science", superpower: "Creative Vision" },
  "Journalist / Broadcaster": { score: 50, ai: "Reshaped", growth: "Variable", salary: "£23,000–£45,000", sector: "Media", superpower: "Ethical Judgment" },
  "Photographer / Film & TV Production": { score: 50, ai: "Reshaped", growth: "Variable", salary: "£17,000–£48,000 (often freelance)", sector: "Creative", superpower: "Creative Vision" },
  "Cybersecurity Professional": { score: 45, ai: "Augmented", growth: "Strong demand", salary: "£48,000–£95,000", sector: "Technology", superpower: "Ethical Judgment" },
  "Civil Servant / Policy Adviser": { score: 45, ai: "Augmented", growth: "Stable", salary: "£29,000–£50,000+", sector: "Diplomacy", superpower: "Ethical Judgment" },
  "Creative Director": { score: 40, ai: "Reshaped", growth: "Strong demand", salary: "£55,000–£95,000", sector: "Creative", superpower: "Creative Vision" },
  "Content Creator": { score: 40, ai: "Reshaped", growth: "Variable", salary: "£22,000–£55,000", sector: "Creative", superpower: "Creative Vision" },
  "Management Consultant / Economist": { score: 40, ai: "Reshaped", growth: "Stable", salary: "£27,000–£60,000", sector: "Business", superpower: "Ethical Judgment" },
  "AI/ML Engineer": { score: 35, ai: "Reshaped", growth: "Strong demand", salary: "£60,000–£100,000", sector: "Technology", superpower: "Creative Vision" },
  "UX/UI Designer": { score: 30, ai: "Reshaped", growth: "Strong demand", salary: "£35,000–£78,000", sector: "Creative", superpower: "Creative Vision" },
  "Accountant / Auditor": { score: 30, ai: "Reshaped", growth: "Stable", salary: "£36,000–£68,000", sector: "Business", superpower: "Ethical Judgment" },
  "Games Developer (programming)": { score: 30, ai: "Reshaped", growth: "Variable", salary: "£27,000–£71,000", sector: "Creative", superpower: "Creative Vision" },
  "Software Developer": { score: 20, ai: "Reshaped", growth: "Strong demand", salary: "£40,000–£85,000", sector: "Technology", superpower: "Creative Vision", note: "AI now lets non-coders build working software, while skilled developers use it alongside their own expertise. The value is shifting from writing code to designing systems and judging AI output — which makes getting in harder, but makes strong developers more valuable." },
  "Animator / VFX Artist": { score: 20, ai: "Reshaped", growth: "Variable", salary: "Variable (median c. £30,000)", sector: "Creative", superpower: "Creative Vision" },
  "Paralegal": { score: 15, ai: "Reshaped", growth: "Stable", salary: "£22,000–£40,000", sector: "Law", superpower: "Ethical Judgment" },
};

const CAREER_COUNT = Object.keys(CAREER_DB).length;
```

### 2b. `SECTOR_MAP` — add the missing `media` key (consistency; currently unused)

Replace the entire `SECTOR_MAP` constant with:
```javascript
const SECTOR_MAP = {
  healthcare: "Healthcare", tech: "Technology", trades: "Trades", creative: "Creative",
  media: "Media", business: "Business", law: "Law", science: "Science", education: "Education",
  public: "Public Service", diplomacy: "Diplomacy",
};
```

### 2c. Test
- Build passes; console shows no errors on load.
- `CAREER_COUNT` evaluates to 44 (temporarily `console.log` it, then remove).

**Commit:** `Replace career database: five-factor resilience scores, AI labels, 44 careers`

---

## Stage 3 — Rewrite `buildPrompt()` and the results merge ⚠ STRUCTURAL

Changes:
- The career list sent to Claude is generated from `CAREER_DB` (no more manual sync; exact names so database lookups work — currently short names like "Mental Health Therapist" fail to match the database key, so cards fall back to "Competitive" / "Growing").
- No % signs. Claude is told to use database scores unchanged and to apply the five factors for any career outside the database.
- The response schema adds `"l"` (label).
- V Levels added to the UK context line.

### 3a. Replace the entire `buildPrompt` function with:

```javascript
function buildPrompt(a) {
  const concernLabels = a.concerns.map((id, i) => `${i + 1}. ${CONCERNS.find(c => c.id === id)?.label || id}`).join("; ");
  const priorityLabels = a.priorities.map((id, i) => `${i + 1}. ${PRIORITIES.find(p => p.id === id)?.label || id}`).join("; ");
  const subjectLabels = a.subjectText || a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ");
  const interestLabels = a.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ");
  const careerList = Object.entries(CAREER_DB).map(([name, d]) => `${name} | ${d.score} | ${d.ai}`).join("\n");

  return `Return ONLY valid JSON. No markdown. No backticks. Start with { end with }. All strings under 80 chars. No special characters in values.

Student: ${a.grade} year group, interests: ${interestLabels}, priorities (ranked): ${priorityLabels}, subjects: ${subjectLabels}, activities: ${a.activities || "none"}, accomplishments: ${a.accomplishments || "none"}${a.specificCareer ? ", considering: " + a.specificCareer : ""}

Careers database (name | AI resilience score out of 100 | how AI changes the role):
${careerList}

Rules: Prefer careers from the database and copy the name exactly as written. Use the database score and label unchanged. Only if a career outside the database clearly fits this student better, include it and score it yourself: rate five factors 0 to 4 each (in-person and physical work; human trust and relationships; accountability and regulation; non-routine judgement; entry-level resilience), add them and multiply by 5. Label it Mostly human, Augmented or Reshaped. Scores are points out of 100, not percentages.

Use UK context throughout: salaries in GBP, qualifications as GCSEs/A-levels/T-Levels/V Levels/BTECs/UCAS, university not college, careers adviser not counselor.

{"careers":[{"n":"career name","s":65,"l":"Augmented","f":"why fits this student"}],"buildOn":[{"a":"their activity","c":"career connection","d":"deepen or add"}],"qs":["careers adviser question"],"concern":"response to their top concern: ${concernLabels}","aiTip":"how to combine their interests with AI skills"}

5 careers, 3 buildOn, 5 qs. Be specific to this student. All salary references in GBP.`;
}
```

### 3b. In `generate()`, replace the `careers:` mapping inside `fullPb`

Find:
```javascript
        careers: (parsed.careers || []).map(c => ({
          name: c.n || c.name || "Career",
          score: c.s || c.score || 80,
          fit: c.f || c.fit || "",
          insight: CAREER_DB[c.n || c.name]?.growth ? (CAREER_DB[c.n || c.name].growth + " projected growth") : "High demand field",
        })),
```
Replace with:
```javascript
        careers: (parsed.careers || []).map(c => {
          const name = c.n || c.name || "Career";
          const db = CAREER_DB[name];
          return {
            name,
            // Database score always wins; Claude's own score is used only for careers outside the database.
            score: db ? db.score : (Number(c.s ?? c.score) || 50),
            ai: db ? db.ai : (c.l || c.label || ""),
            fit: c.f || c.fit || "",
          };
        }),
```

### 3c. Test
- Generate three playbooks with different interest mixes (e.g. Healthcare; Technology + Creative; Media).
- Every career that exists in the database must show its database salary, demand and label (not "Competitive" / "Growing").
- Confirm at least one Media-interest run returns Journalist / Broadcaster or another sensible match.

**Commit:** `Rewrite prompt: database-driven career list, resilience scoring rules, AI labels`

---

## Stage 4 — Display changes

### 4a. Replace the entire `ScoreGauge` function with:

```javascript
// Arc gauge for AI resilience score (points out of 100 — not a percentage)
function ScoreGauge({ score, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  // D2: green 75+, amber 45–74, deep orange below 45. No red — a low score is not "avoid".
  const color = score >= 75 ? "#059669" : score >= 45 ? "#d97706" : "#c2410c";
  return (
    <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
      <path d={`M 6 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
        fill="none" stroke="var(--border-mid)" strokeWidth="10" strokeLinecap="round" />
      <path d={`M 6 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" fill="var(--text)"
        style={{ fontSize: size * 0.28, fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
        {score}<tspan fill="var(--text-muted)" style={{ fontSize: size * 0.13, fontWeight: 600 }}>/100</tspan>
      </text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="var(--text-muted)"
        style={{ fontSize: 9, fontFamily: "'Inter', sans-serif", letterSpacing: "0.5px" }}>AI RESILIENCE</text>
    </svg>
  );
}
```
Check in `vite dev` at both gauge sizes used (90 and 100): "/100" must not clip. Verify each gauge colour reaches at least 3:1 contrast against the card background (WCAG non-text contrast), consistent with the earlier contrast remediation; adjust the hex values if not.

### 4b. Career card — replace the `careerGrid` map block

Find the block starting `{pb.careers?.map((c, i) => {` inside `<div className="careerGrid">` (the one using `ScoreGauge score={c.score || dbEntry.score || 80}`) and replace the whole map with:

```javascript
              {pb.careers?.map((c, i) => {
                const dbEntry = CAREER_DB[c.name] || {};
                return (
                  <div key={i} className="careerCard">
                    <div className="ccRank">#{i + 1}</div>
                    <div className="ccGauge"><ScoreGauge score={c.score} size={90} /></div>
                    <div className="ccName">{c.name}</div>
                    <div className="ccMeta">
                      <span className="ccTag">{dbEntry.salary || "Salary varies"}</span>
                      <span className="ccTag grow">{dbEntry.growth ? `Demand: ${dbEntry.growth}` : "Demand: not assessed"}</span>
                    </div>
                    <div className="ccFit">{c.fit}</div>
                    {dbEntry.note && <div className="ccFit">{dbEntry.note}</div>}
                    {c.ai && <div className="ccInsight">💡 How AI changes this role: <strong>{c.ai}</strong></div>}
                  </div>
                );
              })}
```

### 4c. Brag sheet line

Find:
```javascript
              <BragRow label="Top AI-Resistant Matches" items={pb.careers?.map(c => `${c.name} (${c.score}% AI Resistant)`)} />
```
Replace with:
```javascript
              <BragRow label="Top AI-Resilient Matches" items={pb.careers?.map(c => `${c.name} (${c.score}/100 AI resilience${c.ai ? ", " + c.ai : ""})`)} />
```

### 4d. Career section description (explains the score and links to the method)

Find:
```javascript
            <p className="secDesc">Ranked by fit to {a.studentName || "your child"}'s profile. Scores from 17 cross-referenced research sources.</p>
```
Replace with:
```javascript
            <p className="secDesc">Ranked by fit to {a.studentName || "your child"}'s profile. AI resilience scores are points out of 100, based on five published factors (<a href="https://github.com/zero-conditional/ai-career-playbook-uk#scoring-method" target="_blank" rel="noopener noreferrer">method and sources</a>). Higher means more resilient. Not a prediction for any individual.</p>
```

**Commit:** `Display: AI resilience gauge, AI label and demand on career cards`

---

## Stage 5 — Copy and content updates (copy only)

Apply each find → replace exactly. Line numbers are approximate (pre-Phase 5).

| # | ~Line | Find | Replace with |
|---|---|---|---|
| 5.1 | 49 | The whole `desc:` string of the `debt_roi` concern | `"On average, a UK degree leaves graduates around £100,000 better off over their lifetime, after tax and student loan repayments — but subject matters enormously. IFS analysis of government LEO data shows returns ranging from around £60,000 worse off on average for Performing Arts to over £400,000 better off for Medicine and Economics. Around a quarter of graduates can expect to be financially worse off than if they had not gone to university. Source: IFS 'New estimates of the impact of undergraduate degrees on lifetime earnings' (June 2026), using DfE Longitudinal Education Outcomes (LEO) data."` |
| 5.2 | 310 | `TALKING_POINTS[0]` — the string beginning "PwC projects up to 30% of UK jobs…" | `"Most UK employers expect AI to reshape entry-level roles rather than replace them — 87% expect changes within three years, with routine research, drafting and admin shrinking (ISE Student Development Survey 2026). We want our child to build the judgement, communication and hands-on skills that stay human-led, alongside AI fluency."` |
| 5.3 | 916 | `data: "PwC found workers with AI skills command a 62% wage premium…"` (whole string) | `data: "PwC found UK job adverts requiring AI skills offer a 34% wage premium on average, up from 11% a year earlier (PwC UK AI Jobs Barometer 2026). Across 27 countries the average is 62%."` |
| 5.4 | 951 | `<span className="Wb">Free &nbsp;·&nbsp; 20+ research sources &nbsp;·&nbsp; 33 careers scored</span>` | `<span className="Wb">Free &nbsp;·&nbsp; UK research sources &nbsp;·&nbsp; {CAREER_COUNT} careers scored</span>` |
| 5.5 | 962–963 | `<div className="Wn">£500K+</div>` and `<div className="Wl">Lifetime earnings gap between highest and lowest returning degree subjects (IFS)</div>` | `<div className="Wn">£450K+</div>` and `<div className="Wl">Lifetime earnings gap between highest and lowest returning degree subjects (IFS, 2026)</div>` |
| 5.6 | 967–968 | `<div className="Wn">62%</div>` and `<div className="Wl">Average wage premium for AI skills (PwC, 2026)</div>` | `<div className="Wn">34%</div>` and `<div className="Wl">UK wage premium for AI skills in job adverts (PwC, 2026)</div>` |
| 5.7 | 981 | `Visual AI Resistance Gauges for career matches` | `Visual AI Resilience Gauges for career matches` |
| 5.8 | 1099 | `"Matching AI-resistant careers"` | `"Matching AI-resilient careers"` |
| 5.9 | 1146 | `Your Top AI-Resistant Career Matches` | `Your Top AI-Resilient Career Matches` |
| 5.10 | 1171 | `Your personalized roadmap from {gradeLabel} through college.` | `Your personalised roadmap from {gradeLabel} onwards.` |
| 5.11 | 1182 | `connect to AI-resistant careers.` | `connect to AI-resilient careers.` |
| 5.12 | 1279 | The meeting-kit line beginning `→ PwC found an average 62% wage premium…` | `→ PwC found UK job adverts requiring AI skills offer a 34% wage premium on average (62% across 27 countries) — it varies by sector but spans the economy, from healthcare and law to education and the trades (PwC 2026).` |
| 5.13 | 1428 | `<div className="arTitle">The 62% Rule</div>` | `<div className="arTitle">The AI Skills Premium</div>` |
| 5.14 | 1429 | `<div className="arSub">Workers with AI skills earn a 62% wage premium on average (PwC, 2026)</div>` | `<div className="arSub">UK job adverts requiring AI skills offer a 34% wage premium on average (PwC, 2026)</div>` |
| 5.15 | 1435–1440 | The whole Footer CTA block (`{/* ---- Footer CTA ---- */}` through its closing `</div>`) | See 5.15 code below |
| 5.16 | 1444 | `<p>Research from 17 sources: WEF, Goldman Sachs, McKinsey, PwC, ONS, NHS, Prospects, IFS, DfE, Stanford HAI, Anthropic, and 10 more.</p>` | `<p>Research from PwC, Skills England, IFS, DfE, ONS, NHS, ISE, Prospects and NFER. Method and sources: github.com/zero-conditional/ai-career-playbook-uk</p>` |
| 5.17 | 1449 | `· Research from WEF, PwC, IFS, DfE, ONS, NHS, Prospects, and Anthropic.` | `· Research from PwC, Skills England, IFS, DfE, ONS, NHS, ISE, Prospects and NFER.` |
| 5.18 | 192 | In the Year 11 `courses` string: `A-levels (typically 3 subjects), BTEC Level 3, T-Levels (technical, two-year, include substantial industry placement), or a Level 3 Apprenticeship.` | `A-levels (typically 3 subjects), T-Levels (technical, two-year, include substantial industry placement), V Levels (new vocational qualifications, each the size of one A-level, replacing many BTECs from September 2027), BTEC Level 3 where still offered, or a Level 3 Apprenticeship.` |
| 5.19 | 200 | `BTEC and T-Level students follow their programme's structure.` | `BTEC, V Level and T-Level students follow their programme's structure.` |
| 5.20 | 1371 | `A-levels (typically 3 subjects, academic), BTECs (vocational, coursework-based), T-Levels (technical, include a substantial industry placement), or a Level 3 Apprenticeship (earn while you learn).` | `A-levels (typically 3 subjects, academic), V Levels (new vocational qualifications replacing many BTECs from September 2027, each the size of one A-level), T-Levels (technical, include a substantial industry placement), or a Level 3 Apprenticeship (earn while you learn). BTECs remain available in some subjects during the changeover.` |
| 5.21 | 1386 | `the UCAS personal statement is 4,000 characters and takes longer to write well than most students expect.` | `the UCAS personal statement is now three questions with a 4,000-character total, and takes longer to write well than most students expect.` |

### 5.15 code — replacement footer block
```javascript
          {/* ---- Footer: method and sources ---- */}
          <div className="Rf no-print">
            <h3>How these scores work</h3>
            <p>{CAREER_COUNT} careers are scored for AI resilience using five published factors, with demand ratings from Skills England. Read the full method and sources on <a href="https://github.com/zero-conditional/ai-career-playbook-uk#scoring-method" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
          </div>
```

After applying, search `App.jsx` for any remaining `AI-Resistant`, `AI Resistant`, `AI resistance`, `62%`, `33 careers`, `17 sources`, `personalized` and `college` (where it means university) and report each hit to Graham before changing it.

**Commit:** `Copy: UK AI premium, IFS 2026, V Levels, UCAS format, resilience wording, footer`

---

## Stage 6 — README: scoring method and sources

### 6a. Add a new section to `README.md` immediately before `## Data sources`:

```markdown
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
```

### 6b. Update `## Data sources`

Under `### AI and future of work`, replace the two lines:
```markdown
- **PwC Global AI Jobs Barometer 2026** — wage premium for AI skills (62%, up from 57%)
- **PwC "Will robots really steal our jobs?" (2018)** — UK automation risk by sector
```
with:
```markdown
- **PwC Global AI Jobs Barometer 2026 and UK analysis** — UK AI skills wage premium (34.2%, up from 11%); global average 62%; professionalised vs democratised occupations
- **DfE Unit for Future Skills, "The impact of AI on UK jobs and training" (November 2023)** — occupational AI exposure (cross-check)
- **Skills England Annual Skills Report and Sector Skills Needs Assessments 2026; Occupations in Demand 2025** — demand outlook
- **DCMS / Warwick IER, "AI Skills for Life and Work: labour market and skills projections" (January 2026)** — AI-related occupation projections
- **NFER / Warwick IER, The Skills Imperative 2035** — long-run occupational projections
- **ISE Student Development Survey 2026; Prospects & ISE "AI and Early Careers" (April 2026)** — entry-level impact of AI
- **DWP "Young people and work: interim report" (Milburn Review, May 2026)** — entry-level labour market
```

Under `### Salary and labour market data`, add:
```markdown
- **National Careers Service job profiles** — salary ranges for careers added in Phase 5 (journalist/broadcaster, civil servant/policy, engineering, architect, carpentry/joinery/bricklaying, agricultural/horticultural, animation/VFX, games development, photography/film and TV, management consultancy/economics)
- **Skills England occupational maps** — median salary reference for animation/VFX roles
- **Prospects** — policy adviser progression salaries
```

Under `### UK education and careers`, add:
```markdown
- **DfE post-16 qualifications reform** — V Levels from September 2027
```

**Commit:** `README: scoring method, demand outlook definitions, updated sources`

---

## Stage 7 — Full end-to-end test before sharing

1. `npx vite build` passes with no warnings introduced by this phase.
2. Complete the nine-question flow three times with contrasting profiles (healthcare-focused; tech + creative; media + politics).
3. For every career card: gauge shows "N/100" and "AI RESILIENCE"; colour matches the D2 bands; salary, "Demand: …" and "How AI changes this role" all populated for database careers.
4. Software Developer, if returned, shows its note.
5. Brag sheet shows "(N/100 AI resilience, Label)".
6. Welcome screen: 44 careers, £450K+, 34%.
7. Footer: no "22-page research" text; GitHub method link opens the README Scoring method section.
8. Print preview: print footer shows the updated source list.
9. Rate limit and model checks from Stage 1 repeated on the live site.
10. **Model quality check (D1):** Graham compares the three Sonnet 5.5 playbooks against recent Opus 4.8 output — career fit explanations, careers adviser questions and the concern response. If noticeably weaker, change `MODEL` back to `claude-opus-4-8` in the edge function.

---

## Summary of structural changes

| Item | Change |
|---|---|
| Edge function request | Model (`claude-sonnet-5-5`) and max tokens server-side only; single user message ≤12,000 chars; rate limited 5/min/IP |
| `CAREER_DB` | 44 entries; new `ai` field; optional `note` field; new sector `"Media"`; scores are points out of 100 |
| `CAREER_COUNT` | New constant derived from `CAREER_DB`; replaces hard-coded 33 |
| Claude response schema | Career objects add `"l"` (label) |
| Results merge | Database score and label override Claude's; `insight` field removed from career objects |

## Open items not in this phase
- Occupation-level demand check for teachers and SEN teachers in the Skills England Occupations in Demand 2025 dataset.
- Refresh new-career salaries against ONS ASHE 2026 occupation tables.
- Longer term: build the prompt server-side from the answers object, so the endpoint accepts no free-form prompt at all.
- GA4 Measurement ID (from earlier open items).
