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
  coverImageUrl?: string | null
  pricePerMeter: number
}

export interface CamperImage {
  url: string
  fileName: string
  caption: string
  sortOrder: number
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
  address: string
  latitude: number | null
  longitude: number | null
  notes: string
  sourceUrl: string
  isFavorite: boolean
  tags: string[]
  imageUrls: string[]
}

export interface UpdateCamperRequest extends CreateCamperRequest {}

export interface CamperDetail extends CamperSummary {
  transmission: string
  engine: string
  chassis: string
  sleepingPlaces: number | null
  address: string
  latitude: number | null
  longitude: number | null
  notes: string
  sourceUrl: string
  tags: string[]
  images: CamperImage[]
}

export interface CamperComparison {
  id: string
  brand: string
  model: string
  year: number | null
  askingPrice: number | null
  mileageKm: number | null
  lengthMeters: number | null
  sleepingPlaces: number | null
  transmission: string
  engine: string
  chassis: string
  pricePerMeter: number
  isFavorite: boolean
}

export interface ParsedCamper {
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
  address: string
  notes: string
  sourceUrl: string
  imageUrls: string[]
}

export interface DistributionPoint {
  label: string
  value: number
}

export interface CamperLocation {
  id: string
  brand: string
  model: string
  latitude: number
  longitude: number
}

export interface DashboardStats {
  totalCampers: number
  favoriteCampers: number
  averagePrice: number
  averageMileageKm: number
  brandDistribution: DistributionPoint[]
  priceDistribution: DistributionPoint[]
  regionDistribution: DistributionPoint[]
  camperLocations: CamperLocation[]
  latestCampers: CamperSummary[]
}
