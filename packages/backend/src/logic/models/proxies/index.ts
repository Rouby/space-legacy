import type { fleetProxy } from './fleet';
import type { gameProxy } from './game';
import type { shipProxy } from './ship';
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
  fleetProxy: undefined as any as fleetProxy,
  gameProxy: undefined as any as gameProxy,
  shipProxy: undefined as any as shipProxy,
  shipDesignProxy: undefined as any as shipDesignProxy,
  starSystemProxy: undefined as any as starSystemProxy,
  userProxy: undefined as any as userProxy,
  visibilityProxy: undefined as any as visibilityProxy,
};
