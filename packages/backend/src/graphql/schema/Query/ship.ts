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
    design: ShipDesign!
    combat: Combat
  }

  type Combat {
    friendlies: [Ship!]!
    hostiles: [Ship!]!
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
    movingTo: async (promisedShip, _, { ability, models, userId }) => {
      const ship =
        promisedShip instanceof models.Ship
          ? promisedShip
          : await promisedShip.$resolve;

      if ((await ship.combats).length > 0) {
        return null;
      }

      if (ability.cannot('view', subject('Ship', ship), 'movingTo')) {
        return new Vector(ship.coordinates).add(
          new Vector(ship.movementVector).multiply(10), // TODO get ship speed?
        );
      }

      if (ship.followingShip) {
        return ship.getFollowingMovingTo();
      }

      return ship.movingTo;
    },
    combat: async (promisedShip, _, { ability, models, userId }) => {
      const ship =
        promisedShip instanceof models.Ship
          ? promisedShip
          : await promisedShip.$resolve;

      const involvedCombats = await ship.combats;

      if (involvedCombats.length === 0) {
        return null;
      }

      return {
        friendlies: involvedCombats.flatMap((combat) => combat.ships),
        hostiles: involvedCombats.flatMap((combat) =>
          combat.hostiles.flatMap((hostile) => hostile.ships),
        ),
      };
    },
  },
};
