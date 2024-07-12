import { DeepPartial, normalizeTimezone } from '@utils/index';
import { isArray, mergeWith } from 'lodash-es';

export function mergeState<T>(oldState: T, newState: DeepPartial<T>, overwrite: boolean = true) {
    return mergeWith(oldState, newState, (a, b) => isArray(b) ? overwrite ? b : a.concat(b) : undefined);
}

export function handleDate(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): Date {
    var date = new Date(e.target.value);
    if (Number.isNaN(date.getTime())) return undefined as any;
    return normalizeTimezone(date);
}

export function handleNumber(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): number {
    if (e.target.value == null || Number.isNaN(e.target.value)) return undefined as any;
    return +e.target.value;
}

export function handleAny(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): any {
    return e.target.value;
}
