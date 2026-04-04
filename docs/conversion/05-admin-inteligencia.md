# Plan 05 — Admin de inteligencia: el panel que atrae clientes

> Prioridad: **MEDIA**
> El panel actual (`src/pages/Admin.tsx`) muestra datos crudos. Este plan lo transforma en un centro de comando de conversión.

---

## Estado actual del admin

`/admin` muestra en tiempo real:
- Lista de visitantes (atribución, browser, device)
- Lista de leads del chatbot con scores AI
- Lista de contact submissions
- Cambio manual de `pipelineStage`

Falta: métricas de conversión, costo de IA, alertas, recomendaciones, funnel, ROI por canal.

---

## Sección 1 — Métricas de conversión en tiempo real

### Nuevo componente: `src/pages/admin/ConversionMetrics.tsx`

```tsx
interface ConversionMetrics {
  // Visitas
  totalVisits: number;
  uniqueVisitors: number;
  avgTimeOnSiteSeconds: number;
  avgScrollDepth: number;

  // Chatbot
  chatSessions: number;
  chatCompletions: number;           // sessions con ≥8 campos
  chatCompletionRate: number;        // %

  // Formulario
  contactSubmissions: number;

  // Pipeline
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  
  // Conversión global
  visitToLeadRate: number;           // %
  leadToQualifiedRate: number;       // %

  // Por canal
  byChannel: Array<{
    channel: string;
    visits: number;
    leads: number;
    conversionRate: number;
    avgReadinessScore: number;
  }>;
}
```

Estos datos se calculan con una query a Firestore + agregación client-side (no necesita backend nuevo).
Para escala: se pueden precomputar con una Cloud Function que corra cada hora y guarde en `_metrics/daily`.

---

## Sección 2 — Control de costos de IA

### Nuevo componente: `src/pages/admin/AICostMonitor.tsx`

Mostrar:
- Llamadas a Gemini en las últimas 24h / 7 días / 30 días
- Tokens estimados consumidos (900 max por llamada × n llamadas)
- Costo estimado en USD (gemini-2.0-flash: ~$0.00015/1K tokens de output)
- Llamadas fallidas que cayeron al heurístico
- Distribución heurístico vs. gemini

```typescript
// En Firestore, `leadAnalyses` collection ya guarda `generatedBy: 'gemini' | 'heuristic'`
// y `model` string. Query agrupada por día:

const aiCallsToday = await adminDb
  .collection('leadAnalyses')
  .where('generatedBy', '==', 'gemini')
  .where('createdAt', '>=', startOfDay)
  .get();

const estimatedTokens = aiCallsToday.size * 900; // max tokens por call
const estimatedCostUSD = estimatedTokens / 1000 * 0.00015;
```

### Circuit breaker configurable

```typescript
// api/_lib/leadStrategyService.ts — agregar antes de llamar a Gemini

async function checkAIBudget(): Promise<boolean> {
  const maxDailyCalls = parseInt(process.env.MAX_DAILY_AI_CALLS ?? '200', 10);
  const today = new Date().toISOString().split('T')[0];
  
  const countRef = adminDb.collection('_aiUsage').doc(today);
  
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(countRef);
    const current = (snap.data()?.calls ?? 0) as number;
    
    if (current >= maxDailyCalls) return false; // budget exceeded
    
    tx.set(countRef, { calls: current + 1 }, { merge: true });
    return true;
  });
}

// En generateWithGemini():
const withinBudget = await checkAIBudget();
if (!withinBudget) {
  console.warn('[lead-strategy] AI budget exceeded, using heuristic');
  return heuristic; // fallback directo
}
```

Variable de entorno a agregar: `MAX_DAILY_AI_CALLS=200`

---

## Sección 3 — Alertas de leads hot en tiempo real

### Nuevo componente: `src/pages/admin/HotLeadAlerts.tsx`

Usando Firestore `onSnapshot`, escuchar leads nuevos con `aiPriorityLevel === 'hot'`:

```typescript
useEffect(() => {
  const fiveMinutesAgo = Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000));
  
  const q = query(
    collection(db, 'chatSessions'),
    where('aiPriorityLevel', '==', 'hot'),
    where('updatedAt', '>=', fiveMinutesAgo),
    orderBy('updatedAt', 'desc'),
    limit(10)
  );
  
  return onSnapshot(q, (snap) => {
    const newHotLeads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (newHotLeads.length > 0) {
      // Notificación en browser (si está en la tab)
      if (Notification.permission === 'granted') {
        new Notification(`🔥 Lead HOT: ${newHotLeads[0].company}`, {
          body: newHotLeads[0].aiWhatToSayNow,
        });
      }
      setHotAlerts(newHotLeads);
    }
  });
}, []);
```

---

## Sección 4 — Funnel de conversión visual

```
[Visitas únicas] → [Chatbot abierto] → [Chat completado] → [Lead capturado] → [Qualified] → [Won]
    10.000              2.000               800               600               200          40
      100%               20%                 8%                6%                2%         0.4%
```

Implementación: calcular desde las colecciones `visitors`, `chatSessions`, `contactSubmissions` y filtrar por `pipelineStage`.

---

## Sección 5 — ROI por canal

```
| Canal          | Visitas | Leads | Conv% | Avg Score | Calificados |
|----------------|---------|-------|-------|-----------|-------------|
| linkedin / cpc |   342   |  28   | 8.2%  |    72     |     11      |
| direct         |  1.203  |  45   | 3.7%  |    58     |     9       |
| referral       |   189   |  19   | 10%   |    81     |     8       |
| google / cpc   |   567   |  17   | 3%    |    55     |     4       |
```

Esto permite decidir dónde aumentar presupuesto de pauta con datos reales.

---

## Sección 6 — Playbook card expandida por lead

Actualmente el admin muestra los scores pero el `whatToSayNow` y `followUpWhatsApp` están ocultos.
Expander card con:

```tsx
// En Admin.tsx — expandir el lead detail
<div className="lead-detail-expanded">
  <section>
    <label>Qué decirle ahora</label>
    <p>{lead.aiWhatToSayNow}</p>
  </section>
  <section>
    <label>WhatsApp listo para copiar</label>
    <div className="copyable">
      {lead.aiFollowUpWhatsApp}
      <button onClick={() => navigator.clipboard.writeText(lead.aiFollowUpWhatsApp)}>
        Copiar
      </button>
    </div>
  </section>
  <section>
    <label>Email listo</label>
    <p>{lead.aiFollowUpEmailBody}</p>
  </section>
  <section>
    <label>Objeciones detectadas</label>
    <ul>{lead.aiObjections?.map(o => <li key={o}>{o}</li>)}</ul>
  </section>
</div>
```

---

## Sección 7 — Búsqueda y filtros en el admin

El admin actual no tiene búsqueda. Agregar filtros:
- Por prioridad (hot / warm / cold)
- Por canal de atribución
- Por oferta recomendada
- Por stage de pipeline
- Por fecha (hoy / semana / mes)
- Búsqueda por nombre/empresa/email (client-side sobre los datos ya cargados)

---

## Sección 8 — Vista de recomendaciones de Growth

Panel con reglas simples basadas en datos acumulados:

```typescript
function generateInsights(leads: LeadDoc[], visitors: Visitor[]): string[] {
  const insights: string[] = [];
  
  // Insight de canal
  const byChannel = groupBy(leads, 'firstAttributionChannel');
  const bestChannel = Object.entries(byChannel)
    .map(([channel, ls]) => ({
      channel,
      avgScore: avg(ls.map(l => l.aiReadinessScore ?? 0)),
      count: ls.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)[0];
  
  if (bestChannel) {
    insights.push(
      `Los leads de "${bestChannel.channel}" tienen score promedio ${bestChannel.avgScore.toFixed(0)}, el más alto. Considerá aumentar inversión en ese canal.`
    );
  }
  
  // Insight de pain
  const topPains = leads
    .map(l => l.salesAngle)
    .filter(Boolean)
    .reduce((acc, pain) => ({ ...acc, [pain!]: (acc[pain!] ?? 0) + 1 }), {} as Record<string, number>);
  
  const dominantPain = Object.entries(topPains).sort((a, b) => b[1] - a[1])[0];
  if (dominantPain) {
    insights.push(
      `El dolor más frecuente es "${dominantPain[0]}" (${dominantPain[1]} leads). ¿Tenés contenido específico para ese problema?`
    );
  }
  
  return insights;
}
```

---

## Nueva estructura de `src/pages/Admin.tsx`

```
Admin
├── Header (logo + logout + last refresh)
├── Tab: Métricas
│   ├── ConversionFunnel
│   ├── ChannelROI
│   └── AICostMonitor
├── Tab: Leads
│   ├── HotLeadAlerts (sticky top)
│   ├── FilterBar
│   └── LeadList (con PlaybookCard expandible)
├── Tab: Visitantes
│   └── VisitorList (igual que ahora)
├── Tab: Experimentos
│   └── ABTestResults
└── Tab: Insights
    └── GrowthRecommendations
```

---

## Checklist

- [ ] Extraer `LeadList` como componente separado en `src/pages/admin/`
- [ ] Crear `ConversionMetrics.tsx` con funnel y ROI por canal
- [ ] Crear `AICostMonitor.tsx` con `checkAIBudget` en el servicio
- [ ] Crear `HotLeadAlerts.tsx` con Firestore onSnapshot + browser notifications
- [ ] Expandir PlaybookCard con `whatToSayNow`, `followUpWhatsApp`, `followUpEmailBody`, objections
- [ ] Agregar filtros y búsqueda client-side
- [ ] Crear `GrowthRecommendations.tsx` con reglas de insights
- [ ] Crear `ABTestResults.tsx` (ver Plan 03)
- [ ] Agregar `MAX_DAILY_AI_CALLS` env var y circuit breaker en leadStrategyService
