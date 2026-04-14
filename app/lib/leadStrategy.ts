import type { ChatLeadData } from './crmTypes';

const CHAT_FIELD_KEYS: Array<keyof ChatLeadData> = [
  'name',
  'company',
  'role',
  'email',
  'phone',
  'location',
  'industry',
  'website',
  'monthlyOrders',
  'teamSize',
  'currentTools',
  'salesChannels',
  'topPain',
  'urgency',
  'budget',
  'extraContext',
];

export interface LeadTranscriptMessage {
  role: 'assistant' | 'user';
  content: string;
}

export interface LeadIntelligence {
  priorityLevel: 'cold' | 'warm' | 'hot';
  intentScore: number;
  urgencyScore: number;
  fitScore: number;
  readinessScore: number;
  buyerMotivation: string;
  recommendedOffer: string;
  offerToShowNow: string;
  offerReason: string;
  salesAngle: string;
  executiveSummary: string;
  painSummary: string;
  nextBestAction: string;
  whatToSayNow: string;
  followUpMessage: string;
  followUpWhatsApp: string;
  followUpEmailSubject: string;
  followUpEmailBody: string;
  objections: string[];
  missingData: string[];
  automationWins: string[];
  confidence: number;
  generatedBy: 'heuristic' | 'gemini';
  model: string;
  analysisVersion: number;
}

export interface LeadStrategyRequest {
  sourceType: 'chatbot' | 'contact_form';
  leadData: Partial<ChatLeadData>;
  transcript: LeadTranscriptMessage[];
}

const ALLOWED_OFFERS = [
  'ERP operativo',
  'ERP + e-commerce',
  'E-commerce con integracion',
  'Diagnostico + demo guiada',
] as const;

function sanitizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => sanitizeText(item))
    .filter(Boolean)
    .slice(0, 6);
}

function firstNumber(value: string) {
  const match = value.replace(/\./g, '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getLeadText(leadData: Partial<ChatLeadData>, transcript: LeadTranscriptMessage[] = []) {
  const transcriptText = transcript
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .join(' ');
  return [
    leadData.company,
    leadData.role,
    leadData.industry,
    leadData.website,
    leadData.monthlyOrders,
    leadData.teamSize,
    leadData.currentTools,
    leadData.salesChannels,
    leadData.topPain,
    leadData.urgency,
    leadData.budget,
    leadData.extraContext,
    transcriptText,
  ]
    .map((value) => sanitizeText(value))
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function capitalizeFirst(value: string) {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function lowerFirst(value: string) {
  if (!value) {
    return '';
  }

  return value.charAt(0).toLowerCase() + value.slice(1);
}

function stripTrailingPunctuation(value: string) {
  return sanitizeText(value).replace(/[.!?]+$/g, '');
}

function normalizeSnippet(value: string) {
  return sanitizeText(value)
    .replace(/\s*[,;:]+\s*/g, ', ')
    .replace(/^([a-z]+)\s*,\s*((?:quiero|queremos|busco|buscamos|necesito|necesitamos)\s+\1\b)/i, '$2')
    .replace(/\s+,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/^[-,.\s]+|[-,.\s]+$/g, '');
}

function toSentence(value: string) {
  const cleaned = normalizeSnippet(value);
  if (!cleaned) {
    return '';
  }

  const sentence = capitalizeFirst(cleaned);
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

function getLeadSignals(
  leadData: Partial<ChatLeadData>,
  transcript: LeadTranscriptMessage[] = [],
) {
  const text = getLeadText(leadData, transcript);
  const website = sanitizeText(leadData.website);

  return {
    text,
    hasCommerceSignals:
      /(web|ecommerce|mercado libre|instagram|tienda|checkout|seo|conversion|canal digital)/.test(text) ||
      Boolean(website),
    hasOpsSignals:
      /(excel|manual|stock|precio|catalogo|pedido|inventario|whatsapp|logistica|orden|organizacion|organizar|proceso|operacion|control|visibilidad)/.test(
        text,
      ),
    hasCustomerSignals:
      /(crm|cliente|atencion|seguimiento|fidelizacion|retencion|respuesta|postventa)/.test(text),
    hasGrowthSignals:
      /(vender|venta|ventas|crecer|conversion|escala|escalar|expansion)/.test(text),
  };
}

function buildPainSummary(
  leadData: Partial<ChatLeadData>,
  transcript: LeadTranscriptMessage[] = [],
) {
  const signals = getLeadSignals(leadData, transcript);
  const narrativeText = [
    leadData.topPain,
    leadData.extraContext,
    transcript
      .filter((message) => message.role === 'user')
      .map((message) => message.content)
      .join(' '),
  ]
    .map((value) => sanitizeText(value))
    .filter(Boolean)
    .join(' ');
  const narrativeLower = narrativeText.toLowerCase();

  if (
    /(atencion|cliente|seguimiento|crm|respuesta|postventa)/.test(narrativeLower) &&
    /(orden|organiz|operacion|proceso|control|venta|vender|ventas)/.test(narrativeLower)
  ) {
    return 'Quieren vender con una operacion mas organizada y una atencion mas consistente.';
  }

  if (/(atencion|cliente|seguimiento|crm|respuesta|postventa)/.test(narrativeLower)) {
    return 'Necesitan profesionalizar la atencion y el seguimiento comercial para no perder oportunidades.';
  }

  if (
    /(orden|organiz|operacion|proceso|control|visibilidad)/.test(narrativeLower) &&
    /(vender|venta|ventas|crecer|escala|escalar|conversion)/.test(narrativeLower)
  ) {
    return 'Quieren crecer en ventas con mas orden operativo y una experiencia comercial mas solida.';
  }

  if (/(vender|venta|ventas|crecer|escala|escalar|conversion)/.test(narrativeLower)) {
    return 'Quieren crecer en ventas sin perder orden ni calidad de ejecucion.';
  }

  if (/(orden|organiz|operacion|proceso|control|visibilidad)/.test(narrativeLower)) {
    return 'Necesitan mas orden, control y visibilidad sobre la operacion.';
  }

  if (/(excel|manual|whatsapp|planilla|pedido|carga manual|tiempo perdido)/.test(signals.text)) {
    return 'La operacion depende demasiado de procesos manuales y eso frena velocidad y control.';
  }

  if (/(stock|inventario|deposito|quiebre|logistica|reparto)/.test(signals.text)) {
    return 'Necesitan mas control sobre stock, pedidos y logistica para operar sin desbordes.';
  }

  if (/(precio|dolar|lista|catalogo)/.test(signals.text)) {
    return 'Necesitan centralizar precios y catalogos para evitar dispersion y errores.';
  }

  if (
    /(atencion|cliente|seguimiento|crm|respuesta|postventa)/.test(signals.text) &&
    /(orden|organiz|operacion|proceso|control|venta|vender|ventas)/.test(signals.text)
  ) {
    return 'Quieren vender con una operacion mas organizada y una atencion mas consistente.';
  }

  if (/(atencion|cliente|seguimiento|crm|respuesta|postventa)/.test(signals.text)) {
    return 'Necesitan profesionalizar la atencion y el seguimiento comercial para no perder oportunidades.';
  }

  if (
    /(orden|organiz|operacion|proceso|control|visibilidad)/.test(signals.text) &&
    /(vender|venta|ventas|crecer|escala|escalar|conversion)/.test(signals.text)
  ) {
    return 'Quieren crecer en ventas con mas orden operativo y una experiencia comercial mas solida.';
  }

  if (/(vender|venta|ventas|crecer|escala|escalar|conversion)/.test(signals.text)) {
    return 'Quieren crecer en ventas sin perder orden ni calidad de ejecucion.';
  }

  if (/(orden|organiz|operacion|proceso|control|visibilidad)/.test(signals.text)) {
    return 'Necesitan mas orden, control y visibilidad sobre la operacion.';
  }

  if (sanitizeText(leadData.currentTools) && sanitizeText(leadData.salesChannels)) {
    return `Hoy operan con ${sanitizeText(leadData.currentTools)} en ${sanitizeText(leadData.salesChannels)}, y eso ya pide un sistema mas centralizado.`;
  }

  if (narrativeText) {
    const sentence = toSentence(narrativeText);
    if (/^(Quiero|Queremos|Busco|Buscamos|Necesito|Necesitamos)\b/.test(sentence)) {
      return sentence;
    }

    return `La prioridad hoy es ${lowerFirst(stripTrailingPunctuation(sentence))}.`;
  }

  if (sanitizeText(leadData.currentTools)) {
    return `Hoy operan con ${sanitizeText(leadData.currentTools)}.`;
  }

  return 'Dolor principal todavia poco definido.';
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getMissingData(leadData: Partial<ChatLeadData>) {
  const labels: Array<[keyof ChatLeadData, string]> = [
    ['email', 'Email'],
    ['phone', 'Telefono'],
    ['monthlyOrders', 'Volumen mensual'],
    ['budget', 'Presupuesto'],
    ['currentTools', 'Herramientas actuales'],
    ['salesChannels', 'Canales de venta'],
  ];

  return labels
    .filter(([key]) => !sanitizeText(leadData[key]))
    .map(([, label]) => label);
}

export function countLeadFields(leadData: Partial<ChatLeadData>) {
  return CHAT_FIELD_KEYS.filter((key) => sanitizeText(leadData[key]).length > 0).length;
}

export function inferLeadSalesAngle(leadData: Partial<ChatLeadData>) {
  const text = getLeadText(leadData);

  if (/(excel|manual|whatsapp|pedido|carga manual|tiempo perdido)/.test(text)) {
    return 'Automatizacion operativa';
  }

  if (/(stock|inventario|deposito|quiebre|logistica|reparto)/.test(text)) {
    return 'Control de stock y logistica';
  }

  if (/(precio|dolar|catalogo|lista)/.test(text)) {
    return 'Actualizacion de precios y catalogos';
  }

  if (/(tienda|ecommerce|mercado libre|web|seo|checkout|instagram)/.test(text)) {
    return 'Ecommerce y conversion';
  }

  if (/(crm|cliente|seguimiento|fidelizacion|retencion)/.test(text)) {
    return 'CRM y fidelizacion';
  }

  return 'Diagnostico general';
}

function getRecommendedOffer(
  leadData: Partial<ChatLeadData>,
  transcript: LeadTranscriptMessage[] = [],
) {
  const signals = getLeadSignals(leadData, transcript);

  if (signals.hasCommerceSignals && (signals.hasOpsSignals || signals.hasCustomerSignals || signals.hasGrowthSignals)) {
    return {
      recommendedOffer: 'ERP + e-commerce',
      offerReason: 'Hay dolor operativo y tambien una oportunidad clara en el frente digital.',
    };
  }

  if (signals.hasOpsSignals || signals.hasCustomerSignals) {
    return {
      recommendedOffer: 'ERP operativo',
      offerReason: 'La entrada mas clara es ordenar la operacion comercial y ganar control desde un sistema central.',
    };
  }

  if (signals.hasCommerceSignals || signals.hasGrowthSignals) {
    return {
      recommendedOffer: 'E-commerce con integracion',
      offerReason: 'La oportunidad dominante aparece en crecer mejor desde el frente digital.',
    };
  }

  return {
    recommendedOffer: 'Diagnostico + demo guiada',
    offerReason: 'Hace falta una primera demo consultiva para definir el alcance correcto.',
  };
}

function getAutomationWins(leadData: Partial<ChatLeadData>, transcript: LeadTranscriptMessage[]) {
  const signals = getLeadSignals(leadData, transcript);
  const wins = new Set<string>();

  if (/(excel|manual|whatsapp|planilla|pedido)/.test(signals.text)) {
    wins.add('Reducir carga manual y errores operativos');
  }

  if (/(stock|inventario|quiebre|deposito|reparto|logistica)/.test(signals.text)) {
    wins.add('Ordenar stock y logistica en tiempo real');
  }

  if (/(precio|dolar|lista|catalogo)/.test(signals.text)) {
    wins.add('Actualizar precios y catalogos de forma centralizada');
  }

  if (signals.hasCustomerSignals) {
    wins.add('Ordenar seguimiento comercial y calidad de atencion');
  }

  if (signals.hasCommerceSignals) {
    wins.add('Unificar operacion y canal digital para vender mejor');
  }

  if (signals.hasGrowthSignals && (signals.hasOpsSignals || signals.hasCustomerSignals)) {
    wins.add('Crecer en ventas con una operacion mas consistente');
  }

  if (wins.size === 0) {
    wins.add('Detectar el cuello principal y automatizarlo primero');
  }

  return Array.from(wins).slice(0, 3);
}

function scoreIntent(leadData: Partial<ChatLeadData>, transcript: LeadTranscriptMessage[]) {
  const text = getLeadText(leadData, transcript);
  let score = 18;

  if (sanitizeText(leadData.email)) score += 10;
  if (sanitizeText(leadData.phone) && !/prefiere no compartir/i.test(leadData.phone)) score += 10;
  if (sanitizeText(leadData.company)) score += 8;
  if (sanitizeText(leadData.role)) score += 6;
  if (sanitizeText(leadData.budget)) score += 12;
  if (sanitizeText(leadData.monthlyOrders)) score += 8;

  if (/(quiero|necesito|busco|resolver|solucion|demo|cotizacion|presupuesto|implementar)/.test(text)) {
    score += 12;
  }

  if (/(este mes|ya|ahora|urgente|lo antes posible)/.test(text)) {
    score += 8;
  }

  return clampScore(score);
}

function scoreUrgency(leadData: Partial<ChatLeadData>, transcript: LeadTranscriptMessage[]) {
  const text = getLeadText(leadData, transcript);
  let score = 10;

  const urgencyField = sanitizeText(leadData.urgency).toLowerCase();
  if (/(urgente|ya|hoy|esta semana|este mes|lo antes posible)/.test(urgencyField || text)) {
    score += 55;
  } else if (/(pronto|en breve|este trimestre)/.test(urgencyField || text)) {
    score += 35;
  } else if (urgencyField) {
    score += 18;
  }

  if (/(pierdo|demora|caos|no damos abasto|se complica|cuello de botella)/.test(text)) {
    score += 20;
  }

  return clampScore(score);
}

function scoreFit(leadData: Partial<ChatLeadData>, transcript: LeadTranscriptMessage[]) {
  const signals = getLeadSignals(leadData, transcript);
  let score = 15;

  if (signals.hasOpsSignals || signals.hasCommerceSignals || signals.hasCustomerSignals) {
    score += 28;
  }

  if (signals.hasGrowthSignals && (signals.hasOpsSignals || signals.hasCustomerSignals || signals.hasCommerceSignals)) {
    score += 10;
  }

  const monthlyOrders = firstNumber(sanitizeText(leadData.monthlyOrders));
  if (monthlyOrders >= 500) score += 20;
  else if (monthlyOrders >= 100) score += 12;
  else if (monthlyOrders > 0) score += 6;

  const teamSize = firstNumber(sanitizeText(leadData.teamSize));
  if (teamSize >= 5) score += 10;
  else if (teamSize > 0) score += 5;

  if (sanitizeText(leadData.currentTools)) score += 10;
  if (sanitizeText(leadData.salesChannels)) score += 10;

  return clampScore(score);
}

function getBuyerMotivation(leadData: Partial<ChatLeadData>, transcript: LeadTranscriptMessage[]) {
  const text = getLeadText(leadData, transcript);

  if (/(manual|caos|desorden|control|error|stock|pedido|whatsapp|excel)/.test(text)) {
    return 'Control y alivio operativo';
  }

  if (/(atencion|cliente|seguimiento|crm|respuesta|postventa)/.test(text)) {
    return 'Control y experiencia comercial';
  }

  if (/(margen|precio|rentabilidad|ganancia|costos)/.test(text)) {
    return 'Rentabilidad y margen';
  }

  if (/(crecer|ventas|conversion|web|ecommerce|seo|tienda)/.test(text)) {
    return 'Crecimiento comercial';
  }

  if (/(rapido|ya|urgente|demora)/.test(text)) {
    return 'Velocidad de ejecucion';
  }

  return 'Seguridad para tomar una buena decision';
}

function getPriorityLevel(readinessScore: number, urgencyScore: number, intentScore: number): LeadIntelligence['priorityLevel'] {
  if (readinessScore >= 75 || (urgencyScore >= 70 && intentScore >= 65)) {
    return 'hot';
  }

  if (readinessScore >= 45 || intentScore >= 45) {
    return 'warm';
  }

  return 'cold';
}

function getPainSummary(leadData: Partial<ChatLeadData>, transcript: LeadTranscriptMessage[]) {
  return buildPainSummary(leadData, transcript);
}

function getObjections(
  leadData: Partial<ChatLeadData>,
  missingData: string[],
  intentScore: number,
  urgencyScore: number,
) {
  const objections: string[] = [];
  const budget = sanitizeText(leadData.budget).toLowerCase();

  if (!budget || /no|sin|despues|veremos/.test(budget)) {
    objections.push('Puede postergar la decision por presupuesto poco claro.');
  }

  if (urgencyScore < 45) {
    objections.push('Puede no sentir dolor suficiente para moverse ahora.');
  }

  if (intentScore < 50) {
    objections.push('Todavia puede estar explorando opciones sin decision inmediata.');
  }

  if (missingData.includes('Telefono')) {
    objections.push('Falta un canal rapido para seguimiento comercial.');
  }

  if (objections.length === 0) {
    objections.push('No aparece una objecion dominante; conviene avanzar con demo y propuesta breve.');
  }

  return objections.slice(0, 3);
}

function getOfferValueProp(
  offerToShowNow: string,
  salesAngle: string,
  automationWins: string[],
) {
  if (offerToShowNow === 'ERP + e-commerce') {
    return 'unificar operacion y canal digital para crecer con control';
  }

  if (offerToShowNow === 'ERP operativo' && salesAngle === 'CRM y fidelizacion') {
    return 'ordenar seguimiento, atencion y contexto comercial desde un sistema central';
  }

  if (offerToShowNow === 'ERP operativo' && salesAngle === 'Control de stock y logistica') {
    return 'darle visibilidad a stock, pedidos y logistica desde un mismo sistema';
  }

  if (offerToShowNow === 'ERP operativo') {
    return 'ordenar la operacion comercial y reducir dependencia de procesos manuales';
  }

  if (offerToShowNow === 'E-commerce con integracion') {
    return 'mejorar conversion sin desconectar el canal digital del resto del negocio';
  }

  const firstWin = automationWins[0];
  if (firstWin) {
    return lowerFirst(stripTrailingPunctuation(firstWin));
  }

  return 'bajar incertidumbre y mostrar el punto de mayor impacto';
}

function buildTalkTrack(
  leadData: Partial<ChatLeadData>,
  offerToShowNow: string,
  buyerMotivation: string,
  painSummary: string,
  salesAngle: string,
  automationWins: string[],
) {
  const company = sanitizeText(leadData.company) || 'tu empresa';
  const pain = stripTrailingPunctuation(painSummary);
  const offerValue = getOfferValueProp(offerToShowNow, salesAngle, automationWins);

  if (buyerMotivation === 'Control y alivio operativo') {
    return `Hoy con ${company} el foco tiene que ser control operativo. Mostra ${offerToShowNow} como la forma mas directa de ${offerValue}. El punto a poner arriba de la mesa es este: ${pain}.`;
  }

  if (buyerMotivation === 'Control y experiencia comercial') {
    return `Con ${company} conviene entrar por orden comercial y calidad de atencion. Mostra ${offerToShowNow} como la forma mas clara de ${offerValue}. El problema central hoy es claro: ${pain}.`;
  }

  if (buyerMotivation === 'Rentabilidad y margen') {
    return `Con ${company} conviene hablar de margen, tiempo y decisiones mas finas. Mostra ${offerToShowNow} como una forma de ${offerValue} sin seguir perdiendo rentabilidad.`;
  }

  if (buyerMotivation === 'Crecimiento comercial') {
    return `Con ${company} la entrada fuerte es crecimiento comercial. Mostra ${offerToShowNow} como la forma mas directa de ${offerValue}. El objetivo tiene que bajar a algo concreto: ${pain}.`;
  }

  if (buyerMotivation === 'Velocidad de ejecucion') {
    return `Con ${company} hay que vender velocidad y claridad. El mensaje corto es ${offerToShowNow} para ${offerValue}, sin una implementacion eterna.`;
  }

  return `Con ${company} conviene ir a lo concreto: ${offerToShowNow} para ${offerValue}. El problema a mostrar ahora es claro: ${pain}.`;
}

function buildFollowUpAssets(
  leadData: Partial<ChatLeadData>,
  offerToShowNow: string,
  nextBestAction: string,
  painSummary: string,
  salesAngle: string,
  automationWins: string[],
) {
  const name = sanitizeText(leadData.name) || 'hola';
  const company = sanitizeText(leadData.company) || 'tu empresa';
  const pain = stripTrailingPunctuation(painSummary);
  const offerValue = getOfferValueProp(offerToShowNow, salesAngle, automationWins);
  const nextStep = lowerFirst(stripTrailingPunctuation(nextBestAction));

  return {
    followUpMessage: `Hola ${name}, vi un foco claro en ${company}: ${lowerFirst(pain)}. La mejor entrada ahora es ${offerToShowNow} para ${offerValue}.`,
    followUpWhatsApp: `Hola ${name}, revise lo que contaste de ${company}. Veo un foco claro: ${pain}. La mejor entrada hoy seria ${offerToShowNow} para ${offerValue}. Si te sirve, seguimos con una demo corta enfocada en ese punto.`,
    followUpEmailSubject: `Idea concreta para ${company}`,
    followUpEmailBody: `Hola ${name},\n\nRevise lo que nos compartiste sobre ${company} y veo un foco claro: ${pain}.\n\nLa mejor entrada hoy seria ${offerToShowNow}, porque permite ${offerValue}.\n\nSiguiente paso recomendado: ${capitalizeFirst(nextStep)}.\n\nSi te sirve, coordinamos una demo breve y la enfocamos en ese punto.\n\nSaludos,\nLayerCloud`,
  };
}

function buildExecutiveSummary(
  company: string,
  salesAngle: string,
  priorityLevel: LeadIntelligence['priorityLevel'],
  offerToShowNow: string,
  painSummary: string,
) {
  return `${company} muestra una oportunidad clara en ${salesAngle.toLowerCase()} con prioridad ${priorityLevel}. El foco ahora es ${lowerFirst(stripTrailingPunctuation(painSummary))} y entrar con ${offerToShowNow}.`;
}

export function hydrateLeadIntelligence(
  leadData: Partial<ChatLeadData>,
  strategy: LeadIntelligence,
): LeadIntelligence {
  const company = sanitizeText(leadData.company) || 'la empresa';
  const whatToSayNow = buildTalkTrack(
    leadData,
    strategy.offerToShowNow,
    strategy.buyerMotivation,
    strategy.painSummary,
    strategy.salesAngle,
    strategy.automationWins,
  );
  const followUpAssets = buildFollowUpAssets(
    leadData,
    strategy.offerToShowNow,
    strategy.nextBestAction,
    strategy.painSummary,
    strategy.salesAngle,
    strategy.automationWins,
  );

  return {
    ...strategy,
    executiveSummary: buildExecutiveSummary(
      company,
      strategy.salesAngle,
      strategy.priorityLevel,
      strategy.offerToShowNow,
      strategy.painSummary,
    ),
    whatToSayNow,
    followUpMessage: followUpAssets.followUpMessage,
    followUpWhatsApp: followUpAssets.followUpWhatsApp,
    followUpEmailSubject: followUpAssets.followUpEmailSubject,
    followUpEmailBody: followUpAssets.followUpEmailBody,
  };
}

export function buildHeuristicLeadIntelligence(
  leadData: Partial<ChatLeadData>,
  transcript: LeadTranscriptMessage[] = [],
): LeadIntelligence {
  const intentScore = scoreIntent(leadData, transcript);
  const urgencyScore = scoreUrgency(leadData, transcript);
  const fitScore = scoreFit(leadData, transcript);
  const readinessScore = clampScore(intentScore * 0.4 + urgencyScore * 0.25 + fitScore * 0.35);
  const buyerMotivation = getBuyerMotivation(leadData, transcript);
  const offer = getRecommendedOffer(leadData, transcript);
  const salesAngle = inferLeadSalesAngle(leadData);
  const painSummary = getPainSummary(leadData, transcript);
  const missingData = getMissingData(leadData);
  const automationWins = getAutomationWins(leadData, transcript);
  const priorityLevel = getPriorityLevel(readinessScore, urgencyScore, intentScore);
  const nextBestAction =
    priorityLevel === 'hot'
      ? urgencyScore < 45
        ? 'coordinar una demo consultiva y validar ventana de implementacion'
        : 'coordinar una demo o llamada comercial esta semana'
      : priorityLevel === 'warm'
        ? 'mandar una propuesta corta y validar presupuesto + urgencia'
        : 'hacer seguimiento liviano y completar datos criticos';
  const company = sanitizeText(leadData.company) || 'la empresa';

  return hydrateLeadIntelligence(leadData, {
    priorityLevel,
    intentScore,
    urgencyScore,
    fitScore,
    readinessScore,
    buyerMotivation,
    recommendedOffer: offer.recommendedOffer,
    offerToShowNow: offer.recommendedOffer,
    offerReason: offer.offerReason,
    salesAngle,
    executiveSummary: buildExecutiveSummary(company, salesAngle, priorityLevel, offer.recommendedOffer, painSummary),
    painSummary,
    nextBestAction: nextBestAction.charAt(0).toUpperCase() + nextBestAction.slice(1) + '.',
    whatToSayNow: '',
    followUpMessage: '',
    followUpWhatsApp: '',
    followUpEmailSubject: '',
    followUpEmailBody: '',
    objections: getObjections(leadData, missingData, intentScore, urgencyScore),
    missingData,
    automationWins,
    confidence: clampScore(readinessScore * 0.7 + fitScore * 0.3),
    generatedBy: 'heuristic',
    model: 'rules-v3',
    analysisVersion: 3,
  });
}

export function sanitizeLeadIntelligence(
  raw: Partial<LeadIntelligence> | null | undefined,
  fallback: LeadIntelligence,
): LeadIntelligence {
  const safeOffer = sanitizeText(raw?.recommendedOffer);
  const recommendedOffer = ALLOWED_OFFERS.includes(safeOffer as (typeof ALLOWED_OFFERS)[number])
    ? safeOffer
    : fallback.recommendedOffer;
  const safeOfferToShow = sanitizeText(raw?.offerToShowNow);
  const offerToShowNow = ALLOWED_OFFERS.includes(safeOfferToShow as (typeof ALLOWED_OFFERS)[number])
    ? safeOfferToShow
    : recommendedOffer;

  const priorityLevel =
    raw?.priorityLevel === 'hot' || raw?.priorityLevel === 'warm' || raw?.priorityLevel === 'cold'
      ? raw.priorityLevel
      : fallback.priorityLevel;

  return {
    priorityLevel,
    intentScore: typeof raw?.intentScore === 'number' ? clampScore(raw.intentScore) : fallback.intentScore,
    urgencyScore: typeof raw?.urgencyScore === 'number' ? clampScore(raw.urgencyScore) : fallback.urgencyScore,
    fitScore: typeof raw?.fitScore === 'number' ? clampScore(raw.fitScore) : fallback.fitScore,
    readinessScore: typeof raw?.readinessScore === 'number' ? clampScore(raw.readinessScore) : fallback.readinessScore,
    buyerMotivation: sanitizeText(raw?.buyerMotivation) || fallback.buyerMotivation,
    recommendedOffer,
    offerToShowNow,
    offerReason: sanitizeText(raw?.offerReason) || fallback.offerReason,
    salesAngle: sanitizeText(raw?.salesAngle) || fallback.salesAngle,
    executiveSummary: sanitizeText(raw?.executiveSummary) || fallback.executiveSummary,
    painSummary: toSentence(sanitizeText(raw?.painSummary)) || fallback.painSummary,
    nextBestAction: sanitizeText(raw?.nextBestAction) || fallback.nextBestAction,
    whatToSayNow: sanitizeText(raw?.whatToSayNow) || fallback.whatToSayNow,
    followUpMessage: sanitizeText(raw?.followUpMessage) || fallback.followUpMessage,
    followUpWhatsApp: sanitizeText(raw?.followUpWhatsApp) || fallback.followUpWhatsApp,
    followUpEmailSubject: sanitizeText(raw?.followUpEmailSubject) || fallback.followUpEmailSubject,
    followUpEmailBody: sanitizeText(raw?.followUpEmailBody) || fallback.followUpEmailBody,
    objections: toStringArray(raw?.objections).length ? toStringArray(raw?.objections) : fallback.objections,
    missingData: toStringArray(raw?.missingData).length ? toStringArray(raw?.missingData) : fallback.missingData,
    automationWins: toStringArray(raw?.automationWins).length ? toStringArray(raw?.automationWins) : fallback.automationWins,
    confidence: typeof raw?.confidence === 'number' ? clampScore(raw.confidence) : fallback.confidence,
    generatedBy:
      raw?.generatedBy === 'gemini' || raw?.generatedBy === 'heuristic'
        ? raw.generatedBy
        : fallback.generatedBy,
    model: sanitizeText(raw?.model) || fallback.model,
    analysisVersion:
      typeof raw?.analysisVersion === 'number'
        ? Math.max(1, Math.round(raw.analysisVersion))
        : fallback.analysisVersion,
  };
}

export async function requestLeadIntelligence(input: LeadStrategyRequest) {
  const fallback = buildHeuristicLeadIntelligence(input.leadData, input.transcript);

  try {
    const response = await fetch('/api/lead-strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`AI route failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { strategy?: Partial<LeadIntelligence> };
    return hydrateLeadIntelligence(
      input.leadData,
      sanitizeLeadIntelligence(payload.strategy, fallback),
    );
  } catch (error) {
    console.warn('[LayerCloud AI]', error);
    return hydrateLeadIntelligence(input.leadData, fallback);
  }
}

export function shouldAnalyzeLead(leadData: Partial<ChatLeadData>) {
  const completed = countLeadFields(leadData);
  return completed >= 8 && Boolean(sanitizeText(leadData.company) && sanitizeText(leadData.email));
}
