import { Combat } from '../Combat';
import { get } from '../loader';
import { proxyOf } from './proxy';

export function combatProxy(id: string) {
  return proxyOf({ id }, () => get(Combat, id));
}
export type combatProxy = typeof combatProxy;
