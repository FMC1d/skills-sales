---
name: email-outbound-copy-rules
description: Reglas obligatorias de copy y estructura para TODA campaña de email marketing / cold outreach de AgenticEcosystem y SecOpsCorp (ingesta engineer 2026-08-06/07). Cargar SIEMPRE antes de redactar, revisar o automatizar correos de campaña — emails fríos, secuencias, follow-ups, writing room outreach. Triggers: email marketing, cold email, correo frío, outreach, campaña, secuencia, follow-up, seguimiento, copy de correo, subject line, reply rate, segmentación de base de datos.
---

# Reglas de copy — Email outbound (AgenticEcosystem / SecOpsCorp)

Fuente: ingesta directa de engineer, 2026-08-06/07. Estas reglas son PERMANENTES y aplican a
toda campaña futura. Complementan (no reemplazan) el playbook oferta+problema de
`SecOpsCorp-oiv-outbound-playbook` y las reglas de brand voice de
`Agentic Systems\.claude\rules\content.md` (humanizer obligatorio, sin em-dash, vocabulario).

## 0. Pregunta gate (hacerla SIEMPRE, antes que todo)

**"¿Puede este correo ser utilizado para mil otras empresas?"**
Si la respuesta es sí → se reescribe. Sin excepción.

## 1. Relevancia (los primeros 5 segundos)

- El copy debe probar la relevancia del mensaje en menos de 5 segundos.
- Debe responder "¿qué hay para mí?" de inmediato.
- Fórmula de apertura = **observación específica + problema segmentado**:
  - Observación específica de ELLOS: su empresa, su actividad en redes, sus últimos posts,
    su último proyecto, su stack. Debe pasar la **prueba del "Solo Ellos"**: si la frase
    aplica a otras 1.000 empresas, no es personalización real.
  - Un problema común que, específicamente por la segmentación hecha a ese lead,
    probablemente están enfrentando.
- **Regla "Ellos primero":** hablar del prospecto antes de mencionar quiénes somos o qué
  hacemos. Poner su rol en el correo NO es personalización.
- Esto se ejecuta A ESCALA con IA (análisis de LinkedIn, web y perfil del lead para
  generar las líneas de apertura; no se escriben a mano una por una).

Ejemplos que PASAN: "Notice that you're using Salesforce, but there's no enrichment in
your tech stack.." · "Saw you just hired three SR's based out of your last LinkedIn post.."
Ejemplos que FALLAN: "As a VP of sales you probably want more pipeline.." · "I saw your
company wants to grow revenue.." · "I saw you posted on LinkedIn recently..."

## 2. Segmentación (obligatoria, automatizable)

Segmentar SIEMPRE la base, mínimo por: **industria · tamaño de empresa · rol del
recipiente · problema principal del recipiente**. Sin segmentar, el mensaje no es
relevante para nadie porque intenta ser relevante para todos.

### Preguntas pre-copy (por CADA segmento, ANTES de cualquier sesión de redacción)
1. ¿Cuál es el dolor número 1 de esta persona?
2. ¿Qué es en realidad lo que más les importa?
3. ¿Qué lenguaje o terminologías usan comúnmente?
4. ¿Qué prueba o valor realmente resonaría con ellos?

Luego: UN email por segmento que hable directamente a esas respuestas.

### Cadena del porqué (regla permanente, engineer 2026-08-09)

La pregunta 2 **nunca** se contesta con el síntoma comercial. Se pregunta "¿y por qué le
importa eso?" hasta llegar a la raíz primitiva: **plata**, y bajo la plata **tranquilidad,
estabilidad, estatus, calidad de vida**. Ese es el nivel al que tiene que hablar el copy.

| Respuesta superficial | Cadena hasta la raíz |
|---|---|
| "Quiere reuniones agendadas" | reuniones → ventas → plata → dejar de vivir mes a mes |
| "Quiere que el proceso no se caiga" | no se cae → se produce → entra plata → siguen los sueldos, incluido el suyo |
| "Quiere que la empresa siga operando" | opera → genera plata → estabilidad y no retroceder de nivel de vida |
| "No quiere ser el culpable del incidente" | filtración → demanda y multa → plata que se va → menos crecimiento y decisiones apuradas |

La reputación, el cargo y el cumplimiento normativo **no son la raíz**: son intermediarios.
Si el copy se queda ahí, no toca lo que de verdad mueve a la persona.

### Lenguaje: cero jerga

Nada de SGSI, compliance, framework, superficie de ataque, outbound, funnel, lead
nurturing, transformación digital. Hablar de: **clientes, contratos, multas, caja, tiempo,
reuniones, ventas del mes**. "Cumplimiento normativo" no es un beneficio; "no perder al
cliente grande cuando te exija seguridad" sí lo es.
Fuente: `SecOpsCorp/_operations/2026-08-06-investigacion-captacion-pymes.md`.

Cada segmento del `problem-map.json` trae su propio campo `lenguaje_evitar`. Respetarlo.

### ICP: quién es realmente el destinatario

El ICP de AgenticEcosystem/SecOpsCorp es el **fundador que todavía está metido en el proceso**: etapa
temprana, empresa micro o pequeña, quiere empezar a crecer. **No** es la empresa de 10-30
personas que ya intenta delegar el proceso comercial. Es el mismo problema que AgenticEcosystem
resuelve para sí misma, por eso conocemos a esa persona.
Consecuencia: el problema del segmento se acota por **tamaño**, no solo por rol.

## 3. Formato (factor comprobado y repetible a escala)

- **50 a 75 palabras en total** · **1 a 2 oraciones por párrafo**. Es el rango de más
  alta respuesta conseguible. Obligatorio en todos los correos futuros.
- Prohibido el muro de texto: ningún párrafo de más de 2-3 líneas.
- Cada párrafo comunica UNA sola idea.

### Estructura de 5 líneas
1. Observación específica sobre ellos
2. (2-3) El problema que probablemente enfrentan
3. La oferta o propuesta de valor
4. Un CTA simple

## 4. Oferta y CTA

- Cada campaña debe dar una RAZÓN para querer una llamada: primero se OFRECE algo por lo
  que alguien normalmente pagaría (auditoría rápida, framework, playbook, caso de estudio).
- **Regla de los 10 segundos:** la primera oferta debe poder aceptarse en 10 segundos,
  SIN entrar en una llamada ("Is it cool if I send it over? No call required."). La
  llamada se ofrece después del enganche.
- Coherente con SecOpsCorp-oiv-outbound-playbook: oferta gratuita de bajo riesgo en el
  primer correo; cierre final = reunión corta de 15 min una vez entregado el valor.

## 5. Seguimientos

- NUNCA follow-ups vacíos: cada uno agrega valor nuevo o un ángulo nuevo de la oferta.
- El sistema debe estar listo para **5 a 12 toques** (ahí ocurre el 80% de las ventas
  exitosas; el 44% de los vendedores se rinde tras el primer seguimiento).
- Por campaña: preparar **3 a 5 seguimientos** escritos de antemano.
- Framework de secuencia: **E1 oferta de valor → E2 insight adicional → E3 ángulo de
  prueba social → E4 recurso gratis entregado sin pedir nada** (breakup email).

## 6. Checklist pre-envío (todo correo, sin excepción)

- [ ] Pregunta gate (§0) respondida "no".
- [ ] Preview de cómo se ve EN TELÉFONO generado y revisado.
- [ ] Removida toda palabra que no contribuya al mensaje core.
- [ ] Pasado por humanizer (regla fundamental de content.md — sin em-dash, sin frases plantilla).
- [ ] **Test de ebriedad:** ¿lo entendería alguien ebrio en un bar a las 12 de la noche
      viendo solo el preview? Si no, no es un buen correo.
- [ ] **Test primera/última línea:** ¿se entiende qué se ofrece leyendo solo la primera
      y la última línea? Si sí, el correo es bueno.
- [ ] 50-75 palabras · 1-2 oraciones por párrafo · una idea por párrafo.
- [ ] Follow-ups (3-5) escritos, cada uno con valor o ángulo nuevo.

## Herramientas (F1, desde 2026-08-07)

No revises estas reglas a ojo: hay un gate determinístico que las cuenta.

```bash
node 02_production/scripts/outreach/validate-email-copy.cjs <archivo|carpeta> --strict
```

```bash
node 02_production/scripts/outreach/preview-email-mobile.cjs <archivo|carpeta> --png
```

```bash
node 02_production/scripts/leads/segment-builder.cjs --campana=<slug> --min-size=10
```

- El validador corta lo contable: 50-75 palabras, oraciones por párrafo, em-dash, frases
  plantilla, aperturas genéricas, "ellos primero", subject spam. Exit 1 = no pasa a `final/`.
- Lo que NO decide (te toca a ti o al agente juez): si la observación es verdadera y
  relevante, el test de ebriedad, y el juicio final de la pregunta gate.
- El segment builder deja un archivo por segmento con las 4 preguntas pre-copy ya
  planteadas, tomadas de `03_research/prospecting/segments/problem-map.json`.
  Si un segmento cae al problema por defecto, avisa: no redactar sobre eso.

Detalle completo: `Agentic Systems\02_production\specs\2026-08-07-sistema-email-outbound-low-hitl.md`.

## Ejemplos de referencia completos

Éxito (formato + relevancia):
```
Subject: Quick idea to protect your reply rates

Hi [First Name],

Saw you just launched the new product line - congrats.

Most brands I work with see a 20–30% drop in reply rates when they scale to
multiple products. It's usually a segmentation issue.
```

Oferta 10 segundos:
```
Subject: Quick 10-min Audit With 3 Easy Wins

Hi [First Name],

I put together a ten-minute audit of your current cold email approach, and I
found three quick wins that could boost your reply rates.

Is it cool if I send it over? No call required.
```
