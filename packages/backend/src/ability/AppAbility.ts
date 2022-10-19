import { Ability, Subject, type AbilityClass } from '@casl/ability';
import type { Subjects } from '@casl/prisma';
import type { User } from '@prisma/client';
import type {
  Combat,
  Game,
  GameList,
  Ship,
  ShipDesign,
  StarSystem,
} from '../logic/models';

type Abilities =
  | [
      'read' | 'create' | 'update' | 'delete' | 'login',
      'User' | Subjects<{ User: User }>,
    ]
  | ['read', 'GamesList' | Flatten<Readonly<GameList>>]
  | [
      (
        | 'debug'
        | 'create'
        | 'delete'
        | 'join'
        | 'leave'
        | 'enter'
        | 'start'
        | 'endTurn'
      ),
      'Game' | Flatten<Readonly<Game>>,
    ]
  | [
      'constructShip' | 'cancelShipConstruction',
      'StarSystem' | Flatten<Readonly<StarSystem>>,
    ]
  | ['move' | 'view', 'Ship' | Flatten<Readonly<Ship>>]
  | ['participate' | 'playCard', 'Combat' | Flatten<Readonly<Combat>>]
  | ['construct', 'ShipDesign' | Flatten<Readonly<ShipDesign>>];

export type AppAbility = Ability<Abilities>;

export const AppAbility = Ability as AbilityClass<AppAbility>;

type Flatten<T> = Subject;
// type Flatten<T> = {
//   [P in DeepKeys<T>]?: DeepValue<T, P>;
// };

type ComputeRange<
  N extends number,
  Result extends Array<unknown> = [],
> = Result['length'] extends N
  ? Result
  : ComputeRange<N, [...Result, Result['length']]>;
type Index40 = ComputeRange<40>[number];

type IsTuple<T> = T extends readonly any[] & { length: infer Length }
  ? Length extends Index40
    ? T
    : never
  : never;

type AllowedIndexes<
  Tuple extends ReadonlyArray<any>,
  Keys extends number = never,
> = Tuple extends readonly []
  ? Keys
  : Tuple extends readonly [infer _, ...infer Tail]
  ? AllowedIndexes<Tail, Keys | Tail['length']>
  : Keys;

export type DeepKeys<T> = unknown extends T
  ? keyof T
  : object extends T
  ? string
  : T extends readonly any[] & IsTuple<T>
  ? AllowedIndexes<T> | DeepKeysPrefix<T, AllowedIndexes<T>>
  : T extends (infer U)[]
  ? (keyof U & string) | DeepKeysPrefix<T, keyof U>
  : T extends Date
  ? never
  : T extends object
  ? (keyof T & string) | DeepKeysPrefix<T, keyof T>
  : never;

type DeepKeysPrefix<T, TPrefix> = TPrefix extends keyof T & (number | string)
  ? `${TPrefix}.${DeepKeys<T[TPrefix]> & string}`
  : never;

export type DeepValue<T, TProp> = T extends Record<string | number, any>
  ? TProp extends `${infer TBranch}.${infer TDeepProp}`
    ? T[TBranch] extends (infer U)[]
      ? DeepValue<U, TDeepProp>
      : DeepValue<T[TBranch], TDeepProp>
    : T[TProp & string] extends (infer U)[]
    ? U
    : T[TProp & string]
  : never;
