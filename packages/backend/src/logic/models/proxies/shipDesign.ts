import { get } from '../loader';
import { ShipDesign } from '../ShipDesign';
import { proxyOf } from './proxy';

export function shipDesignProxy(id: string) {
  return proxyOf({ id }, () => get(ShipDesign, id));
}
export type shipDesignProxy = typeof shipDesignProxy;
