import { get } from '../loader';
import { StarSystem } from '../StarSystem';
import { proxyOf } from './proxy';

export function starSystemProxy(id: string) {
  return proxyOf({ id }, () => get(StarSystem, id));
}
export type starSystemProxy = typeof starSystemProxy;
