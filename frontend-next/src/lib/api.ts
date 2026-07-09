const API_PREFIX = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details: unknown,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string" && payload
        ? payload
        : JSON.stringify(payload ?? { status: response.status });

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const api = {
  get<T>(path: string) {
    return request<T>(path);
  },
  post<T>(path: string, body: unknown) {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}
