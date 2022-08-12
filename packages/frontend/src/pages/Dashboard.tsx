import { Button } from '@mantine/core';
import { gql } from 'urql';
import {
  useCurrentRoundQuery,
  useDeleteGameMutation,
  useEndTurnMutation,
  useGameListQuery,
  useNewGameMutation,
} from '../graphql';
import { useAbility } from '../utility';

export function Dashboard() {
  gql`
    mutation EndTurn {
      endTurn
    }
  `;
  const [endTurnResult, endTurn] = useEndTurnMutation();

  gql`
    query CurrentRound {
      currentRound {
        id
        count
      }
    }
  `;
  const [currentRound] = useCurrentRoundQuery();

  gql`
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

  gql`
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

  gql`
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
