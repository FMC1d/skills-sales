---
id: lead-scraper
name: Extractor de Leads B2B
version: 1.0.0
category: leads
agent: leads
trigger: "\\f lead scraper"
requires: [apollo-api, hunter-api, google-sheets-api, firecrawl]
type: code-assisted
description: Extrae prospectos B2B hiper-segmentados y entrega spreadsheet con nombres y emails verificados
---

# SOP: Extractor de Leads B2B

## Objetivo
A partir de una instruccion en lenguaje natural, encontrar prospectos B2B segmentados por cargo, industria y ubicacion. Entregar spreadsheet con datos verificados.

## Entrada
- Instruccion en lenguaje natural (ej: "Extrae 50 gerentes de TI en empresas de manufactura en Santiago")
- Opcional: filtros adicionales (tamaño empresa, revenue, tecnologias)

## Proceso

### Paso 1: Parsear Instruccion
Extraer de la instruccion:
- **Cantidad** de leads deseados (default: 50)
- **Cargo/Titulo** (ej: "Gerente de TI", "CTO", "Director Comercial")
- **Industria** (ej: "manufactura", "retail", "servicios financieros")
- **Ubicacion** (ej: "Santiago", "Chile", "Region Metropolitana")
- **Tamaño empresa** (ej: "50+ empleados", "100-500 empleados")
- **Filtros extra** (revenue, tecnologias usadas, etc.)

### Paso 2: Buscar en Apollo.io API
- Construir query con los filtros parseados
- Endpoint: `POST /v1/mixed_people/search`
- Parametros: person_titles, person_locations, organization_industries, organization_num_employees_ranges
- Paginar si se necesitan mas resultados
- Rate limit: respetar 100 requests/minuto

### Paso 3: Enriquecer Datos con Hunter.io
Para cada lead de Apollo que no tenga email verificado:
- `GET /v2/email-finder?domain={domain}&first_name={first}&last_name={last}`
- Verificar email: `GET /v2/email-verifier?email={email}`
- Solo incluir emails con confidence >= 80%

### Paso 4: Enriquecer con Firecrawl (opcional)
Para leads de alta prioridad:
- Scrape del sitio web de la empresa
- Extraer: descripcion de servicios, tecnologias mencionadas, tamaño equipo
- Guardar como contexto para personalizacion de outreach

### Paso 5: Scoring Basico
Puntuar cada lead (0-100):
- +30: Cargo coincide exactamente con lo buscado
- +20: Email verificado con alta confianza
- +20: Empresa del tamaño correcto
- +15: Industria coincide exactamente
- +15: Ubicacion coincide
- -20: Email no verificable
- -10: Perfil incompleto (sin telefono, sin LinkedIn)

### Paso 6: Exportar a Google Sheet
- Crear o actualizar Google Sheet via API
- Columnas: Nombre Completo, Email, Cargo, Empresa, Industria, Ubicacion, LinkedIn URL, Telefono, Score, Fecha Extraccion
- Ordenar por Score descendente
- Agregar hoja "Metadata" con parametros de busqueda usados

### Paso 7: Registrar en Convex
- Guardar leads en tabla agentMemory (tipo: "lead_batch")
- Registrar metricas: total encontrados, verificados, tasa de match

## APIs Necesarias

### Apollo.io
```
Base URL: https://api.apollo.io/api/v1
Auth: x-api-key header
Endpoints clave:
  POST /mixed_people/search — buscar personas
  POST /people/match — enriquecer persona
```

### Hunter.io
```
Base URL: https://api.hunter.io/v2
Auth: api_key query param
Endpoints clave:
  GET /email-finder — encontrar email
  GET /email-verifier — verificar email
  GET /domain-search — todos los emails de un dominio
```

### Google Sheets API
```
Base URL: https://sheets.googleapis.com/v4
Auth: OAuth2 o Service Account
Endpoints:
  POST /spreadsheets — crear nueva hoja
  PUT /spreadsheets/{id}/values/{range} — escribir datos
```

## Formato de Salida

```json
{
  "query_parsed": {
    "quantity": 50,
    "title": "Gerente de TI",
    "industry": "manufactura",
    "location": "Santiago, Chile",
    "company_size": "50+"
  },
  "results": {
    "total_found": 67,
    "emails_verified": 52,
    "avg_score": 78
  },
  "google_sheet_url": "https://docs.google.com/spreadsheets/d/...",
  "top_leads": [
    {
      "name": "Juan Perez",
      "email": "jperez@empresa.cl",
      "title": "Gerente de Tecnologia",
      "company": "Empresa XYZ",
      "score": 95
    }
  ]
}
```

## Compliance
- **Ley 19.628** vigente: sistema opt-out, incluir desuscripcion
- **Ley 21.719** (vigencia plena dic 2026): consentimiento o interes legitimo documentable
  - Documentar origen de cada lead
  - Implementar registro de interes legitimo por segmento
  - Sanciones: hasta 20.000 UTM por infracciones muy graves
- No scrappear LinkedIn directamente (usar APIs autorizadas como Apollo.io)
- Incluir mecanismo de opt-out en cualquier contacto posterior
- Solo datos B2B profesionales (cargo, email corporativo, empresa)
- No recolectar datos sensibles
- Implementar mecanismo de eliminacion ante solicitud del titular
- Retener datos por maximo 12 meses, luego purgar

## Waterfall de Enriquecimiento (investigacion 2026)
Orden recomendado para maximizar cobertura:
1. Apollo.io (210M+ contactos, filtros completos) — fuente primaria
2. Hunter.io (verificacion email, confidence score) — validacion
3. Firecrawl (scrape sitio web empresa) — contexto para personalizacion
4. ScrapingBee (backup para sitios que bloquean) — fallback

## Filtros Optimos para Mercado Chileno
- **Cargo:** VP Ventas, Director Comercial, Gerente de Ventas, Head of Sales, CRO, CEO
- **Industria:** SaaS, Fintech, Servicios profesionales, Manufactura, Logistica
- **Ubicacion:** Chile (Santiago prioritario)
- **Tamano:** 50-500 empleados
- **Senales:** Stack CRM (HubSpot/Salesforce), hiring signals (contratando vendedores)

## Reglas
- Maximo 200 leads por ejecucion (para no agotar creditos API)
- Solo incluir leads con email verificado (>= 80% confidence)
- Si Apollo no tiene suficientes resultados, ampliar filtros automaticamente
- Logging completo de cada API call para auditoria de costos
