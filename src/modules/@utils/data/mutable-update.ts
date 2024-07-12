import { Spec } from 'immutability-helper';

export function mutableUpdate<T>(target: T, spec: Spec<T>): T {
  for (let key in spec) {
    if (spec.hasOwnProperty(key)) {
      const command: any = (spec as any)[key];
      if (key === '$push' && Array.isArray(target)) {
        target.push(...command);
      } else if (key === '$unshift' && Array.isArray(target)) {
        target.unshift(...command);
      } else if (key === '$splice' && Array.isArray(target)) {
        (command as [number, number, ...any[]][]).forEach(args => target.splice(...args));
      } else if (key === '$set') {
        return command as T;
      } else if (key === '$toggle' && target instanceof Object) {
        (command as string[]).forEach(field => {
          if (field in target) {
            (target as any)[field] = !(target as any)[field];
          }
        });
      } else if (key === '$unset' && target instanceof Object) {
        (command as string[]).forEach(field => {
          delete (target as any)[field];
        });
      } else if (key === '$merge' && target instanceof Object) {
        Object.assign(target, command);
      } else if (key === '$apply' && typeof command === 'function') {
        return (command as (value: any) => any)(target);
      } else if (key === '$add' && (target instanceof Map || target instanceof Set)) {
        (command as any[]).forEach(entry => {
          if (target instanceof Map) {
            target.set(entry[0], entry[1]);
          } else if (target instanceof Set) {
            target.add(entry);
          }
        });
      } else if (key === '$remove' && (target instanceof Map || target instanceof Set)) {
        (command as any[]).forEach(entry => {
          if (target instanceof Map) {
            target.delete(entry);
          } else if (target instanceof Set) {
            target.delete(entry);
          }
        });
      } else if (typeof target === 'object' && typeof command === 'object') {
        (target as any)[key] = mutableUpdate((target as any)[key], command);
      }
    }
  }

  return target;
}