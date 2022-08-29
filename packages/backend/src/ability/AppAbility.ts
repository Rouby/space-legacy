import { Ability, AbilityClass } from '@casl/ability';
import { User } from '@prisma/client';
import { Fleet, Game, GameList, StarSystem } from '../logic/models';

type Abilities =
  | ['read' | 'create' | 'update' | 'delete' | 'login', 'User' | User]
  | ['read', 'GamesList' | DeepPartial<Readonly<GameList>>]
  | [
      'create' | 'delete' | 'join' | 'leave' | 'enter' | 'start' | 'endTurn',
      'Game' | DeepPartial<Readonly<Game>>,
    ]
  | ['view' | 'musterFleet', 'StarSystem' | DeepPartial<Readonly<StarSystem>>]
  | ['muster', 'Fleet' | DeepPartial<Readonly<Fleet>>];

export type AppAbility = Ability<Abilities>;

export const AppAbility = Ability as AbilityClass<AppAbility>;

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
