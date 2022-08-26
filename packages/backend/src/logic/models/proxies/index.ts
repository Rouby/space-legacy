export type Promised<T extends { id: any }> = {
  [P in keyof T]: P extends 'id' ? T[P] : Promise<T[P]>;
};
