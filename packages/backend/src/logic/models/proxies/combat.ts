import { Combat } from '../Combat';
import { proxyOf } from './proxy';

export function combatProxy(id: string) {
  return proxyOf({ id }, () => Combat.get(id));
}
export type combatProxy = typeof combatProxy;
