# Agentic Skills: Sales & Revenue Operations

> Production-ready AI agent skills for B2B outbound, prospect research, cold email generation, call prep, pipeline analysis, and deal tracking.

This repository is part of the **Open Agentic Skills Catalog**. It provides modular, self-contained, and security-hardened skills for autonomous agents (Claude Code, Cursor, Codex, OpenClaw, Gemini CLI, and Antigravity).

## Skills Included (15)

| Skill | Description |
|---|---|
| [`draft-outreach`](skills/draft-outreach) | Research a prospect then draft personalized outreach. Uses web research by default, supercharged with enrichment and CRM. Trigger with draft outreach to [person/company], write cold email to [prospect], reach out to [name]. |
| [`account-research`](skills/account-research) | Research a company or person and get actionable sales intel. Works standalone with web search, supercharged when you connect enrichment tools or your CRM. Trigger with research [company], look up [person], intel on [prospect], who is [name] at [company], or tell me about [company]. |
| [`call-prep`](skills/call-prep) | Prepare for a sales call with account context, attendee research, and suggested agenda. Works standalone with user input and web research, supercharged when you connect your CRM, email, chat, or transcripts. Trigger with prep me for my call with [company], Im meeting with [company] prep me, call prep [company], or get me ready for [meeting]. |
| [`call-summary`](skills/call-summary) | Process call notes or a transcript — extract action items, draft follow-up email, generate internal summary. Use when pasting rough notes or a transcript after a discovery, demo, or negotiation call, drafting a customer follow-up, logging the activity for your CRM, or capturing objections and next steps for your team. |
| [`competitive-intelligence`](skills/competitive-intelligence) | Research your competitors and build an interactive battlecard. Outputs an HTML artifact with clickable competitor cards and a comparison matrix. Trigger with competitive intel, research competitors, how do we compare to [competitor], battlecard for [competitor], or whats new with [competitor]. |
| [`create-an-asset`](skills/create-an-asset) | Generate tailored sales assets (landing pages, decks, one-pagers, workflow demos) from your deal context. Describe your prospect, audience, and goal — get a polished, branded asset ready to share with customers. |
| [`daily-briefing`](skills/daily-briefing) | Start your day with a prioritized sales briefing. Works standalone when you tell me your meetings and priorities, supercharged when you connect your calendar, CRM, and email. Trigger with morning briefing, daily brief, whats on my plate today, prep my day, or start my day. |
| [`forecast`](skills/forecast) | Generate a weighted sales forecast with best/likely/worst scenarios, commit vs. upside breakdown, and gap analysis. Use when preparing a quarterly forecast call, assessing gap-to-quota from a pipeline CSV, deciding which deals to commit vs. call upside, or checking pipeline coverage against your number. |
| [`pipeline-review`](skills/pipeline-review) | Analyze pipeline health — prioritize deals, flag risks, get a weekly action plan. Use when running a weekly pipeline review, deciding which deals to focus on this week, spotting stale or stuck opportunities, auditing for hygiene issues like bad close dates, or identifying single-threaded deals. |
| [`cold-email-writer`](skills/cold-email-writer) | Crea embudos de correo frio completos con variantes A/B basados en campanas exitosas |
| [`lead-scraper`](skills/lead-scraper) | Extrae prospectos B2B hiper-segmentados y entrega spreadsheet con nombres y emails verificados |
| [`leads-agent`](skills/leads-agent) | Production agent skill |
| [`follow-up-nurture`](skills/follow-up-nurture) | Escanea pipeline de ventas y redacta correos de seguimiento personalizados por etapa |
| [`sales-brief`](skills/sales-brief) | Surfaces top and bottom sellers, identifies seasonality patterns, and produces a 2-week content brief to push winners and clear slow movers. Accepts optional lookback window of 30, 60, or 90 days. |
| [`email-outbound-copy-rules`](skills/email-outbound-copy-rules) | Reglas obligatorias de copy y estructura para TODA campaña de email marketing / cold outreach de AgenticEcosystem y SecOpsCorp (ingesta engineer 2026-08-06/07). Cargar SIEMPRE antes de redactar, revisar o automatizar correos de campaña — emails fríos, secuencias, follow-ups, writing room outreach. Triggers: email marketing, cold email, correo frío, outreach, campaña, secuencia, follow-up, seguimiento, copy de correo, subject line, reply rate, segmentación de base de datos. |

## Installation & Usage

### 1. Claude Code
Clone or symlink the desired skill folder directly into your workspace `.claude/skills/` or global `~/.claude/skills/`:

```bash
# Example: install a specific skill into your current workspace
mkdir -p .claude/skills
cp -r skills/draft-outreach .claude/skills/
```

### 2. Antigravity & Generic Agent Harnesses
Copy the skill into your `.agents/skills/` directory:

```bash
mkdir -p .agents/skills
cp -r skills/* .agents/skills/
```

### 3. Cursor & Windsurf
Reference the rule or skill inside your `.cursorrules` or `.windsurfrules`.

## Security & Privacy Guarantee

- **Zero Private Credentials**: All keys, webhooks, and secrets are parameterized as environment variables (`process.env.API_KEY`).
- **Zero PII**: Contains no private emails, phone numbers, or proprietary business tokens.
- **Open License**: Released under the [MIT License](LICENSE).
