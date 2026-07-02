import { http } from './http'
import type { UpsertVisitChecklistRequest, VisitChecklistDto } from '../types/checklist'

export async function getVisitChecklists(camperId: string) {
  const response = await http.get<VisitChecklistDto[]>(`/campers/${camperId}/visit-checklists`)
  return response.data
}

export async function createVisitChecklist(camperId: string, request: UpsertVisitChecklistRequest) {
  const response = await http.post<VisitChecklistDto>(`/campers/${camperId}/visit-checklists`, request)
  return response.data
}

export async function updateVisitChecklist(id: string, request: UpsertVisitChecklistRequest) {
  const response = await http.put<VisitChecklistDto>(`/visit-checklists/${id}`, request)
  return response.data
}
