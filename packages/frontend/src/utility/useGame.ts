import { atom, useAtom } from 'jotai';

const gameIdAtom = atom<string | null>(null);

export function useGame() {
  return useAtom(gameIdAtom);
}
