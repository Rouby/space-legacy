import { ShipDesign } from '../ShipDesign';
import { proxyOf } from './proxy';

export function shipDesignProxy(id: string) {
  return proxyOf({ id }, () => ShipDesign.get(id));
}
export type shipDesignProxy = typeof shipDesignProxy;
