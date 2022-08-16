import { Ability, AbilityClass } from '@casl/ability';
import { User } from '@prisma/client';

type Abilities =
  | [
      'read' | 'create' | 'update' | 'delete' | 'login',
      (
        | 'User'
        | (User & {
            __typename: 'User';
          })
      ),
    ]
  | ['read', 'GamesList']
  | [
      'create' | 'delete' | 'join' | 'leave' | 'enter' | 'endTurn',
      (
        | 'Game'
        | {
            __typename: 'Game';

            id: string;
            players: { id: string }[];
            'players.id'?: string;
          }
      ),
    ];

export type AppAbility = Ability<Abilities>;

export const AppAbility = Ability as AbilityClass<AppAbility>;
