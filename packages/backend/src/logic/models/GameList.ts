import type { AppEvent } from '../events';
import { Base } from './Base';
import type { Game } from './Game';
import { proxies, type Promised } from './proxies';

export class GameList extends Base {
  readonly kind = 'GameList';

  public constructor() {
    super();
  }

  public list = [] as Promised<Game>[];

  protected applyEvent(event: AppEvent) {
    if (event.type === 'createGame') {
      this.list.push(proxies.gameProxy(event.payload.id));
    }

    if (event.type === 'deleteGame') {
      const idx = this.list.findIndex((game) => game.id === event.payload.id);
      if (idx >= 0) {
        this.list.splice(idx, 1);
      }
    }
  }
}
