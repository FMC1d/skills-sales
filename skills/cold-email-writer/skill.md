---
id: cold-email-writer
name: Cold Email Campaign Writer
version: 1.0.0
category: sales
agent: sales
trigger: "\\f cold email"
requires: [instantly-api, claude-api, resend]
type: code-assisted
description: Crea embudos de correo frio completos con variantes A/B basados en campanas exitosas
---

# SOP: Cold Email Campaign Writer

## Objetivo
Automatizar la creacion de campanas de correo frio completas: secuencia de emails, variantes A/B, personalizacion por prospecto, y configuracion en plataforma de envio.

## Entrada
- Descripcion de la oferta (texto o transcripcion de voz)
- Nicho/industria objetivo
- Opcional: campana exitosa previa a clonar
- Opcional: lista de leads (Google Sheet URL)

## Proceso

### Paso 1: Ingerir Briefing
- Si es transcripcion de voz, limpiar y estructurar
- Extraer: oferta principal, beneficios clave, publico objetivo, CTA deseado
- Identificar pain points del nicho

### Paso 2: Buscar Campanas Previas Exitosas
- Revisar en Convex (agentMemory tipo: "campaign_template")
- Filtrar por industria similar o metricas de exito (open rate > 40%, reply rate > 5%)
- Si existe campana exitosa, usarla como base
- Si no existe, generar desde cero

### Paso 3: Disenar Secuencia de Emails
Estructura estandar de embudo frio:

**Email 1 — Primer Contacto (Dia 0)**
- Subject line llamativo (max 6 palabras)
- Contexto personalizado (1 linea sobre el prospecto)
- Pain point del nicho
- Solucion breve
- CTA simple (pregunta si/no)
- Largo: 50-80 palabras

**Email 2 — Seguimiento de Valor (Dia 3)**
- No repetir el pitch
- Compartir un dato, caso de exito o recurso relevante
- CTA diferente al Email 1
- Largo: 40-60 palabras

**Email 3 — Prueba Social (Dia 7)**
- Mencionar resultado concreto con cliente similar
- Estadistica verificable
- CTA: agendar reunion corta
- Largo: 40-60 palabras

**Email 4 — Ultimo Intento (Dia 14)**
- Tono honesto, "solo queria asegurarme de no ser molesto"
- Ofrecer valor sin pedir nada
- CTA suave: "responde si prefieres que no te escriba mas"
- Largo: 30-50 palabras

### Paso 4: Generar Variantes A/B
Para cada email generar 2-3 variantes:
- **Subject line:** 3 variantes por email (pregunta, numero, curiosidad)
- **Opening line:** 2 variantes (personalizada vs generica)
- **CTA:** 2 variantes (pregunta vs afirmacion)

### Paso 5: Agregar Personalizacion Dinamica
Variables disponibles:
- `{{first_name}}` — nombre del prospecto
- `{{company}}` — empresa del prospecto
- `{{industry}}` — industria
- `{{city}}` — ciudad
- `{{pain_point}}` — pain point especifico del nicho
- `{{custom_1}}` — campo personalizado (ej: tecnologia que usan)

### Paso 6: Configurar en Plataforma de Envio
Si se usa Instantly.ai:
- Crear campana via API
- Subir secuencia de emails
- Configurar schedule (Lun-Vie, 9:00-17:00 Chile)
- Activar tracking de opens/clicks
- Configurar warmup del dominio si es nuevo

Si se usa Resend (envio directo):
- Configurar secuencia con delays via n8n workflows
- Tracking via pixel y link wrapping

### Paso 7: Guardar Como Template
- Guardar campana exitosa en agentMemory para reusar
- Tags: industria, tamaño, resultado

## Formato de Salida

```json
{
  "campaign_name": "Outreach Manufactura Chile Q1-2026",
  "target_niche": "Gerentes de Operaciones en manufactura",
  "sequence": [
    {
      "step": 1,
      "delay_days": 0,
      "variants": [
        {
          "variant": "A",
          "subject": "pregunta rapida sobre {company}",
          "body": "...",
          "cta": "Te hace sentido explorar esto?"
        },
        {
          "variant": "B",
          "subject": "{first_name}, vi algo interesante",
          "body": "...",
          "cta": "Vale la pena una llamada de 15 min?"
        }
      ]
    }
  ],
  "personalization_fields": ["first_name", "company", "industry"],
  "schedule": {
    "days": ["mon", "tue", "wed", "thu", "fri"],
    "hours": "09:00-17:00",
    "timezone": "America/Santiago"
  },
  "platform_configured": "instantly|resend|draft",
  "template_saved": true
}
```

## Deliverability Best Practices (investigacion 2026)
- SPF, DKIM, DMARC configurados — rollout: p=none → p=quarantine → p=reject
- NUNCA usar dominio principal AgenticEcosystem.cl para cold email
- Crear dominios secundarios: AgenticEcosystem.com, getAgenticEcosystem.com, tryAgenticEcosystem.cl
- Preferir .com por mejor deliverability
- Max 3 cuentas de email por dominio
- Max 40-50 emails/dia por cuenta (120-150 por dominio)
- Google Workspace recomendado para B2B (~$3-4/mes via resellers)
- Warmup minimo 2-4 semanas antes de campanas reales
- No incluir imagenes en correos frios
- No usar links trackeados en primeros envios
- Subject lines sin mayusculas ni signos de exclamacion
- Spam complaints < 0.3% (Google/Yahoo/Microsoft exigen desde 2025)
- Bounces < 2%

## Timing Optimo (benchmarks 2025-2026)
- Mejor dia: Miercoles (~5.8% reply rate), luego Jueves y Martes
- Mejor hora: 7-11 AM hora local (peak: 10-11 AM)
- Evitar: Lunes (backlog fin de semana), Viernes PM
- Open rate promedio: 40-60% (buena deliverability)
- Reply rate: 5-9% generico, 15-18% altamente personalizado
- Personalizacion avanzada: +142% replies vs genericos

## Plataforma de Envio Recomendada: Instantly.ai
- API V2 REST completa (developer.instantly.ai)
- Cuentas ilimitadas, warm-up automatizado incluido
- A/Z testing con auto-optimize (pausa variantes perdedoras)
- AI Reply Agent (responde en < 5 min)
- 450M+ contactos B2B verificados
- Resend se reserva SOLO para email transaccional del producto

## Compliance
- Incluir opcion de desuscripcion en cada email
- Respetar CAN-SPAM: identificacion clara del remitente
- Ley 19.628 Chile: solo datos de fuentes publicas o consentidas
- Si el prospecto responde "no me interesa", agregar a blacklist global
- No enviar a dominios personales (@gmail, @hotmail) en contexto B2B

## Reglas
- NUNCA inventar testimonios o metricas
- Usar solo las estadisticas verificadas de AgenticEcosystem (ver CLAUDE.md)
- Emails deben parecer escritos por humano (errores menores ok, emojis minimos)
- Modo draft por defecto hasta aprobacion del CEO
- Guardar cada campana creada como template reutilizable
