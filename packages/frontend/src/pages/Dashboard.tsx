import { Button, Group, LoadingOverlay } from '@mantine/core';
import { Link } from '@tanstack/react-location';
import { Fragment, useEffect, useReducer, useRef } from 'react';
import { IssueShipOrder } from '../components';
import {
  GameListQuery,
  useDeleteGameMutation,
  useGalaxyOverviewQuery,
  useGameCreatedSubscription,
  useGameListQuery,
  useJoinGameMutation,
  useNewGameCreatedSubscription,
  useNewGameMutation,
  useShipListQuery,
  useStarSystemListQuery,
  useStartGameMutation,
} from '../graphql';
import { useAbility, useGame, useRandom } from '../utility';

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
        <div>Round: {game.round}</div>
        <Button onClick={() => setGameId(null)}>Return</Button>
        {ability.can('start', game) && (
          <Button onClick={() => startGame({ id: game.id })}>Start</Button>
        )}
        <StarSystemList />
        <ShipList />
        <GalaxyOverview />
      </>
    );
  }

  return (
    <>
      <GameList />
    </>
  );
}

function GalaxyOverview() {
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query GalaxyOverview($gameId: ID!) {
      starSystems(gameId: $gameId) {
        id
        name
        coordinates
      }

      ships(gameId: $gameId) {
        id
        coordinates
        movingTo
      }
    }
  `;
  const [galaxyOverview] = useGalaxyOverviewQuery({
    variables: { gameId: game?.id! },
  });

  const rng = useRandom('galaxy-overview');

  const [viewBox, updateViewBox] = useReducer(
    (
      state: { x: number; y: number; w: number },
      action:
        | {
            type: 'zoom';
            delta: number;
            svg: { width: number; height: number };
          }
        | {
            type: 'pan';
            delta: { x: number; y: number };
            svg: { width: number; height: number };
          },
    ) => {
      switch (action.type) {
        case 'zoom':
          return {
            x: state.x,
            y: state.y,
            w: Math.max(50, state.w + action.delta),
          };
        case 'pan':
          return {
            x: Math.max(
              state.w / 2 - action.svg.width,
              Math.min(
                -(state.w / 2 - action.svg.width),
                state.x - action.delta.x * (state.w / action.svg.width),
              ),
            ),
            y: Math.max(
              state.w / 2 - action.svg.height,
              Math.min(
                -(state.w / 2 - action.svg.height),
                state.y - action.delta.y * (state.w / action.svg.height),
              ),
            ),
            w: state.w,
          };
        default:
          return state;
      }
    },
    { x: 0, y: 0, w: 1000 },
  );
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    svgRef.current?.addEventListener('wheel', handleWheel);
    svgRef.current?.addEventListener('mousedown', handleMouseDown);
    svgRef.current?.addEventListener('mouseup', handleMouseUp);
    svgRef.current?.addEventListener('mousemove', handleMouseMove);
    return () => {
      svgRef.current?.removeEventListener('wheel', handleWheel);
      svgRef.current?.removeEventListener('mousedown', handleMouseDown);
      svgRef.current?.removeEventListener('mouseup', handleMouseUp);
      svgRef.current?.removeEventListener('mousemove', handleMouseMove);
    };

    function handleWheel(evt: WheelEvent) {
      evt.preventDefault();
      updateViewBox({
        type: 'zoom',
        delta: evt.deltaY,
        svg: svgRef.current!.getBoundingClientRect(),
      });
    }

    function handleMouseDown(evt: MouseEvent) {
      evt.preventDefault();
      dragging = true;
      lastX = evt.clientX;
      lastY = evt.clientY;
    }
    function handleMouseUp() {
      dragging = false;
    }
    function handleMouseMove(evt: MouseEvent) {
      if (dragging) {
        const dx = evt.clientX - lastX;
        const dy = evt.clientY - lastY;
        lastX = evt.clientX;
        lastY = evt.clientY;
        updateViewBox({
          type: 'pan',
          delta: { x: dx, y: dy },
          svg: svgRef.current!.getBoundingClientRect(),
        });
      }
    }
  }, []);

  return (
    <svg
      ref={svgRef}
      width="800"
      height="800"
      viewBox={`${viewBox.x - viewBox.w / 2} ${viewBox.y - viewBox.w / 2} ${
        viewBox.w
      } ${viewBox.w}`}
    >
      <filter
        id="star-field"
        filterUnits="objectBoundingBox"
        x="0"
        y="0"
        width="100%"
        height="100%"
      >
        <feTurbulence baseFrequency="0.6" seed={rng.next()} />
        <feColorMatrix
          values="0 0 0 7 -4
                  0 0 0 7 -4
                  0 0 0 7 -4
                  0 0 0 0 1"
        />
      </filter>
      <rect
        x="-500"
        y="-500"
        width="1000"
        height="1000"
        filter="url(#star-field)"
      />
      {galaxyOverview.data?.starSystems.map((starSystem) => (
        <circle
          key={starSystem.id}
          cx={starSystem.coordinates.x}
          cy={starSystem.coordinates.y}
          r="1"
          fill="red"
        />
      ))}
      {galaxyOverview.data?.ships.map((ship) => (
        <Fragment key={ship.id}>
          {ship.movingTo && (
            <line
              x1={ship.coordinates.x}
              y1={ship.coordinates.y}
              x2={ship.movingTo.x}
              y2={ship.movingTo.y}
              stroke="teal"
              strokeWidth="0.8"
              strokeDasharray="1,1"
            />
          )}
          <circle
            cx={ship.coordinates.x}
            cy={ship.coordinates.y}
            r="1"
            fill="green"
          />
        </Fragment>
      ))}
    </svg>
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
    variables: { gameId: game?.id! },
  });

  return (
    <>
      {starSystems.data?.starSystems.map((starSystem) => (
        <div key={starSystem.id}>
          {starSystem.name}
          <Button component={Link} to={`/star-system/${starSystem.id}`}>
            View
          </Button>
        </div>
      ))}
    </>
  );
}

function ShipList() {
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query ShipList($gameId: ID!) {
      ships(gameId: $gameId) {
        id
        coordinates
        owner {
          id
        }
        movingTo
      }
    }
  `;
  const [ships] = useShipListQuery({
    variables: { gameId: game?.id! },
  });

  return (
    <>
      <div>ships</div>
      {ships.data?.ships.map((ship) => (
        <div key={ship.id}>
          {ship.id}
          {` at (${ship.coordinates.x}, ${ship.coordinates.y}) `}
          {ship.movingTo
            ? `moving to (${ship.movingTo.x}, ${ship.movingTo.y})`
            : ''}{' '}
          <IssueShipOrder shipId={ship.id} />
        </div>
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
          turnEnded
        }
        round
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
          turnEnded
        }
      }
    }
  `;
  const [createGameResult, createGame] = useNewGameMutation();

  /* GraphQL */ `#graphql
    subscription GameCreated {
      gameCreated {
        id
        players {
          id
        }
      }
    }
  `;
  useGameCreatedSubscription();

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

function GameListItem(game: GameListQuery['games'][number]) {
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
    subscription NewGameCreated($id: ID!) {
      gameCreated(filter: { id: { eq: $id}}) {
        id
        players {
          id
        }
      }
    }
  `;
  const [gameCreated] = useNewGameCreatedSubscription({
    pause: game.players.length > 0,
    variables: { id: game.id },
  });

  /* GraphQL */ `#graphql
    mutation JoinGame($id: ID!) {
      joinGame(input: { id: $id }) {
        id
        players {
          id
        }
      }
    }
  `;
  const [, joinGame] = useJoinGameMutation();

  const [, setGameId] = useGame();

  return (
    <Group key={game.id} sx={{ position: 'relative' }}>
      {game.name}, {`${game.players.length} / ${game.maxPlayers}`} {game.state}
      {ability.can('join', game) && (
        <Button onClick={() => joinGame({ id: game.id })}>Join</Button>
      )}
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
