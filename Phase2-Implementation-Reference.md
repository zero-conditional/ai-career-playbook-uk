# AI Career Playbook — UK Edition
## Phase 2 Implementation Reference (corrected against actual `App.jsx`)

**This supersedes all earlier Phase 2 drafts.** Earlier planning (done before the real file was available) got several structures wrong — `YEAR_TEMPLATES`, `AI_TOOLKIT`, `DEMO_INTEREST_TEMPLATES`, and `TALKING_POINTS` all have different shapes than originally drafted. This document is written against the actual code you uploaded and is a direct drop-in replacement for each block.

Apply these in order. Each block below replaces the entire corresponding `const` or `function` in `src/App.jsx`. Line numbers refer to your uploaded copy and will drift after the first edit — find each block by its `const NAME` or `function NAME` declaration instead.

---
## 1. GRADES (replaces lines ~47–55)

```javascript
const GRADES = [
  { id: "y8", label: "Year 8 or below", years: 6 },
  { id: "y9", label: "Year 9", years: 5 },
  { id: "y10", label: "Year 10 (GCSE)", years: 4 },
  { id: "y11", label: "Year 11 (GCSE)", years: 3 },
  { id: "y12", label: "Year 12 (Sixth Form or College)", years: 2 },
  { id: "y13", label: "Year 13 (Sixth Form or College)", years: 1 },
  { id: "university", label: "Already at university", years: 0 },
  { id: "adult", label: "Adult exploring for myself", years: 0 },
];
```

No other code changes are needed for this rename — `a.grade` is referenced generically throughout the file (dropdown, button list, `buildPrompt()`, `getYearPlan()` call). As long as `YEAR_TEMPLATES` and `getYearPlan()`'s `gradeOrder` (next section) use matching ids, everything downstream resolves correctly.

---
## 2. YEAR_TEMPLATES + getYearPlan() (replaces lines ~195–213)

**Structural note:** the original is a single array of 6 rows stored under the `"8th"` key; every other grade key is `null`. `getYearPlan()` slices that one array by index. The UK version keeps this exact pattern — one array of 7 rows stored under `"y8"`, sliced via the new `gradeOrder`. Do not convert this into 7 separate object keys.

```javascript
const YEAR_TEMPLATES = {
  "y8": [
    {
      year: "Year 8 or Below",
      courses: "Focus on breadth across all subjects — this is the time to discover what genuinely interests you, not to specialise. Keep Maths, English, and sciences strong. Start exploring creative, technical, and humanities subjects equally. Talk to your teachers about which GCSE options you'll be choosing in Year 9.",
      activities: "Join clubs that stretch you beyond your comfort zone — drama, coding, sports, debating, or art. Start the Duke of Edinburgh Bronze Award if your school offers it at this stage. Volunteer locally. Try things you might not stick with — this is exactly the right time for that.",
      summer: "Work experience taster days, summer reading, a creative project, or a local volunteering stint. STEM summer schools (many are free — check Nuffield Research Placements and the Smallpeice Trust). Don't over-schedule; unstructured time to explore personal interests matters here.",
      portfolio: "Start a simple journal or notes document tracking what you enjoy, what you're good at, and what you've tried. No formal portfolio needed yet — just building awareness of your strengths.",
      aiMilestone: "Use an AI assistant (Claude, ChatGPT) to explore careers you're curious about. Ask it to explain what different jobs actually involve day-to-day, not just job titles."
    },
    {
      year: "Year 9",
      courses: "GCSE option choices are typically made this year — one of the most consequential decisions of secondary school. Keep Maths and English (compulsory). Think carefully about which optional subjects align with possible career directions, but don't over-narrow. Talk to your careers adviser before finalising choices.",
      activities: "Duke of Edinburgh Bronze Award. School leadership roles (form representative, prefect duties if available). Start building a track record of commitment in one or two activities rather than sampling many. Springpod virtual work experience placements are available from Year 9.",
      summer: "Springpod or Speakers for Schools virtual work experience. Local volunteering. Begin researching what different career paths actually require — qualifications, timelines, entry routes. A short coding or creative skills course online (free options: Khan Academy, FutureLearn).",
      portfolio: "Record your GCSE option choices and the reasoning behind them. Note any work experience, volunteering, or new skills. Keep it brief — a running document is fine.",
      aiMilestone: "Use the National Careers Service skills assessment alongside an AI tool to explore how your school subjects connect to real careers."
    },
    {
      year: "Year 10 (GCSE)",
      courses: "First year of GCSE study. Build consistent study habits early — the groundwork laid in Year 10 directly affects Year 11 outcomes. If your school offers it, consider whether an EPQ (Extended Project Qualification) could begin in Year 10 or 11 — universities value it. BTECs running alongside GCSEs count; know what qualifications you're actually working toward.",
      activities: "Duke of Edinburgh Bronze completion if not already done; start Silver. School clubs, sports teams, arts productions — admissions tutors and employers look for sustained commitment over time. First formal work experience placement (many schools organise this in Year 10).",
      summer: "Year 10 summer is ideal for a first real work experience placement if school hasn't arranged one. NHS work experience, local law firms, engineering companies, and creative agencies all offer placements. NCS (National Citizen Service) runs summer programmes for 15–17 year olds.",
      portfolio: "Document your work experience: what you did, what you observed, what surprised you. One honest paragraph is more useful than a polished brochure.",
      aiMilestone: "Use Springpod's AI-powered career matching alongside your own research. Ask an AI to help you write a reflection on your work experience."
    },
    {
      year: "Year 11 (GCSE)",
      courses: "GCSE exam year. Prioritise revision planning from September. Research post-16 options: A-levels (typically 3 subjects), BTEC Level 3, T-Levels (technical, two-year, include substantial industry placement), or a Level 3 Apprenticeship. Applications to sixth form, FE college, or apprenticeships usually open in autumn/winter. You are legally required to remain in education or training until age 18.",
      activities: "Keep commitments manageable during exam term but don't drop everything. Duke of Edinburgh Silver Award ongoing. Prefect or leadership roles strengthen applications. Careers fair attendance.",
      summer: "Post-GCSE summer is a significant window. Results Day is in late August. Before results: rest, but have a back-up option for sixth form or college in case grades differ from predictions. After results: use remaining summer for reading, a skill, or work/volunteering.",
      portfolio: "Finalise a clear record of GCSEs (predicted and actual), work experience, volunteering, and activities. This becomes the foundation for sixth form applications and, later, your UCAS personal statement.",
      aiMilestone: "Use an AI tool to research the difference between A-level, BTEC, T-Level, and apprenticeship routes for your area of interest."
    },
    {
      year: "Year 12 (Sixth Form / College)",
      courses: "First year of post-16 study. A-level students typically take 3–4 subjects. BTEC and T-Level students follow their programme's structure. EPQ is strongly recommended if available. Begin thinking about university vs. degree apprenticeship vs. employment. UCAS opens for the following year's cycle.",
      activities: "Duke of Edinburgh Gold Award. Sixth form or college leadership. Part-time work if manageable. Attend university open days from summer of Year 12. Springpod virtual industry placements. Young Enterprise company programme.",
      summer: "University open days (June–September). Summer internship, work placement, or shadowing. Insight programmes at law firms, NHS, banks, engineering companies. Begin drafting personal statement ideas. NCS leadership programmes. Nuffield Research Placements.",
      portfolio: "Start your UCAS personal statement draft. Record open days attended and your notes on each. If considering degree apprenticeships, research which companies recruit and when.",
      aiMilestone: "Use Claude or Perplexity to research universities and courses — entry requirements, course content, graduate outcomes (check Discover Uni for official data)."
    },
    {
      year: "Year 13 (Sixth Form / College)",
      courses: "A-level, BTEC, or T-Level final year. Exam preparation is the primary academic focus from January. EPQ submission typically autumn/winter. UCAS application deadline for most courses: 29 January. Oxford, Cambridge, and medicine/dentistry/veterinary science: 15 October deadline. Personal statement: 4,000 characters, genuinely personal.",
      activities: "Maintain existing commitments — consistent involvement looks better than dropping everything to 'focus on studying'. Leadership roles at peak value here. Interview preparation for university admissions and degree apprenticeship assessment centres.",
      summer: "Results Day: A-level results published mid-August. If grades meet offers: confirm your place. If grades miss: Clearing — places at good universities are real. If grades exceed offers: Adjustment. Pre-university: read widely in your subject, set up student finance, sort accommodation.",
      portfolio: "Final UCAS personal statement. Record of all open days, work experience, volunteering, and achievements for interview preparation.",
      aiMilestone: "Use an AI tool to practise for university or apprenticeship interviews. Use Discover Uni to compare graduate salary and employment outcomes before final decisions."
    },
    {
      year: "University / Further Education Year 1",
      courses: "Whether at university, on a degree apprenticeship, or in higher-level FE, Year 1 sets the habits that define the rest of your studies. University: join your department's student society and at least one non-academic society in the first week. Degree apprenticeship: balance academic study with workplace performance from day one.",
      activities: "Student union roles, course representative, volunteering, part-time work. University careers service: register in Week 1. Graduate employers recruit on rolling cycles — many summer internship applications open in October of Year 1.",
      summer: "First-year summer internship applications open from October — apply in your first term. Competitive graduate employers (banks, consultancies, law firms, engineering companies) have structured Year 1 insight and internship programmes.",
      portfolio: "Begin a professional CV. Record university societies, leadership roles, academic projects, and skills gained. Start building a LinkedIn network.",
      aiMilestone: "Use LinkedIn and Prospects alongside AI tools to map graduate career paths from your degree. Use NotebookLM to organise your career research notes."
    },
  ],
  "y9": null, "y10": null, "y11": null, "y12": null, "y13": null, "university": null, "adult": null,
};

// Generate year plan from templates starting at the right grade
function getYearPlan(gradeId) {
  const allYears = YEAR_TEMPLATES["y8"]; // base template
  const gradeOrder = ["y8", "y9", "y10", "y11", "y12", "y13", "university"];
  const startIdx = gradeOrder.indexOf(gradeId);
  if (startIdx === -1) return allYears.slice(-2); // adult: just university years
  return allYears.slice(startIdx);
}
```

---
## 3. CAREER_DB (replaces lines ~133–165)

**Structural note:** this is an object keyed by career title, not an array. The Barrister/Solicitor split means the key itself changes — there is no separate "title" field to edit.

```javascript
const CAREER_DB = {
  "Mental Health Therapist / Counsellor": { score: 98, growth: "Strong demand", salary: "£35,000–£75,000", sector: "Healthcare", superpower: "Emotional Intelligence" },
  "Firefighter / Paramedic": { score: 97, growth: "Stable", salary: "£28,000–£45,000", sector: "Public Service", superpower: "Physical Dexterity" },
  "Physician / Surgeon": { score: 96, growth: "Stable", salary: "£110,000–£145,000+", sector: "Healthcare", superpower: "Ethical Judgment" },
  "School Careers Adviser / Pastoral Lead": { score: 96, growth: "Stable", salary: "£28,000–£45,000", sector: "Education", superpower: "Emotional Intelligence" },
  "Diplomat (FCDO)": { score: 95, growth: "Stable", salary: "£31,000–£55,000", sector: "Diplomacy", superpower: "Ethical Judgment" },
  "Special Educational Needs Teacher (SEN/SENCO)": { score: 95, growth: "Stable", salary: "£33,000–£55,000", sector: "Education", superpower: "Emotional Intelligence" },
  "Advanced Nurse Practitioner": { score: 94, growth: "Strong demand", salary: "£48,000–£63,000", sector: "Healthcare", superpower: "Emotional Intelligence" },
  "Electrician": { score: 94, growth: "Strong demand", salary: "£33,000–£55,000", sector: "Trades", superpower: "Physical Dexterity" },
  "Plumber / Heating Engineer": { score: 94, growth: "Strong demand", salary: "£28,000–£50,000", sector: "Trades", superpower: "Physical Dexterity" },
  "Social Worker": { score: 93, growth: "Stable", salary: "£33,000–£50,000", sector: "Public Service", superpower: "Emotional Intelligence" },
  "Renewable Energy Technician": { score: 92, growth: "Strong demand", salary: "£30,000–£50,000", sector: "Trades", superpower: "Physical Dexterity" },
  "AI Governance / Policy Specialist": { score: 92, growth: "Emerging", salary: "£45,000–£90,000", sector: "Diplomacy", superpower: "Ethical Judgment" },
  "Performing Artist": { score: 91, growth: "Variable", salary: "£20,000–£60,000", sector: "Creative", superpower: "Creative Vision" },
  "Business Leader / Senior Executive": { score: 90, growth: "Stable", salary: "£80,000–£200,000+", sector: "Business", superpower: "Ethical Judgment" },
  "Secondary School Teacher": { score: 89, growth: "Stable", salary: "£33,000–£51,000", sector: "Education", superpower: "Emotional Intelligence" },
  "Cybersecurity Professional": { score: 88, growth: "Strong demand", salary: "£45,000–£90,000", sector: "Technology", superpower: "Ethical Judgment" },
  "Armed Forces / Military": { score: 88, growth: "Stable", salary: "£25,000–£75,000", sector: "Public Service", superpower: "Physical Dexterity" },
  "Construction Manager": { score: 87, growth: "Stable", salary: "£55,000–£90,000", sector: "Trades", superpower: "Physical Dexterity" },
  "Environmental Scientist": { score: 86, growth: "Stable", salary: "£30,000–£55,000", sector: "Science", superpower: "Creative Vision" },
  "Creative Director": { score: 85, growth: "Stable", salary: "£55,000–£90,000", sector: "Creative", superpower: "Creative Vision" },
  "Robotics Engineer": { score: 85, growth: "Strong demand", salary: "£35,000–£70,000", sector: "Technology", superpower: "Creative Vision" },
  "Biomedical Engineer": { score: 83, growth: "Stable", salary: "£28,000–£55,000", sector: "Science", superpower: "Creative Vision" },
  "Barrister": { score: 82, growth: "Stable", salary: "£25,000–£100,000+", sector: "Law", superpower: "Ethical Judgment (note: bimodal — criminal legal aid vs. commercial earnings differ sharply)" },
  "Solicitor": { score: 82, growth: "Stable", salary: "£40,000–£85,000", sector: "Law", superpower: "Ethical Judgment" },
  "Research Scientist": { score: 80, growth: "Stable", salary: "£35,000–£60,000", sector: "Science", superpower: "Creative Vision" },
  "AI/ML Engineer": { score: 78, growth: "Strong demand", salary: "£65,000–£100,000", sector: "Technology", superpower: "Creative Vision" },
  "UX/UI Designer": { score: 78, growth: "Stable", salary: "£35,000–£75,000", sector: "Creative", superpower: "Creative Vision" },
  "Financial Adviser (IFA)": { score: 76, growth: "Stable", salary: "£40,000–£80,000", sector: "Business", superpower: "Emotional Intelligence" },
  "Content Creator": { score: 65, growth: "Variable", salary: "£22,000–£48,000", sector: "Creative", superpower: "Creative Vision" },
  "Software Developer": { score: 62, growth: "Stable", salary: "£40,000–£80,000", sector: "Technology", superpower: "Creative Vision" },
  "Accountant / Auditor": { score: 45, growth: "Stable", salary: "£35,000–£65,000", sector: "Business", superpower: "Ethical Judgment" },
  "Paralegal": { score: 35, growth: "Stable", salary: "£20,000–£35,000", sector: "Law", superpower: "Ethical Judgment" },
};
```

**Note on the `superpower` field for Barrister:** there's no separate description field in this structure to carry the "bimodal earnings" nuance, so I've appended it parenthetically to `superpower`. If this reads awkwardly in the UI once rendered, the alternative is to drop the parenthetical and rely on the salary range itself (`£25,000–£100,000+`) to imply the spread — your call once you see it rendered.

**32 entries total**, confirmed against the agreed list (31 original − Trial Lawyer + Barrister + Solicitor = 32).

---

## 4. SECTOR_MAP — no change

Confirmed transferable as-is (line ~167). Do not touch.

---
## 5. AI_TOOLKIT (replaces lines ~744–835)

**Structural note:** this is an object keyed `1`–`9`, each with `{ title, intro, tools: [{ name, what, tag, url }] }`. The `tag` field must match a key in `TAG_STYLE` (`"Free"`, `"Free (basic)"`, `"Free (students)"`, `"Free (school-provided)"`, `"Free (limited)"`, `"Paid (often school-provided)"`, `"Paid"`) or it falls back to "Freemium" styling. `TAG_STYLE` itself needs no changes.

```javascript
const AI_TOOLKIT = {
  1: { // Grade
    title: "Start here: AI tools for career exploration",
    intro: "Great time to introduce your child to AI tools built for their age. These are the best places to begin.",
    tools: [
      { name: "Springpod", what: "Free UK careers platform with virtual work experience and a career quiz to explore directions based on interests and subjects", tag: "Free", url: "https://www.springpod.com" },
      { name: "National Careers Service — Skills Assessment", what: "Free UK government tool that matches your interests and skills to career suggestions", tag: "Free", url: "https://nationalcareers.service.gov.uk/skills-assessment" },
      { name: "ChatGPT", what: "Ask it anything about a career — a typical day, what school subjects matter most, what skills employers look for", tag: "Free", url: "https://chatgpt.com" },
      { name: "Claude", what: "Great for nuanced career research — ask it to compare two careers, explain salary trajectories, or decode job postings", tag: "Free", url: "https://claude.ai" },
    ]
  },
  2: { // Interests
    title: "Explore your child's interests with AI",
    intro: "These tools go deeper on interest-to-career mapping — beyond simple quizzes.",
    tools: [
      { name: "Khan Academy", what: "Free learning across subjects — useful for exploring whether an academic area genuinely interests you before committing at GCSE or A-level", tag: "Free", url: "https://www.khanacademy.org" },
      { name: "Google AI Essentials", what: "Free Google course on using AI tools effectively — relevant to almost every career path", tag: "Free", url: "https://grow.google/intl/uk_ie/courses/ai-essentials/" },
      { name: "Perplexity AI", what: "Ask 'what careers combine [interest 1] and [interest 2]?' — gives sourced, current answers unlike a basic Google search", tag: "Free", url: "https://www.perplexity.ai" },
      { name: "Morrisby", what: "Aptitude-based assessment used by UK schools — uncovers natural talents beyond self-reported interests", tag: "Paid (often school-provided)", url: "https://morrisby.com" },
    ]
  },
  3: { // Priority
    title: "AI tools to research career priorities",
    intro: "Help your child ground their priorities in real data — not assumptions.",
    tools: [
      { name: "LMI for All", what: "UK labour market intelligence tool — search any occupation for real UK data on earnings, employment trends, and regional demand", tag: "Free", url: "https://www.lmiforall.org.uk" },
      { name: "LinkedIn (free tier)", what: "Search any job title — see how many postings exist, what skills are required, and what companies are hiring", tag: "Free", url: "https://www.linkedin.com/jobs" },
      { name: "Glassdoor", what: "Real salary data from real workers — helps ground salary expectations before setting priorities", tag: "Free", url: "https://www.glassdoor.co.uk" },
      { name: "Claude or ChatGPT", what: "Ask: 'What careers have the highest job security AND salary for someone interested in [X]?' — great for priority tradeoffs", tag: "Free", url: "https://claude.ai" },
    ]
  },
  4: { // Tech comfort
    title: "Build AI fluency — free resources by level",
    intro: "AI fluency is one of the strongest skill premiums right now. Here's how to build it at every comfort level.",
    tools: [
      { name: "Google AI Essentials", what: "Free beginner course — learn how to use AI tools practically in everyday work and school tasks (no coding required)", tag: "Free", url: "https://grow.google/intl/uk_ie/courses/ai-essentials/" },
      { name: "Khan Academy + Khanmigo", what: "Free AI tutor for every subject — great for students who want to use AI to strengthen their weakest academic areas", tag: "Free", url: "https://www.khanacademy.org" },
      { name: "MIT OpenCourseWare (AI intro)", what: "Free MIT course materials — for students ready to go deeper into how AI actually works", tag: "Free", url: "https://ocw.mit.edu/search/?q=artificial+intelligence" },
      { name: "GitHub Copilot (student)", what: "Free for verified students — AI coding assistant that teaches while you build", tag: "Free (students)", url: "https://github.com/features/copilot/plans" },
    ]
  },
  5: { // Concern
    title: "AI tools to address your specific career concerns",
    intro: "These tools provide data-backed answers to the questions parents and students worry about most.",
    tools: [
      { name: "World Economic Forum Future of Jobs", what: "The actual research behind AI's job impact — searchable by industry. Counters fear with data.", tag: "Free", url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/" },
      { name: "Perplexity AI", what: "Ask it your exact concern — 'Will AI replace nurses?' or 'What happens to software jobs by 2030?' — sourced answers", tag: "Free", url: "https://www.perplexity.ai" },
      { name: "National Careers Service — Job Profiles", what: "Free UK government job profiles covering entry requirements, typical tasks, salary ranges, and future outlook", tag: "Free", url: "https://nationalcareers.service.gov.uk/explore-careers" },
      { name: "NotebookLM", what: "Upload reports and articles on career topics and ask questions across all of them — useful for making sense of conflicting information", tag: "Free", url: "https://notebooklm.google.com" },
    ]
  },
  6: { // Subjects
    title: "Turn academic strengths into career signals",
    intro: "AI tools that connect what your child is good at now to where that leads professionally.",
    tools: [
      { name: "Unifrog", what: "UK platform used by schools and colleges to connect subject choices to university courses and apprenticeships — ask your school if they have a licence", tag: "Free (school-provided)", url: "https://www.unifrog.org" },
      { name: "NotebookLM (Google)", what: "Upload class notes and ask 'what careers use skills from this subject?' — genuinely useful for subject-to-career bridging", tag: "Free", url: "https://notebooklm.google.com" },
      { name: "Claude", what: "Ask: 'My child excels at [subjects]. What careers use all three of these strengths?' — gets specific, ranked answers", tag: "Free", url: "https://claude.ai" },
      { name: "Wolfram Alpha", what: "For maths and science students — shows how mathematical concepts directly connect to engineering, physics, and research careers", tag: "Free (basic)", url: "https://www.wolframalpha.com" },
    ]
  },
  7: { // Activities
    title: "AI tools to amplify extracurriculars",
    intro: "Help your child see the career value in what they're already doing — and find ways to deepen it.",
    tools: [
      { name: "LinkedIn (student profile)", what: "Create a student profile now — list activities, get a professional digital presence before university applications", tag: "Free", url: "https://www.linkedin.com" },
      { name: "ChatGPT", what: "Paste your activity list and ask: 'Which of these activities are most relevant to [career]? What should I add?' — instant coaching", tag: "Free", url: "https://chatgpt.com" },
      { name: "Prospects", what: "UK's leading graduate careers site with a degree apprenticeship search — see what activities lead to which opportunities", tag: "Free", url: "https://www.prospects.ac.uk" },
      { name: "UCAS — Personal Statement Guidance", what: "Official UCAS guidance on framing activities and experience for your personal statement — transforms a list into a compelling narrative", tag: "Free", url: "https://www.ucas.com/undergraduate/applying-to-university/writing-your-personal-statement" },
    ]
  },
  8: { // Accomplishments
    title: "AI tools to document and showcase accomplishments",
    intro: "The brag sheet is just the start. These tools help package accomplishments for universities and employers.",
    tools: [
      { name: "Claude or ChatGPT", what: "Give it raw accomplishments and ask: 'Rewrite these as strong bullet points for a personal statement or CV' — remarkable results", tag: "Free", url: "https://claude.ai" },
      { name: "Grammarly", what: "Paste any accomplishment description — it helps refine the language for applications, personal statements, and brag sheets", tag: "Free (basic)", url: "https://www.grammarly.com" },
      { name: "LinkedIn", what: "Research professionals in roles you're targeting — their career paths show what accomplishments and experiences actually lead to those jobs", tag: "Free", url: "https://www.linkedin.com" },
      { name: "Glassdoor", what: "Read honest reviews of employers and interview experiences — understand what companies actually value in candidates", tag: "Free", url: "https://www.glassdoor.co.uk" },
    ]
  },
  9: { // Final details
    title: "Get ready for the next step",
    intro: "Tools to prepare for careers adviser meetings, university research, and what comes after this playbook.",
    tools: [
      { name: "UCAS Course Search", what: "Official tool for searching every UK university course — entry requirements, course content, and application links in one place", tag: "Free", url: "https://www.ucas.com/explore" },
      { name: "Discover Uni", what: "Official UK government tool comparing universities by graduate salary, employment rates, and student satisfaction", tag: "Free", url: "https://discoveruni.gov.uk" },
      { name: "Student Finance England", what: "Official information on tuition fee loans, maintenance loans, and repayment terms — open it now to understand what to prepare", tag: "Free", url: "https://www.gov.uk/student-finance" },
      { name: "Claude or ChatGPT", what: "Paste your playbook results and ask: 'Help me prepare questions for my careers adviser meeting focused on [career]'", tag: "Free", url: "https://claude.ai" },
    ]
  },
};
```

`TAG_STYLE` (line ~837) needs **no changes** — all tags used above already exist as keys.

---
## 6. DEMO_INTEREST_TEMPLATES + getDemoInterest() (replaces lines ~215–281)

**Structural note:** each category is an array of exactly 4 `{ action, why }` pairs, keyed by the same 10 ids as `INTERESTS`. `getDemoInterest()` needs no changes — it reads `interests[0]` dynamically and falls back to `tech`, which still exists.

```javascript
const DEMO_INTEREST_TEMPLATES = {
  healthcare: [
    { action: "Arrange NHS work experience through your local hospital or GP surgery", why: "Direct healthcare exposure shows genuine commitment to admissions" },
    { action: "Start a health awareness campaign at your school", why: "Leadership in health-related initiatives demonstrates initiative" },
    { action: "Shadow a healthcare professional for a day", why: "Shows proactive career exploration beyond the classroom" },
    { action: "Complete a St John Ambulance first aid course", why: "Tangible credential that connects to a healthcare career path" },
  ],
  tech: [
    { action: "Build a personal project and publish it on GitHub", why: "Tangible evidence of technical skills beyond coursework" },
    { action: "Enter a hackathon or coding competition such as the Bebras Challenge", why: "Competitive tech events stand out on applications" },
    { action: "Start a tech blog or YouTube channel explaining concepts", why: "Shows communication skills alongside technical knowledge" },
    { action: "Contribute to an open source project", why: "Real-world collaboration experience that universities value" },
  ],
  trades: [
    { action: "Enrol in a T-Level or local college course in your trade", why: "Direct skill-building shows commitment to the path" },
    { action: "Volunteer on a local community building or conservation project", why: "Hands-on community service combining skills and service" },
    { action: "Get a part-time job in a related trade", why: "Paid experience demonstrates real-world commitment" },
    { action: "Research and visit a local FE college or apprenticeship provider", why: "Shows you are serious and informed about the pathway" },
  ],
  creative: [
    { action: "Build an online portfolio showcasing your best work", why: "Creative portfolios are more powerful than transcripts for creative fields" },
    { action: "Enter a national competition such as the BBC Young Writers' Award or RSA Student Design Awards", why: "Awards and recognition validate creative talent to admissions tutors" },
    { action: "Collaborate on a creative project with peers and document it", why: "Collaboration and documentation show a professional mindset" },
    { action: "Attend a workshop or masterclass in your creative discipline", why: "Continued learning shows dedication beyond school requirements" },
  ],
  business: [
    { action: "Start a small business or side project this term", why: "Entrepreneurial initiative is the strongest signal for business courses" },
    { action: "Join or start a Young Enterprise company at your school", why: "Young Enterprise is the UK's leading enterprise programme and is recognised by admissions tutors" },
    { action: "Shadow a professional in your target business field", why: "Shows you understand the reality of the career, not just the theory" },
    { action: "Take an online course in financial literacy or entrepreneurship", why: "Self-directed learning demonstrates genuine intellectual curiosity" },
  ],
  law: [
    { action: "Join a debating society or moot court competition", why: "Argumentation and public speaking are core legal skills" },
    { action: "Apply for work experience at a local solicitors' firm", why: "Exposure to real legal work shows serious career interest" },
    { action: "Write an op-ed for your school paper on a policy issue", why: "Published writing on policy demonstrates analytical thinking" },
    { action: "Attend a local court session to observe proceedings", why: "Shows proactive exploration of the legal profession" },
  ],
  science: [
    { action: "Design and conduct an independent research project, ideally as an EPQ", why: "Original research is the gold standard for science courses" },
    { action: "Enter a CREST Award or science fair competition", why: "Competitive science achievements stand out in applications" },
    { action: "Reach out to a local university department for mentorship", why: "University connections show initiative and research readiness" },
    { action: "Apply for a Nuffield Research Placement", why: "A free, competitive summer placement that shows applied scientific thinking" },
  ],
  education: [
    { action: "Tutor younger students in your strong subjects", why: "Direct teaching experience is the strongest signal for education courses" },
    { action: "Volunteer at an after-school programme or summer scheme", why: "Working with young people in structured settings shows commitment" },
    { action: "Create educational content for a topic you love", why: "Content creation shows you can explain complex ideas clearly" },
    { action: "Shadow a teacher and observe different teaching styles", why: "Reflective observation shows mature interest in pedagogy" },
  ],
  public: [
    { action: "Volunteer with your local fire and rescue service or ambulance trust", why: "Direct service experience is essential for public safety careers" },
    { action: "Complete a St John Ambulance first aid course", why: "Tangible credential that demonstrates readiness and commitment" },
    { action: "Organise a community service project at your school", why: "Leadership in service shows the public service mindset" },
    { action: "Interview a first responder and write about their career", why: "Shows reflective understanding of the profession" },
  ],
  diplomacy: [
    { action: "Join Model UN or start a chapter at your school", why: "Model UN is the most recognised activity for international relations courses" },
    { action: "Study a second language and seek conversation practice", why: "Language skills are essential for diplomacy and global careers" },
    { action: "Write about a current international issue for your school paper", why: "Published analysis shows intellectual engagement with global affairs" },
    { action: "Attend a public lecture or webinar on international affairs", why: "Shows self-directed learning about global issues" },
  ],
};

function getDemoInterest(interests) {
  const primary = interests[0] || "tech";
  return DEMO_INTEREST_TEMPLATES[primary] || DEMO_INTEREST_TEMPLATES.tech;
}
```

---
## 7. TALKING_POINTS (replaces lines ~283–287)

**Structural note:** this is a flat array of 3 plain strings — parent-facing talking points for a careers adviser conversation, not citation objects. Keep this shape exactly.

```javascript
const TALKING_POINTS = [
  "PwC projects up to 30% of UK jobs face high automation risk by the mid-2030s — but roles combining human judgment with technical skills are the most resilient. We want to make sure our child builds AI fluency alongside their primary interests.",
  "UK graduates earn on average £11,500 more per year than non-graduates (DfE 2024). Entry-level and routine roles are being disrupted fastest by AI, so we want to ensure our child has demonstrable, hands-on skills before they finish their education, not just qualifications.",
  "The World Economic Forum projects 170 million new jobs created but 92 million displaced globally by 2030. We want to focus on careers that require human skills AI cannot easily replicate.",
];
```

---
## 8. CONCERNS (replaces lines ~84–90)

```javascript
const CONCERNS = [
  { id: "entry_level", label: "Entry-level jobs are disappearing before my kid graduates" },
  { id: "ai_replace", label: "AI will make their chosen field obsolete" },
  { id: "no_direction", label: "My child has no idea what they want to do" },
  { id: "debt_roi", label: "University costs won't pay off in this economy" },
  { id: "too_late", label: "We are already behind and don't know where to start" },
];
```

Only `debt_roi`'s label changes. The four others are untouched.

---
## 9. SUBJECTS + SUBJECT_KEYWORDS (replaces lines ~92–109)

```javascript
const SUBJECTS = [
  { id: "math", label: "Maths" }, { id: "english", label: "English / Writing" },
  { id: "sciences", label: "Sciences" }, { id: "history", label: "History / Social Studies" },
  { id: "languages", label: "Foreign Language" }, { id: "cs", label: "Computer Science" },
  { id: "arts", label: "Arts / Music" }, { id: "sports", label: "Sports / Physical Ed" },
  { id: "epq", label: "EPQ (Extended Project)" }, { id: "btec", label: "BTEC / T-Level" },
];

// Keyword map: subject id → words that signal it
const SUBJECT_KEYWORDS = {
  math: ["math","maths","further maths","further mathematics","algebra","calculus","geometry","statistics","stats","mechanics","trigonometry","trig","numbers","equations","precalc","quantitative"],
  english: ["english","english language","english literature","writing","essay","literature","lit","reading","poetry","grammar","language arts","journalism","creative writing","stories","books","novel","composition","media studies","film studies"],
  sciences: ["science","combined science","triple science","biology","bio","chemistry","chem","physics","anatomy","ecology","earth science","environmental science","environmental","lab","research","scientific","medicine","health","nursing"],
  history: ["history","social studies","economics","econ","government","politics","government and politics","political","civics","geography","world history","psychology","psych","sociology","anthropology","culture"],
  languages: ["spanish","french","german","chinese","mandarin","japanese","latin","arabic","korean","italian","foreign language","modern languages","mfl","language","linguistic"],
  cs: ["computer","computing","computer science","digital technology","coding","programming","code","software","technology","tech","ai","machine learning","robotics","engineering","web","app","python","javascript","java","stem","data","btec it","btec digital"],
  arts: ["art","design technology","dt","product design","graphic design","textiles","music","drawing","painting","theater","theatre","drama","film","photography","design","dance","visual","creative","sculpt","choir","band","orchestra","perform","studio"],
  sports: ["sports","fitness","physical","gym","athletic","exercise","health","nutrition","coaching","pe","football","basketball","soccer","swimming","track","running","baseball","rugby","netball","cricket"],
  epq: ["epq","extended project","extended project qualification"],
  btec: ["btec","t-level","t level","vocational","applied"],
};
```

**`epq` and `btec` are now real subject ids**, added to `SUBJECTS` above — not just keywords the text-scanner recognises, but valid entries that resolve everywhere else in the app (subject buttons, any matching logic). A student mentioning "EPQ" or "BTEC" in free text now gets correctly tagged and displayed, rather than producing an id with nowhere to resolve to. Worth a quick visual check once running — two extra buttons will appear in whatever UI renders the `SUBJECTS` list.

---
## 10. INTERESTS (replaces lines ~57–68)

Only the `ex` field changes on two entries; `id`, `label`, `ico` stay identical on all ten.

```javascript
const INTERESTS = [
  { id: "healthcare", label: "Healthcare & Medicine", ico: "🏥", ex: "Nursing, psychiatry, surgery, therapy" },
  { id: "tech", label: "Technology & Engineering", ico: "💻", ex: "Software, cybersecurity, AI, robotics" },
  { id: "trades", label: "Skilled Trades", ico: "🔧", ex: "Electrical, plumbing, heating engineering, solar" },
  { id: "creative", label: "Creative Arts & Design", ico: "🎨", ex: "Film, music, graphic design, UX" },
  { id: "business", label: "Business & Finance", ico: "📈", ex: "Management, consulting, investing" },
  { id: "law", label: "Law & Policy", ico: "⚖️", ex: "Barrister, solicitor, governance, compliance" },
  { id: "science", label: "Science & Environment", ico: "🔬", ex: "Biology, climate science, research" },
  { id: "education", label: "Education", ico: "📚", ex: "Teaching, careers advice, special ed" },
  { id: "public", label: "Public Service & Emergency", ico: "🚒", ex: "Fire service, paramedic, social work, military" },
  { id: "diplomacy", label: "Diplomacy & International", ico: "🌍", ex: "Foreign service, NGO, AI governance" },
];
```

---
## What's deliberately NOT in this document (Phase 3 scope — do not touch yet)

- `buildPrompt()` — contains a second, separate hardcoded US careers shortlist string embedded in the prompt text itself (currently: `"Counselor 98%, Firefighter 97%, Physician 96%, Diplomat 95%..."` etc.), plus `"qs":["counselor question"]`. This is a distinct piece of US content from `CAREER_DB` and needs its own rewrite once Phase 3 starts.
- "Parent as the Ally Model" section (~line 1428 onward) — five phases of US admissions timeline content (PSAT, SAT/ACT, FAFSA, "college list" strategy). Substantial rewrite, explicitly deferred.
- Supabase feature-request form (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `submitFeatureRequest()`, `FeatureRequestForm` component) — full removal, not a content edit.
- `trackEvent()` / Google Analytics (`window.gtag`, `window.dataLayer`) — removal, not a content edit.
- API model string verification (used in the API call, not shown in the structures above — locate and verify before any live API test).

---

## Implementation order recommendation

1. GRADES (§1) — do first, nothing else depends on anything except this and §2 sharing matching ids.
2. YEAR_TEMPLATES + getYearPlan() (§2) — must use the same ids as §1.
3. CAREER_DB (§3) — independent of 1–2, safe to do in any order from here.
4. AI_TOOLKIT (§5) — independent.
5. DEMO_INTEREST_TEMPLATES (§6) — independent.
6. CONCERNS, SUBJECTS/keywords, INTERESTS (§7–10) — independent, quick copy edits.
7. Test the app end-to-end in `vite dev` before touching anything Phase 3.

After applying all of the above, the only remaining US-specific content in the app should be `buildPrompt()` and the "Parent as Ally" section — both explicitly Phase 3.

