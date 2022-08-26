import { Box } from '@mantine/core';
import { useMatch } from '@tanstack/react-location';
import { useState } from 'react';
import { useStarSystemQuery } from '../graphql';
import { useGame, useRandom } from '../utility';

export function StarSystemView() {
  const { params } = useMatch();
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query StarSystem($id: ID!, $gameId: ID!) {
      starSystem(id: $id, gameId: $gameId) {
        id
        name
        habitablePlanets {
          name
          orbit
          size
          type
          owner {
            name
          }
          population
        }
        uninhabitableBodies {
          orbit
          size
          type
        }
      }
    }
  `;
  const [starSystemResult] = useStarSystemQuery({
    variables: { id: params.starSystemId, gameId: game?.id! },
  });

  const [tilt, setTilt] = useState(70);

  const rng = useRandom(starSystemResult.data?.starSystem?.id);

  return (
    <>
      <div>{starSystemResult.data?.starSystem?.name}</div>
      Planets:
      {starSystemResult.data?.starSystem?.habitablePlanets.map((planet) => (
        <div key={planet.orbit}>
          {planet.type}, Size: {planet.size}, Pop: {planet.population}, Owner:{' '}
          {planet.owner?.name}
        </div>
      ))}
      {starSystemResult.data?.starSystem?.uninhabitableBodies.map((body) => (
        <div key={body.orbit}>
          {body.type}, Size: {body.size}
        </div>
      ))}
      <svg
        width="100%"
        height="300"
        viewBox="0 0 600 180"
        onMouseMove={(evt) => {
          const { y, height } = evt.currentTarget.getBoundingClientRect();
          setTilt(70 + ((evt.clientY - y) / height) * 10);
        }}
        onMouseOut={() => setTilt(70)}
      >
        <filter id="star-field">
          <feTurbulence baseFrequency="0.6" seed={rng.next()} />
          <feColorMatrix
            values="0 0 0 7 -4
                    0 0 0 7 -4
                    0 0 0 7 -4
                    0 0 0 0 1"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#star-field)" />
        <Box component="g">
          {[
            ...(starSystemResult.data?.starSystem?.habitablePlanets ?? []),
            ...(starSystemResult.data?.starSystem?.uninhabitableBodies ?? []),
          ].map((body) => (
            <HalfOrbit
              key={body.orbit}
              orbit={body.orbit}
              tilt={tilt}
              seed={rng.next()}
            />
          ))}
          <Sun temperature={2000} cx="50" cy="90" r="20" seed={rng.next()} />
          {/* Draw bodies */}
          {starSystemResult.data?.starSystem?.habitablePlanets.map((planet) => (
            <Planet
              key={planet.orbit}
              orbit={planet.orbit}
              size={planet.size}
              seed={rng.next()}
            />
          ))}
          {starSystemResult.data?.starSystem?.uninhabitableBodies.map(
            (body) => (
              <Box
                key={body.orbit}
                component="circle"
                cx={50 + body.orbit * 500}
                cy="90"
                r={body.size / 5}
                stroke="black"
                strokeWidth="2"
                fill="gray"
              />
            ),
          )}
          {[
            ...(starSystemResult.data?.starSystem?.habitablePlanets ?? []),
            ...(starSystemResult.data?.starSystem?.uninhabitableBodies ?? []),
          ].map((body) => (
            <HalfOrbit
              key={body.orbit}
              orbit={body.orbit}
              tilt={tilt}
              front
              seed={rng.next()}
            />
          ))}
        </Box>
      </svg>
    </>
  );
}

function Sun({
  temperature,
  cx,
  cy,
  r,
  seed,
}: {
  temperature: number;
  cx: string | number;
  cy: string | number;
  r: string | number;
  seed: number;
}) {
  return (
    <>
      <filter
        id="sun-glow"
        filterUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1000"
        height="1000"
      >
        <feGaussianBlur stdDeviation="15" />
      </filter>
      <filter
        id="sun-turbulence"
        filterUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1000"
        height="1000"
      >
        <feTurbulence baseFrequency="0.2" seed={seed} />
        <feDiffuseLighting
          lightingColor={blackBodyToRGB(temperature)}
          surfaceScale="4"
        >
          <feDistantLight azimuth="0" elevation="100" />
        </feDiffuseLighting>
        <feComposite operator="in" in2="SourceGraphic" />
        <feGaussianBlur stdDeviation="0.5" />
      </filter>
      <circle
        filter="url(#sun-glow)"
        cx={cx}
        cy={cy}
        r={r}
        fill={blackBodyToRGB(temperature)}
        stroke="none"
      />
      <circle
        filter="url(#sun-turbulence)"
        cx={cx}
        cy={cy}
        r={r}
        fill="white"
        stroke="none"
      />
    </>
  );
}

function HalfOrbit({
  orbit,
  tilt,
  front = false,
  seed,
}: {
  orbit: number;
  tilt: number;
  front?: boolean;
  seed: number;
}) {
  return (
    <path
      d={`M ${[50 - orbit * 500, 90].join(',')} A ${[
        orbit * 500,
        orbit * 500 * Math.sin(((tilt + 90) * Math.PI) / 180),
      ].join(',')} 0,0,${front ? '0' : '1'} ${[50 + orbit * 500, 90].join(
        ',',
      )}`}
      stroke="white"
      strokeWidth={0.5}
      strokeLinecap="round"
      opacity={0.1}
      fill="none"
    />
  );
}

function Planet({
  orbit,
  size,
  seed,
}: {
  orbit: number;
  size: number;
  seed: number;
}) {
  return (
    <>
      <filter id={`planet-${orbit}`}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.08"
          numOctaves="10"
          seed={seed}
        />
        <feColorMatrix
          values="1 0 0 0 0
                  1 0 0 0 0
                  1 0 0 0 0
                  0 0 0 0 1"
        />
        <feComponentTransfer>
          <feFuncR
            type="table"
            tableValues="0 .02 .03 .03 .09 .12 .27 .91 .3 .03 0 0"
          />
          <feFuncG
            type="table"
            tableValues=".01 .09 .16 .18 .38 .48 .54 .73 .33 .09 .01 .01"
          />
          <feFuncB
            type="table"
            tableValues=".03 .17 .3 .25 .37 .42 .42 .6 .17 .01 0 0"
          />
        </feComponentTransfer>
        <feComposite operator="in" in2="SourceGraphic" />
      </filter>
      <filter id={`clouds-${orbit}`}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.08"
          numOctaves="10"
          stitchTiles="stitch"
          seed={seed}
        />
        <feColorMatrix
          values="1 0 0 0 0
                  1 0 0 0 0
                  1 0 0 0 0
                  1 0 0 0 0"
        />
        <feComponentTransfer>
          <feFuncR type="linear" slope="1" intercept="-0.4" />
          <feFuncG type="linear" slope="1" intercept="-0.4" />
          <feFuncB type="linear" slope="1" intercept="-0.4" />
          <feFuncA type="linear" slope="1" intercept="-0.4" />
        </feComponentTransfer>{' '}
        <feComponentTransfer>
          <feFuncR type="linear" slope="3" intercept="0" />
          <feFuncG type="linear" slope="3" intercept="0" />
          <feFuncB type="linear" slope="3" intercept="0" />
          <feFuncA type="linear" slope="4" intercept="0" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="1" />
        <feComposite operator="in" in2="SourceGraphic" />
      </filter>
      <circle
        filter={`url(#planet-${orbit})`}
        cx={50 + orbit * 500}
        cy="90"
        r={size / 3}
        fill="white"
        stroke="none"
      />
      <circle
        filter={`url(#clouds-${orbit})`}
        cx={50 + orbit * 500}
        cy="90"
        r={size / 3}
        fill="white"
        stroke="none"
      />
    </>
  );
}

function blackBodyToRGB(kelvin: number) {
  let tmp = kelvin / 100,
    r,
    g,
    b;

  //------------------------------------------------------Red
  if (tmp <= 66) {
    r = 255;
  } else {
    r = tmp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    if (r < 0) r = 0;
    if (r > 255) r = 255;
  }
  //------------------------------------------------------Green
  if (tmp <= 66) {
    g = tmp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
  } else {
    g = tmp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
  }
  if (g < 0) g = 0;
  if (g > 255) g = 255;
  //------------------------------------------------------Blue
  if (tmp >= 66) {
    b = 255;
  } else {
    if (tmp <= 19) {
      b = 0;
    } else {
      b = tmp - 10;
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
      if (b < 0) b = 0;
      if (b > 255) b = 255;
    }
  }

  return `rgb(${r}, ${g}, ${b})`;
}
