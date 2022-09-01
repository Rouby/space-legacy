import { changePopulation } from './changePopulation';
import { colonizePlanet } from './colonizePlanet';
import { constructShip } from './constructShip';
import { constructShipyard } from './constructShipyard';
import { createGame } from './createGame';
import { createStarSystem } from './createStarSystem';
import { deleteGame } from './deleteGame';
import { endTurn } from './endTurn';
import { joinGame } from './joinGame';
import { nextRound } from './nextRound';
import { startGame } from './startGame';

export * from './changePopulation';
export * from './colonizePlanet';
export * from './constructShip';
export * from './constructShipyard';
export * from './createGame';
export * from './createStarSystem';
export * from './deleteGame';
export * from './endTurn';
export * from './joinGame';
export * from './nextRound';
export * from './startGame';

export type AppEvent =
  | ReturnType<typeof changePopulation>
  | ReturnType<typeof colonizePlanet>
  | ReturnType<typeof constructShip>
  | ReturnType<typeof constructShipyard>
  | ReturnType<typeof createGame>
  | ReturnType<typeof createStarSystem>
  | ReturnType<typeof deleteGame>
  | ReturnType<typeof endTurn>
  | ReturnType<typeof joinGame>
  | ReturnType<typeof nextRound>
  | ReturnType<typeof startGame>;
