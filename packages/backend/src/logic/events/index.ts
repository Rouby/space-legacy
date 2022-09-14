import { cancelShipConstruction } from './cancelShipConstruction';
import { changePopulation } from './changePopulation';
import { colonizePlanet } from './colonizePlanet';
import { constructShip } from './constructShip';
import { constructShipyard } from './constructShipyard';
import { createGame } from './createGame';
import { createStarSystem } from './createStarSystem';
import { deleteGame } from './deleteGame';
import { endTurn } from './endTurn';
import { issueMoveOrder } from './issueMoveOrder';
import { joinGame } from './joinGame';
import { launchShip } from './launchShip';
import { moveShip } from './moveShip';
import { nextRound } from './nextRound';
import { progressShipConstruction } from './progressShipConstruction';
import { startGame } from './startGame';

export * from './cancelShipConstruction';
export * from './changePopulation';
export * from './colonizePlanet';
export * from './constructShip';
export * from './constructShipyard';
export * from './createGame';
export * from './createStarSystem';
export * from './deleteGame';
export * from './endTurn';
export * from './issueMoveOrder';
export * from './joinGame';
export * from './launchShip';
export * from './moveShip';
export * from './nextRound';
export * from './progressShipConstruction';
export * from './startGame';

export type AppEvent =
  | ReturnType<typeof cancelShipConstruction>
  | ReturnType<typeof changePopulation>
  | ReturnType<typeof colonizePlanet>
  | ReturnType<typeof constructShip>
  | ReturnType<typeof constructShipyard>
  | ReturnType<typeof createGame>
  | ReturnType<typeof createStarSystem>
  | ReturnType<typeof deleteGame>
  | ReturnType<typeof endTurn>
  | ReturnType<typeof issueMoveOrder>
  | ReturnType<typeof joinGame>
  | ReturnType<typeof launchShip>
  | ReturnType<typeof moveShip>
  | ReturnType<typeof nextRound>
  | ReturnType<typeof progressShipConstruction>
  | ReturnType<typeof startGame>;
