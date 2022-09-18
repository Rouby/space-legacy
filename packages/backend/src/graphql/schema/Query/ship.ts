import { subject } from '@casl/ability';
import { Vector } from '../../../util';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type ShipDesign {
    id: ID!
  }

  type Ship {
    id: ID!
    coordinates: Coordinates!
    movingTo: Coordinates
    owner: Player!
  }

  type Query {
    ship(id: ID!, gameId: ID!): Ship
  }
`;

export const resolvers: Resolvers = {
  Query: {
    ship: async (_, { gameId, id }, { models, ability, userId }) => {
      const ship = await models.Ship.get(id);

      if (!ship.isVisibleTo(userId)) {
        return null;
      }

      return ship;
    },
  },
  Ship: {
    movingTo: async (ship, _, { ability, models, userId }) => {
      const resolved = ship instanceof models.Ship ? ship : await ship.$resolve;

      if (ability.cannot('view', subject('Ship', resolved), 'movingTo')) {
        return new Vector(resolved.coordinates).add(
          new Vector(resolved.movementVector).multiply(10), // TODO get ship speed?
        );
      }

      if (resolved.followingShip) {
        const followingShip = await resolved.followingShip.$resolve;
        if (await followingShip.isVisibleTo(userId)) {
          return followingShip.coordinates;
        }
      }

      return resolved.movingTo;
    },
  },
};
