import type { Promised } from '.';
import { StarSystem } from '../StarSystem';

export function starSystemProxy(id: string) {
  return new Proxy<Promised<StarSystem>>({ id } as any, {
    get: (target, prop: keyof Promised<StarSystem>) => {
      if (prop in target) {
        return target[prop];
      }
      return StarSystem.get(target.id).then((game) => game[prop]);
    },
  });
}
export type starSystemProxy = typeof starSystemProxy;
