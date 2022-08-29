import type { Promised } from '.';
import { Fleet } from '../Fleet';

export function fleetProxy(id: string) {
  return new Proxy<Promised<Fleet>>({ id } as any, {
    get: (target, prop: keyof Promised<Fleet>) => {
      if (prop in target) {
        return target[prop];
      }
      return Fleet.get(target.id).then((game) => game[prop]);
    },
  });
}
export type fleetProxy = typeof fleetProxy;
