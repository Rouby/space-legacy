import { Game } from '../Game';
import { get } from '../loader';
import { proxyOf } from './proxy';

export function gameProxy(id: string) {
  return proxyOf({ id }, () => get(Game, id));
}
export type gameProxy = typeof gameProxy;
