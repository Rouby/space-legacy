import { ShipComponent } from '../ShipComponent';
import { proxyOf } from './proxy';

export function shipComponentProxy(id: string) {
  return proxyOf({ id }, () => ShipComponent.get(id));
}
export type shipComponentProxy = typeof shipComponentProxy;
