import { useAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { useGameQuery, useGameUpdatesSubscription } from '../graphql';

const gameIdAtom = atomWithStorage(
  'gameId',
  null,
  createJSONStorage<string | null>(() => sessionStorage),
);

export function useGame() {
  const [gameId, setGameId] = useAtom(gameIdAtom);

  /* GraphQL */ `#graphql
  query Game($gameId: ID!) {
    game(id: $gameId) {
      __typename
      id
      name
      maxPlayers
      players {
        id
        turnEnded
      }
      creator {
        id
      }
      state
      round
    }
  }`;
  const [game] = useGameQuery({
    variables: { gameId: gameId! },
    pause: !gameId,
  });

  /* GraphQL */ `#graphql
    subscription GameUpdates($gameId: ID!) {
      nextRound(filter: { id: { eq: $gameId}}) {
        id
        round
      }
    }
  `;
  useGameUpdatesSubscription({
    variables: { gameId: gameId! },
    pause: !gameId,
  });

  return [
    gameId ? { id: gameId, ...game.data?.game } : null,
    setGameId,
  ] as const;
}
