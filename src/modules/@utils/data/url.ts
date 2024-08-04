import { jsonDateReviver } from '@/modules/@utils/data/json';

export function changeUrl(baseUrl: string, config: { hostname?: string, port?: string, path?: string, protocol?: string }) {
  const url = new URL(baseUrl);

  if (config.hostname != null) url.hostname = config.hostname;
  if (config.path != null) url.pathname = config.path;
  if (config.port != null) url.port = config.port;
  if (config.protocol != null) url.protocol = config.protocol;

  return url.toString();
}

export function encodeUrlObj(obj: object): string {
  return btoa(JSON.stringify(obj));
}

export function decodeUrlObj(encoded: string): object {
  return JSON.parse(atob(encoded), jsonDateReviver);
}

export function encodeUrlObjFlat(obj: object): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    params.append(key, JSON.stringify(value));
  }
  return params;
}

export function decodeUrlObjFlat(params: URLSearchParams): object {
  const obj: any = {};
  for (const [key, value] of params.entries()) {
    obj[key] = JSON.parse(value);
  }
  return obj;
}