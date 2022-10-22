import { get } from '../loader';
import { Player } from '../Player';
import { proxyOf } from './proxy';

export function playerProxy(gameId: string, userId: string) {
  return proxyOf({ gameId, userId }, () => get(Player, gameId, userId));
}
export type playerProxy = typeof playerProxy;
