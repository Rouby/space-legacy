export function isTruthy<T>(v: T | null | undefined | ''): v is T {
  return !!v;
}
