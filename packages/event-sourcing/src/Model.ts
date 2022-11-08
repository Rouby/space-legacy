export abstract class Model {
  abstract get kind(): string;

  lastEvent?: Date;

  protected abstract applyEvent(event: unknown): void;
}
