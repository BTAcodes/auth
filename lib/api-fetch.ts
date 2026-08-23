export async function apiFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // Access token expired / unauthorized
  if (response.status === 401) {
    const refreshResponse = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    // Refresh token expired or invalid
    if (!refreshResponse.ok) {
      return response;
    }

    // Access token has been refreshed, retry original request
    response = await fetch(url, {
      ...options,
      credentials: "include",
    });
  }

  return response;
}