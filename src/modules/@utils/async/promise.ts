export function promiseParallel<T, TRej = T>(tasks: (() => Promise<T>)[], concurrencyLimit: number, noReject: boolean = false): Promise<(T | TRej)[]> {
  return new Promise<(T | TRej)[]>((res, rej) => {
      if (tasks.length === 0) res([]);

      const results: (T | TRej)[] = [];
      const pool: Promise<T | TRej>[] = [];
      let canceled: boolean = false;

      tasks.slice(0, concurrencyLimit).map(e => runPromise(e));

      function runPromise(task: () => Promise<T>): Promise<T | TRej> {
          let promise: Promise<T | TRej> = task();

          pool.push(promise);

          if (noReject) promise = promise.catch((e: TRej) => e);

          promise.then(r => {
              if (canceled) return;

              results.push(r);

              const poolIndex = pool.indexOf(promise);
              pool.splice(poolIndex, 1);

              if (tasks.length === results.length)
                  res(results);

              const nextIndex = concurrencyLimit + results.length - 1;
              const nextTask = tasks[nextIndex];

              if (!nextTask) return;

              runPromise(nextTask);
          })
          
          if (!noReject) promise.catch(err => { canceled = true; rej(err); });

          return promise;
      }
  });
}

export async function promiseRetry<T>(func: () => Promise<T>, maxRetries: number, onError?: (err: any) => void): Promise<T> {
  try {
      return await func();
  } catch (err) {
      onError?.(err);
      const funcAny = (func as any);
      funcAny._retries = (funcAny._retries as number ?? 0) + 1;
      if (funcAny._retries >= maxRetries) throw err;
      else return await promiseRetry(func, maxRetries, onError);
  }
}

export function promiseDeferred<T>(): { promise: Promise<T>, resolve: (value: T) => void, reject: (reason?: any) => void } {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve: resolve!, reject: reject! };
}