import { cancelShipConstruction } from './cancelShipConstruction';
import { changePopulation } from './changePopulation';
import { colonizePlanet } from './colonizePlanet';
import { constructShip } from './constructShip';
import { constructShipyard } from './constructShipyard';
import { createGame } from './createGame';
import { createStarSystem } from './createStarSystem';
import { deleteGame } from './deleteGame';
import { endTurn } from './endTurn';
import { engageCombat } from './engageCombat';
import { issueFollowOrder } from './issueFollowOrder';
import { issueMoveOrder } from './issueMoveOrder';
import { joinGame } from './joinGame';
import { launchShip } from './launchShip';
import { moveShip } from './moveShip';
import { nextRound } from './nextRound';
import { progressShipConstruction } from './progressShipConstruction';
import { startGame } from './startGame';

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
  | ReturnType<typeof engageCombat>
  | ReturnType<typeof issueFollowOrder>
  | ReturnType<typeof issueMoveOrder>
  | ReturnType<typeof joinGame>
  | ReturnType<typeof launchShip>
  | ReturnType<typeof moveShip>
  | ReturnType<typeof nextRound>
  | ReturnType<typeof progressShipConstruction>
  | ReturnType<typeof startGame>;

export {
  cancelShipConstruction,
  changePopulation,
  colonizePlanet,
  constructShip,
  constructShipyard,
  createGame,
  createStarSystem,
  deleteGame,
  endTurn,
  engageCombat,
  issueFollowOrder,
  issueMoveOrder,
  joinGame,
  launchShip,
  moveShip,
  nextRound,
  progressShipConstruction,
  startGame,
};
