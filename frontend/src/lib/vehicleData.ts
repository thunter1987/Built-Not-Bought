import vehicleData from '../data/base_car_api.json'

export type VehicleTrim = string

export type VehicleModel = {
  name: string
  trims: VehicleTrim[]
}

export type VehicleMake = {
  name: string
  models: VehicleModel[]
}

export type VehicleDatabase = {
  makes: VehicleMake[]
}

const db = vehicleData as VehicleDatabase

export function getAllMakes(): VehicleMake[] {
  return db.makes
}

export function getModelsForMake(makeName: string): VehicleModel[] {
  const make = db.makes.find(
    m => m.name.toLowerCase() === makeName.toLowerCase(),
  )

  return make?.models ?? []
}

export function getTrimsForModel(
  makeName: string,
  modelName: string,
): VehicleTrim[] {
  const models = getModelsForMake(makeName)
  const model = models.find(
    m => m.name.toLowerCase() === modelName.toLowerCase(),
  )

  return model?.trims ?? []
}

/**
 * Extract the year from a trim string.
 * Example: "2020 GR Supra 3.0 2dr Coupe (3.0L 6cyl Turbo 8A)" → 2020
 */
export function extractYearFromTrim(trim: string): number | null {
  const match = trim.match(/^(\d{4})\s/)

  if (match) {
    const year = parseInt(match[1], 10)

    if (year >= 1900 && year <= 2100) {
      return year
    }
  }

  return null
}

/**
 * Extract the model name from a trim string.
 * Example: "2020 GR Supra 3.0 2dr Coupe" → "GR Supra"
 * This is a best-effort helper. The user should confirm via the model dropdown.
 */
export function extractModelFromTrim(trim: string): string | null {
  const withoutYear = trim.replace(/^\d{4}\s+/, '')
  const parts = withoutYear.split(/\s+/)

  // Heuristic: model name is usually the first 1-3 words before body style hints
  const bodyStyleHints = [
    '2dr',
    '4dr',
    '2D',
    '4D',
    'Convertible',
    'Coupe',
    'Sedan',
    'Hatchback',
  ]

  const modelParts: string[] = []

  for (const part of parts) {
    if (bodyStyleHints.some(hint => part.includes(hint))) {
      break
    }

    modelParts.push(part)
  }

  return modelParts.length > 0 ? modelParts.join(' ') : null
}
