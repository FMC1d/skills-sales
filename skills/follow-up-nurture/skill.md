---
id: follow-up-nurture
name: Follow-up Nurture CRM
version: 1.0.0
category: sales
agent: sales
trigger: "\\f follow-up nurture"
requires: [gmail-api, crm-data, claude-api]
type: code-assisted
description: Escanea pipeline de ventas y redacta correos de seguimiento personalizados por etapa
---

# SOP: Follow-up Nurture CRM

## Objetivo
Escanear automaticamente el pipeline de ventas, identificar prospectos que necesitan seguimiento, leer su historial de correos y redactar follow-ups personalizados que parezcan escritos por un humano.

## Entrada
- Pipeline de ventas (Convex: tabla leads o CRM externo)
- Credenciales Gmail OAuth2
- Opcional: maximo de follow-ups a generar (default: 20)

## Proceso

### Paso 1: Escanear Pipeline
Obtener prospectos que necesitan follow-up:
- Lead con estado "contacted" sin respuesta en 3+ dias
- Lead con estado "meeting_scheduled" sin confirmacion en 1 dia
- Lead con estado "proposal_sent" sin respuesta en 5+ dias
- Lead con estado "negotiating" sin actividad en 7+ dias
- Lead con estado "warm" sin contacto en 14+ dias

### Paso 2: Leer Historial de Correos
Para cada prospecto:
- Buscar en Gmail por email del prospecto
- Obtener el thread completo (todos los mensajes del hilo)
- Extraer: ultimo mensaje enviado, ultimo mensaje recibido, tono de la conversacion
- Identificar en que etapa esta la relacion

### Paso 3: Determinar Tipo de Follow-up
Segun la etapa del prospecto:

| Etapa | Tipo de Follow-up | Tono |
|-------|-------------------|------|
| contacted_no_reply | Bump casual | Muy informal, breve |
| meeting_scheduled | Confirmacion | Amigable, directo |
| proposal_sent | Check-in | Casual, sin presion |
| negotiating | Value add | Compartir recurso util |
| warm_re_engagement | Re-engagement | Personal, curioso |

### Paso 4: Redactar Email con IA
Reglas de redaccion:
- **Tono:** Casual, como si lo escribiera un humano apurado
- **Largo:** 2-4 oraciones maximo (nadie lee emails largos)
- **Sin formalidades:** Nada de "Estimado/a" ni "Cordialmente"
- **Contexto:** Referenciar algo especifico de la conversacion anterior
- **CTA:** Una sola pregunta o accion clara
- **Firma variable:** Rotar entre variantes (nombre, nombre + cargo, iniciales)

### Paso 5: Responder en el Mismo Hilo
- Usar el Thread ID original de Gmail
- Reply-To del ultimo mensaje en el hilo
- Mantener el subject original (con Re:)

### Paso 6: Registrar en Convex
- Guardar que se envio follow-up con timestamp
- Actualizar lastContactedAt del lead
- Incrementar followUpCount

## Plantillas por Etapa

### contacted_no_reply (Bump)
```
Variante 1: "Hey {nombre}, solo queria ver si viste mi mensaje anterior. Cualquier cosa me dices!"
Variante 2: "{nombre} - se me paso preguntarte, pudiste revisar lo que te mande?"
Variante 3: "Buena {nombre}! Solo un ping rapido por si se te paso el email anterior"
```

### proposal_sent (Check-in)
```
Variante 1: "{nombre}, alguna duda con la propuesta? Feliz de ajustar lo que necesites"
Variante 2: "Hey! Solo checkeando si pudiste revisar la propuesta. Sin apuro, pero quedo atento"
Variante 3: "{nombre} - se que estas ocupado, pero queria saber si la propuesta les hizo sentido"
```

### warm_re_engagement
```
Variante 1: "{nombre}! Tiempo sin hablar. Vi que {referencia_contextual} y me acorde de ti"
Variante 2: "Hey {nombre}, como va todo? Estuve pensando en lo que hablamos sobre {tema} y se me ocurrio algo"
```

## Firmas Variables
```
- engineer
- engineer M.
- FM
- engineer Martinez
- engineer | AgenticEcosystem
- -F
```

## Formato de Salida

```json
{
  "follow_ups_generated": 12,
  "by_stage": {
    "contacted_no_reply": 5,
    "proposal_sent": 3,
    "negotiating": 2,
    "warm_re_engagement": 2
  },
  "emails": [
    {
      "to": "prospecto@empresa.cl",
      "thread_id": "abc123",
      "stage": "proposal_sent",
      "subject": "Re: Propuesta AgenticEcosystem",
      "body": "...",
      "signature": "engineer M.",
      "status": "draft|sent"
    }
  ]
}
```

## Cadencia Multicanal Optima (investigacion 2026)
Fuente: 80% de ventas requieren 5+ follow-ups, pero 44% de vendedores abandonan despues del 1ro.

| Dia | Accion | Canal |
|-----|--------|-------|
| 0 | Email inicial / post-reunion | Email |
| 1 | Conexion LinkedIn | LinkedIn |
| 3 | Follow-up con valor (caso de estudio) | Email |
| 5 | Llamada telefonica | Telefono |
| 7 | Follow-up con angulo fresco | Email |
| 10 | Social touch (comentar/reaccionar post) | LinkedIn |
| 14 | Re-engagement con nueva propuesta de valor | Email |
| 21 | Break-up email (ultimo intento) | Email |

## Humanizacion de Emails (anti-deteccion IA)
- Mezclar oraciones cortas y largas (la IA tiende a uniformar)
- Usar contracciones: "Queria" en vez de "Deseaba"
- Agregar imperfecciones controladas: "Ah," o "Por cierto,"
- Referenciar algo concreto de la ultima conversacion o un post de LinkedIn
- Variar timing: +/- 30 min aleatorio al schedule (no enviar siempre a las 09:00)
- Largo: 80-150 palabras maximo para follow-ups

## Implementacion Preferida: n8n
- Gmail Trigger node (poll cada 15-30 min)
- Thread Reply: responder en mismo hilo usando threadId
- Claude API node para generar contenido personalizado
- Convex HTTP node para registrar interaccion

## Reglas
- NUNCA enviar automaticamente sin aprobacion del CEO (modo draft por defecto)
- Maximo 1 follow-up por prospecto por ejecucion
- No hacer follow-up si el prospecto respondio "no me interesa" o similar
- Respetar horarios: solo enviar entre 9:00-18:00 Chile (o programar)
- Si el lead tiene "do_not_contact" flag, saltarlo
- Variar las firmas para no parecer automatizado
- Deliverability: SPF + DKIM + DMARC obligatorio
- Usar subdominio para outreach (ventas.AgenticEcosystem.cl)
- Mantener spam complaints < 0.1% (umbral Google)
