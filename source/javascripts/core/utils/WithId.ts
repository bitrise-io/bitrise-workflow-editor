export type WithId<T extends Record<string, unknown> = {}> = T & {
  id: string;
};

export const withId = <T extends Record<string, unknown> = {}>([id, elem]: [id: string, T]): WithId<T> => ({
  id,
  ...elem,
});
