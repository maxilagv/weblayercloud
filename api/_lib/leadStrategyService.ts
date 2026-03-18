import {
  buildHeuristicLeadIntelligence,
  hydrateLeadIntelligence,
  sanitizeLeadIntelligence,
  type LeadIntelligence,
  type LeadStrategyRequest,
} from '../../src/lib/leadStrategy';

const DEFAULT_MODEL = process.env.AI_ANALYST_MODEL || 'gemini-2.0-flash';

function getTextPart(payload: any) {
  return payload?.candidates?.[0]?.content?.parts?.find((part: any) => typeof part?.text === 'string')?.text || '';
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function buildPrompt(body: LeadStrategyRequest, heuristic: LeadIntelligence) {
  return `
Sos un analista comercial senior de LayerCloud.
Tu trabajo es decidir cual es la mejor oferta, el mejor angulo de venta y el siguiente paso comercial.
Usa persuasion fuerte pero honesta. No manipules, no inventes y no uses miedo artificial.
Responde SOLO JSON valido.

Oferta disponible de LayerCloud:
- ERP operativo
- ERP + e-commerce
- E-commerce con integracion
- Diagnostico + demo guiada

Objetivo:
- Identificar la oferta mas alineada al lead.
- Resumir el dolor real.
- Priorizar si el lead esta cold, warm o hot.
- Puntuar intencion de compra, urgencia, fit y readiness.
- Detectar la motivacion dominante del comprador.
- Recomendar el siguiente movimiento comercial.
- Redactar que decir ahora.
- Redactar un follow-up listo para WhatsApp y otro para email.

Reglas obligatorias:
- Usa solo evidencia del lead y de sus respuestas. No bases el diagnostico en preguntas del asistente.
- Si el lead expresa un deseo u objetivo ("queremos vender mas", "queremos orden"), transformalo en un dolor u oportunidad operativa concreta.
- Evita ofertas genericas si ya hay evidencia para recomendar ERP operativo, ERP + e-commerce o E-commerce con integracion.
- "Diagnostico + demo guiada" solo se usa si de verdad falta informacion para elegir una oferta especifica.
- painSummary debe ser una sola frase quirurgica, clara y sin fragmentos rotos.
- No repitas palabras ni copies texto defectuoso del lead. Reescribe con claridad comercial.
- whatToSayNow, followUpWhatsApp y followUpEmailBody deben mencionar un problema puntual y una palanca concreta de valor.

Fuente del lead:
${body.sourceType}

Lead:
${JSON.stringify(body.leadData, null, 2)}

Transcript:
${JSON.stringify(body.transcript.slice(-12), null, 2)}

Baseline heuristico:
${JSON.stringify(heuristic, null, 2)}

Devuelve este esquema:
{
  "priorityLevel": "cold|warm|hot",
  "intentScore": 0,
  "urgencyScore": 0,
  "fitScore": 0,
  "readinessScore": 0,
  "buyerMotivation": "string",
  "recommendedOffer": "string",
  "offerToShowNow": "string",
  "offerReason": "string",
  "salesAngle": "string",
  "executiveSummary": "string",
  "painSummary": "string",
  "nextBestAction": "string",
  "whatToSayNow": "string",
  "followUpMessage": "string",
  "followUpWhatsApp": "string",
  "followUpEmailSubject": "string",
  "followUpEmailBody": "string",
  "objections": ["string"],
  "missingData": ["string"],
  "automationWins": ["string"],
  "confidence": 0,
  "generatedBy": "gemini",
  "model": "${DEFAULT_MODEL}",
  "analysisVersion": 3
}
`.trim();
}

async function generateWithGemini(body: LeadStrategyRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  const heuristic = buildHeuristicLeadIntelligence(body.leadData, body.transcript);

  if (!apiKey) {
    return heuristic;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(body, heuristic) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 900,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const rawText = getTextPart(payload);
  const parsed = extractJson(rawText);

  return hydrateLeadIntelligence(
    body.leadData,
    sanitizeLeadIntelligence(
      {
        ...(parsed ?? {}),
        generatedBy: 'gemini',
        model: DEFAULT_MODEL,
        analysisVersion: 3,
      },
      heuristic,
    ),
  );
}

export async function analyzeLeadStrategy(body: LeadStrategyRequest) {
  try {
    return await generateWithGemini(body);
  } catch (error) {
    console.error('[lead-strategy-service]', error);
    return buildHeuristicLeadIntelligence(body.leadData, body.transcript);
  }
}
