import { proxies } from './models/proxies';
import { fleetProxy } from './models/proxies/fleet';
import { gameProxy } from './models/proxies/game';
import { starSystemProxy } from './models/proxies/starSystem';
import { userProxy } from './models/proxies/user';

export * as models from './models';
export { publishEvent } from './publishEvent';

proxies.fleetProxy = fleetProxy;
proxies.gameProxy = gameProxy;
proxies.starSystemProxy = starSystemProxy;
proxies.userProxy = userProxy;
