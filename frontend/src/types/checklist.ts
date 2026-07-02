export type ChecklistItemStatus = 'ok' | 'toVerify' | 'problem'
export type ChecklistCategory = 'Esterno' | 'Interno' | 'Impianti' | 'Meccanica'

export interface ChecklistItemDto {
  id: string
  category: ChecklistCategory
  description: string
  status: ChecklistItemStatus
  notes: string
}

export interface VisitChecklistDto {
  id: string
  camperId: string
  visitDate: string
  items: ChecklistItemDto[]
}

export interface UpsertChecklistItemRequest {
  id?: string
  category: ChecklistCategory
  description: string
  status: ChecklistItemStatus
  notes: string
}

export interface UpsertVisitChecklistRequest {
  visitDate: string
  items: UpsertChecklistItemRequest[]
}
