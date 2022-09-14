import { Ship } from '../Ship';
import { proxyOf } from './proxy';

export function shipProxy(id: string) {
  return proxyOf({ id }, () => Ship.get(id));
}
export type shipProxy = typeof shipProxy;
