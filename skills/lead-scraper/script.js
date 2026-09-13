/**
 * Lead Scraper — SAAN Skill
 * Extrae prospectos B2B via PhantomBuster (LinkedIn Sales Navigator)
 * y enriquece con ScrapingBee. SIN Apollo ni Hunter.
 */

const PHANTOM_BASE = "https://api.phantombuster.com/api/v2";

const INDUSTRY_MAP = {
  "manufactura": "manufacturing",
  "tecnologia": "information technology and services",
  "servicios financieros": "financial services",
  "retail": "retail",
  "salud": "health, wellness and fitness",
  "educacion": "education management",
  "construccion": "construction",
  "mineria": "mining & metals",
  "logistica": "logistics and supply chain",
  "alimentos": "food & beverages",
  "energia": "oil & energy",
  "telecomunicaciones": "telecommunications",
  "inmobiliaria": "real estate",
};

function parseQuery(naturalLanguageQuery) {
  const q = naturalLanguageQuery.toLowerCase();

  const qtyMatch = q.match(/(\d+)\s*(?:leads?|prospectos?|contactos?)/i);
  const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 50;

  const titlePatterns = [
    /(?:gerente|director|jefe|encargado|responsable|vp|head)\s+(?:de\s+)?[\w\s]+/i,
    /(?:cto|ceo|cfo|cmo|coo|vp|svp)/i,
  ];
  let title = null;
  for (const p of titlePatterns) {
    const match = q.match(p);
    if (match) { title = match[0].trim(); break; }
  }

  let industry = null;
  for (const [es, en] of Object.entries(INDUSTRY_MAP)) {
    if (q.includes(es)) { industry = en; break; }
  }

  const locationPatterns = [
    /en\s+(santiago|chile|valparaiso|concepcion|region\s+metropolitana|[\w\s]+,\s*chile)/i,
    /(?:de|desde)\s+(santiago|chile|[\w\s]+)/i,
  ];
  let location = null;
  for (const p of locationPatterns) {
    const match = q.match(p);
    if (match) { location = match[1].trim(); break; }
  }

  let companySize = null;
  const sizeMatch = q.match(/(\d+\+?(?:\s*-\s*\d+)?)\s*empleados/i);
  if (sizeMatch) companySize = sizeMatch[1].replace(/\s/g, "");

  return { quantity, title, industry, location, companySize };
}

/**
 * Construye la URL de busqueda de LinkedIn Sales Navigator
 * basada en los filtros parseados.
 */
function buildSalesNavUrl(params) {
  const base = "https://www.linkedin.com/sales/search/people";
  const filters = [];

  if (params.title) {
    filters.push(`titleIncluded=${encodeURIComponent(params.title)}`);
  }
  if (params.industry) {
    filters.push(`industryIncluded=${encodeURIComponent(params.industry)}`);
  }
  if (params.location) {
    filters.push(`geoIncluded=${encodeURIComponent(params.location)}`);
  }
  if (params.companySize) {
    filters.push(`companySize=${encodeURIComponent(params.companySize)}`);
  }

  return filters.length > 0 ? `${base}?${filters.join("&")}` : base;
}

/**
 * Lanza un Phantom de PhantomBuster para extraer leads de LinkedIn.
 * Requiere tener configurado el Phantom "LinkedIn Sales Navigator Search Export"
 */
async function launchPhantom(apiKey, phantomId, searchUrl, maxResults) {
  // Lanzar el phantom con los parametros
  const response = await fetch(`${PHANTOM_BASE}/agents/launch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-phantombuster-key": apiKey,
    },
    body: JSON.stringify({
      id: phantomId,
      argument: {
        searchUrl,
        numberOfProfiles: maxResults,
        extractEmails: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`PhantomBuster API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene el resultado de un phantom ejecutado.
 */
async function getPhantomOutput(apiKey, containerId) {
  const response = await fetch(`${PHANTOM_BASE}/containers/fetch-output?id=${containerId}`, {
    headers: { "x-phantombuster-key": apiKey },
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data;
}

/**
 * Espera a que el phantom termine (polling).
 */
async function waitForPhantom(apiKey, containerId, maxWaitMs = 300000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const response = await fetch(`${PHANTOM_BASE}/containers/fetch?id=${containerId}`, {
      headers: { "x-phantombuster-key": apiKey },
    });
    const data = await response.json();

    if (data.status === "finished") return data;
    if (data.status === "error") throw new Error(`Phantom failed: ${data.error}`);

    await new Promise((r) => setTimeout(r, 10000)); // Poll cada 10s
  }
  throw new Error("Phantom timeout");
}

/**
 * Enriquece un lead con datos de su sitio web via ScrapingBee.
 */
async function enrichWithScrapingBee(apiKey, websiteUrl) {
  if (!websiteUrl) return null;

  const url = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(websiteUrl)}&render_js=false&extract_rules=${encodeURIComponent(JSON.stringify({
    title: "title",
    description: "meta[name='description']@content",
    h1: "h1",
  }))}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  return response.json();
}

function scoreLead(lead, params) {
  let score = 0;

  if (lead.title && params.title) {
    const t1 = lead.title.toLowerCase();
    const t2 = params.title.toLowerCase();
    if (t1.includes(t2) || t2.includes(t1)) score += 30;
    else score += 10;
  }

  if (lead.email) score += 20;
  else score -= 20;

  if (lead.company) score += 15;
  if (lead.location) score += 15;
  if (lead.linkedinUrl) score += 10;
  if (lead.phone) score += 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Pipeline completo de extraccion de leads.
 * Usa PhantomBuster para LinkedIn y ScrapingBee para enriquecimiento.
 */
async function scrapeLeads(config, naturalLanguageQuery) {
  const { phantomApiKey, phantomId, scrapingBeeApiKey } = config;
  const params = parseQuery(naturalLanguageQuery);

  console.log("Query parseada:", JSON.stringify(params, null, 2));

  // Step 1: Construir URL de busqueda Sales Navigator
  const searchUrl = buildSalesNavUrl(params);
  console.log("Sales Navigator URL:", searchUrl);

  // Step 2: Lanzar PhantomBuster
  console.log("Lanzando PhantomBuster...");
  const launch = await launchPhantom(phantomApiKey, phantomId, searchUrl, params.quantity);
  console.log(`Phantom lanzado, container: ${launch.containerId}`);

  // Step 3: Esperar resultado
  const result = await waitForPhantom(phantomApiKey, launch.containerId);
  const output = await getPhantomOutput(phantomApiKey, launch.containerId);

  // Step 4: Parsear resultados de PhantomBuster
  let leads = (output?.resultObject || []).map((p) => ({
    name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim(),
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email || p.mail || null,
    title: p.title || p.jobTitle || null,
    company: p.company || p.companyName || null,
    industry: p.industry || null,
    location: p.location || p.city || null,
    linkedinUrl: p.profileUrl || p.linkedinUrl || null,
    phone: p.phone || p.phoneNumber || null,
    companyUrl: p.companyUrl || p.website || null,
  }));

  console.log(`PhantomBuster: ${leads.length} leads extraidos`);

  // Step 5: Enriquecer top leads con ScrapingBee (solo los primeros 10 para no gastar creditos)
  if (scrapingBeeApiKey) {
    const topLeads = leads.filter((l) => l.companyUrl).slice(0, 10);
    for (const lead of topLeads) {
      const enrichment = await enrichWithScrapingBee(scrapingBeeApiKey, lead.companyUrl);
      if (enrichment) {
        lead.companyDescription = enrichment.description || null;
        lead.companyTitle = enrichment.title || null;
      }
      await new Promise((r) => setTimeout(r, 500)); // Rate limit
    }
    console.log(`ScrapingBee: ${topLeads.length} empresas enriquecidas`);
  }

  // Step 6: Scoring
  for (const lead of leads) {
    lead.score = scoreLead(lead, params);
  }

  leads.sort((a, b) => b.score - a.score);
  leads = leads.slice(0, params.quantity);

  const withEmail = leads.filter((l) => l.email).length;

  return {
    query_parsed: params,
    results: {
      total_found: leads.length,
      with_email: withEmail,
      avg_score: Math.round(leads.reduce((s, l) => s + l.score, 0) / (leads.length || 1)),
    },
    leads: leads.map((l) => ({
      name: l.name,
      email: l.email,
      title: l.title,
      company: l.company,
      industry: l.industry,
      location: l.location,
      linkedin_url: l.linkedinUrl,
      phone: l.phone,
      company_url: l.companyUrl,
      company_description: l.companyDescription || null,
      score: l.score,
    })),
  };
}

module.exports = { scrapeLeads, parseQuery, scoreLead, buildSalesNavUrl };

if (require.main === module) {
  console.log("Lead Scraper — usa PhantomBuster + ScrapingBee");
  console.log("Requiere: PHANTOMBUSTER_API_KEY, PHANTOMBUSTER_PHANTOM_ID, SCRAPINGBEE_API_KEY en .env");
  console.log('Ejemplo: scrapeLeads(config, "50 gerentes de TI en manufactura en Santiago")');
}
