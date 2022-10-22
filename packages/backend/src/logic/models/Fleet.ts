import type { AppEvent } from '../events';
import { Base } from './Base';
import { Promised, proxies } from './proxies';
import type { Ship } from './Ship';
import type { StarSystem } from './StarSystem';

export class Fleet extends Base {
  readonly kind = 'Fleet';

  public constructor(public id: string) {
    super();
  }

  public owner = proxies.userProxy('');
  public name = '';
  public starSystem = null as Promised<StarSystem> | null;
  public coordinates = { x: 0, y: 0 };
  public ships = [] as Promised<Ship>[];

  protected applyEvent(event: AppEvent) {}
}
