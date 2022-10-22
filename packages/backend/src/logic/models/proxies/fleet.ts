import { Fleet } from '../Fleet';
import { get } from '../loader';
import { proxyOf } from './proxy';

export function fleetProxy(id: string) {
  return proxyOf({ id }, () => get(Fleet, id));
}
export type fleetProxy = typeof fleetProxy;
