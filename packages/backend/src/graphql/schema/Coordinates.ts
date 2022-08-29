import { GraphQLScalarType } from 'graphql';
import { context } from '../context';
import { Resolvers } from '../generated';

export const typeDefs = /* GraphQL */ `
  scalar Coordinates
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Coordinates: new GraphQLScalarType<{ x: number; y: number }, string>({
    name: 'Coordinates',
    description: 'Object with x and y coordinates',
    serialize(value) {
      if (
        typeof value !== 'object' ||
        !value ||
        !('x' in value) ||
        !('y' in value)
      ) {
        throw new Error(
          `Scalar "Coordinates" cannot represent "${value}" since it is either not an object, or has no x value, or no y value.`,
        );
      }

      return JSON.stringify(value);
    },
    parseValue(value) {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (
        typeof parsed !== 'object' ||
        !parsed ||
        !('x' in parsed) ||
        !('y' in parsed)
      ) {
        throw new Error(
          `Scalar "Coordinates" cannot represent "${parsed}" since it is either not an object, or has no x value, or no y value.`,
        );
      }
      return parsed;
    },
    parseLiteral(ast) {
      if (ast.kind !== 'ObjectValue') {
        throw new Error('Expected ObjectValue');
      }
      const xField = ast.fields.find((f) => f.name.value === 'x');
      const yField = ast.fields.find((f) => f.name.value === 'y');
      if (
        xField?.value.kind !== 'IntValue' ||
        yField?.value.kind !== 'IntValue'
      ) {
        throw new Error('Expected IntValue');
      }
      return {
        x: parseInt(xField.value.value, 10),
        y: parseInt(yField.value.value, 10),
      };
    },
  }),
};
