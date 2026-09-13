# Leads Agent — AI SDR con Metacognicion
## SAAN v1.0 | AgenticEcosystem Autonomous Agent Network

### Mision
Descubrir, enriquecer, calificar y preparar outreach para prospectos B2B chilenos de forma autonoma, mejorando continuamente sus propias capacidades.

### Skills del Agente

| Skill ID | Tipo | Fuente | Frecuencia | Costo Est. |
|----------|------|--------|------------|------------|
| leads-discover-firecrawl | Discovery | Firecrawl Search | Diario 06:00 | $0.008/dia |
| leads-discover-phantombuster | Discovery | PhantomBuster LinkedIn | L/Mi/Vi 07:00 | $1.50/semana |
| leads-discover-scrapingbee | Discovery | ScrapingBee Directories | Ma/Ju 06:30 | $0.002/semana |
| leads-enrich-firecrawl | Enrichment | Firecrawl Scrape | Cada 2h | $0.12/dia |
| leads-score-gemini | Scoring | Gemini 2.5 Flash Lite | Cada 3h | $0.016/dia |
| leads-sdr-outreach | Outreach | Claude Sonnet | Cada 6h | $0.20/dia |
| leads-skill-metacognition | Metacognicion | Claude Sonnet | Domingo 20:00 | $0.03/semana |

**Costo total estimado: ~$3.60/semana (~$14.40/mes)** (Gemini para scoring mantiene el costo bajo)

### Pipeline de Datos

```
Discovery (3 fuentes) --> Deduplicacion --> Enrichment --> AI Scoring (ICP dinamico) --> SDR Outreach --> CEO Review
                                                               ^                                          |
                                                               +-- Metacognicion semanal (mejora skills) <-+
```

### ICP Configurable
El perfil de cliente ideal se almacena en Convex (tabla icpProfiles) y es editable por el CEO. El agente usa el ICP activo para scoring. La metacognicion puede proponer ajustes al ICP basado en resultados.

**ICP Default AgenticEcosystem:**
- Industrias: SaaS, fintech, servicios profesionales, consultoras IT, marketing digital
- Tamano: 50-500 empleados
- Ubicacion: Santiago, Chile
- Senales de compra: necesita CRM, equipo ventas 3+, crecimiento reciente
- Tech positivo: HubSpot, Salesforce, Pipedrive (buscan alternativa)
- Roles objetivo: VP Ventas, Director Comercial, Gerente de Operaciones, CMO

### Metacognicion

Cada domingo a las 20:00 Chile, el agente:
1. Analiza rendimiento de todas sus skills (leads generados, costo/lead, error rate)
2. Identifica skills ineficientes (alto costo, pocos HOT leads)
3. Aplica mejoras automaticas de bajo riesgo (queries, reglas, parametros)
4. Propone cambios mayores al CEO (nuevas skills, desactivaciones, cambio de modelo)
5. Guarda insight en agentMemory para informar la proxima semana (memory-before-action)

**Ciclo de mejora:**
```
Semana N: Skills ejecutan con config actual
          --> Metacognicion analiza resultados
          --> Aplica mejoras automaticas
          --> Propone cambios al CEO
Semana N+1: Skills ejecutan con config mejorada
            --> Scoring consulta insights previos (memory-before-action)
            --> Mejor precision de scoring
```

### Deduplicacion
- **Nivel 1:** Email exacto (primer lookup)
- **Nivel 2:** Nombre de empresa (segundo lookup si no hay email)
- Leads de multiples fuentes se mergean en un solo registro
- Cada fuente se registra en sourceDetails para trazabilidad

### SDR Pipeline (10 estados)

```
new --> enriched --> scored --> outreach_queued --> contacted --> replied --> meeting_booked --> converted
                                    |
                                    +--> rejected (no ICP fit)
                                    +--> nurturing (WARM, seguimiento)
```

**Outreach Stages:**
1. email_1 (presentacion)
2. linkedin_connect (conexion + nota)
3. linkedin_message (valor + caso de uso)
4. phone_call (si hay telefono, script personalizado)

### APIs Necesarias

| Variable | Servicio | Uso |
|----------|----------|-----|
| FIRECRAWL_API_KEY | Firecrawl | Discovery + Enrichment |
| PHANTOMBUSTER_API_KEY | PhantomBuster | LinkedIn Discovery |
| PB_SALES_NAV_AGENT_ID | PhantomBuster | Agent ID para Sales Nav |
| SCRAPINGBEE_API_KEY | ScrapingBee | Directory Discovery |
| ANTHROPIC_API_KEY | Anthropic | SDR Outreach + Metacognicion |
| GEMINI_API_KEY | Google AI | AI Scoring (bulk) |
| SAAN_CONVEX_SITE_URL | Convex | Data layer URL |
| SAAN_CONVEX_SECRET | Convex | API auth secret |

### Compliance

- **Ley 19.628** (Proteccion de datos personales Chile)
- **Ley 21.719** (nueva ley de datos Chile, 2024)
- Solo datos empresariales publicos (no datos personales sensibles)
- Leads pueden solicitar eliminacion via contact@example.com
- PhantomBuster respeta robots.txt de LinkedIn
- ScrapingBee usa renderizado JS legal (no scraping agresivo)
- Datos almacenados en Convex con encriptacion en transito y reposo

### Workflows n8n

| # | Workflow | Nodos | Plan |
|---|----------|-------|------|
| 1 | saan-leads-discover-firecrawl.json | 12 | 04-02 |
| 2 | saan-leads-discover-phantombuster.json | 11 | 04-02 |
| 3 | saan-leads-discover-scrapingbee.json | 12 | 04-02 |
| 4 | saan-leads-enrich.json | 16 | 04-02 |
| 5 | saan-leads-score-ai.json | 21 | 04-03 |
| 6 | saan-leads-sdr-outreach.json | 20 | 04-03 |
| 7 | saan-leads-skill-metacognition.json | 18 | 04-04 |

**Total: 110 nodos n8n**

### Tablas Convex

| Tabla | Proposito | Funciones |
|-------|-----------|-----------|
| leads | Prospectos B2B multi-fuente con pipeline SDR | 15 en leads.ts |
| icpProfiles | Perfiles de cliente ideal configurables | 4 en icpProfiles.ts |
| skillsRegistry | Skills del agente (compartida con otros agentes) | 7 en leadsSkills.ts |
| agentMemory | Memorias, reportes, insights, decisiones | Via agents.ts |
| agentsState | Estado del agente en tiempo real | Via agents.ts |
| agentTasks | Tareas inter-agente y CEO approval | Via agents.ts |

### Metricas Clave

- **Leads descubiertos/semana:** Target 50-100
- **HOT leads/semana:** Target 5-10 (10% conversion)
- **Costo por lead calificado:** Target < $0.50
- **Costo operativo total:** ~$14.40/mes
- **Outreach generados/semana:** Target 15-20
- **Error rate por skill:** Target < 5%

### Arquitectura de Decisiones

| Decision | Razonamiento |
|----------|-------------|
| Gemini para scoring, Claude para outreach | Costo vs calidad: scoring es bulk ($0.0002), outreach necesita creatividad ($0.01) |
| 3 fuentes de discovery | Diversificacion: web (Firecrawl), LinkedIn (PB), directorios (SB) |
| Metacognicion semanal (no diaria) | Balance costo/impacto: cambios semanales dan datos suficientes |
| Skills en skillsRegistry (no hardcoded) | Extensibilidad: nuevas skills se registran sin cambiar codigo |
| ICP en Convex (no en workflow) | Centralizado: scoring y metacognicion comparten mismo ICP |
| Memory-before-action | Aprendizaje: cada scoring consulta insights previos |
