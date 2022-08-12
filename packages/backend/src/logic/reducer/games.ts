import { GameEvent } from '@prisma/client';
import { AppEvent } from '../events';

games.initialState = {
  list: [] as {
    __typename: 'Game';
    id: string;
    name: string;
    maxPlayers: number;
    players: { id: string }[];
  }[],
};

export function games(
  state: typeof games.initialState,
  event: Omit<GameEvent, 'payload'> & AppEvent,
  replay: boolean,
) {
  if (event.type === 'createGame') {
    return {
      ...state,
      list: [
        ...state.list,
        { __typename: 'Game', ...event.payload, players: [] },
      ],
    };
  }
  if (event.type === 'deleteGame') {
    return {
      ...state,
      list: state.list.filter((game) => game.id !== event.payload.id),
    };
  }
  if (event.type === 'joinGame') {
    const { gameId, userId } = event.payload;
    return {
      ...state,
      list: state.list.map((d) =>
        d.id === gameId ? { ...d, players: [...d.players, { id: userId }] } : d,
      ),
    };
  }

  return state;
}
