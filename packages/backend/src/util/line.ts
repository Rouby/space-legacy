import { Vector } from './vector';

export class Line {
  public direction: 1 | -1 = 1;

  constructor(public origin: Vector, public target: Vector) {
    this.direction = this.angle() > 0 ? 1 : -1;
  }

  public angle() {
    return this.target.subtract(this.origin).angle(new Vector({ x: 0, y: 1 }));
  }

  public magnitude() {
    return this.target.subtract(this.origin).magnitude();
  }

  public contains(point: Vector) {
    const a = this.target.subtract(this.origin);
    const b = point.subtract(this.origin);

    return a.cross(b) === 0 && a.dot(b) >= 0 && a.magnitude() >= b.magnitude();
  }

  public intersection(other: Line, out?: { alpha: number; beta: number }) {
    const a = this.target.subtract(this.origin);
    const b = other.target.subtract(other.origin);
    const c = this.origin.subtract(other.origin);

    const alphaNumerator = b.cross(c);
    const alphaDenominator = a.cross(b);
    const betaNumerator = a.cross(c);
    const betaDenominator = a.cross(b);

    if (alphaDenominator === 0 || betaDenominator === 0) {
      // parallel
      if (this.contains(other.target) || other.contains(this.target)) {
        const thisV = this.target.subtract(this.origin);
        const otherV = other.target.subtract(other.origin);

        let t = 0;
        let step = 1;
        for (let i = 0; i < 100; i++) {
          step /= 2;

          const thisPointPlus = this.origin.add(thisV.multiply(t + step));
          const otherPointPlus = other.origin.add(otherV.multiply(t + step));

          const thisPointMinus = this.origin.add(thisV.multiply(t - step));
          const otherPointMinus = other.origin.add(otherV.multiply(t - step));

          const dPlus = thisPointPlus.subtract(otherPointPlus).magnitude();
          const dMinus = thisPointMinus.subtract(otherPointMinus).magnitude();

          if (dPlus < dMinus) {
            t += step;
          } else {
            t -= step;
          }

          if (Math.min(dPlus, dMinus) < 0.05) {
            break;
          }
        }

        if (out) {
          out.alpha = t;
          out.beta = t;
        }

        return this.origin.add(thisV.multiply(t));
      }
      return null;
    }

    const alpha = alphaNumerator / alphaDenominator;
    const beta = betaNumerator / betaDenominator;

    if (alpha >= 0 && alpha <= 1 && beta >= 0 && beta <= 1) {
      if (out) {
        out.alpha = alpha;
        out.beta = beta;
      }
      return this.origin.add(a.multiply(alpha));
    }

    return null;
  }
}

const out = { alpha: 0, beta: 0 };
new Line(
  new Vector({
    x: 2,
    y: 0,
  }),
  new Vector({
    x: 0,
    y: 0,
  }),
).intersection(
  new Line(
    new Vector({
      x: 3,
      y: 0,
    }),
    new Vector({
      x: -1,
      y: 0,
    }),
  ),
  out,
);

out;
