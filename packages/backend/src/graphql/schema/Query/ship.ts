import { subject } from '@casl/ability';
import { getInstance } from '@rouby/event-sourcing';
import { Ship } from '../../../logic/models';
import { Vector } from '../../../util';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Ship {
    id: ID!
    coordinates: Coordinates!
    movingTo: Coordinates
    owner: Player!
    design: ShipDesign!
    damage: Int!
    combat: Combat
  }

  type Query {
    ship(id: ID!, gameId: ID!): Ship
  }
`;

export const resolvers: Resolvers = {
  Query: {
    ship: async (_, { gameId, id }, { ability, userId }) => {
      const ship = await getInstance(Ship, id);

      if (!ship.isVisibleTo(userId)) {
        return null;
      }

      return ship;
    },
  },
  Ship: {
    movingTo: async (promisedShip, _, { ability, userId }) => {
      const ship =
        promisedShip instanceof Ship
          ? promisedShip
          : await promisedShip.$resolve;

      if (!!(await ship.combat)) {
        return null;
      }

      if (ability.cannot('view', subject('Ship', ship), 'movingTo')) {
        return new Vector(ship.coordinates).add(
          new Vector(ship.movementVector ?? new Vector()).multiply(
            await ship.design.ftlSpeed,
          ),
        );
      }

      if (ship.followingShip) {
        return ship.getFollowingMovingTo();
      }

      return ship.movingTo;
    },
  },
};
