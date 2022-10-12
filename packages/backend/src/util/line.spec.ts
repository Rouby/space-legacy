import { describe, expect, it } from 'vitest';
import { Line } from './line';
import { Vector } from './vector';

describe('line', () => {
  it.each([
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },

      { x: 0, y: 1 },
      { x: 1, y: 0 },

      { x: 0.5, y: 0.5 }, // expected to cross
    ],
  ])(
    'should calculate the correct intersection for lines (case %#)',
    (a1, a2, b1, b2, expected) => {
      expect(
        new Line(new Vector(a1), new Vector(a2)).intersection(
          new Line(new Vector(b1), new Vector(b2)),
        ),
      ).toEqual(expected && new Vector(expected));
    },
  );

  it.each([
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },

      { x: 3, y: 0 },
      { x: 1, y: 0 },

      { x: 1.5, y: 0 }, // expected to cross
    ],
    [
      { x: 2, y: 0 },
      { x: 0, y: 0 },

      { x: 3, y: 0 },
      { x: 1, y: 0 },

      { x: 3.9999999999999987, y: 0 }, // expected to cross
    ],
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },

      { x: 3, y: 0 },
      { x: 5, y: 0 },

      null, // not expected to cross
    ],
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },

      { x: 1, y: 1 },
      { x: 3, y: 1 },

      null, // not expected to cross
    ],
  ])(
    'should calculate the correct intersection for parallel lines (case %#)',
    (a1, a2, b1, b2, expected) => {
      expect(
        new Line(new Vector(a1), new Vector(a2)).intersection(
          new Line(new Vector(b1), new Vector(b2)),
        ),
      ).toEqual(expected && new Vector(expected));
    },
  );

  it.each([
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },

      { x: 0, y: 1 },
      { x: 1, y: 0 },

      { alpha: 0.5, beta: 0.5 }, // expected to cross
    ],
    [
      { x: 2, y: 0 },
      { x: 0, y: 0 },

      { x: 3, y: 0 },
      { x: -1, y: 0 },

      { alpha: 0.5, beta: 0.5 }, // expected to cross
    ],
    [
      { x: 2, y: 0 },
      { x: 0, y: 0 },

      { x: 10, y: 0 },
      { x: -10, y: 0 },

      { alpha: 0.4453125, beta: 0.4453125 }, // expected to cross
    ],
    [
      { x: 10, y: 0 },
      { x: -10, y: 0 },

      { x: 2, y: 0 },
      { x: 0, y: 0 },

      { alpha: 0.4453125, beta: 0.4453125 }, // expected to cross
    ],
  ])(
    'should calculate the correct out-params for parallel lines (case %#)',
    (a1, a2, b1, b2, expected) => {
      const out = { alpha: 0, beta: 0 };
      new Line(new Vector(a1), new Vector(a2)).intersection(
        new Line(new Vector(b1), new Vector(b2)),
        out,
      );
      expect(out).toEqual(expected);
    },
  );
});
