import { useResearchQuery } from '../graphql';
import { useGame } from '../utility';

export function Research() {
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query research($gameId: ID!) {
      researchPoints(gameId: $gameId)
    }
  `;
  const [research] = useResearchQuery({ variables: { gameId: game!.id } });

  // gather research points
  // random tech spawns every couple of turns
  // buy research with points?

  return <>research {research.data?.researchPoints}</>;
}
