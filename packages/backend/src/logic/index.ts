import { GameList } from './models';
import { proxies } from './models/proxies';
import { fleetProxy } from './models/proxies/fleet';
import { gameProxy } from './models/proxies/game';
import { playerProxy } from './models/proxies/player';
import { shipProxy } from './models/proxies/ship';
import { shipDesignProxy } from './models/proxies/shipDesign';
import { starSystemProxy } from './models/proxies/starSystem';
import { userProxy } from './models/proxies/user';
import { visibilityProxy } from './models/proxies/visibility';

export * as models from './models';
export { publishEvent } from './publishEvent';

proxies.fleetProxy = fleetProxy;
proxies.gameProxy = gameProxy;
proxies.gameListProxy = GameList;
proxies.playerProxy = playerProxy;
proxies.shipProxy = shipProxy;
proxies.shipDesignProxy = shipDesignProxy;
proxies.starSystemProxy = starSystemProxy;
proxies.userProxy = userProxy;
proxies.visibilityProxy = visibilityProxy;
