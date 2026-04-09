export function hashNumber(...values: number[]): number {
  return values.reduce((accumulator, value, index) => {
    const normalized = Math.floor(value * 1000);
    return (accumulator ^ (normalized + index * 2654435761)) >>> 0;
  }, 2166136261);
}

export function hashString(...values: string[]): number {
  return values.reduce((accumulator, value, index) => {
    let next = accumulator ^ (index * 16777619);

    for (const character of value) {
      next ^= character.charCodeAt(0);
      next = Math.imul(next, 16777619);
    }

    return next >>> 0;
  }, 2166136261);
}

export function mulberry32(seed: number): () => number {
  let current = seed >>> 0;
  return () => {
    current += 0x6d2b79f5;
    let next = Math.imul(current ^ (current >>> 15), current | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const clone = [...items];
  const random = mulberry32(seed);

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

export function pickWeighted<T>(items: T[], getWeight: (item: T) => number, seed: number): T | null {
  if (items.length === 0) {
    return null;
  }

  const total = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);

  if (total <= 0) {
    return items[0] ?? null;
  }

  const random = mulberry32(seed)();
  let threshold = random * total;

  for (const item of items) {
    threshold -= Math.max(0, getWeight(item));
    if (threshold <= 0) {
      return item;
    }
  }

  return items.at(-1) ?? null;
}
