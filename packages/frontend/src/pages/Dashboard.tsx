import { Button, Group, LoadingOverlay } from '@mantine/core';
import {
  useDeleteGameMutation,
  useGameCreatedSubscription,
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
        <GameListItem key={game.id} {...game} />
      ))}
    </>
  );
}

function GameListItem(game: {
  __typename: 'Game';
  id: string;
  name: string;
  maxPlayers: number;
  players: { id: string }[];
}) {
  const ability = useAbility();

  /* GraphQL */ `#graphql
    mutation DeleteGame($id: ID!) {
      deleteGame(input: { id: $id }) {
        id
      }
    }
  `;
  const [deleteGameResult, deleteGame] = useDeleteGameMutation();

  /* GraphQL */ `#graphql
    subscription GameCreated($id: ID!) {
      gameCreated(filter: { id: { eq: $id}}) {
        id
        players {
          id
        }
      }
    }
  `;
  const [gameCreated] = useGameCreatedSubscription({
    pause: game.players.length > 0,
    variables: { id: game.id },
  });

  return (
    <Group key={game.id} sx={{ position: 'relative' }}>
      {game.name}, {`${game.players.length} / ${game.maxPlayers}`}
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
      <LoadingOverlay
        visible={game.players.length === 0 && !gameCreated.data?.gameCreated}
      />
    </Group>
  );
}
