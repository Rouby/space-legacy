import { Button, Group, LoadingOverlay } from '@mantine/core';
import {
  useDeleteGameMutation,
  useGameCreatedSubscription,
  useGameListQuery,
  useNewGameMutation,
  useStarSystemListQuery,
  useStartGameMutation,
} from '../graphql';
import { useAbility, useGame } from '../utility';

export function Dashboard() {
  const [game, setGameId] = useGame();

  /* GraphQL */ `#graphql
    mutation StartGame($id: ID!) {
      startGame(input: { id:$id }) {
        id
        state
      }
    }
  `;
  const [startGameResult, startGame] = useStartGameMutation();

  const ability = useAbility();

  if (game) {
    return (
      <>
        your ingame!
        <Button onClick={() => setGameId(null)}>Return</Button>
        {ability.can('start', 'Game') && (
          <Button onClick={() => startGame({ id: game })}>Start</Button>
        )}
        <StarSystemList />
      </>
    );
  }

  return (
    <>
      <GameList />
    </>
  );
}

function StarSystemList() {
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query StarSystemList($gameId: ID!) {
      starSystems(gameId: $gameId) {
        id
        name
      }
    }
  `;
  const [starSystems] = useStarSystemListQuery({
    variables: { gameId: game! },
  });

  return (
    <>
      list
      {starSystems.data?.starSystems.map((starSystem) => (
        <div key={starSystem.id}>{starSystem.name}</div>
      ))}
    </>
  );
}

function GameList() {
  /* GraphQL */ `#graphql
    query GameList {
      games {
        __typename
        id
        name
        state
        creator {
          id
        }
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
        state
        creator {
          id
        }
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
  state: 'CREATED' | 'STARTED' | 'ENDED';
  creator: { id: string };
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

  const [, setGameId] = useGame();

  return (
    <Group key={game.id} sx={{ position: 'relative' }}>
      {game.name}, {`${game.players.length} / ${game.maxPlayers}`} {game.state}
      {ability.can('join', game) && <Button>Join</Button>}
      {ability.can('enter', game) && (
        <Button onClick={() => setGameId(game.id)}>Enter</Button>
      )}
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
