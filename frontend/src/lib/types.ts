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
