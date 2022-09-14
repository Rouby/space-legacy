import type { Promised } from '.';

export function proxyOf<T extends { id: any }>(
  base: any,
  getter: () => Promise<T | null>,
) {
  let cached = null as Promise<T | null> | null;
  return new Proxy<Promised<T>>(base, {
    get: (target, prop: (keyof T & string) | '$resolve') => {
      if (prop === '$resolve') {
        return getter();
      }
      if (prop in target) {
        return target[prop];
      }
      return (cached = cached ?? getter()).then((d) => d?.[prop]);
    },
  });
}
