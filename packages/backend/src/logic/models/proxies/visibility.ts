import { get } from '../loader';
import { Visibility } from '../Visibility';
import { proxyOf } from './proxy';

export function visibilityProxy(gameId: string, userId: string) {
  return proxyOf({ gameId, userId }, () => get(Visibility, gameId, userId));
}
export type visibilityProxy = typeof visibilityProxy;
