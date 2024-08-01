export function changeUrl(baseUrl: string, config: { hostname?: string, port?: string, path?: string, protocol?: string }) {
  const url = new URL(baseUrl);

  if (config.hostname != null) url.hostname = config.hostname;
  if (config.path != null) url.pathname = config.path;
  if (config.port != null) url.port = config.port;
  if (config.protocol != null) url.protocol = config.protocol;

  return url.toString();
}

export function writeObjToUrl(obj: object): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    params.append(key, JSON.stringify(value));
  }
  return params;
}

export function readObjFromUrl(params: URLSearchParams): object {
  const obj: any = {};
  for (const [key, value] of params.entries()) {
    obj[key] = JSON.parse(value);
  }
  return obj;
}

export function encodeUrlParams(obj: object): string {
  const url = writeObjToUrl(obj);
  const encoded = btoa(url.toString());
  return encoded;
}

export function decodeUrlParams(encoded: string): object {
  const url = atob(encoded);
  return readObjFromUrl(new URLSearchParams(url));
}