import { http } from './http'
import type { CamperSummary, CreateCamperRequest, DashboardStats } from '../types/camper'

export async function getCampers() {
  const response = await http.get<CamperSummary[]>('/campers')
  return response.data
}

export async function getDashboardStats() {
  const response = await http.get<DashboardStats>('/dashboard')
  return response.data
}

export async function createCamper(request: CreateCamperRequest) {
  const response = await http.post('/campers', request)
  return response.data
}
