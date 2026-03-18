export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

export async function postJson<TResponse>(
  url: string,
  body: unknown,
  init?: { keepalive?: boolean; auth?: 'admin' },
) {
  let idToken = '';
  if (typeof window !== 'undefined' && init?.auth === 'admin') {
    const { auth } = await import('./firebase');
    idToken = auth.currentUser ? await auth.currentUser.getIdToken() : '';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(body),
    keepalive: init?.keepalive,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new ApiClientError(
      payload?.error || payload?.message || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return payload as TResponse;
}
