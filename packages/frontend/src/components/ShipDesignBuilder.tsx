import { useMatch } from '@tanstack/react-location';
import {
  useAvailableShipComponentsQuery,
  useShipDesignDetailsQuery,
} from '../graphql';
import { useGame } from '../utility';

export function ShipDesignBuilder() {
  const {
    params: { id },
  } = useMatch();
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query shipDesignDetails($gameId: ID!, $shipDesignId: ID!) {
      shipDesign(gameId: $gameId, id: $shipDesignId) {
        __typename
        id
        name
        owner {
          id
          userId
        }
      }
    } 
  `;
  const [] = useShipDesignDetailsQuery({
    variables: { gameId: game?.id!, shipDesignId: id! },
    pause: !id,
  });

  /* GraphQL */ `#graphql
    query availableShipComponents($gameId: ID!) {
      shipComponents(gameId: $gameId) {
        __typename
        id
        name
      }
    } 
  `;
  const [availableShipComponents] = useAvailableShipComponentsQuery({
    variables: { gameId: game?.id! },
  });

  return (
    <>
      build me up {id} {availableShipComponents.data?.shipComponents.length}
    </>
  );
}
