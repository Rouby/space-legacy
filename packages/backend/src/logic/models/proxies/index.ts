import type { fleetProxy } from './fleet';
import type { gameProxy } from './game';
import type { shipProxy } from './ship';
import type { shipDesignProxy } from './shipDesign';
import type { starSystemProxy } from './starSystem';
import type { userProxy } from './user';

export type Promised<T extends { id: any }> = {
  [P in keyof T]: P extends 'id' ? T[P] : Promise<T[P]>;
} & { $resolve: Promise<T> };

export const proxies = {
  fleetProxy: undefined as any as fleetProxy,
  gameProxy: undefined as any as gameProxy,
  shipProxy: undefined as any as shipProxy,
  shipDesignProxy: undefined as any as shipDesignProxy,
  starSystemProxy: undefined as any as starSystemProxy,
  userProxy: undefined as any as userProxy,
};
