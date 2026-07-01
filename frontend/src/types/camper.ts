export interface CamperSummary {
  id: string
  brand: string
  model: string
  year: number | null
  askingPrice: number | null
  mileageKm: number | null
  lengthMeters: number | null
  region: string
  city: string
  dealerName?: string
  isFavorite: boolean
  pricePerMeter: number
}

export interface CreateCamperRequest {
  brand: string
  model: string
  year: number | null
  askingPrice: number | null
  mileageKm: number | null
  lengthMeters: number | null
  transmission: string
  engine: string
  chassis: string
  sleepingPlaces: number | null
  region: string
  city: string
  notes: string
  sourceUrl: string
  isFavorite: boolean
  tags: string[]
}

export interface UpdateCamperRequest extends CreateCamperRequest {}

export interface CamperDetail extends CamperSummary {
  transmission: string
  engine: string
  chassis: string
  sleepingPlaces: number | null
  notes: string
  sourceUrl: string
  tags: string[]
}

export interface DistributionPoint {
  label: string
  value: number
}

export interface DashboardStats {
  totalCampers: number
  favoriteCampers: number
  averagePrice: number
  averageMileageKm: number
  brandDistribution: DistributionPoint[]
  priceDistribution: DistributionPoint[]
  lengthDistribution: DistributionPoint[]
  latestCampers: CamperSummary[]
}
