import Program from '@aiacta/dicelang';
import { RandomNumberGenerator } from './random';

export async function roll(formula: string, seed?: string) {
  const rng = new RandomNumberGenerator(seed);
  const resolution = await new Program(formula).run({
    roll: async (faces) => rng.int(1, faces),
  });
  return resolution;
}
