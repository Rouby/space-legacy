import { colonizePlanet } from './colonizePlanet';
import { createGame } from './createGame';
import { createStarSystem } from './createStarSystem';
import { deleteGame } from './deleteGame';
import { endTurn } from './endTurn';
import { joinGame } from './joinGame';
import { startGame } from './startGame';

export * from './colonizePlanet';
export * from './createGame';
export * from './createStarSystem';
export * from './deleteGame';
export * from './endTurn';
export * from './joinGame';
export * from './startGame';

export type AppEvent =
  | ReturnType<typeof colonizePlanet>
  | ReturnType<typeof createGame>
  | ReturnType<typeof createStarSystem>
  | ReturnType<typeof deleteGame>
  | ReturnType<typeof endTurn>
  | ReturnType<typeof joinGame>
  | ReturnType<typeof startGame>;
