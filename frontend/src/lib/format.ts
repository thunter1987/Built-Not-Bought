export function powerToWeight(
  horsepower?: number | null,
  weight?: number | null,
): number | null {
  if (!horsepower || !weight || weight <= 0) {
    return null
  }

  return weight / horsepower
}

export function formatLapTime(seconds?: number | null): string {
  if (!seconds || seconds <= 0) {
    return '—'
  }

  const minutes = Math.floor(seconds / 60)
  const remainder = (seconds - minutes * 60).toFixed(2).padStart(5, '0')

  return `${minutes}:${remainder}`
}

export function humanizeEnum(value?: string | null): string {
  if (!value) {
    return 'Unspecified'
  }

  return value
    .split('_')
    .map(part => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}
