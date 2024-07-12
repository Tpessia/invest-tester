export function changeUrl(baseUrl: string, config: { hostname?: string, port?: string, path?: string, protocol?: string }) {
  const url = new URL(baseUrl);

  if (config.hostname != null) url.hostname = config.hostname;
  if (config.path != null) url.pathname = config.path;
  if (config.port != null) url.port = config.port;
  if (config.protocol != null) url.protocol = config.protocol;

  return url.toString();
}