import { GraphQLScalarType } from 'graphql';
import { Vector } from '../../util';
import { Resolvers } from '../generated';

export const typeDefs = /* GraphQL */ `
  scalar Coordinates
`;

export const resolvers: Resolvers = {
  Coordinates: new GraphQLScalarType<{ x: number; y: number }, string>({
    name: 'Coordinates',
    description: 'Object with x and y coordinates',
    serialize(value) {
      if (
        !isXYObject(value) ||
        typeof value.x !== 'number' ||
        typeof value.y !== 'number'
      ) {
        throw new Error(
          `Scalar "Coordinates" cannot represent "${JSON.stringify(
            value,
          )}" since it is either not an object, or has no x value, or no y value.`,
        );
      }

      if (value instanceof Vector) {
        return JSON.stringify(value.toCoordinates());
      }

      return JSON.stringify({
        x: value.x,
        y: value.y,
      });
    },
    parseValue(value) {
      const parsed: unknown =
        typeof value === 'string' ? JSON.parse(value) : value;

      if (
        !isXYObject(parsed) ||
        typeof parsed.x !== 'number' ||
        typeof parsed.y !== 'number'
      ) {
        throw new Error(
          `Scalar "Coordinates" cannot represent "${value}" since it is either not an object, or has no x value, or no y value.`,
        );
      }
      return {
        x: +parsed['x'],
        y: +parsed['y'],
      };
    },
    parseLiteral(ast) {
      if (ast.kind !== 'ObjectValue') {
        throw new Error('Expected ObjectValue');
      }
      const xField = ast.fields.find((f) => f.name.value === 'x');
      const yField = ast.fields.find((f) => f.name.value === 'y');
      if (
        xField?.value.kind !== 'FloatValue' ||
        yField?.value.kind !== 'FloatValue'
      ) {
        throw new Error('Expected FloatValue');
      }
      return {
        x: +xField.value.value,
        y: +yField.value.value,
      };
    },
  }),
};

function isXYObject(value: unknown): value is { x: unknown; y: unknown } {
  return typeof value === 'object' && !!value && 'x' in value && 'y' in value;
}
