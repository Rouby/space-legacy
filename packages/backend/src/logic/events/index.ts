import { createGame } from './createGame';
import { createStarSystem } from './createStarSystem';
import { deleteGame } from './deleteGame';
import { endTurn } from './endTurn';
import { joinGame } from './joinGame';

export * from './createGame';
export * from './createStarSystem';
export * from './deleteGame';
export * from './endTurn';
export * from './joinGame';

export type AppEvent =
  | ReturnType<typeof createGame>
  | ReturnType<typeof createStarSystem>
  | ReturnType<typeof deleteGame>
  | ReturnType<typeof endTurn>
  | ReturnType<typeof joinGame>;
