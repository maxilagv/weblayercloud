export function sanitizeText(value: string | null | undefined) {
  return (value ?? '').trim();
}

export function readJsonBody<T>(req: any, fallback: T): T {
  if (!req?.body) {
    return fallback;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as T;
    } catch {
      return fallback;
    }
  }

  return req.body as T;
}

export function getBearerToken(req: any) {
  const authorization = sanitizeText(req?.headers?.authorization || req?.headers?.Authorization);
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return '';
  }

  return sanitizeText(authorization.slice(7));
}

export function toPlainObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export function sanitizeEventName(value: unknown) {
  const normalized = sanitizeText(typeof value === 'string' ? value.toLowerCase() : '');
  return normalized.replace(/[^a-z0-9_]/g, '').slice(0, 60);
}

export function safeJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}

export function assertBodySize(req: any, maxBytes = 8192): void {
  const contentLength = parseInt(req?.headers?.['content-length'] ?? '0', 10);
  if (contentLength > maxBytes) {
    const error = new Error('Request body too large.');
    (error as any).statusCode = 413;
    throw error;
  }
}

export function sanitizeTranscript(
  value: unknown,
  maxMessages = 20,
  maxContentLength = 2000,
): Array<{ role: string; content: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxMessages)
    .filter((m) => m && typeof m === 'object')
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: sanitizeText(typeof m.content === 'string' ? m.content : '').slice(0, maxContentLength),
    }));
}

export function parseAllowedOrigin(headerValue: string): string {
  const raw = sanitizeText(headerValue);
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
}
