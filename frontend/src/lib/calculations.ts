import type { Modification } from './types'

export function calculateTotalCost(modifications: Modification[]): number {
  return modifications.reduce((sum, mod) => {
    return sum + (mod.cost ?? 0)
  }, 0)
}

export function calculateEstimatedHpGain(
  modifications: Modification[],
): number {
  return modifications.reduce((sum, mod) => {
    return sum + (mod.estimated_hp_gain ?? 0)
  }, 0)
}

export function calculateCostPerHorsepower(
  totalCost: number,
  hpGain: number,
): number | null {
  if (hpGain <= 0) {
    return null
  }

  return totalCost / hpGain
}

export function groupModificationsByCategory(
  modifications: Modification[],
): Record<string, Modification[]> {
  const grouped: Record<string, Modification[]> = {}

  for (const mod of modifications) {
    const category = mod.category

    if (!grouped[category]) {
      grouped[category] = []
    }

    grouped[category].push(mod)
  }

  return grouped
}
