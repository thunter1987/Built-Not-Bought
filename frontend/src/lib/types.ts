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
  nickname?: string
  year: number
  make: string
  model: string
  trim?: string
  engine_code?: string
  drivetrain?: string
  transmission?: string
  curb_weight_lb?: number
  stock_hp?: number
  stock_torque_ftlb?: number
  specs: Record<string, unknown>
  created_at: string
  updated_at: string
  photos?: CarPhoto[]
}
