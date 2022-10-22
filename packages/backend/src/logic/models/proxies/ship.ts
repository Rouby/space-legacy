import { get } from '../loader';
import { Ship } from '../Ship';
import { proxyOf } from './proxy';

export function shipProxy(id: string) {
  return proxyOf({ id }, () => get(Ship, id));
}
export type shipProxy = typeof shipProxy;
