import { combatRoundEnded } from './combatRoundEnded';
import { gameCreated } from './gameCreated';
import { gameRoundEnded } from './gameRoundEnded';
import { gameRoundStarted } from './gameRoundStarted';
import { gameStarted } from './gameStarted';

export const effects = [
  gameCreated,
  gameStarted,
  gameRoundEnded,
  gameRoundStarted,
  combatRoundEnded,
];
