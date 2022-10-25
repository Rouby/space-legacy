import type { Promised } from '.';

export function proxyOf<T extends {}>(
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

declare global {
  interface Array<T> {
    $resolveAll: Promise<(T extends Promised<infer U> ? U : T)[]>;
  }
}

if (!Array.prototype.$resolveAll) {
  Object.defineProperty(Array.prototype, '$resolveAll', {
    get(this: Promised<any>[]) {
      return Promise.all(this.map((d) => d?.$resolve ?? d));
    },
    enumerable: false,
    configurable: false,
  });
}
