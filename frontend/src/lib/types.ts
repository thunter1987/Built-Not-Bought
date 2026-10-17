export type CarStatus = 'PROJECT' | 'STREET' | 'TRACK' | 'SHOW' | 'SOLD'

export type CarDiscipline =
  | 'STREET'
  | 'TIME_ATTACK'
  | 'TRACK'
  | 'DRAG'
  | 'DRIFT'
  | 'RALLY'
  | 'CANYON'
  | 'SHOW'

export type Drivetrain = 'FWD' | 'RWD' | 'AWD'

export type Transmission = 'MANUAL' | 'AUTOMATIC' | 'DCT' | 'CVT'

export type User = {
  id: string
  email: string
  username: string
  created_at: string
}

export type CarPhoto = {
  id: string
  car_id: string
  original_filename: string
  url_path: string
  content_type: string
  size_bytes: number
  created_at: string
}

export type Car = {
  id: string
  owner_id: string

  nickname?: string | null
  year: number
  make: string
  model: string
  trim?: string | null

  status?: CarStatus | null
  discipline?: CarDiscipline | null
  description?: string | null
  goals?: string | null

  engine_code?: string | null
  drivetrain?: Drivetrain | null
  transmission?: Transmission | null

  curb_weight_lb?: number | null
  stock_hp?: number | null
  stock_torque_lbft?: number | null

  specs: Record<string, unknown>

  created_at: string
  updated_at: string

  photos?: CarPhoto[]
}

export type Modification = {
  id: string
  car_id: string
  category: string
  purpose?: string | null
  name: string
  brand?: string | null
  cost?: number | null
  estimated_hp_gain?: number | null
  expected_result?: string | null
  actual_result?: string | null
  installed_at?: string | null
  notes?: string | null
  created_at: string
}

export type ModificationPayload = {
  category: string
  purpose?: string
  name: string
  brand?: string
  cost?: number
  estimated_hp_gain?: number
  expected_result?: string
  actual_result?: string
  installed_at?: string
  notes?: string
}

export type CarPayload = {
  nickname?: string
  year: number
  make: string
  model: string
  trim?: string

  status?: CarStatus
  discipline?: CarDiscipline
  description?: string
  goals?: string

  engine_code?: string
  drivetrain?: Drivetrain
  transmission?: Transmission

  curb_weight_lb?: number
  stock_hp?: number
  stock_torque_lbft?: number

  specs?: Record<string, unknown>
}

export type PerformanceLogType = 'DYNO' | 'ACCELERATION' | 'TRACK' | 'BRAKING'

export type PerformanceLogPhoto = {
  id: string
  performance_log_id: string
  original_filename: string
  url_path: string
  content_type: string
  size_bytes: number
  created_at: string
}

export type PerformanceLog = {
  id: string
  car_id: string
  log_type: PerformanceLogType
  occurred_at: string

  // Results
  horsepower?: number | null
  torque_lbft?: number | null
  zero_to_sixty_sec?: number | null
  quarter_mile_sec?: number | null
  quarter_mile_mph?: number | null
  sixty_to_zero_ft?: number | null
  lap_time_sec?: number | null

  // Conditions
  temperature_f?: number | null
  humidity_percent?: number | null
  fuel_octane?: number | null
  tire_setup?: string | null
  tire_pressure_front_psi?: number | null
  tire_pressure_rear_psi?: number | null

  // Location
  location?: string | null
  track_name?: string | null
  track_layout?: string | null

  notes?: string | null
  data: Record<string, unknown>
  created_at: string

  photos?: PerformanceLogPhoto[]
}

export type PerformanceLogPayload = {
  log_type: PerformanceLogType
  occurred_at?: string

  // Results
  horsepower?: number
  torque_lbft?: number
  zero_to_sixty_sec?: number
  quarter_mile_sec?: number
  quarter_mile_mph?: number
  sixty_to_zero_ft?: number
  lap_time_sec?: number

  // Conditions
  temperature_f?: number
  humidity_percent?: number
  fuel_octane?: number
  tire_setup?: string
  tire_pressure_front_psi?: number
  tire_pressure_rear_psi?: number

  // Location
  location?: string
  track_name?: string
  track_layout?: string

  notes?: string
  data?: Record<string, unknown>
}
export type PowerProgressionPoint = {
  date: string
  hp: number
  label: string
  point_type: 'baseline' | 'mod' | 'dyno'
}

export type LapProgressionPoint = {
  date: string
  lap_time: number
  track: string
}

export type AccelerationProgressionPoint = {
  date: string
  zero_to_sixty: number
  quarter_mile: number | null
  trap_mph: number | null
}

export type CostCategoryBreakdown = {
  category: string
  cost: number
  count: number
  hp_gain: number
}

export type CostAnalysis = {
  total_cost: number
  total_estimated_hp_gain: number
  cost_per_hp: number | null
  mod_count: number
  by_category: CostCategoryBreakdown[]
}

export type BestStats = {
  best_hp: number | null
  best_torque: number | null
  best_zero_to_sixty: number | null
  best_quarter_mile: number | null
  best_lap: number | null
  best_braking: number | null
}

export type StockVsCurrent = {
  stock_hp: number | null
  current_hp: number | null
  hp_gain: number | null
  stock_weight: number | null
  current_weight: number | null
  stock_power_to_weight: number | null
  current_power_to_weight: number | null
}

export type CarAnalytics = {
  best_stats: BestStats
  stock_vs_current: StockVsCurrent
  cost_analysis: CostAnalysis
  power_progression: PowerProgressionPoint[]
  lap_progression: Record<string, LapProgressionPoint[]>
  acceleration_progression: AccelerationProgressionPoint[]
}
