import { GameEvent } from '@prisma/client';
import { AppEvent } from '../events';

starSystems.initialState = {
  list: {} as Record<
    string,
    {
      __typename: 'StarSystem';
      id: string;
      name: string;
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
