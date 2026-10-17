import type { PerformanceLog, PerformanceLogType } from './types'

export const SESSION_TYPES: { value: PerformanceLogType; label: string }[] = [
  { value: 'DYNO', label: 'Dyno' },
  { value: 'ACCELERATION', label: 'Drag / Acceleration' },
  { value: 'TRACK', label: 'Track Session' },
  { value: 'BRAKING', label: 'Braking Test' },
]

export function humanizeSessionType(value?: string | null): string {
  if (!value) {
    return 'Unspecified'
  }

  const type = SESSION_TYPES.find(t => t.value === value)
  return type ? type.label : value
}

export function formatSessionResult(log: PerformanceLog): string {
  switch (log.log_type) {
    case 'DYNO':
      if (log.horsepower) {
        return `${log.horsepower} hp`
      }
      return 'No HP recorded'

    case 'ACCELERATION':
      if (log.zero_to_sixty_sec) {
        return `${log.zero_to_sixty_sec.toFixed(2)}s`
      }
      if (log.quarter_mile_sec) {
        return `${log.quarter_mile_sec.toFixed(2)}s @ ${log.quarter_mile_mph ?? '?'} mph`
      }
      return 'No time recorded'

    case 'TRACK':
      if (log.lap_time_sec) {
        const minutes = Math.floor(log.lap_time_sec / 60)
        const seconds = (log.lap_time_sec - minutes * 60)
          .toFixed(2)
          .padStart(5, '0')
        return `${minutes}:${seconds}`
      }
      return 'No lap time recorded'

    case 'BRAKING':
      if (log.sixty_to_zero_ft) {
        return `${log.sixty_to_zero_ft.toFixed(1)} ft`
      }
      return 'No distance recorded'

    default:
      return '—'
  }
}

export function getBestSessions(logs: PerformanceLog[]): {
  bestHp?: PerformanceLog
  bestZeroToSixty?: PerformanceLog
  bestQuarterMile?: PerformanceLog
  bestLap?: PerformanceLog
  bestBraking?: PerformanceLog
} {
  const dynoLogs = logs.filter(log => log.log_type === 'DYNO' && log.horsepower)
  const accelLogs = logs.filter(log => log.log_type === 'ACCELERATION')
  const trackLogs = logs.filter(
    log => log.log_type === 'TRACK' && log.lap_time_sec,
  )
  const brakingLogs = logs.filter(
    log => log.log_type === 'BRAKING' && log.sixty_to_zero_ft,
  )

  return {
    bestHp:
      dynoLogs.length > 0
        ? dynoLogs.reduce((best, log) =>
            log.horsepower! > best.horsepower! ? log : best,
          )
        : undefined,

    bestZeroToSixty: accelLogs
      .filter(log => log.zero_to_sixty_sec)
      .reduce(
        (best, log) =>
          !best || log.zero_to_sixty_sec! < best.zero_to_sixty_sec!
            ? log
            : best,
        undefined as PerformanceLog | undefined,
      ),

    bestQuarterMile: accelLogs
      .filter(log => log.quarter_mile_sec)
      .reduce(
        (best, log) =>
          !best || log.quarter_mile_sec! < best.quarter_mile_sec! ? log : best,
        undefined as PerformanceLog | undefined,
      ),

    bestLap:
      trackLogs.length > 0
        ? trackLogs.reduce((best, log) =>
            log.lap_time_sec! < best.lap_time_sec! ? log : best,
          )
        : undefined,

    bestBraking:
      brakingLogs.length > 0
        ? brakingLogs.reduce((best, log) =>
            log.sixty_to_zero_ft! < best.sixty_to_zero_ft! ? log : best,
          )
        : undefined,
  }
}
