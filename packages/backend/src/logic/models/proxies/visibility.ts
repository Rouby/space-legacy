import { Visibility } from '../Visibility';
import { proxyOf } from './proxy';

export function visibilityProxy(gameId: string, userId: string) {
  return proxyOf({ gameId, userId }, () => Visibility.get(gameId, userId));
}
export type visibilityProxy = typeof visibilityProxy;
