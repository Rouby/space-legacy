import { GameEvent } from '@prisma/client';
import { pubSub } from '../../graphql/context';
import { logger } from '../../logger';
import { generateName, RandomNumberGenerator, Vector } from '../../util';
import {
  AppEvent,
  colonizePlanet,
  constructShipyard,
  createShipComponent,
  createStarSystem,
} from '../events';
import { proxies } from '../models/proxies';

export async function gameStarted(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  if (event.type === 'startGame') {
    logger.info('Effect "gameStarted" triggered');

    const game = await proxies.gameProxy(event.payload.gameId).$resolve;

    const systems = generateGalaxyPositions('spiral', 100).map((pos) =>
      scheduleEvent(
        createStarSystem({
          gameId: event.payload.gameId,
          name: generateName('systems'),
          coordinates: pos.toCoordinates(),
          ...generateSystem(),
        }),
      ),
    );

    const rng = new RandomNumberGenerator();
    for (const [idx, player] of game.players.entries()) {
      // basic components
      {
        scheduleEvent(
          createShipComponent({
            gameId: game.id,
            userId: player.userId,
            type: 'thruster',
            name: 'Fusion Torch',
            powerDraw: 1,
            resourceCosts: 1,
            structuralStrength: 1,
            crewRequirements: 1,
            evasion: 1,
          }),
        );
        scheduleEvent(
          createShipComponent({
            gameId: game.id,
            userId: player.userId,
            type: 'ftl',
            name: 'Hyperdrive',
            powerDraw: 1,
            resourceCosts: 1,
            structuralStrength: 1,
            crewRequirements: 1,
            ftlSpeed: 1,
            fuelConsumption: 1,
          }),
        );
        scheduleEvent(
          createShipComponent({
            gameId: game.id,
            userId: player.userId,
            type: 'sensor',
            name: 'Scanner',
            powerDraw: 1,
            resourceCosts: 1,
            structuralStrength: 0,
            crewRequirements: 1,
            sensorRange: 10,
          }),
        );
        scheduleEvent(
          createShipComponent({
            gameId: game.id,
            userId: player.userId,
            type: 'weapon',
            name: 'Nuclear Missile Launcher',
            powerDraw: 1,
            resourceCosts: 1,
            structuralStrength: 1,
            crewRequirements: 1,
            ammoConsumption: 1,
            weaponDamage: '1d6',
            weaponInitiative: 1,
          }),
        );
        scheduleEvent(
          createShipComponent({
            gameId: game.id,
            userId: player.userId,
            type: 'armor',
            name: 'Plasteel Plates',
            powerDraw: 0,
            resourceCosts: 1,
            structuralStrength: 2,
            crewRequirements: 0,
            armorStrength: 2,
          }),
        );
        scheduleEvent(
          createShipComponent({
            gameId: game.id,
            userId: player.userId,
            type: 'generator',
            name: 'Fission Reactor',
            powerDraw: 0,
            resourceCosts: 1,
            structuralStrength: 1,
            crewRequirements: 1,
            powerGeneration: 4,
          }),
        );
        scheduleEvent(
          createShipComponent({
            gameId: game.id,
            userId: player.userId,
            type: 'augmentation',
            name: 'Crew Quarters',
            powerDraw: 1,
            resourceCosts: 1,
            structuralStrength: 1,
            crewRequirements: 0,
            crewCapacity: 4,
          }),
        );
        scheduleEvent(
          createShipComponent({
            gameId: game.id,
            userId: player.userId,
            type: 'augmentation',
            name: 'Barracks',
            powerDraw: 1,
            resourceCosts: 1,
            structuralStrength: 1,
            crewRequirements: 1,
            soldierCapacity: 2,
          }),
        );
        scheduleEvent(
          createShipComponent({
            gameId: game.id,
            userId: player.userId,
            type: 'augmentation',
            name: 'Life Support',
            powerDraw: 1,
            resourceCosts: 1,
            structuralStrength: 1,
            crewRequirements: 1,
            lifeSupport: 4,
          }),
        );
      }

      const system = rng.from(systems, {
        splice: true,
        where: (system) => system.payload.habitablePlanets.length > 0,
      });
      const planet = rng.from(system.payload.habitablePlanets);

      scheduleEvent(
        colonizePlanet({
          gameId: event.payload.gameId,
          systemId: system.payload.id,
          planetIndex: system.payload.habitablePlanets.indexOf(planet),
          userId: player.userId,
        }),
      );

      scheduleEvent(
        constructShipyard({
          gameId: event.payload.gameId,
          systemId: system.payload.id,
          userId: player.userId,
          workNeeded: 0,
          materialsNeeded: 0,
        }),
      );
    }

    return () => {
      pubSub.publish('gameStarted', { id: event.payload.gameId });
    };
  }
}

function generateGalaxyPositions(
  type: 'elliptical' | 'spiral',
  systemCount: number,
) {
  const rng = new RandomNumberGenerator();
  const systems: Vector[] = [];

  const φ = rng.next() * Math.PI;

  switch (type) {
    case 'elliptical':
      {
        for (let i = 0; i < systemCount; ++i) {
          const x = rng.normal(0, 800);
          const y = rng.normal(0, 500);
          const tx = x * Math.cos(φ) - y * Math.sin(φ);
          const ty = y * Math.cos(φ) + x * Math.sin(φ);
          systems.push(new Vector({ x: tx, y: ty }));
        }
      }
      break;
    case 'spiral':
      {
        const n = rng.int(2, 4);
        for (let i = 0; i < n; ++i) {
          systems.push(...genArm(φ + ((Math.PI * 2) / n) * i, n));
        }
      }
      break;
  }

  while (
    systems.some(
      (system) =>
        Math.min(
          ...systems.map((other) =>
            other === system ? 100000000 : system.distance(other),
          ),
        ) < 10,
    )
  ) {
    const sys = systems.findIndex(
      (system) =>
        Math.min(
          ...systems.map((other) =>
            other === system ? 100000000 : system.distance(other),
          ),
        ) < 10,
    );
    systems.splice(sys, 1);
  }
  while (systems.length > systemCount) {
    rng.from(systems, { splice: true });
  }

  return systems;

  function genArm(φ: number, armCount: number) {
    const points = [];
    for (let i = 0; i < Math.log10(systemCount) ** 2 * 11; ++i) {
      for (let o = 0; o < 3 / armCount; ++o) {
        const x = i + rng.normal(0, 10);
        const y = rng.normal(0, 10);
        const tx =
          (x * Math.cos(φ + i ** 1.5 / 100) -
            y * Math.sin(φ + i ** 1.5 / 100)) *
          10;
        const ty =
          (y * Math.cos(φ + i ** 1.5 / 100) +
            x * Math.sin(φ + i ** 1.5 / 100)) *
          10;
        points.push(new Vector({ x: tx, y: ty }));
      }
    }
    return points;
  }
}

function generateSystem() {
  const rng = new RandomNumberGenerator();

  const sunClass = rng.from([
    ...Array.from({ length: 3 }).map(() => 'O'),
    ...Array.from({ length: 6 }).map(() => 'B'),
    ...Array.from({ length: 11 }).map(() => 'A'),
    ...Array.from({ length: 18 }).map(() => 'F'),
    ...Array.from({ length: 15 }).map(() => 'G'),
    ...Array.from({ length: 13 }).map(() => 'K'),
    ...Array.from({ length: 9 }).map(() => 'M'),
    ...Array.from({ length: 4 }).map(() => 'neutron'),
    ...Array.from({ length: 2 }).map(() => 'pulsar'),
    ...Array.from({ length: 1 }).map(() => 'blackhole'),
  ] as ReturnType<typeof createStarSystem>['payload']['sunClass'][]);

  const habitablePlanetsNum = {
    O: 0,
    B: 0,
    A: 0,
    F: rng.int(0, 3),
    G: rng.int(0, 4),
    K: rng.int(2, 6),
    M: rng.int(1, 4),
    neutron: 0,
    pulsar: 0,
    blackhole: 0,
  }[sunClass];
  const habitableZone = {
    O: [0, 0] as const,
    B: [0, 0] as const,
    A: [0, 0] as const,
    F: [0.2, 0.4] as const,
    G: [0.15, 0.35] as const,
    K: [0.1, 0.35] as const,
    M: [0.05, 0.3] as const,
    neutron: [0, 0] as const,
    pulsar: [0, 0] as const,
    blackhole: [0, 0] as const,
  }[sunClass];

  const uninhabitableBodiesNum = {
    O: rng.int(0, 3),
    B: rng.int(0, 4),
    A: rng.int(0, 5),
    F: rng.int(3, 5),
    G: rng.int(3, 5),
    K: rng.int(2, 4),
    M: rng.int(1, 4),
    neutron: rng.int(0, 2),
    pulsar: rng.int(0, 1),
    blackhole: 0,
  }[sunClass];

  let orbits = [0];

  do {
    orbits = [
      ...Array.from({ length: habitablePlanetsNum }).map(
        () =>
          Math.round(rng.float(habitableZone[0], habitableZone[1]) * 100) / 100,
      ),
      ...Array.from({ length: uninhabitableBodiesNum }).map(() => {
        let orbit = rng.float(0, 1);
        while (orbit > habitableZone[0] && orbit < habitableZone[1]) {
          orbit = rng.float(0, 1);
        }
        return Math.round(orbit * 100) / 100;
      }),
    ].sort();
  } while (
    orbits.some(
      (orbit, idx) =>
        (idx > 0 && orbit - orbits[idx - 1] < 0.02) ||
        (idx + 1 < orbits.length && orbits[idx + 1] - orbit < 0.02),
    )
  );

  return {
    sunClass,
    habitablePlanets: Array.from({ length: habitablePlanetsNum })
      .map((_, idx) => ({
        orbit: rng.from(orbits, {
          splice: true,
          where: (orbit) =>
            orbit >= habitableZone[0] && orbit <= habitableZone[1],
        }),
        size: Math.round(rng.normal(15, 10)),
        type: rng.from([
          'arid' as const,
          'desert' as const,
          'savanna' as const,
          'alpine' as const,
          'arctic' as const,
          'tundra' as const,
          'continental' as const,
          'ocean' as const,
          'tropical' as const,
        ]),
      }))
      .sort((a, b) => a.orbit - b.orbit),
    uninhabitableBodies: Array.from({ length: uninhabitableBodiesNum })
      .map((_, idx) => ({
        orbit: rng.from(orbits, { splice: true }),
        size: Math.max(1, Math.round(Math.abs(rng.normal(10, 20)))),
        type: rng.from([
          'asteroids' as const,
          'gas' as const,
          'barren' as const,
          'broken' as const,
          'frozen' as const,
          'molten' as const,
          'toxic' as const,
        ]),
      }))
      .sort((a, b) => a.orbit - b.orbit),
  };
}
