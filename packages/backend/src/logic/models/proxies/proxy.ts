import type { Promised } from '.';

export function proxyOf<T extends {}>(
  base: any,
  getter: () => Promise<T | null>,
) {
  let cached = null as Promise<T | null> | null;
  return new Proxy<Promised<T>>(base, {
    get: (target, prop: (keyof T & string) | '$resolve') => {
      if (prop === '$resolve') {
        return (cached = cached ?? getter());
      }
      if (prop in target) {
        return target[prop];
      }
      return (cached = cached ?? getter()).then((d) => d?.[prop]);
    },
  });
}

declare global {
  interface Array<T> {
    $resolveAll: Promise<(T extends Promised<infer U> ? U : T)[]>;
  }
}

Object.defineProperty(Array.prototype, '$resolveAll', {
  get(this: Promised<any>[]) {
    return Promise.all(this.map((d) => d?.$resolve ?? d));
  },
  enumerable: false,
  configurable: false,
});
