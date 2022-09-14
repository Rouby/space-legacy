import type { Promised } from '.';

export function proxyOf<T extends { id: any }>(
  base: any,
  getter: () => Promise<T | null>,
) {
  return new Proxy<Promised<T>>(base, {
    get: (target, prop: (keyof T & string) | '$resolve') => {
      if (prop === '$resolve') {
        return getter();
      }
      if (prop in target) {
        return target[prop];
      }
      return getter().then((d) => d?.[prop]);
    },
  });
}
