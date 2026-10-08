/**
 * Follow-up Nurture CRM — SAAN Skill
 * Escanea pipeline, lee historial de correos y genera follow-ups personalizados.
 */

const { google } = require("googleapis");

// Configuracion de tiempos de follow-up por etapa (en dias)
const FOLLOW_UP_RULES = {
  contacted: { daysWithoutReply: 3, type: "bump", tone: "muy informal" },
  meeting_scheduled: { daysWithoutReply: 1, type: "confirmacion", tone: "amigable" },
  proposal_sent: { daysWithoutReply: 5, type: "check_in", tone: "casual" },
  negotiating: { daysWithoutReply: 7, type: "value_add", tone: "profesional" },
  warm: { daysWithoutReply: 14, type: "re_engagement", tone: "personal" },
};

const SIGNATURES = [
  "Alex",
  "Alex M.",
  "Alex Morgan",
  "- Alex",
];

const TEMPLATES = {
  bump: [
    "Hey {nombre}, solo queria ver si viste mi mensaje anterior. Cualquier cosa me dices!",
    "{nombre} - se me paso preguntarte, pudiste revisar lo que te mande?",
    "Buena {nombre}! Solo un ping rapido por si se te paso el email anterior",
    "{nombre}, te escribi hace unos dias. Algun comentario?",
  ],
  confirmacion: [
    "{nombre}, seguimos para la reunion de {fecha}? Quedo atento!",
    "Hey {nombre}! Solo confirmando nuestra junta. Nos vemos el {fecha}",
    "{nombre} - todo bien para el {fecha}? Si necesitas mover, me dices",
  ],
  check_in: [
    "{nombre}, alguna duda con la propuesta? Feliz de ajustar lo que necesites",
    "Hey! Solo checkeando si pudiste revisar la propuesta. Sin apuro, pero quedo atento",
    "{nombre} - se que estas ocupado, pero queria saber si la propuesta les hizo sentido",
    "{nombre}, como vas con la propuesta? Si hay algo que ajustar, me cuentas",
  ],
  value_add: [
    "{nombre}, vi un articulo sobre {industria} que te puede servir: {recurso}",
    "Hey {nombre}! Se me ocurrio una idea para {empresa} que te quiero contar",
    "{nombre}, un cliente nuestro en {industria} tuvo resultados interesantes que te podrian servir",
  ],
  re_engagement: [
    "{nombre}! Tiempo sin hablar. Como va todo por {empresa}?",
    "Hey {nombre}, me acorde de ti. Como van las cosas en {industria}?",
    "{nombre}, se que ha pasado tiempo. Solo queria saber como estas y si hay algo en que pueda ayudar",
  ],
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSignature() {
  return getRandomElement(SIGNATURES);
}

function needsFollowUp(lead) {
  const rule = FOLLOW_UP_RULES[lead.status];
  if (!rule) return false;
  if (lead.doNotContact) return false;

  const daysSinceContact = (Date.now() - (lead.lastContactedAt || 0)) / (1000 * 60 * 60 * 24);
  return daysSinceContact >= rule.daysWithoutReply;
}

function generateFollowUpBody(lead) {
  const rule = FOLLOW_UP_RULES[lead.status];
  if (!rule) return null;

  const templates = TEMPLATES[rule.type] || TEMPLATES.bump;
  let body = getRandomElement(templates);

  // Replace placeholders
  body = body.replace(/{nombre}/g, lead.firstName || lead.name?.split(" ")[0] || "");
  body = body.replace(/{empresa}/g, lead.company || "tu empresa");
  body = body.replace(/{industria}/g, lead.industry || "tu sector");
  body = body.replace(/{fecha}/g, lead.meetingDate || "la fecha acordada");
  body = body.replace(/{recurso}/g, lead.resourceUrl || "algo interesante");

  const signature = getRandomSignature();

  return {
    body: `${body}\n\n${signature}`,
    signature,
    type: rule.type,
    tone: rule.tone,
  };
}

async function createGmailClient(credentials) {
  const auth = new google.auth.OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    credentials.redirectUri
  );
  auth.setCredentials({ refresh_token: credentials.refreshToken });
  return google.gmail({ version: "v1", auth });
}

async function getEmailThread(gmail, prospectEmail) {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: `from:${prospectEmail} OR to:${prospectEmail}`,
    maxResults: 10,
  });

  if (!res.data.messages) return null;

  const thread = await gmail.users.threads.get({
    userId: "me",
    id: res.data.messages[0].threadId,
    format: "metadata",
  });

  return {
    threadId: thread.data.id,
    messageCount: thread.data.messages.length,
    lastMessageId: thread.data.messages[thread.data.messages.length - 1].id,
  };
}

function createReplyRaw(to, subject, body, threadId, messageId) {
  const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;

  const email = [
    `To: ${to}`,
    `Subject: ${replySubject}`,
    `In-Reply-To: ${messageId}`,
    `References: ${messageId}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");

  return Buffer.from(email).toString("base64url");
}

async function generateFollowUps(leads, gmailCredentials, options = {}) {
  const { dryRun = true, maxFollowUps = 20 } = options;

  const gmail = gmailCredentials ? await createGmailClient(gmailCredentials) : null;

  const results = {
    follow_ups_generated: 0,
    by_stage: {},
    emails: [],
  };

  const eligibleLeads = leads.filter(needsFollowUp).slice(0, maxFollowUps);

  for (const lead of eligibleLeads) {
    const followUp = generateFollowUpBody(lead);
    if (!followUp) continue;

    const stage = lead.status;
    results.by_stage[stage] = (results.by_stage[stage] || 0) + 1;

    let threadInfo = null;
    if (gmail && lead.email) {
      threadInfo = await getEmailThread(gmail, lead.email);
    }

    const emailData = {
      to: lead.email,
      thread_id: threadInfo?.threadId || null,
      stage,
      subject: lead.lastSubject || `Seguimiento - ${lead.company || ""}`,
      body: followUp.body,
      signature: followUp.signature,
      type: followUp.type,
      status: dryRun ? "draft" : "sent",
    };

    if (!dryRun && gmail && threadInfo) {
      const raw = createReplyRaw(
        lead.email,
        emailData.subject,
        followUp.body,
        threadInfo.threadId,
        threadInfo.lastMessageId
      );
      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw, threadId: threadInfo.threadId },
      });
      emailData.status = "sent";
    }

    results.emails.push(emailData);
    results.follow_ups_generated++;
  }

  return results;
}

module.exports = { generateFollowUps, needsFollowUp, generateFollowUpBody };

if (require.main === module) {
  console.log("Follow-up Nurture CRM — requiere credenciales Gmail OAuth2 y datos del pipeline");
  console.log("Modo: draft por defecto (no envia sin aprobacion)");
}
