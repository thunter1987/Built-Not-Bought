export const MODIFICATION_CATEGORIES = [
  { value: 'ENGINE', label: 'Engine' },
  { value: 'TURBO_SUPERCHARGER', label: 'Turbo / Supercharger' },
  { value: 'EXHAUST', label: 'Exhaust' },
  { value: 'INTAKE', label: 'Intake' },
  { value: 'COOLING', label: 'Cooling' },
  { value: 'ECU', label: 'ECU / Tune' },
  { value: 'SUSPENSION', label: 'Suspension' },
  { value: 'BRAKES', label: 'Brakes' },
  { value: 'WHEELS', label: 'Wheels' },
  { value: 'TIRES', label: 'Tires' },
  { value: 'AERO', label: 'Aero' },
  { value: 'DRIVETRAIN', label: 'Drivetrain' },
  { value: 'INTERIOR_WEIGHT', label: 'Interior / Weight' },
  { value: 'RELIABILITY', label: 'Reliability' },
]

export const MODIFICATION_PURPOSES = [
  { value: 'POWER', label: 'Power' },
  { value: 'HANDLING', label: 'Handling' },
  { value: 'BRAKING', label: 'Braking' },
  { value: 'WEIGHT_REDUCTION', label: 'Weight Reduction' },
  { value: 'COOLING', label: 'Cooling' },
  { value: 'RELIABILITY', label: 'Reliability' },
  { value: 'SOUND', label: 'Sound' },
  { value: 'AERO', label: 'Aero' },
  { value: 'GRIP', label: 'Grip' },
  { value: 'APPEARANCE', label: 'Appearance' },
]

export function humanizeCategory(value?: string | null): string {
  if (!value) {
    return 'Unspecified'
  }

  return value
    .split('_')
    .map(part => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}

export function humanizePurpose(value?: string | null): string {
  if (!value) {
    return 'Unspecified'
  }

  return value
    .split('_')
    .map(part => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}
