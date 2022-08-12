import { GameEvent } from '@prisma/client';
import { AppEvent } from '../events';

turnTracker.initialState = { turnsEnded: 0 };

export function turnTracker(
  state: typeof turnTracker.initialState,
  event: Omit<GameEvent, 'payload'> & AppEvent,
  replay: boolean,
) {
  if (event.type === 'endTurn') {
    return {
      turnsEnded: state.turnsEnded + 1,
    };
  }

  return state;
}
