import { createPubSub } from '@graphql-yoga/node';
import { CookieSerializeOptions, serialize } from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';
import { decode, JwtPayload, verify } from 'jsonwebtoken';
import { AppAbility, createDefaultAbility } from '../ability';
import { publishEvent, retrieveState } from '../logic';
import { getDbClient } from '../prisma';

export const pubSub = createPubSub<{
  gameCreated: [payload: { id: string }];
}>();

export async function context({
  req,
  res,
}: {
  req: IncomingMessage;
  res: ServerResponse;
}) {
  const prisma = await getDbClient();

  let token: string | undefined;
  if (req.headers.authorization) {
    [, token] = req.headers.authorization.split(' ');
  }

  let user: { id: string; permissions: any } | undefined;
  if (token) {
    let decodedToken: JwtPayload | null = null;

    try {
      decodedToken = decode(token, { complete: true });
    } catch {
      throw new Error('invalid_token');
    }

    try {
      verify(token, process.env.SESSION_SECRET!);
    } catch {
      throw new Error('invalid_token');
    }

    // TODO check if token was revoked

    user = decodedToken?.payload.space;
  }

  return {
    prisma,
    userId: user?.id,
    ability: user ? new AppAbility(user.permissions) : createDefaultAbility(),
    publishEvent,
    retrieveState,
    pubSub,
    http: {
      setCookie: (
        name: string,
        value: any,
        options: Partial<CookieSerializeOptions>,
      ) => {
        res.setHeader(
          'Set-Cookie',
          serialize(name, value, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            ...options,
          }),
        );
      },
    },
  };
}
