import { get } from '../loader';
import { ShipComponent } from '../ShipComponent';
import { proxyOf } from './proxy';

export function shipComponentProxy(id: string) {
  return proxyOf({ id }, () => get(ShipComponent, id));
}
export type shipComponentProxy = typeof shipComponentProxy;
