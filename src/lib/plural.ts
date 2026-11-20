/** "1 serie" / "3 series" — every count label in the UI goes through here. */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
