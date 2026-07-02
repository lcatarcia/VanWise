import { http } from './http'
import type { CamperDetail, CamperSummary, CreateCamperRequest, DashboardStats, ParsedCamper, UpdateCamperRequest } from '../types/camper'

export async function getCampers() {
  const response = await http.get<CamperSummary[]>('/campers')
  return response.data
}

export async function getCamper(id: string) {
  const response = await http.get<CamperDetail>(`/campers/${id}`)
  return response.data
}

export async function getDashboardStats() {
  const response = await http.get<DashboardStats>('/dashboard')
  return response.data
}

export async function createCamper(request: CreateCamperRequest) {
  const response = await http.post<CamperDetail>('/campers', request)
  return response.data
}

export async function updateCamper(id: string, request: UpdateCamperRequest) {
  const response = await http.put<CamperDetail>(`/campers/${id}`, request)
  return response.data
}

export async function parseCamperUrl(url: string) {
  const response = await http.post<ParsedCamper>('/campers/parse-url', { url })
  return response.data
}
