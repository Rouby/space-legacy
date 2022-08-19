import { games } from './games';
import { starSystems } from './starSystems';
import { turnTracker } from './turnTracker';

export const aggregates = [games, turnTracker, starSystems] as const;
