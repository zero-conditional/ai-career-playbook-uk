import { useState, useEffect, useRef } from "react";

/* ================================================================
   STATIC DATA & CAREER DATABASE
   ================================================================ */
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

const INTERESTS = [
  { id: "healthcare", label: "Healthcare, Social Care & Medicine", ico: "🏥", ex: "Nursing, Doctor/GP, Surgeon, Physiotherapist, Paramedic, Social Worker" },
  { id: "tech", label: "Technology & Engineering", ico: "💻", ex: "Software, cybersecurity, AI, robotics, mechanical engineering, civil engineering, architecture, automotive" },
  { id: "trades", label: "Skilled Trades", ico: "🔧", ex: "Electrical, plumbing, heating engineering, bricklaying, plastering, carpentry, horticulture, landscaping, agriculture" },
  { id: "creative", label: "Creative Arts & Design", ico: "🎨", ex: "Film, music, fashion design, graphic design, photography, sound engineering, creative production/management, video games" },
  { id: "media", label: "Media & Communication", ico: "📰", ex: "Journalism, writing, news reporting, broadcasting, radio, current affairs" },
  { id: "business", label: "Business & Finance", ico: "📈", ex: "Management, business development, consulting, investing, economics, accountancy" },
  { id: "law", label: "Law & Policy", ico: "⚖️", ex: "Barrister, Solicitor, Paralegal, Policy Adviser" },
  { id: "science", label: "Science & Environment", ico: "🔬", ex: "Biologist, Environmental Scientist, Research Scientist, Biomedical Engineer, Renewable Energy Technician" },
  { id: "education", label: "Education", ico: "📚", ex: "Teacher, School Careers Adviser, SEN Teacher, Tutor" },
  { id: "public", label: "Public Service & Emergency", ico: "🚒", ex: "Firefighter, Paramedic, Police Officer, Armed Forces" },
  { id: "diplomacy", label: "Politics, Home & International Affairs", ico: "🌍", ex: "Politician, Civil Servant, Diplomat, Political Adviser, International Aid Worker" },
];

const PRIORITIES = [
  { id: "security", label: "Job Security", desc: "Stable demand that won't disappear" },
  { id: "salary", label: "High Earning Potential", desc: "Strong income trajectory over 20 years" },
  { id: "purpose", label: "Purpose & Impact", desc: "Work that matters to the world" },
  { id: "flexibility", label: "Flexibility & Balance", desc: "Location and schedule freedom" },
];

const TECHC = [
  { id: "loves", label: "Loves Technology", desc: "Genuinely curious how things work — codes, builds, or joins tech clubs and competitions" },
  { id: "comfortable", label: "Comfortable", desc: "Confident using apps and devices, but doesn't seek out how they work" },
  { id: "neutral", label: "Neutral", desc: "Uses a phone/social media like most kids, but shows no particular interest in technology itself" },
  { id: "handson", label: "Prefers Hands-On", desc: "Uses technology when needed, but isn't drawn to it or reliant on it — happy without it" },
];

const CONCERNS = [
  { id: "entry_level", label: "Entry-level jobs are disappearing before my kid graduates" },
  { id: "ai_replace", label: "AI will make their chosen field obsolete" },
  { id: "no_direction", label: "My child has no idea what they want to do" },
  { id: "debt_roi", label: "Will my child's degree pay off financially?", desc: "On average, a UK degree delivers a positive lifetime return — but subject matters enormously. IFS analysis of government LEO data shows net lifetime earnings ranging from negative returns for Social Care and Creative Arts graduates, to over £1,000,000 for Economics and Medicine. One in five graduates would have been better off financially without a degree. Which subject and career path matters far more than the decision to go to university itself. Source: IFS 'The impact of undergraduate degrees on lifetime earnings' (2020), using DfE Longitudinal Education Outcomes (LEO) data." },
  { id: "too_late", label: "We are already behind and don't know where to start" },
];

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

function parseSubjectsFromText(text) {
  const lower = text.toLowerCase();
  const matched = [];
  for (const [id, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) matched.push(id);
  }
  return matched.length > 0 ? matched : ["english"]; // fallback so prompt always has something
}

function isGibberish(text) {
  const t = text.trim();
  if (t.length < 10) return "Please share a bit more — describe at least one subject or area of interest.";
  const nonAlpha = (t.match(/[^a-zA-Z\s.,!?'\-]/g) || []).length;
  if (nonAlpha / t.length > 0.3) return "That doesn't look like a real answer. Describe subjects or interests in plain English.";
  const words = t.split(/\s+/).filter(w => w.length >= 3);
  if (words.length < 2) return "Please use a few words to describe what subjects or topics interest you most.";
  const realWords = words.filter(w => /^[a-zA-Z]{3,}/.test(w));
  if (realWords.length < 2) return "That looks like random characters. Please describe subjects or topics in plain English.";
  return null;
}

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

const SECTOR_MAP = {
  healthcare: "Healthcare", tech: "Technology", trades: "Trades", creative: "Creative",
  media: "Media", business: "Business", law: "Law", science: "Science", education: "Education",
  public: "Public Service", diplomacy: "Diplomacy",
};

const TOTAL_STEPS = 9;

/* ================================================================
   COMPACT JSON PROMPT (70% cheaper than prose prompt)
   ================================================================ */
function buildPrompt(a) {
  const concernLabels = a.concerns.map((id, i) => `${i + 1}. ${CONCERNS.find(c => c.id === id)?.label || id}`).join("; ");
  const priorityLabels = a.priorities.map((id, i) => `${i + 1}. ${PRIORITIES.find(p => p.id === id)?.label || id}`).join("; ");
  const subjectLabels = a.subjectText || a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ");
  const interestLabels = a.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ");

  return `Return ONLY valid JSON. No markdown. No backticks. Start with { end with }. All strings under 80 chars. No special characters in values.

Student: ${a.grade} year group, interests: ${interestLabels}, priorities (ranked): ${priorityLabels}, subjects: ${subjectLabels}, activities: ${a.activities || "none"}, accomplishments: ${a.accomplishments || "none"}${a.specificCareer ? ", considering: " + a.specificCareer : ""}

Careers DB: Mental Health Therapist 98%, Firefighter/Paramedic 97%, Physician 96%, Careers Adviser 96%, Diplomat 95%, SEN Teacher 95%, Nurse Practitioner 94%, Electrician 94%, Plumber 94%, Social Worker 93%, Police Officer 93%, Renewable Energy Tech 92%, AI Governance 92%, Performing Artist 91%, Business Leader 90%, Teacher 89%, Cybersecurity 88%, Military 88%, Construction Mgr 87%, Environmental Scientist 86%, Creative Director 85%, Robotics Engineer 85%, Biomedical Engineer 83%, Barrister 82%, Solicitor 82%, Research Scientist 80%, AI/ML Engineer 78%, UX Designer 78%, Financial Adviser 76%, Content Creator 65%, Software Developer 62%, Accountant 45%, Paralegal 35%

Use UK context throughout: salaries in GBP, qualifications as GCSEs/A-levels/BTECs/T-Levels/UCAS, university not college, careers adviser not counselor.

{"careers":[{"n":"career name","s":88,"f":"why fits this student"}],"buildOn":[{"a":"their activity","c":"career connection","d":"deepen or add"}],"qs":["careers adviser question"],"concern":"response to their top concern: ${concernLabels}","aiTip":"how to combine their interests with AI skills"}

5 careers, 3 buildOn, 5 qs. Be specific to this student. All salary references in GBP.`;
}

// ---- Client-side template generators (no API cost) ----
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
  media: [
    { action: "Start a blog, podcast, or video series on a topic you care about", why: "Published, self-directed content is the strongest signal for media and journalism courses" },
    { action: "Write for your school newspaper or magazine, or start one if none exists", why: "Regular published writing demonstrates genuine commitment to journalism" },
    { action: "Enter a young writers' or journalism competition", why: "Competitive recognition stands out on applications" },
    { action: "Interview someone interesting and write it up as a feature piece", why: "Shows initiative and real journalistic skill, not just interest" },
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

const TALKING_POINTS = [
  "PwC projects up to 30% of UK jobs face high automation risk by the early 2030s — but roles combining human judgment with technical skills are the most resilient. We want to make sure our child builds AI fluency alongside their primary interests.",
  "UK graduates earn on average £11,500 more per year than non-graduates (DfE 2024 — the most recent figures, published before DfE discontinued this comparison). Entry-level and routine roles are being disrupted fastest by AI, so we want to ensure our child has demonstrable, hands-on skills before they finish their education, not just qualifications.",
  "The World Economic Forum projects 170 million new jobs created but 92 million displaced globally by 2030. We want to focus on careers that require human skills AI cannot easily replicate.",
];

/* ================================================================
   VISUAL COMPONENTS
   ================================================================ */

// Arc gauge for AI resistance score
function ScoreGauge({ score, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
      <path d={`M 6 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
        fill="none" stroke="var(--border-mid)" strokeWidth="10" strokeLinecap="round" />
      <path d={`M 6 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" fill="var(--text)"
        style={{ fontSize: size * 0.28, fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{score}%</text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="var(--text-muted)"
        style={{ fontSize: 9, fontFamily: "'Inter', sans-serif", letterSpacing: "0.5px" }}>AI RESISTANT</text>
    </svg>
  );
}

// Horizontal bar
function GrowthBar({ value, label }) {
  const numVal = parseFloat(value) || 0;
  const width = Math.min(Math.max(numVal * 2, 10), 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <span style={{ color: "var(--text-muted)", minWidth: 50 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: "var(--border-mid)", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${width}%`, background: "linear-gradient(90deg, var(--blue), var(--blue-glow))", borderRadius: 3, transition: "width 1s ease" }} />
      </div>
      <span style={{ color: "var(--text)", fontWeight: 600, minWidth: 45, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// Timeline node
function TimelineNode({ year, data, idx, total }) {
  const isLast = idx === total - 1;
  return (
    <div style={{ display: "flex", gap: 16, position: "relative", paddingBottom: isLast ? 0 : 24 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--blue), var(--blue-glow))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{idx + 1}</div>
        {!isLast && <div style={{ width: 2, flex: 1, background: "rgba(140,80,40,0.2)", marginTop: 4 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>{year}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          {data.courses && <MiniCard icon="📖" title="Courses" text={data.courses} />}
          {data.activities && <MiniCard icon="🎯" title="Activities" text={data.activities} />}
          {data.summer && <MiniCard icon="☀️" title="Summer" text={data.summer} />}
          {data.portfolio && <MiniCard icon="📁" title="Build" text={data.portfolio} />}
          {data.aiMilestone && <MiniCard icon="🤖" title="AI Skill" text={data.aiMilestone} />}
        </div>
      </div>
    </div>
  );
}

function MiniCard({ icon, title, text }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-mid)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{icon} {title}</div>
      <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

// Brag sheet row
function BragRow({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{label}</div>
      {typeof items === "string" ? (
        <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{items}</div>
      ) : (
        items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 14, color: "var(--text)" }}>
            <span style={{ color: "var(--blue)", flexShrink: 0 }}>-</span>
            <span style={{ lineHeight: 1.5 }}>{item}</span>
          </div>
        ))
      )}
    </div>
  );
}

/* ================================================================
   VOICE COMPONENTS — Web Speech API (free, no key, works in Chrome/Edge/Safari)
   VoiceCapture: free-text steps — streams transcript live into textarea
   VoiceSelect:  choice steps — listens, matches spoken answer to an option
   ================================================================ */

function useSpeechRecognition() {
  const supported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const create = () => {
    if (!supported) return null;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    return r;
  };
  return { supported, create };
}

function MicIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

// Free-text steps: streams live transcript into the field as the family talks
function VoiceCapture({ onTranscript }) {
  const [state, setState] = useState("idle"); // idle | listening | done | unsupported
  const [interim, setInterim] = useState("");
  const recogRef = useRef(null);
  const finalRef = useRef("");
  const { supported, create } = useSpeechRecognition();

  const start = () => {
    if (!supported) { setState("unsupported"); return; }
    const recog = create();
    finalRef.current = "";
    recog.onstart = () => {
      setState("listening");
    };
    recog.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalRef.current += (finalRef.current ? " " : "") + t.trim();
          onTranscript(finalRef.current);
        } else {
          interimText += t;
        }
      }
      setInterim(interimText);
    };
    recog.onerror = (e) => { if (e.error !== "no-speech") setState("idle"); };
    recog.onend = () => {
      setInterim("");
      const captured = finalRef.current.length > 0;
      setState(captured ? "done" : "idle");
    };
    recogRef.current = recog;
    recog.start();
  };

  const stop = () => recogRef.current?.stop();

  const reset = () => {
    recogRef.current?.stop();
    finalRef.current = "";
    setState("idle");
    setInterim("");
    onTranscript("");
  };

  if (!supported) return null;

  return (
    <div className="vcWrap">
      {state === "idle" && (
        <button className="vcBtn idle" onClick={start}>
          <MicIcon /> <span>Tap to speak your answer</span>
        </button>
      )}
      {state === "listening" && (
        <div className="vcListening">
          <button className="vcBtn active" onClick={stop}>
            <span className="vcPulse"/><MicIcon /><span>Listening… tap to stop</span>
          </button>
          {interim && <div className="vcInterim">"{interim}"</div>}
        </div>
      )}
      {state === "done" && (
        <div className="vcDone">
          <span className="vcDoneIcon">✓</span>
          <span className="vcDoneText">Captured — edit above if needed</span>
          <button className="vcRedo" onClick={reset}>Re-record</button>
        </div>
      )}
      {state === "unsupported" && (
        <div className="vcUnsupported">Voice input requires Chrome or Edge.</div>
      )}
    </div>
  );
}

// Choice steps: listens until stopped, then matches spoken words to the closest option
function VoiceSelect({ options, onSelect, matchKey = "label" }) {
  const [state, setState] = useState("idle"); // idle | listening | matched | nomatch | unsupported
  const [interim, setInterim] = useState("");
  const [matched, setMatched] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const recogRef = useRef(null);
  const finalRef = useRef("");
  const { supported, create } = useSpeechRecognition();

  const findBestMatch = (text) => {
    const lower = text.toLowerCase();
    let found = options.find(o => lower.includes(o[matchKey].toLowerCase()));
    if (!found) {
      found = options.find(o => {
        const words = o[matchKey].toLowerCase().split(/\s+/);
        return words.some(w => w.length > 3 && lower.includes(w));
      });
    }
    return found || null;
  };

  const start = () => {
    if (!supported) { setState("unsupported"); return; }
    const recog = create();
    finalRef.current = "";
    setInterim(""); setMatched(null); setErrMsg("");
    recog.onstart = () => {
      setState("listening");
    };
    recog.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalRef.current += (finalRef.current ? " " : "") + t.trim();
          // Try to match as words come in
          const match = findBestMatch(finalRef.current);
          if (match) {
            recog.stop();
            setMatched(match);
            onSelect(match.id);
            setState("matched");
            return;
          }
        } else {
          interimText += t;
        }
      }
      setInterim(interimText);
    };
    recog.onerror = (e) => { if (e.error !== "no-speech") setState("idle"); };
    recog.onend = () => {
      setInterim("");
      if (state === "matched") return;
      if (finalRef.current) {
        const match = findBestMatch(finalRef.current);
        if (match) { setMatched(match); onSelect(match.id); setState("matched"); }
        else { setErrMsg(`Heard "${finalRef.current}" — no match. Tap an option above.`); setState("nomatch"); }
      } else {
        setState("idle");
      }
    };
    recogRef.current = recog;
    recog.start();
  };

  const stop = () => recogRef.current?.stop();
  const reset = () => { recogRef.current?.stop(); finalRef.current = ""; setState("idle"); setMatched(null); setErrMsg(""); setInterim(""); };

  if (!supported) return null;

  return (
    <div className="vcWrap">
      {state === "idle" && (
        <button className="vcBtn idle" onClick={start}>
          <MicIcon /> <span>Or speak your answer</span>
        </button>
      )}
      {state === "listening" && (
        <div className="vcListening">
          <button className="vcBtn active" onClick={stop}>
            <span className="vcPulse"/><MicIcon /><span>Listening… tap to stop</span>
          </button>
          {interim && <div className="vcInterim">"{interim}"</div>}
        </div>
      )}
      {state === "matched" && matched && (
        <div className="vcDone">
          <span className="vcDoneIcon">✓</span>
          <span className="vcDoneText">Selected: <strong>{matched[matchKey]}</strong></span>
          <button className="vcRedo" onClick={reset}>Re-record</button>
        </div>
      )}
      {state === "nomatch" && (
        <div className="vcError"><span>⚠ {errMsg}</span><button className="vcRedo" onClick={reset}>Try again</button></div>
      )}
    </div>
  );
}


/* ================================================================
   AI TOOLKIT — per-step tool recommendations
   ================================================================ */
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

const TAG_STYLE = {
  "Free": { bg: "rgba(140,80,40,.1)", color: "oklch(38% 0.09 55)" },
  "Freemium": { bg: "rgba(180,120,0,.12)", color: "oklch(45% 0.11 85)" },
  "Free (basic)": { bg: "rgba(140,80,40,.1)", color: "oklch(38% 0.09 55)" },
  "Free (students)": { bg: "rgba(140,80,40,.1)", color: "oklch(38% 0.09 55)" },
  "Free (school-provided)": { bg: "rgba(140,80,40,.1)", color: "oklch(38% 0.09 55)" },
  "Free (limited)": { bg: "rgba(140,80,40,.1)", color: "oklch(38% 0.09 55)" },
  "Paid (often school-provided)": { bg: "rgba(100,100,100,.15)", color: "var(--text-muted)" },
  "Paid": { bg: "rgba(100,100,100,.15)", color: "var(--text-muted)" },
};

function AIToolkit({ step }) {
  const [open, setOpen] = useState(false);
  const data = AI_TOOLKIT[step];
  if (!data) return null;

  return (
    <div className="atkWrap no-print">
      <button className="atkToggle" onClick={() => {
        const next = !open;
        setOpen(next);
      }}>
        <span className="atkToggleIcon">{open ? "▾" : "▸"}</span>
        <span className="atkToggleLabel">AI Toolkit for this step</span>
        <span className="atkToggleSub">— {data.tools.filter(t => t.tag.startsWith("Free")).length} free tools</span>
      </button>
      {open && (
        <div className="atkPanel">
          <div className="atkTitle">{data.title}</div>
          <div className="atkIntro">{data.intro}</div>
          <div className="atkTools">
            {data.tools.map((tool, i) => {
              const ts = TAG_STYLE[tool.tag] || TAG_STYLE["Freemium"];
              return (
                <a key={i} className="atkTool" href={tool.url} target="_blank" rel="noopener noreferrer">
                  <div className="atkToolTop">
                    <span className="atkToolName">{tool.name}</span>
                    <span className="atkTag" style={{ background: ts.bg, color: ts.color }}>{tool.tag}</span>
                  </div>
                  <div className="atkToolWhat">{tool.what}</div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MAIN APP
   ================================================================ */
// Tap-to-rank selector — shared by Q3 (priorities) and Q5 (concerns)
function RankSelect({ options, value, onChange, maxRank, inlineDesc }) {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter(x => x !== id));
    else if (value.length < maxRank) onChange([...value, id]);
  };
  return (
    <div className="Ol">{options.map(o => {
      const rank = value.indexOf(o.id);
      const sel = rank !== -1;
      const atMax = !sel && value.length >= maxRank;
      return (
        <button key={o.id} className={`Ob ${inlineDesc ? "hd" : ""} ${sel ? "s" : ""}`} onClick={() => toggle(o.id)} style={atMax ? { opacity: 0.45 } : undefined}>
          {sel ? <span className="rankNum">{rank + 1}</span> : <span className="rankEmpty"/>}
          {inlineDesc
            ? <div><div className="Om">{o.label}</div><div className="Od">{o.desc}</div></div>
            : <span>{o.label}</span>}
        </button>
      );
    })}</div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState({
    grade: "", interests: [], priorities: [], techComfort: "", concerns: [],
    subjects: [], subjectText: "", activities: "", accomplishments: "",
    specificCareer: "", extraContext: "", studentName: "",
  });
  const [pb, setPb] = useState(null); // parsed playbook JSON
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const topRef = useRef(null);

  useEffect(() => {
    if (!loading) return;
    setProgress(0);
    const iv = setInterval(() => setProgress(p => p >= 93 ? (clearInterval(iv), 93) : p + Math.random() * 5), 600);
    return () => clearInterval(iv);
  }, [loading]);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth" }); }, [step]);

  const set = (k, v) => setA(p => ({ ...p, [k]: v }));

  const advanceStep = (nextStep) => {
    setStep(nextStep);
  };
  const toggleInt = (id) => setA(p => ({ ...p, interests: p.interests.includes(id) ? p.interests.filter(x => x !== id) : p.interests.length < 3 ? [...p.interests, id] : p.interests }));
  const [subjectErr, setSubjectErr] = useState("");
  const handleSubjectText = (text) => {
    set("subjectText", text);
    if (text.length > 5) {
      const err = isGibberish(text);
      setSubjectErr(err || "");
      if (!err) set("subjects", parseSubjectsFromText(text));
    } else {
      setSubjectErr("");
    }
  };

  const ok = () => {
    if (step === 1) return a.grade !== "";
    if (step === 2) return a.interests.length >= 1;
    if (step === 3) return a.priorities.length === 4;
    if (step === 4) return a.techComfort !== "";
    if (step === 5) return a.concerns.length === 3;
    if (step === 6) return a.subjectText.trim().length >= 10 && !isGibberish(a.subjectText);
    return true;
  };

  // Attempt to repair truncated or malformed JSON
  const repairJSON = (str) => {
    let s = str.trim();
    // Remove markdown fencing
    s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "").trim();
    // Find the first { and last }
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      s = s.substring(start, end + 1);
    }
    // Try parsing as-is first
    try { return JSON.parse(s); } catch {}
    // Fix common issues: trailing commas
    s = s.replace(/,\s*([\]}])/g, "$1");
    try { return JSON.parse(s); } catch {}
    // If truncated, try to close open brackets/braces
    let opens = 0, openb = 0;
    for (const ch of s) { if (ch === "[") opens++; if (ch === "]") opens--; if (ch === "{") openb++; if (ch === "}") openb--; }
    // Remove trailing partial values
    s = s.replace(/,\s*"[^"]*$/, "");
    s = s.replace(/,\s*$/, "");
    for (let i = 0; i < opens; i++) s += "]";
    for (let i = 0; i < openb; i++) s += "}";
    s = s.replace(/,\s*([\]}])/g, "$1");
    try { return JSON.parse(s); } catch {}
    // Last resort: try to extract just careers array
    try {
      const careersMatch = s.match(/"careers"\s*:\s*(\[[\s\S]*?\])/);
      if (careersMatch) {
        return { careers: JSON.parse(careersMatch[1].replace(/,\s*([\]}])/g, "$1")) };
      }
    } catch {}
    return null;
  };

  const generate = async () => {
    setStep(10); setLoading(true); setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: buildPrompt(a) }] }),
      });
      if (res.status === 429) {
        setError("Too many requests from your connection. Please wait a minute and try again.");
        setStep(11); setLoading(false); return;
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error.message || JSON.stringify(data.error));
        setStep(11); setLoading(false); return;
      }
      const txt = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      const parsed = repairJSON(txt);
      if (!parsed) {
        setError("JSON parse failed. Raw: " + txt.substring(0, 300) + "...");
        setStep(11); setLoading(false); return;
      }
      // Merge API response with client-side templates
      const fullPb = {
        careers: (parsed.careers || []).map(c => ({
          name: c.n || c.name || "Career",
          score: c.s || c.score || 80,
          fit: c.f || c.fit || "",
          insight: CAREER_DB[c.n || c.name]?.growth ? (CAREER_DB[c.n || c.name].growth + " projected growth") : "High demand field",
        })),
        yearPlan: getYearPlan(a.grade),
        buildOn: (parsed.buildOn || []).map(b => ({
          activity: b.a || b.activity || "",
          connection: b.c || b.connection || "",
          action: b.d || b.action || "deepen",
        })),
        demoInterest: getDemoInterest(a.interests),
        counselorQs: parsed.qs || parsed.counselorQs || [],
        talkingPoints: TALKING_POINTS,
        concernResponse: {
          headline: parsed.concern || "The data shows a path forward",
          data: "PwC found workers with AI skills command a 62% wage premium on average — up from 57% a year earlier (PwC 2026). The size varies by sector, from around 16% in the public sector to over 100% in consumer-facing roles.",
          steps: ["Research the top career match from this playbook this week", "Have a conversation with your child using the talking points above", "Schedule a careers adviser meeting and bring this printed playbook"],
        },
        aiRule: {
          insight: parsed.aiTip || "Combining domain expertise with AI fluency is the highest-value career strategy in every field",
          action: "Start with one AI tool relevant to their primary interest area this month",
        },
      };
      setProgress(100);
      setTimeout(() => { setPb(fullPb); setStep(11); setLoading(false); }, 400);
    } catch (err) {
      setError("Error: " + err.message);
      setStep(11); setLoading(false);
    }
  };

  const restart = () => { setStep(0); setA({ grade: "", interests: [], priorities: [], techComfort: "", concerns: [], subjects: [], subjectText: "", activities: "", accomplishments: "", specificCareer: "", extraContext: "", studentName: "" }); setPb(null); setError(""); };

  const gradeLabel = GRADES.find(g => g.id === a.grade)?.label || "";
  const interestLabels = a.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ");
  const subjectLabels = a.subjectText || a.subjects.map(s => SUBJECTS.find(x => x.id === s)?.label).join(", ");
  const priorityLabels = a.priorities.map((id, i) => `${i + 1}. ${PRIORITIES.find(p => p.id === id)?.label}`).join(", ");
  const progressPct = step >= 1 && step <= 9 ? (step / TOTAL_STEPS) * 100 : 0;

  // Print handler
  const doPrint = () => { window.print(); };

  /* ---- RENDER ---- */
  return (
    <div className="R" ref={topRef}>

      {/* ============ WELCOME ============ */}
      {step === 0 && <div className="W">
        <div className="Wcard">
          <div className="Wc">
            <span className="Wb">Free &nbsp;·&nbsp; 20+ research sources &nbsp;·&nbsp; 33 careers scored</span>

            <h1 className="Wh">
              Get Your Child's<br/>
              <span className="Wa">AI-Ready Career Playbook</span>
            </h1>

            <p className="Ws">Answer a few questions about your child. Get a personalised, visual career strategy with a printable Student Profile you can take to your next careers adviser meeting.</p>

            <div className="Wst">
              <div className="Wsi">
                <div className="Wn">£500K+</div>
                <div className="Wl">Lifetime earnings gap between highest and lowest returning degree subjects (IFS)</div>
              </div>
              <div className="Wsdv"></div>
              <div className="Wsi">
                <div className="Wn">62%</div>
                <div className="Wl">Average wage premium for AI skills (PwC, 2026)</div>
              </div>
              <div className="Wsdv"></div>
              <div className="Wsi">
                <div className="Wn">46%</div>
                <div className="Wl">Fall in UK tech grad roles, 2024/25 (ISE); the wider graduate market has since steadied</div>
              </div>
            </div>

            <button className="Cb" onClick={() => setStep(1)}>Build My Playbook <span>→</span></button>

            <div className="Ww">
              <div className="Wwg">
                <div className="Wwi">Visual AI Resistance Gauges for career matches</div>
                <div className="Wwi">Year-by-Year Timeline with specific action items</div>
                <div className="Wwi">Printable Brag Sheet formatted for careers advisers</div>
                <div className="Wwi">Careers Adviser Meeting Kit with tailored questions</div>
              </div>
            </div>

            <div className="Wf">No login. No email. Completely free.<br/>AI Career Playbook UK · Zero Conditional</div>
          </div>
        </div>
      </div>}

      {/* ============ ASSESSMENT ============ */}
      {step >= 1 && step <= 9 && <div className="A">
        <div className="Ah">
          <button className="Abk" onClick={() => { setStep(s => s - 1); }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
          <div className="Ap"><div className="Afl" style={{ width: `${progressPct}%` }}/></div>
          <span className="Asl">{step}/{TOTAL_STEPS}</span>
        </div>
        <div className="Aby">

          {step === 1 && <div className="Q"><div className="Qn">01</div><h2 className="Qt">What year group will your child be entering in September?</h2><p className="Qd">Answering over the summer? Choose the year they're moving up to, not the one they just finished.</p>
            <div className="Ol">{GRADES.map(g => <button key={g.id} className={`Ob ${a.grade === g.id ? "s" : ""}`} onClick={() => set("grade", g.id)}><span className="Or">{a.grade === g.id ? "◉" : "○"}</span>{g.label}</button>)}</div>
            <VoiceSelect options={GRADES} onSelect={(id) => set("grade", id)} currentValue={a.grade} />
          </div>}

          {step === 2 && <div className="Q"><div className="Qn">02</div><h2 className="Qt">What are their top interests?</h2><p className="Qd">Pick up to 3 areas, or speak them — say something like "healthcare and technology".</p>
            <div className="Ig">{INTERESTS.map(o => <button key={o.id} className={`Ic ${a.interests.includes(o.id) ? "s" : ""}`} onClick={() => toggleInt(o.id)}>
              <span className="Ii">{o.ico}</span><span className="Il">{o.label}</span><span className="Ie">{o.ex}</span>
              {a.interests.includes(o.id) && <span className="Ik">✓</span>}
            </button>)}</div>
            <p className="Qh">{a.interests.length}/3 selected</p>
            <VoiceSelect options={INTERESTS} onSelect={(id) => toggleInt(id)} currentValue={a.interests} matchKey="label" />
          </div>}

          {step === 3 && <div className="Q"><div className="Qn">03</div><h2 className="Qt">What matters most for their career?</h2><p className="Qd">Rank all four from most to least important — tap them in order.</p>
            <RankSelect options={PRIORITIES} value={a.priorities} onChange={v => set("priorities", v)} maxRank={4} inlineDesc />
            <p className="Qh">{a.priorities.length}/4 ranked</p>
          </div>}

          {step === 4 && <div className="Q"><div className="Qn">04</div><h2 className="Qt">How does your child feel about technology?</h2><p className="Qd">This shapes how we integrate AI fluency into their path. Or just say it — "loves technology" or "prefers hands-on".</p>
            <div className="Ol">{TECHC.map(t => <button key={t.id} className={`Ob hd ${a.techComfort === t.id ? "s" : ""}`} onClick={() => set("techComfort", t.id)}>
              <span className="Or">{a.techComfort === t.id ? "◉" : "○"}</span><div><div className="Om">{t.label}</div><div className="Od">{t.desc}</div></div>
            </button>)}</div>
            <VoiceSelect options={TECHC} onSelect={(id) => set("techComfort", id)} currentValue={a.techComfort} />
          </div>}

          {step === 5 && <div className="Q"><div className="Qn">05</div><h2 className="Qt">What are your biggest career concerns?</h2><p className="Qd">Choose your top 3, tapping the most important first. Your playbook will address them head-on with data.</p>
            <RankSelect options={CONCERNS} value={a.concerns} onChange={v => set("concerns", v)} maxRank={3} />
            <p className="Qh">{a.concerns.length}/3 selected</p>
            {a.concerns.map(id => { const c = CONCERNS.find(x => x.id === id); return c?.desc ? <p key={id} className="Qd" style={{marginTop:"8px",fontSize:"13px"}}>{c.desc}</p> : null; })}
          </div>}

          {step === 6 && <div className="Q"><div className="Qn">06</div>
            <h2 className="Qt">What subjects or topics does your child excel at in school?</h2>
            <p className="Qd">Tell us where they're genuinely strong — "She's top of her class in biology and loves genetics" or "He's excellent at maths and enjoys coding." We'll figure out the rest.</p>
            <textarea
              className={`Ta subjectTa ${subjectErr ? "err" : a.subjectText.length > 10 && !isGibberish(a.subjectText) ? "ok" : ""}`}
              placeholder={"Try something like:\n\u2022 She lights up in chemistry, loves science\n\u2022 Obsessed with coding, built apps already\n\u2022 Top of the class in biology, really enjoys computing\n\u2022 Loves performing arts and music"}
              value={a.subjectText}
              onChange={e => handleSubjectText(e.target.value)}
              rows={5}
              maxLength={500}
            />
            {subjectErr && <div className="subjectErrBox"><span className="subjectErrIcon">⚠</span>{subjectErr}</div>}
            {!subjectErr && a.subjectText.length > 10 && parseSubjectsFromText(a.subjectText).length === 0 && (
              <div className="subjectHint">Keep going — mention a specific subject, topic, or activity and we'll connect it to career paths.</div>
            )}
            <VoiceCapture onTranscript={(text, final) => { if (text) handleSubjectText(text); }} />
            <p className="Qh2">{a.subjectText.length}/500 characters</p>
          </div>}

          {step === 7 && <div className="Q"><div className="Qn">07</div><h2 className="Qt">What extracurriculars and activities are they involved in?</h2><p className="Qd">Include anything they do in or outside school — sports teams, school clubs and societies, Duke of Edinburgh, music lessons, tutoring, volunteering, or any other regular activity or hobby.</p>
            <textarea className="Ta" placeholder="e.g. School football or netball team, Duke of Edinburgh Award, debating society, drama or music club, cadets, volunteering" value={a.activities} onChange={e => set("activities", e.target.value)} rows={4}/>
            <VoiceCapture onTranscript={(text, final) => { if (text) set("activities", text); }} />
            <p className="Qh2">The more you share, the more personalized your playbook will be</p>
          </div>}

          {step === 8 && <div className="Q"><div className="Qn">08</div><h2 className="Qt">Any accomplishments, awards, or milestones?</h2><p className="Qd">These will appear in your printable Brag Sheet. Ask your child directly — tap the mic and let them tell you.</p>
            <textarea className="Ta" placeholder="e.g. A music grade exam, Duke of Edinburgh Award, a public speaking or debating competition win, a personal best in sport, a school science or design award, a mock trial or Model UN competition" value={a.accomplishments} onChange={e => set("accomplishments", e.target.value)} rows={4}/>
            <VoiceCapture onTranscript={(text, final) => { if (text) set("accomplishments", text); }} />
            <p className="Qh2">Don't be modest. Everything counts.</p>
          </div>}

          {step === 9 && <div className="Q"><div className="Qn">09</div><h2 className="Qt">Final details</h2><p className="Qd">Optional. These make your playbook even more specific.</p>
            <div className="Tf">
              <label className="Fl">Student's first name (for the printed profile)
                <input type="text" className="Ti" placeholder="e.g. Sarah, Marcus, Thea..." value={a.studentName} onChange={e => set("studentName", e.target.value)}/>
              </label>
              <label className="Fl">Specific career they are considering?
                <input type="text" className="Ti" placeholder="e.g. Neurosurgeon, cybersecurity analyst, electrician..." value={a.specificCareer} onChange={e => set("specificCareer", e.target.value)}/>
              </label>
              <label className="Fl">Anything else? (strengths, challenges, financial situation)
                <textarea className="Ta2" placeholder="e.g. Great at maths but shy. Has ADHD, thrives hands-on. First in the family to go to university..." value={a.extraContext} onChange={e => set("extraContext", e.target.value)} rows={3}/>
                <VoiceCapture onTranscript={(text, final) => { if (text) set("extraContext", text); }} />
              </label>
            </div>
          </div>}

          <AIToolkit step={step} />

          <div className="An">
            <button className={`Nb ${ok() ? "ac" : "di"}`} disabled={!ok()} onClick={() => step === 9 ? generate() : advanceStep(step + 1)}>
              {step === 9 ? "Generate My Playbook" : "Continue"} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            {step >= 7 && step <= 8 && <button className="Ns" onClick={() => setStep(s => s + 1)}>Skip this step</button>}
          </div>
        </div>
      </div>}

      {/* ============ GENERATING ============ */}
      {step === 10 && <div className="G">
        <div className="Gc">
          <div className="Gi"><div className="Gs"/></div>
          <h2 className="Gt">Building Your Visual Playbook</h2>
          <p className="Gu">Analyzing your child's profile against 17 research sources...</p>
          <div className="Gp"><div className="Gf" style={{ width: `${progress}%` }}/></div>
          <div className="Gl">
            {[["Matching AI-resistant careers", 8], ["Connecting activities to career paths", 25], ["Building year-by-year timeline", 42], ["Creating careers adviser meeting kit", 58], ["Generating brag sheet", 75], ["Rendering visual playbook", 90]].map(([t, v]) =>
              <div key={t} className={`Gx ${progress > v ? "on" : ""}`}>{progress > v ? "✓" : "○"} {t}</div>
            )}
          </div>
        </div>
      </div>}

      {/* ============ RESULTS ============ */}
      {step === 11 && <div className="RE" id="playbook-output">
        <div className="Rh no-print"><div className="Ri">
          <div>
            <h1 className="Rt">{a.studentName ? `${a.studentName}'s Career Playbook` : "Your Career Playbook"}</h1>
            <p className="Rsu">{gradeLabel} · {interestLabels} · {new Date().toLocaleDateString()}</p>
          </div>
          <div className="Ra">
            <button className="Bn" onClick={doPrint}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print / Save as PDF</button>
            <button className="Bn sc" onClick={restart}>New Playbook</button>
          </div>
        </div></div>

        {error && <div className="Rb"><div className="errBox">{error}<br/><br/>Please try again or check your API configuration.</div></div>}

        {pb && <div className="Rb">

          {/* ---- PRINT HEADER (only visible in print) ---- */}
          <div className="print-only print-header">
            <h1>{a.studentName ? `${a.studentName}'s Career Playbook` : "Career Playbook"}</h1>
            <p>AI Career Playbook UK · {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          {/* ---- SECTION 1: Student Profile ---- */}
          <div className="section" style={{ background: "rgba(140,80,40,0.04)", border: "1px solid rgba(140,80,40,0.12)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
            <h2 className="secTitle">Student Profile & Accomplishment Record</h2>
            <div className="profGrid">
              {a.studentName && <div className="profRow"><span className="profK">Name</span><span className="profV">{a.studentName}</span></div>}
              <div className="profRow"><span className="profK">Grade</span><span className="profV">{gradeLabel}</span></div>
              <div className="profRow"><span className="profK">Interests</span><span className="profV">{interestLabels}</span></div>
              <div className="profRow"><span className="profK">Strong Subjects</span><span className="profV">{subjectLabels}</span></div>
              <div className="profRow"><span className="profK">Priorities</span><span className="profV">{priorityLabels}</span></div>
              {a.activities && <div className="profRow"><span className="profK">Activities</span><span className="profV">{a.activities}</span></div>}
              {a.accomplishments && <div className="profRow"><span className="profK">Accomplishments</span><span className="profV">{a.accomplishments}</span></div>}
              {a.specificCareer && <div className="profRow"><span className="profK">Considering</span><span className="profV">{a.specificCareer}</span></div>}
            </div>
          </div>

          {/* ---- SECTION 2: Career Match Dashboard ---- */}
          <div className="section">
            <h2 className="secTitle">Your Top AI-Resistant Career Matches</h2>
            <p className="secDesc">Ranked by fit to {a.studentName || "your child"}'s profile. Scores from 17 cross-referenced research sources.</p>
            <div className="careerGrid">
              {pb.careers?.map((c, i) => {
                const dbEntry = CAREER_DB[c.name] || {};
                return (
                  <div key={i} className="careerCard">
                    <div className="ccRank">#{i + 1}</div>
                    <div className="ccGauge"><ScoreGauge score={c.score || dbEntry.score || 80} size={90} /></div>
                    <div className="ccName">{c.name}</div>
                    <div className="ccMeta">
                      <span className="ccTag">{dbEntry.salary || "Competitive"}</span>
                      <span className="ccTag grow">{dbEntry.growth || "Growing"} growth</span>
                    </div>
                    <div className="ccFit">{c.fit}</div>
                    <div className="ccInsight">💡 {c.insight}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- SECTION 3: Year-by-Year Timeline ---- */}
          <div className="section">
            <h2 className="secTitle">Year-by-Year Action Plan</h2>
            <p className="secDesc">Your personalized roadmap from {gradeLabel} through college.</p>
            <div className="timeline">
              {pb.yearPlan?.map((yp, i) => (
                <TimelineNode key={i} year={yp.year} data={yp} idx={i} total={pb.yearPlan.length} />
              ))}
            </div>
          </div>

          {/* ---- SECTION 4: Building on What You Have ---- */}
          {pb.buildOn && pb.buildOn.length > 0 && <div className="section">
            <h2 className="secTitle">Building on What You Already Have</h2>
            <p className="secDesc">{a.studentName || "Your child"} is NOT starting from zero. Here is how current activities connect to AI-resistant careers.</p>
            <div className="buildGrid">
              {pb.buildOn.map((b, i) => (
                <div key={i} className="buildCard">
                  <div className="buildAct">{b.activity}</div>
                  <div className="buildConn">→ {b.connection}</div>
                  <div className={`buildAction ${b.action === "deepen" ? "deep" : "add"}`}>{b.action === "deepen" ? "DEEPEN" : "ADD"}</div>
                </div>
              ))}
            </div>
          </div>}

          {/* ---- SECTION 5: Brag Sheet ---- */}
          <div className="section bragSheet">
            <h2 className="secTitle">Printable Brag Sheet</h2>
            <p className="secDesc">Formatted for careers advisers and school reference writers. Print this page to bring to your next meeting.</p>
            <div className="bragBox">
              <div className="bragHeader">{a.studentName ? `${a.studentName}'s Brag Sheet` : "Student Brag Sheet"} · {gradeLabel} · {new Date().getFullYear()}</div>
              <BragRow label="Academic Strengths" items={subjectLabels} />
              {a.activities && <BragRow label="Extracurricular Activities" items={a.activities.split(",").map(s => s.trim()).filter(Boolean)} />}
              {a.accomplishments && <BragRow label="Accomplishments & Awards" items={a.accomplishments.split(",").map(s => s.trim()).filter(Boolean)} />}
              <BragRow label="Career Interests" items={interestLabels} />
              {a.specificCareer && <BragRow label="Career Direction" items={`Exploring: ${a.specificCareer}`} />}
              <BragRow label="Top AI-Resistant Matches" items={pb.careers?.map(c => `${c.name} (${c.score}% AI Resistant)`)} />
              {pb.demoInterest && <BragRow label="Demonstrated Interest Actions" items={pb.demoInterest.map(d => d.action)} />}
              <BragRow label="Priorities" items={priorityLabels} />
            </div>
          </div>

          {/* ---- SECTION 6: Careers Adviser Meeting Kit (Rich Version) ---- */}
          <div className="section">
            <h2 className="secTitle">Careers Adviser Meeting Kit</h2>
            <p className="secDesc">Walk in prepared. Most careers advisers support hundreds of students. The parents who get the most help are the ones who come ready.</p>
            <div className="meetingKit">

              {/* BRING */}
              <div className="mkSection">
                <div className="mkLabel">📋 What to Bring</div>
                <div className="mkItems">
                  <div className="mkItem">✓ This printed playbook — student profile + career matches on top</div>
                  <div className="mkItem">✓ Latest school report and predicted grades (the adviser needs to see the full trajectory)</div>
                  <div className="mkItem">✓ GCSE results (or predicted GCSE grades if not yet sat)</div>
                  <div className="mkItem">✓ Printed Brag Sheet from above — formatted exactly how they expect it</div>
                  <div className="mkItem">✓ A short shortlist of course and university ideas — even 5–10 early ideas shows you're serious</div>
                  <div className="mkItem">✓ One paragraph about who your child is beyond grades — written in advance</div>
                </div>
              </div>

              {/* UNDERSTANDING THE STUDENT */}
              <div className="mkSection">
                <div className="mkLabel">🎓 Questions the Adviser Will Ask You — Be Ready</div>
                <div className="mkSub">Advisers use the first meeting to build a student profile. Prepare your child for these:</div>
                <div className="mkItems">
                  <div className="mkItem question">What subjects do you genuinely enjoy — not just the ones you're good at?</div>
                  <div className="mkItem question">What do you do outside of school that you'd do even if it wasn't on a UCAS application?</div>
                  <div className="mkItem question">Is there a university size, location, or campus culture you're drawn to — or want to avoid?</div>
                  <div className="mkItem question">Have you thought about what you want to study, or does that feel too early to decide?</div>
                  <div className="mkItem question">Are you open to degree apprenticeships and employment routes, or set on university?</div>
                  <div className="mkItem question">What does your family's financial picture look like — are we working with a budget for living costs?</div>
                  <div className="mkItem question">Are there any learning differences, access arrangements, or personal circumstances we should factor in?</div>
                  <div className="mkItem question">Where do you see yourself in 10 years — even a rough direction helps us think about courses and pathways.</div>
                </div>
              </div>

              {/* TAILORED QUESTIONS FROM AI */}
              <div className="mkSection">
                <div className="mkLabel">❓ Your Questions for the Adviser — Tailored to {a.studentName || "Your Child"}</div>
                <div className="mkSub">These are smart, informed questions based on the playbook profile. Use them to lead, not just react.</div>
                <div className="mkItems">
                  {pb.counselorQs?.map((q, i) => <div key={i} className="mkItem question">{i + 1}. {q}</div>)}
                  <div className="mkItem question">{pb.careers?.[0]?.name ? `Is ${pb.careers[0].name} a path you've seen students pursue successfully? What does that route look like from our school?` : "What routes have students with similar profiles pursued successfully from our school?"}</div>
                  <div className="mkItem question">How many careers adviser meetings can we expect, and what's the best way to stay in contact between them?</div>
                  <div className="mkItem question">Who writes the school reference, and what do you need to know about my child that isn't in their grades?</div>
                  <div className="mkItem question">Given where my child is right now, what one thing should they do this term that would most improve their application?</div>
                  <div className="mkItem question">Which degree apprenticeships or employers are worth looking at alongside university for this profile?</div>
                </div>
              </div>

              {/* ACADEMIC PLANNING */}
              <div className="mkSection">
                <div className="mkLabel">📚 Academic Planning — What to Settle in This Meeting</div>
                <div className="mkItems">
                  <div className="mkItem">→ Are the current subject choices (A-levels / BTEC / T-Level) appropriate for the target courses? What should change?</div>
                  <div className="mkItem">→ Are the predicted grades on track for the entry requirements of the shortlisted courses — and are there any concerns to address now?</div>
                  <div className="mkItem">→ Does this course/university path need an admissions test (e.g. UCAT for medicine, LNAT for law, or an Oxbridge test)? When should they sit it?</div>
                  <div className="mkItem">→ Is an EPQ worth taking, given the career direction and the universities being considered?</div>
                  <div className="mkItem">→ What's the strongest Year 13 workload that doesn't cause burnout before the UCAS deadline?</div>
                </div>
              </div>

              {/* AI & CAREERS TALKING POINTS */}
              <div className="mkSection">
                <div className="mkLabel">💬 Talking Points — AI & Career Planning</div>
                <div className="mkSub">Most advisers haven't had this conversation with parents yet. Lead it confidently.</div>
                <div className="mkItems">
                  {pb.talkingPoints?.map((tp, i) => <div key={i} className="mkItem tp">→ {tp}</div>)}
                  <div className="mkItem tp">→ WEF projects 170M new jobs by 2030 alongside 92M displaced — net positive, but the new jobs require different preparation than we've historically focused on.</div>
                  <div className="mkItem tp">→ PwC found an average 62% wage premium for AI-fluent workers (PwC 2026) — it varies by sector but spans the economy, from healthcare and law to education and the trades.</div>
                  <div className="mkItem tp">→ We're not trying to predict the future — we're building a student who can adapt to whatever it brings.</div>
                </div>
              </div>

              {/* SCHOOL REFERENCE */}
              <div className="mkSection">
                <div className="mkLabel">✉️ School Reference Strategy</div>
                <div className="mkSub">UCAS uses a single school reference — usually from a form tutor or head of year, not several teacher letters.</div>
                <div className="mkItems">
                  <div className="mkItem">→ Ask explicitly: "What information can we give you so the reference feels personal, not generic?"</div>
                  <div className="mkItem">→ Offer to share specific stories and achievements the referee might not otherwise know — in detail, not adjectives.</div>
                  <div className="mkItem">→ Check which subject teachers contribute predicted grades and comments, and make sure they know your child well.</div>
                  <div className="mkItem">→ Ask how far in advance they need everything to write a strong reference before the UCAS deadline.</div>
                </div>
              </div>

              {/* AFTER */}
              <div className="mkSection">
                <div className="mkLabel">📝 After the Meeting — Within 48 Hours</div>
                <div className="mkItems">
                  <div className="mkItem">□ Send a brief thank-you email — include your child's name and one thing you appreciated from the conversation</div>
                  <div className="mkItem">□ Write down the 3 most important action items the adviser gave you before you forget</div>
                  <div className="mkItem">□ Update the Brag Sheet with any accomplishments or activities the adviser suggested highlighting</div>
                  <div className="mkItem">□ Book the next meeting before you leave or within 24 hours — don't let scheduling drift</div>
                  <div className="mkItem">□ Share the key takeaways with your child — frame it as "here's what we learned" not "here's what you need to do"</div>
                  <div className="mkItem">□ Share this playbook with your co-parent or partner so you're aligned on next steps</div>
                </div>
              </div>

            </div>
          </div>

          {/* ---- SECTION 7: Concern + Parent as the Ally Model + 62% Rule ---- */}
          {pb.concernResponse && <div className="section">
            <h2 className="secTitle">Addressing Your Concern</h2>
            <div className="concernBox">
              <div className="concernHead">{pb.concernResponse.headline}</div>
              <div className="concernData">📊 {pb.concernResponse.data}</div>
              <div className="concernSteps">
                <div className="csLabel">Your 3 next steps this week:</div>
                {pb.concernResponse.steps?.map((s, i) => <div key={i} className="csStep"><span className="csNum">{i + 1}</span>{s}</div>)}
              </div>
            </div>
          </div>}

          {/* ---- SUPPORTING YOUR CHILD THROUGH THE UK EDUCATION SYSTEM ---- */}
          <div className="section">
            <div className="allyBox">
              <div className="allyHeader">
                <div className="allyIcon">◈</div>
                <div>
                  <div className="allyTitle">Supporting Your Child Through the UK Education System</div>
                  <div className="allySub">Your role is to stay informed, ask the right questions, and help your child make decisions with confidence — not to manage the process for them. Here is what matters at each stage.</div>
                </div>
              </div>
              <div className="allyPhases">
                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Years 7 &amp; 8</span>
                    <span className="allyPhaseName">Laying the Groundwork</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>Encourage broad curiosity — this is not the time to specialise. Exposure to a wide range of subjects, activities, and experiences is the goal.</div>
                    <div className="allyItem"><span className="allyDot"/>Start conversations about what your child enjoys and is good at — not what they want to "be", but what kinds of problems they like solving and what activities make time pass quickly.</div>
                    <div className="allyItem"><span className="allyDot"/>Introduce the Duke of Edinburgh Award if the school offers it at this stage — Bronze can begin from age 14.</div>
                    <div className="allyItem"><span className="allyDot"/>Visit careers fairs, science fairs, and open days at local colleges and universities — low-stakes exposure that builds familiarity with options that are still years away.</div>
                    <div className="allyItem"><span className="allyDot"/>Use free tools like the National Careers Service (nationalcareers.service.gov.uk) to explore what different jobs actually involve day-to-day.</div>
                  </div>
                </div>
                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Year 9</span>
                    <span className="allyPhaseName">Choosing GCSE Options</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>GCSE options are typically chosen between January and March of Year 9 — this is the first genuinely consequential academic decision your child will make.</div>
                    <div className="allyItem"><span className="allyDot"/>Attend your school's Options Evening (usually January or February) — come prepared with questions about which subjects lead where, not just which subjects your child enjoys.</div>
                    <div className="allyItem"><span className="allyDot"/>Maths and English are compulsory. Beyond that, a balanced set — a science, a humanity, a language, and a creative or technical subject — keeps future options open.</div>
                    <div className="allyItem"><span className="allyDot"/>Avoid over-specialising at this stage. Dropping a subject at 13 can close doors at 16 that are difficult to reopen.</div>
                    <div className="allyItem"><span className="allyDot"/>Talk to the school careers adviser before submitting the options form — they can flag subject combinations that may limit specific post-16 or university routes.</div>
                    <div className="allyItem"><span className="allyDot"/>The options form is usually submitted February to March; final timetables are confirmed in the summer term.</div>
                  </div>
                </div>
                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Years 10 &amp; 11</span>
                    <span className="allyPhaseName">GCSEs and the Post-16 Decision</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>Year 10 is when consistent study habits matter most — the groundwork laid now directly affects Year 11 results.</div>
                    <div className="allyItem"><span className="allyDot"/>Organise work experience in Year 10 if the school does not arrange it — NHS trusts, law firms, engineering companies, and creative agencies all accept school students. Contact them directly.</div>
                    <div className="allyItem"><span className="allyDot"/>Begin researching post-16 options during Year 10: A-levels (typically 3 subjects, academic), BTECs (vocational, coursework-based), T-Levels (technical, include a substantial industry placement), or a Level 3 Apprenticeship (earn while you learn).</div>
                    <div className="allyItem"><span className="allyDot"/>GCSE Results Day is in late August of Year 11 — have a confirmed post-16 place and a backup option before results day, not after.</div>
                    <div className="allyItem"><span className="allyDot"/>Applications to sixth forms, FE colleges, and apprenticeship programmes typically open in autumn/winter of Year 11 — do not leave this until after GCSEs.</div>
                    <div className="allyItem"><span className="allyDot"/>By law, young people in England must remain in education or training until age 18 — the question is which route, not whether.</div>
                  </div>
                </div>
                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Year 12</span>
                    <span className="allyPhaseName">Post-16 Study and Looking Ahead</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>Year 12 is when university, degree apprenticeship, and employment pathways begin to diverge meaningfully — research all three, even if the destination feels obvious.</div>
                    <div className="allyItem"><span className="allyDot"/>Attend university open days from the summer of Year 12 — most Russell Group and specialist universities hold them in June and July. Register early as popular events fill quickly.</div>
                    <div className="allyItem"><span className="allyDot"/>Research degree apprenticeships alongside traditional university routes — major employers offer degree apprenticeships leading to a full degree with no tuition fees and a salary from day one. Many open applications to Year 12 students.</div>
                    <div className="allyItem"><span className="allyDot"/>Begin drafting personal statement ideas in the summer of Year 12 — the UCAS personal statement is 4,000 characters and takes longer to write well than most students expect.</div>
                    <div className="allyItem"><span className="allyDot"/>The EPQ (Extended Project Qualification) is worth starting in Year 12 if available — it develops independent research skills and is explicitly valued by Russell Group admissions tutors.</div>
                    <div className="allyItem"><span className="allyDot"/>Check Student Finance England (gov.uk/student-finance) now — understanding tuition fee loans, maintenance loans, and income-contingent repayment terms before applying removes a significant source of anxiety later.</div>
                  </div>
                </div>
                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Year 13 — Autumn Term (Sep–Jan)</span>
                    <span className="allyPhaseName">UCAS Applications and Decisions</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>The UCAS application opens in September — submit well before the deadline, not on it.</div>
                    <div className="allyItem"><span className="allyDot"/>Key UCAS deadlines: 15 October for Oxford, Cambridge, medicine, dentistry, and veterinary science. 29 January for most other courses. Always verify current deadlines at ucas.com before submitting.</div>
                    <div className="allyItem"><span className="allyDot"/>UCAS allows five university choices — research each carefully using Discover Uni (discoveruni.gov.uk) for official graduate salary and employment outcome data, not just league tables or reputation.</div>
                    <div className="allyItem"><span className="allyDot"/>The personal statement is the same document sent to all five choices — it must work for all of them simultaneously. Get multiple people to read it before submission.</div>
                    <div className="allyItem"><span className="allyDot"/>Your child's school will submit a single reference on their behalf — usually from a form tutor or head of year. There is one reference, not several.</div>
                    <div className="allyItem"><span className="allyDot"/>Degree apprenticeship applications often run on different timelines to UCAS — some open as early as October and close before UCAS results are known. Track deadlines separately.</div>
                  </div>
                </div>
                <div className="allyPhase">
                  <div className="allyPhaseHead">
                    <span className="allyPhaseTag">Year 13 — Spring to Results Day (Feb–Aug)</span>
                    <span className="allyPhaseName">Offers, Results Day and Next Steps</span>
                  </div>
                  <div className="allyPhaseItems">
                    <div className="allyItem"><span className="allyDot"/>University offers arrive between February and May — most will be conditional on A-level grades. Track all offers carefully on the UCAS Hub.</div>
                    <div className="allyItem"><span className="allyDot"/>Once all decisions are received, UCAS requires your child to select a Firm choice and an Insurance choice — the Insurance should be a realistic fallback, not an afterthought.</div>
                    <div className="allyItem"><span className="allyDot"/>Results Day is in mid-August — A-level results are published on a Thursday, typically the third week of August. Confirm the exact date at ucas.com each year.</div>
                    <div className="allyItem"><span className="allyDot"/>If grades meet the Firm offer: the place is confirmed automatically through UCAS Track.</div>
                    <div className="allyItem"><span className="allyDot"/>If grades miss the Firm offer: Clearing opens immediately — places at good universities are available through Clearing, including institutions your child may not have originally considered.</div>
                    <div className="allyItem"><span className="allyDot"/>If grades exceed the Firm offer: Adjustment allows your child to apply to universities requiring higher grades — act quickly as this is a brief window.</div>
                    <div className="allyItem"><span className="allyDot"/>Student Finance applications should be submitted well before Results Day — funding is not automatic and late applications can delay maintenance loan payments at the start of term.</div>
                    <div className="allyItem"><span className="allyDot"/>Gap years are a valid option — UCAS allows deferred entry. Secure the university place first, then defer, rather than reapplying the following year.</div>
                  </div>
                </div>
              </div>
              <div className="allyFootnote">Deadlines and funding terms change year to year. Always verify UCAS deadlines at ucas.com and Student Finance information at gov.uk/student-finance before acting on any dates in this section.</div>
            </div>
          </div>

          {pb.aiRule && <div className="section">
            <div className="aiRuleBox">
              <div className="arTitle">The 62% Rule</div>
              <div className="arSub">Workers with AI skills earn a 62% wage premium on average (PwC, 2026)</div>
              <div className="arInsight">{pb.aiRule.insight}</div>
              <div className="arAction">→ {pb.aiRule.action}</div>
            </div>
          </div>}

          {/* ---- Footer CTA ---- */}
          <div className="Rf no-print">
            <h3>Want the full 22-page research behind this playbook?</h3>
            <p>Explore 33 careers scored for AI resistance. Contribute your perspective and download the complete research document.</p>
            {/* Deployment URL to be added */}
          </div>

          {/* ---- Print footer ---- */}
          <div className="print-only print-footer">
            <p>Research from 17 sources: WEF, Goldman Sachs, McKinsey, PwC, ONS, NHS, Prospects, IFS, DfE, Stanford HAI, Anthropic, and 10 more.</p>
            <p>AI Career Playbook UK · Zero Conditional</p>
            {/* Deployment URL to be added */}
          </div>

          <p className="Rx no-print">AI Career Playbook UK · Zero Conditional · Research from WEF, PwC, IFS, DfE, ONS, NHS, Prospects, and Anthropic.</p>
        </div>}
      </div>}

      {/* ============ STYLES ============ */}
      <style>{`
:root{--bg:oklch(93% 0.006 75);--bg-card:oklch(96% 0.012 75);--bg-elevated:oklch(98% 0.006 75);--blue:oklch(52% 0.13 55);--blue-hover:oklch(47% 0.13 55);--blue-glow:oklch(58% 0.13 55);--border:oklch(88% 0.015 75);--border-mid:oklch(88% 0.015 75);--text:oklch(28% 0.015 75);--text-muted:oklch(45% 0.015 75);--text-dim:oklch(55% 0.015 75)}
*{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);color:var(--text)}#root{min-height:100vh}
.R{font-family:'Inter',sans-serif;min-height:100vh}

/* Welcome */
.W{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:56px 24px;box-sizing:border-box;background:oklch(93% 0.006 75);font-family:'Inter',sans-serif;}
.Wcard{width:100%;max-width:860px;background:oklch(96% 0.012 75);border-radius:16px;box-shadow:0 20px 50px -20px rgba(0,0,0,0.2);overflow:hidden;border:1px solid oklch(88% 0.015 75);}
.Wc{padding:88px 64px 56px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.Wb{display:inline-block;background:oklch(91% 0.03 60);border:1px solid oklch(82% 0.05 60);color:oklch(38% 0.09 55);font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:8px 16px;border-radius:6px;margin-bottom:28px;}
.Wh{margin:0;font-family:'Inter',sans-serif;font-weight:800;font-size:clamp(32px,5.5vw,52px);line-height:1.15;color:oklch(28% 0.015 75);margin-bottom:18px;}
.Wa{color:oklch(52% 0.13 55);}
.Ws{margin:22px 0 0;max-width:600px;font-size:18px;line-height:1.65;color:oklch(45% 0.015 75);font-weight:400;}
.Wst{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:44px;width:100%;max-width:640px;border:1px solid oklch(88% 0.015 75);border-radius:10px;overflow:hidden;background:oklch(98% 0.006 75);}
.Wsi{padding:20px 16px;border-right:1px solid oklch(88% 0.015 75);}
.Wsi:last-child{border-right:none;}
.Wsdv{display:none;}
.Wn{font-size:32px;font-weight:800;color:oklch(28% 0.015 75);font-variant-numeric:tabular-nums;}
.Wl{font-size:12px;color:oklch(45% 0.015 75);margin-top:6px;line-height:1.4;}
.Cb{margin-top:40px;background:oklch(52% 0.13 55);color:oklch(99% 0 0);border:none;font-size:17px;font-weight:700;padding:18px 38px;border-radius:8px;display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-family:'Inter',sans-serif;margin-bottom:0;}
.Cb:hover{background:oklch(47% 0.13 55);}
.Ww{margin-top:36px;width:100%;max-width:640px;}
.Wwg{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid oklch(88% 0.015 75);border-radius:10px;overflow:hidden;background:oklch(98% 0.006 75);}
.Wwi{text-align:left;padding:14px 16px;font-size:14px;color:oklch(45% 0.015 75);border-right:1px solid oklch(88% 0.015 75);border-bottom:1px solid oklch(88% 0.015 75);}
.Wwi:nth-child(even){border-right:none;}
.Wwi:nth-last-child(-n+2){border-bottom:none;}
.Wf{margin-top:36px;font-size:13px;color:oklch(45% 0.015 75);opacity:0.85;line-height:1.6;border-top:1px solid oklch(88% 0.015 75);padding-top:16px;width:100%;max-width:400px;}

/* Assessment */
.A{min-height:100vh;display:flex;flex-direction:column}
.Ah{display:flex;align-items:center;gap:16px;padding:16px 24px;border-bottom:1px solid var(--border-mid);position:sticky;top:0;background:oklch(93% 0.006 75 / 0.97);backdrop-filter:blur(12px);z-index:10}
.Abk{background:none;border:none;color:var(--text-dim);cursor:pointer;padding:6px;border-radius:8px;display:flex}.Abk:hover{color:var(--text-muted)}
.Ap{flex:1;height:3px;background:var(--border-mid);border-radius:2px;overflow:hidden}
.Afl{height:100%;background:var(--blue);border-radius:2px;transition:width .4s}
.Asl{font-size:13px;color:var(--text-dim);font-weight:500;white-space:nowrap;font-family:'DM Mono',monospace}
.Aby{flex:1;display:flex;flex-direction:column;align-items:center;padding:40px 24px 100px}
.Q{max-width:580px;width:100%;animation:fiu .4s ease}
.Qn{font-family:'DM Mono',monospace;font-size:11px;color:var(--blue);font-weight:500;margin-bottom:10px;letter-spacing:.1em;text-transform:uppercase}
.Qt{font-family:'Inter',sans-serif;font-size:28px;color:var(--text);font-weight:700;margin-bottom:8px;line-height:1.2}
.Qd{font-size:15px;color:var(--text-muted);margin-bottom:28px;font-weight:400}
.Qh{font-size:13px;color:var(--text-dim);margin-top:12px;text-align:center}
.Qh2{font-size:13px;color:var(--text-dim);margin-top:8px;font-style:italic}

.Ol{display:flex;flex-direction:column;gap:8px}
.Ob{display:flex;align-items:center;gap:12px;padding:16px 18px;width:100%;background:rgba(255,255,255,.02);border:1px solid var(--border-mid);border-radius:8px;color:var(--text-muted);font-size:15px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;text-align:left}
.Ob:hover{border-color:rgba(140,80,40,.35);background:rgba(140,80,40,.04)}
.Ob.s{border-color:var(--blue);background:rgba(140,80,40,.08);color:var(--text)}
.Or{font-size:16px;color:var(--text-dim);flex-shrink:0}.Ob.s .Or{color:var(--blue)}
.rankNum{width:24px;height:24px;border-radius:50%;background:var(--blue);color:oklch(99% 0 0);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;font-family:'DM Mono',monospace}
.rankEmpty{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--border-mid);flex-shrink:0}
.Ob.hd{align-items:flex-start}.Om{font-weight:500}.Od{font-size:13px;color:var(--text-dim);margin-top:2px}

.Ig{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}
.Ic{display:flex;align-items:center;gap:10px;padding:14px 16px;position:relative;background:rgba(255,255,255,.02);border:1px solid var(--border-mid);border-radius:8px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;text-align:left;flex-wrap:wrap}
.Ic:hover{border-color:rgba(140,80,40,.35)}.Ic.s{border-color:var(--blue);background:rgba(140,80,40,.08)}
.Ii{font-size:22px}.Il{font-size:14px;color:var(--text-muted);font-weight:500;flex:1}
.Ie{font-size:11px;color:var(--text-dim);width:100%;padding-left:32px}
.Ik{position:absolute;top:8px;right:10px;width:22px;height:22px;background:var(--blue);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:oklch(99% 0 0);font-weight:700}

.Sg{display:flex;flex-wrap:wrap;gap:8px}
.subjectTa{width:100%;padding:16px 18px;background:var(--bg-elevated);border:1px solid var(--border-mid);border-radius:8px;color:var(--text);font-size:15px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;resize:vertical;min-height:130px;line-height:1.7}
.subjectTa:focus{border-color:rgba(140,80,40,.5)}
.subjectTa.err{border-color:rgba(239,68,68,.6);box-shadow:0 0 0 3px rgba(239,68,68,.08)}
.subjectTa.ok{border-color:rgba(140,80,40,.5);box-shadow:0 0 0 3px rgba(140,80,40,.08)}
.subjectTa::placeholder{color:var(--text-dim);font-size:13px;line-height:1.6}
.subjectErrBox{display:flex;align-items:flex-start;gap:8px;margin-top:10px;padding:12px 14px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:13px;color:#fca5a5;line-height:1.5;animation:fiu .2s ease}
.subjectErrIcon{flex-shrink:0;font-size:15px}
.subjectDetected{margin-top:10px;padding:10px 14px;background:rgba(140,80,40,.07);border:1px solid rgba(140,80,40,.2);border-radius:8px;font-size:12px;color:oklch(38% 0.09 55);font-family:'DM Mono',monospace;animation:fiu .2s ease}
.subjectDetectedLabel{color:var(--text-dim);margin-right:4px}
.subjectHint{margin-top:10px;font-size:13px;color:var(--text-dim);font-style:italic}
.Sc{padding:12px 20px;background:rgba(255,255,255,.02);border:1px solid var(--border-mid);border-radius:6px;color:var(--text-muted);font-size:14px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;display:flex;align-items:center;gap:8px}
.Sc:hover{border-color:rgba(140,80,40,.35)}.Sc.s{border-color:var(--blue);background:rgba(140,80,40,.08);color:var(--text)}
.Sk{color:var(--blue);font-weight:700;font-size:13px}

.Ta,.Ta2{width:100%;padding:16px 18px;background:var(--bg-elevated);border:1px solid var(--border-mid);border-radius:8px;color:var(--text);font-size:15px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;resize:vertical;min-height:100px;line-height:1.6}
.Ta:focus,.Ta2:focus{border-color:rgba(140,80,40,.5)}.Ta::placeholder,.Ta2::placeholder{color:var(--text-dim)}
.Ta2{min-height:80px}
.Tf{display:flex;flex-direction:column;gap:20px}
.Fl{font-size:14px;color:var(--text-muted);display:flex;flex-direction:column;gap:8px}
.Ti{width:100%;padding:14px 16px;background:var(--bg-elevated);border:1px solid var(--border-mid);border-radius:8px;color:var(--text);font-size:15px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s}
.Ti:focus{border-color:rgba(140,80,40,.5)}.Ti::placeholder{color:var(--text-dim)}

.An{margin-top:36px;display:flex;flex-direction:column;align-items:center;gap:12px}
.Nb{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border:none;border-radius:6px;font-size:15px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:.02em;transition:all .2s}
.Nb.ac{background:var(--blue);color:oklch(99% 0 0);box-shadow:0 4px 16px rgba(140,80,40,.3)}
.Nb.ac:hover{background:var(--blue-hover);transform:translateY(-1px);box-shadow:0 6px 24px rgba(140,80,40,.4)}
.Nb.di{background:rgba(255,255,255,.04);color:var(--text-dim);cursor:not-allowed}
.Ns{background:none;border:none;color:var(--text-dim);font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;text-decoration:underline;text-underline-offset:3px}.Ns:hover{color:var(--text-muted)}

/* Generating */
.G{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 24px}
.Gc{text-align:center;max-width:440px;animation:fiu .5s ease}
.Gi{margin-bottom:28px;display:flex;justify-content:center}
.Gs{width:56px;height:56px;border:3px solid rgba(140,80,40,.15);border-top-color:var(--blue);border-radius:50%;animation:spin 1s linear infinite}
.Gt{font-family:'Inter',sans-serif;font-size:26px;color:var(--text);margin-bottom:10px;font-weight:700}
.Gu{font-size:14px;color:var(--text-muted);margin-bottom:28px}
.Gp{height:3px;background:var(--border-mid);border-radius:2px;margin-bottom:28px;overflow:hidden}
.Gf{height:100%;background:var(--blue);transition:width .5s;border-radius:2px}
.Gl{text-align:left}.Gx{font-size:13px;color:var(--text-dim);padding:6px 0;transition:color .3s}.Gx.on{color:oklch(38% 0.09 55)}

/* Results */
.RE{min-height:100vh}
.Rh{position:sticky;top:0;z-index:10;padding:16px 24px;background:oklch(93% 0.006 75 / 0.97);backdrop-filter:blur(16px);border-bottom:1px solid var(--border-mid)}
.Ri{max-width:820px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.Rt{font-family:'Inter',sans-serif;font-size:22px;color:var(--text);font-weight:700}
.Rsu{font-size:12px;color:var(--text-dim);margin-top:2px;font-family:'DM Mono',monospace}
.Ra{display:flex;gap:8px}
.Bn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:var(--blue);color:oklch(99% 0 0);border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:.02em;transition:all .2s}
.Bn:hover{background:var(--blue-hover);transform:translateY(-1px)}.Bn.sc{background:rgba(255,255,255,.05);color:var(--text-muted)}

.Rb{max-width:820px;margin:0 auto;padding:32px 24px 60px}
.errBox{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:20px;color:#fca5a5;font-size:14px;line-height:1.6}

/* Section headers */
.section{margin-bottom:40px}
.secTitle{font-family:'Inter',sans-serif;font-size:22px;color:var(--text);margin-bottom:6px;font-weight:700}
.secDesc{font-size:14px;color:var(--text-muted);margin-bottom:20px}

/* Profile */
.profGrid{display:flex;flex-direction:column;gap:10px}
.profRow{display:flex;gap:12px;font-size:14px;align-items:flex-start}
.profK{color:var(--blue);font-weight:600;min-width:130px;flex-shrink:0;font-size:12px;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em;padding-top:1px}
.profV{color:var(--text-muted);line-height:1.5}

/* Career cards */
.careerGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.careerCard{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:12px;padding:20px;position:relative;transition:border-color .2s}
.careerCard:hover{border-color:rgba(140,80,40,.4)}
.ccRank{position:absolute;top:12px;left:14px;font-family:'DM Mono',monospace;font-size:11px;color:var(--text-dim);font-weight:500;letter-spacing:.08em;text-transform:uppercase}
.ccGauge{display:flex;justify-content:center;margin-bottom:8px}
.ccName{font-size:16px;font-weight:600;color:var(--text);text-align:center;margin-bottom:8px}
.ccMeta{display:flex;gap:6px;justify-content:center;margin-bottom:10px;flex-wrap:wrap}
.ccTag{font-size:11px;padding:3px 8px;border-radius:4px;background:rgba(255,255,255,.05);color:var(--text-muted);font-family:'DM Mono',monospace}
.ccTag.grow{background:rgba(140,80,40,.1);color:oklch(38% 0.09 55)}
.ccFit{font-size:13px;color:var(--text-muted);line-height:1.5;margin-bottom:8px}
.ccInsight{font-size:12px;color:var(--blue);line-height:1.4;padding-top:8px;border-top:1px solid var(--border-mid)}

/* Timeline */
.timeline{padding:8px 0}

/* Build on */
.buildGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
.buildCard{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:10px;padding:16px}
.buildAct{font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px}
.buildConn{font-size:13px;color:var(--text-muted);line-height:1.5;margin-bottom:8px}
.buildAction{display:inline-block;font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:4px;font-family:'DM Mono',monospace}
.buildAction.deep{background:rgba(140,80,40,.12);color:oklch(38% 0.09 55)}
.buildAction.add{background:rgba(140,80,40,.06);color:var(--text-muted);border:1px solid var(--border-mid)}

/* Brag Sheet */
.bragBox{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:12px;padding:24px}
.bragHeader{font-family:'Inter',sans-serif;font-size:17px;color:var(--text);padding-bottom:12px;border-bottom:1px solid var(--border-mid);margin-bottom:16px;font-weight:700}

/* Meeting Kit */
.meetingKit{display:grid;gap:16px}
.mkSection{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:10px;padding:20px}
.mkLabel{font-size:11px;font-weight:500;color:var(--blue);letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;font-family:'DM Mono',monospace}
.mkItems{display:flex;flex-direction:column;gap:8px}
.mkItem{font-size:14px;color:var(--text-muted);line-height:1.5;padding-left:4px}
.mkItem.question{color:var(--text);padding:8px 12px;background:rgba(140,80,40,.04);border-radius:6px;border-left:2px solid var(--blue)}
.mkItem.tp{color:var(--text-muted)}

/* Concern */
.concernBox{background:var(--bg-card);border:1px solid var(--border-mid);border-radius:12px;padding:24px}
.concernHead{font-size:18px;font-weight:700;color:var(--text);margin-bottom:12px;font-family:'Inter',sans-serif}
.concernData{font-size:14px;color:oklch(38% 0.09 55);margin-bottom:16px;padding:12px;background:rgba(140,80,40,.06);border-radius:6px}
.concernSteps{margin-top:4px}
.csLabel{font-size:11px;color:var(--text-dim);margin-bottom:10px;font-weight:500;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em}
.csStep{display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;font-size:14px;color:var(--text-muted)}
.csNum{width:22px;height:22px;border-radius:50%;background:var(--blue);color:oklch(99% 0 0);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;font-family:'DM Mono',monospace}

/* Meeting kit sub-label */
.mkSub{font-size:12px;color:var(--text-dim);margin-bottom:10px;font-style:italic}

/* Parent as the Ally Model */
.allyBox{background:var(--bg-card);border:1px solid rgba(140,80,40,.25);border-radius:14px;padding:28px}
.allyHeader{display:flex;align-items:flex-start;gap:16px;margin-bottom:28px}
.allyIcon{font-size:28px;color:var(--blue);flex-shrink:0;margin-top:2px}
.allyTitle{font-family:'Inter',sans-serif;font-size:22px;color:var(--text);font-weight:700;margin-bottom:6px}
.allySub{font-size:14px;color:var(--text-muted);line-height:1.6}
.allyPhases{display:flex;flex-direction:column;gap:0}
.allyPhase{border-top:1px solid var(--border-mid);padding:20px 0}
.allyPhase:first-child{border-top:none;padding-top:0}
.allyPhaseHead{display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.allyPhaseTag{font-family:'DM Mono',monospace;font-size:10px;font-weight:500;color:var(--blue);background:rgba(140,80,40,.08);border:1px solid rgba(140,80,40,.2);padding:3px 10px;border-radius:20px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.allyPhaseName{font-size:15px;font-weight:600;color:var(--text)}
.allyPhaseItems{display:flex;flex-direction:column;gap:10px}
.allyItem{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--text-muted);line-height:1.6}
.allyDot{width:6px;height:6px;border-radius:50%;background:var(--blue);flex-shrink:0;margin-top:7px}
.allyFootnote{margin-top:24px;padding-top:20px;border-top:1px solid var(--border-mid);font-size:13px;color:var(--text-dim);line-height:1.7;font-style:italic}

/* AI Rule */{background:var(--bg-card);border:1px solid rgba(140,80,40,.25);border-radius:12px;padding:24px}
.arTitle{font-family:'Inter',sans-serif;font-size:20px;color:var(--text);margin-bottom:4px;font-weight:700}
.arSub{font-size:12px;color:var(--blue);margin-bottom:14px;font-family:'DM Mono',monospace}
.arInsight{font-size:15px;color:var(--text-muted);line-height:1.7;margin-bottom:12px}
.arAction{font-size:14px;color:oklch(38% 0.09 55);font-weight:500}

/* Footer */
.Rf{margin-top:40px;padding:28px;background:rgba(140,80,40,.05);border:1px solid rgba(140,80,40,.15);border-radius:12px;text-align:center}
.Rf h3{font-family:'Inter',sans-serif;font-size:20px;color:var(--text);margin-bottom:8px;font-weight:700}
.Rf p{font-size:14px;color:var(--text-muted);margin-bottom:16px}
.Rc{display:inline-flex;align-items:center;gap:6px;padding:12px 24px;background:var(--blue);color:oklch(99% 0 0);border:none;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;font-family:'Inter',sans-serif;transition:all .2s}
.Rc:hover{background:var(--blue-hover);transform:translateY(-1px)}
.Rx{text-align:center;font-size:11px;color:var(--text-dim);margin-top:24px;line-height:1.6}

/* Print styles */
.print-only{display:none}
@media print{
  body{background:#fff!important;color:#0f172a!important}
  .no-print{display:none!important}
  .print-only{display:block!important}
  .print-header{text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #2563EB}
  .print-header h1{font-family:'Inter',sans-serif;font-size:24px;color:#0f172a;margin-bottom:4px}
  .print-header p{font-size:12px;color:#64748b}
  .print-footer{text-align:center;margin-top:32px;padding-top:16px;border-top:2px solid #2563EB;font-size:11px;color:#94a3b8}
  .RE,.Rb{padding:0!important}
  .section{break-inside:avoid;margin-bottom:24px!important}
  .secTitle{color:#0f172a!important;font-size:18px!important}
  .secDesc{color:#64748b!important}
  .careerGrid{grid-template-columns:repeat(2,1fr)!important}
  .careerCard{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .ccName{color:#0f172a!important}
  .ccFit,.ccInsight{color:#334155!important}
  .bragBox{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .bragHeader{color:#0f172a!important;border-color:#e2e8f0!important}
  .mkSection{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .mkItem{color:#334155!important}
  .mkItem.question{border-color:#2563EB!important;background:#eff6ff!important;color:#0f172a!important}
  .concernBox{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .concernHead{color:#0f172a!important}
  .concernData{color:#1d4ed8!important;background:#eff6ff!important}
  .csStep{color:#0f172a!important}
  .aiRuleBox{border:1px solid #bfdbfe!important;background:#eff6ff!important}
  .arTitle{color:#0f172a!important}
  .arInsight{color:#334155!important}
  .profK{color:#1d4ed8!important}
  .profV{color:#0f172a!important}
  svg text{fill:#0f172a!important}
  svg path[stroke="#10b981"],svg path[stroke="#f59e0b"],svg path[stroke="#ef4444"]{stroke:#2563EB!important}
  .allyBox{border:1px solid #bfdbfe!important;background:#f8fafc!important}
  .allyTitle{color:#0f172a!important}
  .allySub,.allyItem,.allyFootnote{color:#334155!important}
  .allyPhaseTag{background:#eff6ff!important;color:#1d4ed8!important;border-color:#bfdbfe!important}
  .allyPhaseName{color:#0f172a!important}
  .allyDot{background:#2563EB!important}
  .buildCard{border:1px solid #e2e8f0!important;background:#f8fafc!important}
  .buildAct{color:#0f172a!important}
  .buildConn{color:#475569!important}
}

/* Voice Capture */
.vcWrap{margin-top:12px}
.vcBtn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:1px solid var(--border-mid);border-radius:24px;background:rgba(255,255,255,.03);color:var(--text-muted);font-size:13px;font-family:'Inter',sans-serif;cursor:pointer;transition:all .2s}
.vcBtn.idle:hover{border-color:rgba(140,80,40,.4);color:var(--text);background:rgba(140,80,40,.06)}
.vcBtn.active{border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.08);color:#fca5a5;animation:vcPulseBtn 1.5s ease-in-out infinite}
@keyframes vcPulseBtn{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.15)}50%{box-shadow:0 0 0 6px rgba(239,68,68,.04)}}
.vcPulse{width:8px;height:8px;border-radius:50%;background:#ef4444;flex-shrink:0;animation:vcDot .8s ease-in-out infinite}
@keyframes vcDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}
.vcDone{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(140,80,40,.06);border:1px solid rgba(140,80,40,.2);border-radius:8px;font-size:13px}
.vcDoneIcon{color:var(--blue);font-size:14px;flex-shrink:0}
.vcDoneText{color:var(--text-muted);flex:1}
.vcError{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:13px;color:#fca5a5}
.vcError span{flex:1}
.vcRedo{background:none;border:none;color:var(--blue);font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}

/* AI Toolkit */
.atkWrap{margin-bottom:20px;border-radius:10px;overflow:hidden;border:1px solid var(--border-mid)}
.atkToggle{width:100%;display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(140,80,40,.04);border:none;cursor:pointer;font-family:'Inter',sans-serif;text-align:left;transition:background .2s}
.atkToggle:hover{background:rgba(140,80,40,.08)}
.atkToggleIcon{font-size:11px;color:var(--blue);flex-shrink:0;width:12px}
.atkToggleLabel{font-size:13px;font-weight:600;color:var(--text);font-family:'Inter',sans-serif;letter-spacing:.04em}
.atkToggleSub{font-size:12px;color:var(--text-dim)}
.atkPanel{padding:16px;background:var(--bg-card);border-top:1px solid var(--border-mid)}
.atkTitle{font-family:'Inter',sans-serif;font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px}
.atkIntro{font-size:13px;color:var(--text-muted);margin-bottom:14px;line-height:1.5}
.atkTools{display:grid;gap:8px}
.atkTool{display:block;padding:12px 14px;background:rgba(255,255,255,.02);border:1px solid var(--border-mid);border-radius:8px;text-decoration:none;transition:border-color .2s,background .2s}
.atkTool:hover{border-color:rgba(140,80,40,.4);background:rgba(140,80,40,.04)}
.atkToolTop{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:5px;flex-wrap:wrap}
.atkToolName{font-size:14px;font-weight:600;color:var(--text)}
.atkTag{font-size:10px;font-weight:500;padding:2px 8px;border-radius:20px;white-space:nowrap;font-family:'DM Mono',monospace;letter-spacing:.04em}
.atkToolWhat{font-size:12px;color:var(--text-muted);line-height:1.5}
/* Animations */
@keyframes fiu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
@keyframes fl2{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,30px)}}
@keyframes spin{to{transform:rotate(360deg)}}

/* Responsive */
@media(max-width:600px){.Wst{flex-direction:column;gap:16px}.Wdv{width:40px;height:1px}.Ig{grid-template-columns:1fr}.Ri{flex-direction:column;align-items:flex-start}.careerGrid{grid-template-columns:1fr}.profRow{flex-direction:column;gap:2px}.profK{min-width:auto}}
      `}</style>
    </div>
  );
}
