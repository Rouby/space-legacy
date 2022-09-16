import { Ability, type AbilityClass } from '@casl/ability';
import type { Subjects } from '@casl/prisma';
import type { User } from '@prisma/client';
import type { Game, GameList, Ship, StarSystem } from '../logic/models';

type Abilities =
  | [
      'read' | 'create' | 'update' | 'delete' | 'login',
      'User' | Subjects<{ User: User }>,
    ]
  | [
      'read',
      (
        | 'GamesList'
        | Flatten<Readonly<GameList>, NestedPaths<Readonly<GameList>>>
      ),
    ]
  | [
      'create' | 'delete' | 'join' | 'leave' | 'enter' | 'start' | 'endTurn',
      'Game' | Flatten<Readonly<Game>, NestedPaths<Readonly<Game>>>,
    ]
  | [
      'see' | 'view' | 'constructShip' | 'cancelShipConstruction',
      (
        | 'StarSystem'
        | Flatten<Readonly<StarSystem>, NestedPaths<Readonly<StarSystem>>>
      ),
    ]
  | [
      'see' | 'view' | 'move',
      'Ship' | Flatten<Readonly<Ship>, NestedPaths<Readonly<Ship>>>,
    ];

export type AppAbility = Ability<Abilities>;

export const AppAbility = Ability as AbilityClass<AppAbility>;

type Flatten<T, P> = T;
type NestedPaths<T> = T;

// type Flatten<T extends GenericObject, P extends string> = {
//   [K in P]: TypeFromPath<T, K>;
// };

// type Primitive = string | number | symbol;

// type GenericObject = Record<Primitive, unknown>;

// type Join<
//   L extends Primitive | undefined,
//   R extends Primitive | undefined,
// > = L extends string | number
//   ? R extends string | number
//     ? `${L}.${R}`
//     : L
//   : R extends string | number
//   ? R
//   : undefined;

// type Union<
//   L extends unknown | undefined,
//   R extends unknown | undefined,
// > = L extends undefined
//   ? R extends undefined
//     ? undefined
//     : R
//   : R extends undefined
//   ? L
//   : L | R;

// /**
//  * NestedPaths
//  * Get all the possible paths of an object
//  * @example
//  * type Keys = NestedPaths<{ a: { b: { c: string } }>
//  * // 'a' | 'a.b' | 'a.b.c'
//  */
// export type NestedPaths<
//   T extends GenericObject,
//   Prev extends Primitive | undefined = undefined,
//   Path extends Primitive | undefined = undefined,
// > = {
//   [K in keyof T]: T[K] extends Array<infer ArrayType extends GenericObject>
//     ? NestedPaths<ArrayType, Union<Prev, Path>, Join<Path, K>>
//     : T[K] extends GenericObject
//     ? NestedPaths<T[K], Union<Prev, Path>, Join<Path, K>>
//     : Union<Union<Prev, Path>, Join<Path, K>>;
// }[keyof T];

// /**
//  * TypeFromPath
//  * Get the type of the element specified by the path
//  * @example
//  * type TypeOfAB = TypeFromPath<{ a: { b: { c: string } }, 'a.b'>
//  * // { c: string }
//  */
// export type TypeFromPath<
//   T extends GenericObject,
//   Path extends string, // Or, if you prefer, NestedPaths<T>
// > = {
//   [K in Path]: K extends keyof T
//     ? T[K] // TODO deeply nest it????
//     : K extends `${infer P}.${infer S}`
//     ? T[P] extends Array<infer ArrayType extends GenericObject>
//       ? TypeFromPath<ArrayType, S>
//       : T[P] extends GenericObject
//       ? TypeFromPath<T[P], S>
//       : never
//     : never;
// }[Path];
