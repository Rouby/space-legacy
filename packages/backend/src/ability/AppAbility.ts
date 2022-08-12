import { Ability, AbilityClass } from '@casl/ability';
import { User } from '@prisma/client';

type Abilities =
  | [
      'read',
      (
        | 'User'
        | (User & {
            __typename: 'User';
          })
      ),
    ]
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
