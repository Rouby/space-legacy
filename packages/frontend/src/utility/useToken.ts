import type { TokenInfo } from 'backend/src/util';
import { atom, useAtom, useSetAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import decode, { JwtPayload } from 'jwt-decode';
import { useEffect } from 'react';
import { useRefreshTokenQuery } from '../graphql';

const sessionTokenAtom = atomWithStorage(
  'token',
  null,
  createJSONStorage<string | null>(() => sessionStorage),
);
const permanentTokenAtom = atomWithStorage(
  'token',
  null,
  createJSONStorage<string | null>(() => localStorage),
);
export const tokenAtom = atom(
  (get) => get(sessionTokenAtom) ?? get(permanentTokenAtom),
  (get, set, value: string | null) => {
    if (get(sessionTokenAtom)) {
      set(sessionTokenAtom, value);
    } else {
      set(permanentTokenAtom, value);
    }
  },
);
const tokenInfoAtom = atom((get) => parseToken(get(tokenAtom)));

export function useToken() {
  const [userInfo] = useAtom(tokenInfoAtom);
  const setSessionToken = useSetAtom(sessionTokenAtom);
  const setPermanentToken = useSetAtom(permanentTokenAtom);
  const setToken = useSetAtom(tokenAtom);

  /* GraphQL */ `#graphql
    query RefreshToken {
      token
    }
  `;
  const [refreshToken] = useRefreshTokenQuery({ pause: !userInfo });
  useEffect(() => {
    if (refreshToken.data?.token) {
      setToken(refreshToken.data.token);
    }
  }, [refreshToken.data?.token]);

  return [
    userInfo,
    (token: string | null, session: boolean) => {
      if (session) {
        setSessionToken(token);
      } else {
        setSessionToken(null);
        setPermanentToken(token);
      }
    },
  ] as const;

  // const [userInfo, setUserInfo] = useState<(JwtPayload & TokenInfo) | null>(
  //   () =>
  //     parseToken(
  //       sessionStorage.getItem('token') ?? localStorage.getItem('token'),
  //     ),
  // );
  // useEffect(() => {
  //   window.addEventListener('storage', check);
  //   return () => window.removeEventListener('storage', check);
  //   function check(ev: StorageEvent) {
  //     if (ev.key === 'token' || ev.key === null) {
  //       setUserInfo(
  //         parseToken(
  //           sessionStorage.getItem('token') ?? localStorage.getItem('token'),
  //         ),
  //       );
  //     }
  //   }
  // });
  // /* GraphQL */ `#graphql
  //   query RefreshToken {
  //     token
  //   }
  // `;
  // const [refreshToken] = useRefreshTokenQuery({ pause: !userInfo });
  // useEffect(() => {
  //   if (refreshToken.data?.token) {
  //     setToken(refreshToken.data?.token);
  //   }
  // }, [refreshToken.data?.token]);
  // if (userInfo?.exp && userInfo.exp * 1000 < Date.now()) {
  //   localStorage.removeItem('token');
  //   sessionStorage.removeItem('token');
  //   return [null, setToken] as const;
  // }
  // return [userInfo, setToken] as const;
  // function setToken(
  //   token: string | null,
  //   session = !!sessionStorage.getItem('token'),
  // ) {
  //   if (token) {
  //     if (session) {
  //       sessionStorage.setItem('token', token);
  //     } else {
  //       localStorage.setItem('token', token);
  //     }
  //   } else {
  //     localStorage.removeItem('token');
  //     sessionStorage.removeItem('token');
  //   }
  //   setUserInfo(parseToken(token));
  // }
}

function isCorrectJWT(obj: unknown): obj is JwtPayload & TokenInfo {
  return !!obj && typeof obj === 'object' && 'space' in obj;
}

function parseToken(token: string | null) {
  if (token) {
    try {
      const decoded = decode<JwtPayload>(token);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null;
      }

      if (isCorrectJWT(decoded)) {
        return decoded;
      }
    } catch {}
  }
  return null;
}
