import { Ability, AbilityClass } from '@casl/ability';
import { User } from '@prisma/client';

type Abilities =
  | [
      'read' | 'create' | 'update' | 'delete' | 'login',
      (
        | 'User'
        | ({
            __typename: 'User';
          } & User)
      ),
    ]
  | ['read', 'GamesList']
  | [
      'create' | 'delete' | 'join' | 'leave' | 'enter' | 'start' | 'endTurn',
      (
        | 'Game'
        | {
            __typename: 'Game';

            id: string;
            creator: { id: string };
            'creator.id'?: string;
            players: { id: string }[];
            'players.id'?: string;
            state: 'CREATED' | 'STARTED' | 'ENDED';
          }
      ),
    ]
  | [
      'view',
      (
        | 'System'
        | {
            __typename: 'System';

            id: string;
            habitablePlanets: {
              owner: { id: string };
            }[];
            'habitablePlanets.owner.id'?: string;
          }
      ),
    ];

export type AppAbility = Ability<Abilities>;

export const AppAbility = Ability as AbilityClass<AppAbility>;
