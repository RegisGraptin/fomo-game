

export function countDownValue(unixTimestamp: bigint | undefined): number {
  if (!unixTimestamp) return 0;

  const target = new Date(Number(unixTimestamp) * 1000).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return -1;

  const seconds = Math.floor(diff / 1000);
  return seconds;
}

export function displayTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${h}h ${m}m ${s}s`;
}