import { useAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { useGameQuery } from '../graphql';

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
      players {
        id
      }
      creator {
        id
      }
      state
    }
  }`;
  const [game] = useGameQuery({
    variables: { gameId: gameId! },
    pause: !gameId,
  });

  return [game.data?.game, setGameId] as const;
}
