export function formatSignedPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}
