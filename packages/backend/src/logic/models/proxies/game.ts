import type { Promised } from '.';
import { Game } from '../Game';

export function gameProxy(id: string) {
  return new Proxy<Promised<Game>>({ id } as any, {
    get: (target, prop: keyof Game) => {
      if (prop in target) {
        return target[prop];
      }
      return Game.get(target.id).then((game) => game[prop]);
    },
  });
}
