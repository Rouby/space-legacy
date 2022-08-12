import decode, { JwtPayload } from 'jwt-decode';
import { useEffect, useReducer } from 'react';
import { gql } from 'urql';
import { useRefreshTokenQuery } from '../graphql';

export function useToken() {
  const token =
    sessionStorage.getItem('token') ?? localStorage.getItem('token');

  const [, trigger] = useReducer((state) => !state, false);
  useEffect(() => {
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);

    function check(ev: StorageEvent) {
      if (ev.key === 'token' || ev.key === null) {
        trigger();
      }
    }
  });

  gql`
    query RefreshToken {
      token
    }
  `;
  const [refreshToken] = useRefreshTokenQuery({ pause: !token });
  useEffect(() => {
    if (refreshToken.data?.token) {
      if (sessionStorage.getItem('token')) {
        sessionStorage.setItem('token', refreshToken.data.token);
      } else {
        localStorage.setItem('token', refreshToken.data.token);
      }
    }
  }, [refreshToken.data?.token]);

  if (token) {
    try {
      const decoded = decode<JwtPayload>(token);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return [null, setToken] as const;
      }

      if (isCorrectJWT(decoded)) {
        return [decoded, setToken] as const;
      }
    } catch {}
  }

  return [null, setToken] as const;

  function setToken(token: string | null, session: boolean) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    if (token) {
      (session ? sessionStorage : localStorage).setItem('token', token);
    }
    trigger();
  }
}

function isCorrectJWT(
  obj: unknown,
): obj is JwtPayload & { space: { id: string; permissions: any } } {
  return !!obj && typeof obj === 'object' && 'space' in obj;
}
