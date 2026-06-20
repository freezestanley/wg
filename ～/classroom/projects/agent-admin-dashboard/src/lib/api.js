function withFallbackBase(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export async function apiGet(path, config = {}) {
  const url = withFallbackBase(path);

  if (window.axios?.get) {
    return window.axios.get(url, config);
  }

  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }

  return response;
}

export async function apiPost(path, data, config = {}) {
  const url = withFallbackBase(path);

  if (window.axios?.post) {
    return window.axios.post(url, data, config);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: data === undefined ? undefined : JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`POST ${url} failed: ${response.status}`);
  }

  return response;
}
