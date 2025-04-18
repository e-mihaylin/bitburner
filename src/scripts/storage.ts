export const setItem = <T>(key: string, value: T): void =>
  localStorage.setItem(key, JSON.stringify(value));

export const getItem = <T>(key: string): T =>
  JSON.parse(localStorage.getItem(key) || '') as T;