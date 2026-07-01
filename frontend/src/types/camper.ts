export interface CamperSummary {
  id: string
  brand: string
  model: string
  year: number
  askingPrice: number
  mileageKm: number
  lengthMeters: number
  region: string
  dealerName?: string
  isFavorite: boolean
  pricePerMeter: number
}

export interface CreateCamperRequest {
  brand: string
  model: string
  year: number
  askingPrice: number
  mileageKm: number
  lengthMeters: number
  transmission: string
  engine: string
  chassis: string
  sleepingPlaces: number
  region: string
  notes: string
  sourceUrl: string
  isFavorite: boolean
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
