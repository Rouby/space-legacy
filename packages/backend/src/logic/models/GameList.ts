import { Model, Promised, promisedInstance } from '@rouby/event-sourcing';
import type { AppEvent } from '../events';
import type { Game } from './Game';

export class GameList extends Model {
  readonly kind = 'GameList';

  public constructor() {
    super();
  }

  public list = [] as Promised<Game>[];

  protected applyEvent(event: AppEvent) {
    if (event.type === 'createGame') {
      this.list.push(promisedInstance('Game', { id: event.payload.id }));
    }

    if (event.type === 'deleteGame') {
      const idx = this.list.findIndex((game) => game.id === event.payload.id);
      if (idx >= 0) {
        this.list.splice(idx, 1);
      }
    }
  }
}
