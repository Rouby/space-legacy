import { changePopulation } from './changePopulation';
import { colonizePlanet } from './colonizePlanet';
import { createGame } from './createGame';
import { createStarSystem } from './createStarSystem';
import { deleteGame } from './deleteGame';
import { endTurn } from './endTurn';
import { joinGame } from './joinGame';
import { musterFleet, musterFleetV1 } from './musterFleet';
import { nextRound } from './nextRound';
import { progressFleetMuster } from './progressFleetMuster';
import { startGame } from './startGame';

export * from './changePopulation';
export * from './colonizePlanet';
export * from './createGame';
export * from './createStarSystem';
export * from './deleteGame';
export * from './endTurn';
export * from './joinGame';
export * from './musterFleet';
export * from './nextRound';
export * from './progressFleetMuster';
export * from './startGame';

export type AppEvent =
  | ReturnType<typeof changePopulation>
  | ReturnType<typeof colonizePlanet>
  | ReturnType<typeof createGame>
  | ReturnType<typeof createStarSystem>
  | ReturnType<typeof deleteGame>
  | ReturnType<typeof endTurn>
  | ReturnType<typeof joinGame>
  | ReturnType<typeof musterFleet>
  | ReturnType<typeof musterFleetV1>
  | ReturnType<typeof nextRound>
  | ReturnType<typeof progressFleetMuster>
  | ReturnType<typeof startGame>;
