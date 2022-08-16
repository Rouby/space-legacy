import { Button } from '@mantine/core';
import {
  useDeleteGameMutation,
  useGameListQuery,
  useNewGameMutation,
} from '../graphql';
import { useAbility } from '../utility';

export function Dashboard() {
  /* GraphQL */ `#graphql
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

  /* GraphQL */ `#graphql
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

  /* GraphQL */ `#graphql
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
