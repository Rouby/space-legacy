import {
  SpotlightAction,
  SpotlightProvider,
  useSpotlight,
} from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons';
import { useEffect } from 'react';
import { useUndoLastEndOfRoundMutation } from '../graphql';
import { useGame } from '../utility';

const actions: SpotlightAction[] = [];

export function Spotlight({ children }: { children: React.ReactNode }) {
  return (
    <SpotlightProvider
      actions={actions}
      searchIcon={<IconSearch size={18} />}
      searchPlaceholder="Search..."
      shortcut="mod + K"
      nothingFoundMessage="Nothing found..."
    >
      {children}
      <DebugSpotlightActions />
    </SpotlightProvider>
  );
}

function DebugSpotlightActions() {
  const { registerActions, removeActions } = useSpotlight();

  /* GraphQL */ `#graphql
    mutation UndoLastEndOfRound($gameId: ID!) {
      undoLastEndOfRound(input: {gameId:$gameId}) {
        id
        round
        players {
          id
          turnEnded
        }
      }
    }
  `;
  const [, undoLastEndOfRound] = useUndoLastEndOfRoundMutation();

  const [game] = useGame();

  useEffect(() => {
    registerActions([
      {
        id: 'debug.undoRound',
        title: 'Undo latest round',
        onTrigger(action) {
          undoLastEndOfRound({ gameId: game?.id! });
        },
      },
    ]);
    return () => {
      removeActions(['debug.undoRound']);
    };
  }, []);

  return null;
}
