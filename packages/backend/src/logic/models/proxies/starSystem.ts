import { StarSystem } from '../StarSystem';
import { proxyOf } from './proxy';

export function starSystemProxy(id: string) {
  return proxyOf({ id }, () => StarSystem.get(id));
}
export type starSystemProxy = typeof starSystemProxy;
