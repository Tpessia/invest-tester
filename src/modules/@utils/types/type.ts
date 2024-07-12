export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
}
export type Callback<T extends any[], R> = (...args: T) => R;

export type ParamType<T> = T extends (param: infer P) => any ? P : never;
export type ParamsType<T> = T extends (...args: infer P) => any ? P : never;