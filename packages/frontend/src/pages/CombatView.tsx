import { Tooltip } from '@mantine/core';
import { useMatch } from '@tanstack/react-location';
import { AbilityButton } from '../components';
import { useCombatDetailsQuery, usePlayCombatCardMutation } from '../graphql';
import { useGame, useToken } from '../utility';

export function CombatView() {
  const { params } = useMatch();

  const [token] = useToken();
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query CombatDetails($combatId: ID!, $gameId: ID!) {
      combat(id: $combatId, gameId: $gameId) {
        id
        coordinates
        round
        parties {
          player {
            id
            userId
            name
          }
          ships {
            id
            damage
            design {
              id
              structuralHealth
            }
          }
          versus {
            player {
              id
              userId
              name
            }
            ships {
              id
              damage
              design {
                id
                structuralHealth
              }
            }
          }
          cardsInHand
          cardPlayed
        }
      }
    }
  `;
  const [combatDetailsResult] = useCombatDetailsQuery({
    variables: { combatId: params.combatId, gameId: game?.id! },
  });

  /* GraphQL */ `#graphql
    mutation PlayCombatCard($gameId: ID!, $combatId: ID!, $card: CombatCard!) {
      playCombatCard(input: { gameId: $gameId, combatId: $combatId, card: $card }) {
        id
        round
        parties {
          player {
            id
          }
          ships {
            id
            damage
            design {
              id
              structuralHealth
            }
          }
          versus {
            player {
              id
            }
            ships {
              id
              damage
              design {
                id
                structuralHealth
              }
            }
          }
          cardsInHand
          cardPlayed
        }
      }
    }
  `;
  const [, playCard] = usePlayCombatCardMutation();

  return (
    <>
      <div>COMBAT {combatDetailsResult.data?.combat?.id}</div>
      <div>Round {combatDetailsResult.data?.combat?.round}</div>
      {combatDetailsResult.data?.combat?.parties.map((party) => (
        <div key={party.player.id}>
          {party.player.name} has{' '}
          <Tooltip
            label={
              <>
                {party.ships.map((ship) => (
                  <div key={ship.id}>
                    {ship.damage} / {ship.design.structuralHealth}
                  </div>
                ))}
              </>
            }
          >
            <span>{party.ships.length} ships</span>
          </Tooltip>{' '}
          and fights versus{' '}
          {party.versus.map((vs) => vs.player.name).join(' & ')} Played card:{' '}
          {party.cardPlayed}
        </div>
      ))}
      <div>Cards:</div>
      {combatDetailsResult.data?.combat?.parties
        .find((party) => party.player.userId === token?.space.id)
        ?.cardsInHand?.map((card, idx) => (
          <div key={idx}>
            {card}
            <AbilityButton
              can="playCard"
              on={combatDetailsResult.data?.combat}
              onClick={() =>
                playCard({
                  gameId: game?.id!,
                  combatId: combatDetailsResult.data?.combat?.id!,
                  card,
                })
              }
            >
              Play
            </AbilityButton>
          </div>
        ))}
    </>
  );
}
