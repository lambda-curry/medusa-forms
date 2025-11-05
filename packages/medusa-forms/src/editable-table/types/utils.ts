// Utility type to flatten intersection types
export type FlattenType<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
