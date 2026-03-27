/**
 * Random draw: generates 5 unique numbers in range [1, 45]
 */
export function generateRandomDraw(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}
