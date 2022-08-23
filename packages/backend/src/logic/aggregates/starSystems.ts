import { GameEvent } from '@prisma/client';
import { AppEvent } from '../events';

starSystems.initialState = {
  list: {} as Record<
    string,
    {
      __typename: 'StarSystem';
      id: string;
      name: string;
      sunClass:
        | 'O'
        | 'B'
        | 'A'
        | 'F'
        | 'G'
        | 'K'
        | 'M'
        | 'neutron'
        | 'pulsar'
        | 'blackhole';
      coordinates: {
        x: number;
        y: number;
      };
      habitablePlanets: {
        orbit: number;
        size: number;
        type:
          | 'arid'
          | 'desert'
          | 'savanna'
          | 'alpine'
          | 'arctic'
          | 'tundra'
          | 'continental'
          | 'ocean'
          | 'tropical';
      }[];
      uninhabitableBodies: {
        orbit: number;
        size: number;
        type:
          | 'asteroids'
          | 'gas'
          | 'barren'
          | 'broken'
          | 'frozen'
          | 'molten'
          | 'toxic';
      }[];
    }[]
  >,
};

export function starSystems(
  state: typeof starSystems.initialState,
  event: Omit<GameEvent, 'payload'> & AppEvent,
): typeof starSystems.initialState {
  if (event.type === 'createStarSystem') {
    return {
      ...state,
      list: {
        ...state.list,
        [event.payload.gameId]: [
          ...(state.list[event.payload.gameId] ?? []),
          {
            __typename: 'StarSystem',
            ...event.payload,
          },
        ],
      },
    };
  }

  return state;
}
