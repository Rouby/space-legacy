import { cancelShipConstruction } from './cancelShipConstruction';
import { changePopulation } from './changePopulation';
import { colonizePlanet } from './colonizePlanet';
import { constructShip } from './constructShip';
import { constructShipyard } from './constructShipyard';
import { createGame } from './createGame';
import { createShipComponent } from './createShipComponent';
import { createShipDesign } from './createShipDesign';
import { createStarSystem } from './createStarSystem';
import { damageShip } from './damageShip';
import { deleteGame } from './deleteGame';
import { destroyShip } from './destroyShip';
import { drawCombatCard } from './drawCombatCard';
import { endCombat } from './endCombat';
import { endTurn } from './endTurn';
import { engageCombat } from './engageCombat';
import { issueFollowOrder } from './issueFollowOrder';
import { issueMoveOrder } from './issueMoveOrder';
import { joinGame } from './joinGame';
import { launchShip } from './launchShip';
import { moveShip } from './moveShip';
import { nextCombatRound } from './nextCombatRound';
import { nextRound } from './nextRound';
import { playCombatCard } from './playCombatCard';
import { progressShipConstruction } from './progressShipConstruction';
import { restoreCombatDeck } from './restoreCombatDeck';
import { startGame } from './startGame';

export type AppEvent =
  | ReturnType<typeof cancelShipConstruction>
  | ReturnType<typeof changePopulation>
  | ReturnType<typeof colonizePlanet>
  | ReturnType<typeof constructShip>
  | ReturnType<typeof constructShipyard>
  | ReturnType<typeof createGame>
  | ReturnType<typeof createShipComponent>
  | ReturnType<typeof createShipDesign>
  | ReturnType<typeof createStarSystem>
  | ReturnType<typeof damageShip>
  | ReturnType<typeof deleteGame>
  | ReturnType<typeof destroyShip>
  | ReturnType<typeof drawCombatCard>
  | ReturnType<typeof endCombat>
  | ReturnType<typeof endTurn>
  | ReturnType<typeof engageCombat>
  | ReturnType<typeof issueFollowOrder>
  | ReturnType<typeof issueMoveOrder>
  | ReturnType<typeof joinGame>
  | ReturnType<typeof launchShip>
  | ReturnType<typeof moveShip>
  | ReturnType<typeof nextCombatRound>
  | ReturnType<typeof nextRound>
  | ReturnType<typeof playCombatCard>
  | ReturnType<typeof progressShipConstruction>
  | ReturnType<typeof restoreCombatDeck>
  | ReturnType<typeof startGame>;

export {
  cancelShipConstruction,
  changePopulation,
  colonizePlanet,
  constructShip,
  constructShipyard,
  createGame,
  createShipComponent,
  createShipDesign,
  createStarSystem,
  damageShip,
  deleteGame,
  destroyShip,
  drawCombatCard,
  endCombat,
  endTurn,
  engageCombat,
  issueFollowOrder,
  issueMoveOrder,
  joinGame,
  launchShip,
  moveShip,
  nextCombatRound,
  nextRound,
  playCombatCard,
  progressShipConstruction,
  restoreCombatDeck,
  startGame,
};
