import { Fleet } from '../Fleet';
import { proxyOf } from './proxy';

export function fleetProxy(id: string) {
  return proxyOf({ id }, () => Fleet.get(id));
}
export type fleetProxy = typeof fleetProxy;
