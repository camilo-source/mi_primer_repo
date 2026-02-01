export const GRADING_RUBRIC = `
# STANDARD GRADING RUBRIC (VIBE CODE ATS)

All candidates must be evaluated against this consistent standard. Do not deviate based on "potential" unless explicitly asked.

## 1. SCORING PILLARS (Total: 100 Points)

### A. Technical Match (40 Points)
- **40 pts**: Perfect match. Has ALL required skills + desirable extras + relevant seniority.
- **30 pts**: Strong match. Has all required skills but lacks desirable extras.
- **20 pts**: Good match. Has most core skills (75%+) but missing 1 or 2 key technologies.
- **10 pts**: Weak match. Has partial overlap (e.g., knows React but not TypeScript for a TS role).
- **0 pts**: No match. Skills do not align at all (e.g., Python dev for a Frontend role).

### B. Experience & Seniority (30 Points)
- **30 pts**: Exceeds years of experience OR shows high impact/leadership in similar roles.
- **20 pts**: Meets the exact years of experience required.
- **10 pts**: Slightly junior (1-2 years below req) but shows growth.
- **0 pts**: Significantly junior or senior for the role (if overqualified is a concern).

### C. Soft Skills & Communication (15 Points)
- **15 pts**: Clear, professional, well-structured CV. Shows evidence of leadership/teamwork.
- **10 pts**: Standard professional CV. No red flags.
- **5 pts**: Minor issues (typos, messy formatting).
- **0 pts**: Poor communication, confusing layout, unprofessional tone.

### D. Industry/Domain Relevance (15 Points)
- **15 pts**: Previous experience in the EXACT same industry (e.g., Fintech for a Fintech role).
- **10 pts**: Experience in adjacent or high-tech industries.
- **5 pts**: General experience unrelated to the domain.
- **0 pts**: No relevant context.

## 2. MANDATORY RULES
1. **The "Zero" Rule**: If a candidate lacks a VISA or LOCATION requirement marked as "EXCLUYENTE" (Exclusive), their Technical Score is capped at 50% regardless of skills.
2. **The Output**: Always be objective.
3. **Inclusion**: ALL candidates must be graded. Never discard a candidate; just give them a low score if deserved.

## 3. OUTPUT SCHEMA
You must provide:
- **Numerical Score**: 0 to 100.
- **Reasoning**: A 2-sentence executive summary.
- **Pros**: 3 bullet points.
- **Cons**: 3 bullet points.
`;
