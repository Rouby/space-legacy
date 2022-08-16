import { Button } from '@mantine/core';
import {
  useCurrentRoundQuery,
  useDeleteGameMutation,
  useEndTurnMutation,
  useGameListQuery,
  useNewGameMutation,
} from '../graphql';
import { useAbility } from '../utility';

export function Dashboard() {
  /* GraphQL */ `
    mutation EndTurn {
      endTurn
    }
  `;
  const [endTurnResult, endTurn] = useEndTurnMutation();

  /* GraphQL */ `
    query CurrentRound {
      currentRound {
        id
        count
      }
    }
  `;
  const [currentRound] = useCurrentRoundQuery();

  /* GraphQL */ `
    query GameList {
      games {
        __typename
        id
        name
        maxPlayers
        players {
          id
        }
      }
    }
  `;
  const [games] = useGameListQuery();

  /* GraphQL */ `
    mutation NewGame {
      createGame(input: { name: "New Game", maxPlayers: 2 }) {
        id
        name
        maxPlayers
        players {
          id
        }
      }
    }
  `;
  const [createGameResult, createGame] = useNewGameMutation();

  /* GraphQL */ `
    mutation DeleteGame($id: ID!) {
      deleteGame(input: { id: $id }) {
        id
      }
    }
  `;
  const [deleteGameResult, deleteGame] = useDeleteGameMutation();

  const ability = useAbility();

  return (
    <>
      Dashboard {currentRound.data?.currentRound?.count}
      <Button
        onClick={() => endTurn()}
        loading={endTurnResult.fetching}
        disabled={ability.cannot('endTurn', 'Game')}
      >
        End Turn
      </Button>
      <Button
        onClick={() => createGame()}
        loading={createGameResult.fetching}
        disabled={ability.cannot('create', 'Game')}
      >
        Create Game
      </Button>
      {games.data?.games.map((game) => (
        <div key={game.id}>
          {game.name}, {game.players.length} / {game.maxPlayers}
          {ability.can('join', game) && <Button>Join</Button>}
          {ability.can('enter', game) && <Button>Enter</Button>}
          {ability.can('delete', game) && (
            <Button
              onClick={() => deleteGame({ id: game.id })}
              loading={deleteGameResult.fetching}
            >
              Delete
            </Button>
          )}
        </div>
      ))}
    </>
  );
}
