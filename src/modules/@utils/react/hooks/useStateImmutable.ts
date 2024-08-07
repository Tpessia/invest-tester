import update, { Spec } from 'immutability-helper';
import { useState } from 'react';

// Hook as shortcut for immutability-helper's update

export function useStateImmutable<T>(): [T | undefined, ($spec: Spec<T | undefined>) => void];
export function useStateImmutable<T>(initialState: T | (() => T)): [T, ($spec: Spec<T>) => void];
export function useStateImmutable<T>(initialState?: T | (() => T)) {
    const [state, setState] = useState(initialState);
    const updateFunc = ($spec: Spec<T | undefined>) => setState(s => update(s, $spec));
    return [state, updateFunc];
}
