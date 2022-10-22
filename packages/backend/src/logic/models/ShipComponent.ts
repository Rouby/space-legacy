import type { AppEvent } from '../events';
import { Base } from './Base';

export class ShipComponent extends Base {
  readonly kind = 'ShipComponent';

  public constructor(public id: string) {
    super();
  }

  public name = '';

  protected applyEvent(event: AppEvent) {}
}
