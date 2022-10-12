export class Vector {
  public x: number;
  public y: number;

  public constructor(coords?: { x: number; y: number }) {
    this.x = coords?.x ?? 0;
    this.y = coords?.y ?? 0;
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
    const v1 = this.round();
    const v2 = new Vector(other).round();
    return v1.x === v2.x && v1.y === v2.y;
  }

  public round() {
    return new Vector({
      x: Math.round(this.x * 1000) / 1000,
      y: Math.round(this.y * 1000) / 1000,
    });
  }

  public toString() {
    const v = this.round();
    return `(${v.x}, ${v.y})`;
  }

  public static fromString(val: string) {
    const result = /\((?<x>-?\d+(?:\.\d+)?)\s*,\s*(?<y>-?\d+(?:\.\d+)?)\)/.exec(
      val,
    );
    return new Vector({
      x: +(result?.groups?.x ?? 0),
      y: +(result?.groups?.y ?? 0),
    });
  }

  public toCoordinates() {
    const v = this.round();
    return { x: v.x, y: v.y };
  }
}
