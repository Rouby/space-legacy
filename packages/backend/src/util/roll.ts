import Program from '@aiacta/dicelang';
import alea from 'alea';

export async function roll(formula: string, seed?: string) {
  const rng = alea(seed);
  const resolution = await new Program(formula).run({
    roll: async (faces) => Math.floor(rng.next() * faces) + 1,
  });
  return resolution;
}
