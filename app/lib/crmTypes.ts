export const CHAT_FIELD_ORDER = [
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
] as const;

export type ChatFieldKey = (typeof CHAT_FIELD_ORDER)[number];

export interface ChatLeadData {
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  website: string;
  monthlyOrders: string;
  teamSize: string;
  currentTools: string;
  salesChannels: string;
  topPain: string;
  urgency: string;
  budget: string;
  extraContext: string;
}

export interface ContactLeadInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export type LeadCollectionName = 'chatSessions' | 'contactSubmissions';
export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface ChatSessionOptions {
  currentStepKey?: string | null;
  currentStepIndex?: number | null;
  status?: 'active' | 'qualified' | 'completed';
}

export function sanitizeText(value: string | null | undefined) {
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

export function stripEmptyFields<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (typeof value === 'string') {
        return sanitizeText(value).length > 0;
      }

      return value !== null && value !== undefined;
    }),
  ) as Partial<T>;
}

export function firstNumber(value: string) {
  const match = value.replace(/\./g, '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function countCompletedFields(data: Partial<ChatLeadData>) {
  return CHAT_FIELD_ORDER.filter((key) => sanitizeText(data[key] ?? '').length > 0).length;
}

export function calculateLeadScore(data: Partial<ChatLeadData>) {
  let score = Math.min(45, countCompletedFields(data) * 3);

  if (data.email && /.+@.+\..+/.test(data.email)) score += 12;
  if (data.phone && !/prefiere no compartir/i.test(data.phone)) score += 8;
  if (data.company) score += 5;
  if (data.role) score += 5;

  const urgency = (data.urgency ?? '').toLowerCase();
  if (/(urgente|ya|hoy|esta semana|este mes|lo antes posible)/.test(urgency)) {
    score += 15;
  } else if (urgency) {
    score += 6;
  }

  const budget = (data.budget ?? '').toLowerCase();
  if (/\d/.test(budget) || /(definido|aprobado|cerrado)/.test(budget)) {
    score += 10;
  }

  const monthlyOrders = firstNumber(data.monthlyOrders ?? '');
  if (monthlyOrders >= 500) score += 12;
  else if (monthlyOrders >= 100) score += 8;
  else if (monthlyOrders > 0) score += 4;

  const painSignals = `${data.currentTools ?? ''} ${data.topPain ?? ''}`.toLowerCase();
  if (
    /(excel|manual|whatsapp|stock|inventario|pedido|precio|catalogo|demora|organizacion|atencion)/.test(
      painSignals,
    )
  ) {
    score += 8;
  }

  return Math.min(score, 100);
}

export function inferSalesAngle(data: Partial<ChatLeadData>) {
  const text =
    `${data.currentTools ?? ''} ${data.topPain ?? ''} ${data.salesChannels ?? ''} ${data.website ?? ''}`.toLowerCase();

  if (/(excel|manual|whatsapp|pedido|carga manual|tiempo perdido|organizacion|proceso)/.test(text)) {
    return 'Automatizacion operativa';
  }

  if (/(stock|inventario|deposito|quiebre|logistica|reparto)/.test(text)) {
    return 'Control de stock y logistica';
  }

  if (/(precio|dolar|catalogo|lista)/.test(text)) {
    return 'Actualizacion de precios y catalogos';
  }

  if (/(tienda|ecommerce|mercado libre|web|seo|checkout)/.test(text)) {
    return 'Ecommerce y conversion';
  }

  if (/(crm|cliente|seguimiento|fidelizacion|retencion|atencion|respuesta|postventa)/.test(text)) {
    return 'CRM y fidelizacion';
  }

  return 'Diagnostico general';
}

export function getChatSessionStatus(
  data: Partial<ChatLeadData>,
  override?: ChatSessionOptions['status'],
) {
  if (override) {
    return override;
  }

  const completed = countCompletedFields(data);
  if (completed >= CHAT_FIELD_ORDER.length) {
    return 'completed';
  }

  if (calculateLeadScore(data) >= 70) {
    return 'qualified';
  }

  return 'active';
}
