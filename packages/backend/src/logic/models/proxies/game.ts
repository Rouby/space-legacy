import { Game } from '../Game';
import { proxyOf } from './proxy';

export function gameProxy(id: string) {
  return proxyOf({ id }, () => Game.get(id));
}
export type gameProxy = typeof gameProxy;
