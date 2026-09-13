/**
 * Cold Email Campaign Writer — SAAN Skill
 * Crea secuencias de correo frio con variantes A/B.
 */

const SEQUENCE_STRUCTURE = [
  { step: 1, delayDays: 0, name: "Primer Contacto" },
  { step: 2, delayDays: 3, name: "Seguimiento de Valor" },
  { step: 3, delayDays: 7, name: "Prueba Social" },
  { step: 4, delayDays: 14, name: "Ultimo Intento" },
];

const SUBJECT_STYLES = {
  question: (vars) => `${vars.firstName}, pregunta rapida sobre ${vars.company}`,
  curiosity: (vars) => `vi algo interesante sobre ${vars.company}`,
  number: (vars) => `3 ideas para ${vars.industry} que te van a servir`,
  direct: (vars) => `${vars.firstName}, ${vars.painPoint}?`,
  social: (vars) => `como ${vars.socialProof} logro resultados en ${vars.industry}`,
};

function buildCampaignPrompt(briefing) {
  return `Eres un experto en cold email B2B. Crea una secuencia de 4 correos para una campana de outreach.

BRIEFING:
- Oferta: ${briefing.offer}
- Nicho: ${briefing.niche}
- Pain points: ${briefing.painPoints?.join(", ") || "por definir"}
- CTA: ${briefing.cta || "agendar reunion de 15 min"}
- Empresa que envia: AgenticEcosystem — automatizacion de ventas B2B
- Estadisticas verificadas disponibles:
  * 5-7x mas conversiones vs stack DIY
  * 78% de clientes compran del primer vendedor en responder
  * 21x mas conversiones respondiendo < 5 min

ESTRUCTURA DE LA SECUENCIA:

**Email 1 — Primer Contacto (Dia 0)**
- Subject llamativo (max 6 palabras, minusculas)
- 1 linea de contexto personalizado
- Pain point del nicho
- Solucion breve (1 linea)
- CTA simple (pregunta si/no)
- 50-80 palabras

**Email 2 — Seguimiento de Valor (Dia 3)**
- NO repetir el pitch
- Compartir dato o recurso relevante
- CTA diferente
- 40-60 palabras

**Email 3 — Prueba Social (Dia 7)**
- Resultado concreto con cliente similar
- Estadistica verificable (usar las de arriba)
- CTA: agendar reunion
- 40-60 palabras

**Email 4 — Ultimo Intento (Dia 14)**
- Tono honesto, "no quiero ser molesto"
- Ofrecer valor sin pedir nada
- CTA suave
- 30-50 palabras

Para cada email genera 2 variantes (A y B) con distinto subject y opening.

REGLAS:
- Tono casual, como si lo escribiera un humano
- NUNCA inventar testimonios
- Sin mayusculas ni signos de exclamacion en subjects
- Sin imagenes
- Incluir {{first_name}}, {{company}}, {{industry}} como variables
- Responde en JSON

Formato:
{
  "campaign_name": "...",
  "sequence": [
    {
      "step": 1,
      "delay_days": 0,
      "name": "Primer Contacto",
      "variants": [
        {"variant": "A", "subject": "...", "body": "...", "word_count": N},
        {"variant": "B", "subject": "...", "body": "...", "word_count": N}
      ]
    }
  ]
}`;
}

function createCampaignConfig(briefing, sequence) {
  return {
    campaign_name: `Outreach ${briefing.niche} ${new Date().toISOString().slice(0, 7)}`,
    target_niche: briefing.niche,
    sequence,
    personalization_fields: ["first_name", "company", "industry", "city", "pain_point"],
    schedule: {
      days: ["mon", "tue", "wed", "thu", "fri"],
      hours: "09:00-17:00",
      timezone: "America/Santiago",
    },
    deliverability: {
      send_domain: "outreach.AgenticEcosystem.cl",
      daily_limit_per_inbox: 50,
      warmup_days: 14,
      tracking: false, // No tracking in first sends
      spf: true,
      dkim: true,
      dmarc: true,
    },
    compliance: {
      unsubscribe_link: true,
      sender_identification: true,
      data_law: "Ley 19.628 Chile",
      blacklist_on_negative_reply: true,
    },
    platform_configured: "draft",
    template_saved: false,
  };
}

async function createCampaign(briefing, options = {}) {
  const { claudeApiKey = null, saveToDB = false } = options;

  if (!briefing.offer || !briefing.niche) {
    throw new Error("Briefing debe incluir 'offer' y 'niche' como minimo");
  }

  const prompt = buildCampaignPrompt(briefing);
  const config = createCampaignConfig(briefing, SEQUENCE_STRUCTURE);

  // In production: send prompt to Claude API
  // const sequence = await callClaude(prompt);
  // config.sequence = sequence;

  return {
    prompt, // For manual execution or n8n
    config,
    status: "prompt_ready",
  };
}

/**
 * Configura campana en Instantly.ai via API V2.
 * Instantly maneja: warm-up, rotacion de buzones, A/Z testing, deliverability.
 * Resend se reserva para emails transaccionales del producto.
 */
async function setupInstantly(apiKey, campaign) {
  const BASE = "https://api.instantly.ai/api/v2";

  // Create campaign
  const res = await fetch(`${BASE}/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: campaign.campaign_name,
      campaign_schedule: {
        schedules: [{
          days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
          timezone: "America/Santiago",
          timing: { from: "09:00", to: "17:00" },
        }],
      },
    }),
  });

  if (!res.ok) throw new Error(`Instantly API error: ${res.status}`);

  const data = await res.json();
  return { campaignId: data.id, status: "created" };
}

/**
 * Agrega leads a una campana de Instantly.
 */
async function addLeadsToInstantly(apiKey, campaignId, leads) {
  const BASE = "https://api.instantly.ai/api/v2";

  const res = await fetch(`${BASE}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      campaign_id: campaignId,
      leads: leads.map((l) => ({
        email: l.email,
        first_name: l.first_name || l.firstName,
        last_name: l.last_name || l.lastName,
        company_name: l.company,
        custom_variables: {
          industry: l.industry || "",
          pain_point: l.painPoint || "",
          city: l.city || l.location || "",
        },
      })),
    }),
  });

  if (!res.ok) throw new Error(`Instantly leads API error: ${res.status}`);
  return res.json();
}

/**
 * Envia email individual via Resend (para transaccional/follow-ups, NO cold email).
 */
async function sendViaResend(apiKey, emailData) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: emailData.from || "engineer <engineer@AgenticEcosystem.cl>",
      to: [emailData.to],
      subject: emailData.subject,
      text: emailData.body,
      reply_to: emailData.replyTo || "contact@example.com",
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Resend API error: ${res.status} - ${error.message}`);
  }

  return res.json();
}

module.exports = { createCampaign, buildCampaignPrompt, createCampaignConfig };

if (require.main === module) {
  console.log("Cold Email Campaign Writer — genera prompts y configuracion de campana");
  console.log("Requiere Claude API para generar secuencia y opcionalmente Instantly.ai API");
}
