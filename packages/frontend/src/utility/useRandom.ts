import alea from 'alea';

export function useRandom(seed?: number | string) {
  return seed ? alea(seed) : alea();
}
