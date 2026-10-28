/** Error returned by our API (`{ error: { code, message } }`), or a network failure reaching it. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new ApiError('NETWORK_ERROR', 'No se pudo conectar con el servidor.');
  }

  if (!response.ok) {
    const body: ErrorBody | null = await response.json().catch(() => null);
    throw new ApiError(
      body?.error?.code ?? 'INTERNAL_ERROR',
      body?.error?.message ?? 'Ocurrió un error inesperado.',
    );
  }
  return response.json();
}

/** GET a JSON resource from our API; any failure is thrown as an `ApiError` with its code and Spanish message. */
export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

/** POST a JSON body to our API; failures are thrown as an `ApiError`, like `apiGet`. */
export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
