export default function deepCloneSimpleObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
