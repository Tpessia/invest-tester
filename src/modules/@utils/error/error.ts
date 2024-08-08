import { tryParseJson, tryStringifyJson } from '@utils/index';

export function getErrorMsg(err?: Error | string | any, debug: boolean = false, log: boolean = true, prefix: string = 'Error: ') {
  if (log) console.error(err);

  const msgNoDebug = (err as Error)?.stack ?? err.toString();
  const msgParts = msgNoDebug.trim().split('\n');

  let msg = (err as Error)?.message || msgParts[0];
  
  if (!debug) {
    const json = tryParseJson(msg, undefined, false);
    const yahooError = tryStringifyJson(tryParseJson(json?.error, undefined, false)?.chart?.error?.description);
    const parsedError = yahooError || json?.error || msg;
    msg = parsedError;
  } else {
    const stack = msgParts.slice(1).join('\n').replace(/^.*node_modules.*$\n?/gm, '');
    msg = [msg, stack].join('\n');
  }

  return `${prefix}${msg}`;
}