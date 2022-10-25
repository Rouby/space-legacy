import alea from 'alea';
import cuid from 'cuid';

export class RandomNumberGenerator {
  rng: ReturnType<typeof alea>;

  constructor(public seed: string = cuid()) {
    this.rng = alea(seed);
  }

  next() {
    return this.rng.next();
  }

  float(min: number, max: number) {
    return this.rng.next() * (max - min) + min;
  }

  int(min: number, max: number) {
    return Math.floor(this.float(min, max));
  }

  normal(mean: number, stdDev: number): number {
    const u1 = this.rng.next();
    const u2 = this.rng.next();
    const z0 =
      (Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)) / 5;
    if (z0 < -1 && z0 > 1) {
      return this.normal(mean, stdDev);
    }
    return z0 * stdDev + mean;
  }

  from<T>(
    array: T[],
    {
      splice = false,
      where = () => true,
    }: { splice?: boolean; where?: (item: T) => boolean } = {},
  ): T {
    const filteredArray = array.filter(where);
    const element = filteredArray[this.int(0, filteredArray.length)];
    if (splice && element) {
      return array.splice(array.indexOf(element), 1)[0];
    }
    return element;
  }
}
