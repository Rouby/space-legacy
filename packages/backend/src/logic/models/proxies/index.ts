import type { fleetProxy } from './fleet';
import type { gameProxy } from './game';
import type { starSystemProxy } from './starSystem';
import type { userProxy } from './user';

export type Promised<T extends { id: any }> = {
  [P in keyof T]: P extends 'id' ? T[P] : Promise<T[P]>;
};

export const proxies = {
  fleetProxy: undefined as any as fleetProxy,
  gameProxy: undefined as any as gameProxy,
  starSystemProxy: undefined as any as starSystemProxy,
  userProxy: undefined as any as userProxy,
};
