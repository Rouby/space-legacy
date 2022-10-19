import type { GameList } from '../GameList';
import type { combatProxy } from './combat';
import type { fleetProxy } from './fleet';
import type { gameProxy } from './game';
import type { playerProxy } from './player';
import type { shipProxy } from './ship';
import type { shipComponentProxy } from './shipComponent';
import type { shipDesignProxy } from './shipDesign';
import type { starSystemProxy } from './starSystem';
import type { userProxy } from './user';
import type { visibilityProxy } from './visibility';

export type Promised<T extends {}> = {
  [P in keyof T]: P extends 'id'
    ? T[P]
    : P extends `${string}Id`
    ? T[P]
    : Promise<T[P]>;
} & { $resolve: Promise<T> };

export const proxies = {
  combatProxy: undefined as any as combatProxy,
  fleetProxy: undefined as any as fleetProxy,
  gameProxy: undefined as any as gameProxy,
  gameListProxy: undefined as any as typeof GameList,
  playerProxy: undefined as any as playerProxy,
  shipProxy: undefined as any as shipProxy,
  shipComponentProxy: undefined as any as shipComponentProxy,
  shipDesignProxy: undefined as any as shipDesignProxy,
  starSystemProxy: undefined as any as starSystemProxy,
  userProxy: undefined as any as userProxy,
  visibilityProxy: undefined as any as visibilityProxy,
};
