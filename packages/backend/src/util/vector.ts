export class Vector {
  public x: number;
  public y: number;

  public constructor(coords: { x: number; y: number }) {
    this.x = coords.x;
    this.y = coords.y;
  }

  public add(other: { x: number; y: number }) {
    return new Vector({
      x: this.x + other.x,
      y: this.y + other.y,
    });
  }

  public subtract(other: { x: number; y: number }) {
    return new Vector({
      x: this.x - other.x,
      y: this.y - other.y,
    });
  }

  public multiply(scalar: number) {
    return new Vector({
      x: this.x * scalar,
      y: this.y * scalar,
    });
  }

  public divide(scalar: number) {
    return new Vector({
      x: this.x / scalar,
      y: this.y / scalar,
    });
  }

  public magnitude() {
    return (this.x ** 2 + this.y ** 2) ** 0.5;
  }

  public normalize() {
    return this.divide(this.magnitude());
  }

  public dot(other: { x: number; y: number }) {
    return this.x * other.x + this.y * other.y;
  }

  public cross(other: { x: number; y: number }) {
    return this.x * other.y - this.y * other.x;
  }

  public angle(other: { x: number; y: number }) {
    return Math.atan2(this.cross(other), this.dot(other));
  }

  public rotate(angle: number) {
    return new Vector({
      x: this.x * Math.cos(angle) - this.y * Math.sin(angle),
      y: this.x * Math.sin(angle) + this.y * Math.cos(angle),
    });
  }

  public distance(other: { x: number; y: number }) {
    return this.subtract(other).magnitude();
  }

  public equals(other: { x: number; y: number }) {
    return this.x === other.x && this.y === other.y;
  }

  public toString() {
    return `(${this.x}, ${this.y})`;
  }
}
