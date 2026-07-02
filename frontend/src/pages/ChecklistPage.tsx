import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { Alert, Box, Button, Card, CardContent, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { getCampers } from '../api/campers'
import { createVisitChecklist, getVisitChecklists, updateVisitChecklist } from '../api/checklists'
import type { ChecklistCategory, ChecklistItemStatus, UpsertVisitChecklistRequest, VisitChecklistDto } from '../types/checklist'

interface ChecklistDraftItem {
  localKey: string
  id?: string
  category: ChecklistCategory
  description: string
  status: ChecklistItemStatus
  notes: string
}

const categories: ChecklistCategory[] = ['Esterno', 'Interno', 'Impianti', 'Meccanica']
const statusLabels: Record<ChecklistItemStatus, string> = {
  ok: 'OK',
  toVerify: 'Da verificare',
  problem: 'Problema',
}

const templateDescriptions: Record<ChecklistCategory, string[]> = {
  Esterno: ['Carrozzeria e infiltrazioni visibili', 'Pneumatici e cerchi', 'Oblo, finestre e guarnizioni'],
  Interno: ['Mobili e cerniere', 'Letti e dinette', 'Segni di umidita o odori anomali'],
  Impianti: ['Frigo, boiler e riscaldamento', 'Pompa acqua e rubinetti', 'Batteria servizi e prese'],
  Meccanica: ['Avviamento e spie cruscotto', 'Frizione/cambio o automatico', 'Storico manutenzione'],
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function toInputDate(value: string) {
  return value.slice(0, 10)
}

function createTemplateItems(): ChecklistDraftItem[] {
  return categories.flatMap((category) => templateDescriptions[category].map((description, index) => ({
    localKey: `${category}-${index}-${crypto.randomUUID()}`,
    category,
    description,
    status: 'toVerify',
    notes: '',
  })))
}

function mapChecklistToDraft(checklist: VisitChecklistDto): ChecklistDraftItem[] {
  return checklist.items.map((item) => ({
    localKey: item.id,
    id: item.id,
    category: item.category,
    description: item.description,
    status: item.status,
    notes: item.notes,
  }))
}

function toRequest(visitDate: string, items: ChecklistDraftItem[]): UpsertVisitChecklistRequest {
  return {
    visitDate: new Date(`${visitDate}T00:00:00.000Z`).toISOString(),
    items: items.map((item) => ({
      id: item.id,
      category: item.category,
      description: item.description.trim(),
      status: item.status,
      notes: item.notes.trim(),
    })),
  }
}

export function ChecklistPage() {
  const queryClient = useQueryClient()
  const campersQuery = useQuery({ queryKey: ['campers'], queryFn: getCampers, retry: false })
  const [selectedCamperId, setSelectedCamperId] = useState('')
  const [selectedChecklistId, setSelectedChecklistId] = useState('')
  const [visitDate, setVisitDate] = useState(todayInputValue())
  const [items, setItems] = useState<ChecklistDraftItem[]>(createTemplateItems)
  const checklistsQuery = useQuery({
    queryKey: ['visit-checklists', selectedCamperId],
    queryFn: () => getVisitChecklists(selectedCamperId),
    enabled: selectedCamperId.length > 0,
    retry: false,
  })
  const selectedChecklist = checklistsQuery.data?.find((checklist) => checklist.id === selectedChecklistId)
  const summary = useMemo(() => {
    const total = items.length
    const ok = items.filter((item) => item.status === 'ok').length
    const toVerify = items.filter((item) => item.status === 'toVerify').length
    const problem = items.filter((item) => item.status === 'problem').length
    return { total, ok, toVerify, problem, progress: total === 0 ? 0 : Math.round((ok / total) * 100) }
  }, [items])
  const mutation = useMutation({
    mutationFn: (request: UpsertVisitChecklistRequest) => selectedChecklistId.length === 0
      ? createVisitChecklist(selectedCamperId, request)
      : updateVisitChecklist(selectedChecklistId, request),
    onSuccess: async (savedChecklist) => {
      setSelectedChecklistId(savedChecklist.id)
      setVisitDate(toInputDate(savedChecklist.visitDate))
      setItems(mapChecklistToDraft(savedChecklist))
      await queryClient.invalidateQueries({ queryKey: ['visit-checklists', selectedCamperId] })
    },
  })

  useEffect(() => {
    if (selectedChecklist === undefined) {
      return
    }

    setVisitDate(toInputDate(selectedChecklist.visitDate))
    setItems(mapChecklistToDraft(selectedChecklist))
  }, [selectedChecklist])

  function startNewChecklist() {
    setSelectedChecklistId('')
    setVisitDate(todayInputValue())
    setItems(createTemplateItems())
  }

  function updateItem(localKey: string, update: Partial<ChecklistDraftItem>) {
    setItems((current) => current.map((item) => item.localKey === localKey ? { ...item, ...update } : item))
  }

  function addItem(category: ChecklistCategory) {
    setItems((current) => [...current, {
      localKey: `${category}-${crypto.randomUUID()}`,
      category,
      description: '',
      status: 'toVerify',
      notes: '',
    }])
  }

  function saveChecklist() {
    mutation.mutate(toRequest(visitDate, items))
  }

  const hasInvalidItems = items.some((item) => item.description.trim().length === 0)
  const canSave = selectedCamperId.length > 0 && !hasInvalidItems && items.length > 0 && !mutation.isPending

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ color: 'secondary.main', fontSize: 12, fontWeight: 900, letterSpacing: '.28em', mb: 1 }}>
          VISITA GUIDATA
        </Typography>
        <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} variant="h4">Checklist visita</Typography>
        <Typography color="text.secondary">
          Registra controlli, note e criticita prima di decidere se approfondire l'acquisto.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 5 }}>
              <FormControl fullWidth>
                <InputLabel id="checklist-camper-label" shrink>Camper</InputLabel>
                <Select
                  displayEmpty
                  label="Camper"
                  labelId="checklist-camper-label"
                  value={selectedCamperId}
                  onChange={(event) => {
                    setSelectedCamperId(event.target.value)
                    startNewChecklist()
                  }}
                >
                  <MenuItem value="">Seleziona camper</MenuItem>
                  {(campersQuery.data ?? []).map((camper) => (
                    <MenuItem key={camper.id} value={camper.id}>{camper.brand} {camper.model}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={selectedCamperId.length === 0}>
                <InputLabel id="saved-checklist-label" shrink>Checklist salvata</InputLabel>
                <Select
                  displayEmpty
                  label="Checklist salvata"
                  labelId="saved-checklist-label"
                  value={selectedChecklistId}
                  onChange={(event) => {
                    if (event.target.value.length === 0) {
                      startNewChecklist()
                      return
                    }

                    setSelectedChecklistId(event.target.value)
                  }}
                >
                  <MenuItem value="">Nuova checklist</MenuItem>
                  {(checklistsQuery.data ?? []).map((checklist) => (
                    <MenuItem key={checklist.id} value={checklist.id}>Visita {new Date(checklist.visitDate).toLocaleDateString('it-IT')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Data visita" slotProps={{ inputLabel: { shrink: true } }} type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedCamperId.length === 0 && <Alert severity="info">Seleziona un camper per creare o caricare una checklist.</Alert>}
      {checklistsQuery.isError && <Alert severity="error">Impossibile caricare le checklist del camper selezionato.</Alert>}
      {mutation.isError && <Alert severity="error">Impossibile salvare la checklist. Verifica i dati e riprova.</Alert>}
      {hasInvalidItems && <Alert severity="warning">Ogni controllo deve avere una descrizione.</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6">Avanzamento</Typography>
                <Typography color="text.secondary">
                  OK {summary.ok} · Da verificare {summary.toVerify} · Problemi {summary.problem}
                </Typography>
              </Box>
              <Button disabled={selectedCamperId.length === 0} onClick={startNewChecklist} variant="outlined">Nuova checklist</Button>
            </Stack>
            <LinearProgress aria-label="Avanzamento checklist" value={summary.progress} variant="determinate" />
            <Typography color="text.secondary">{summary.progress}% dei controlli risulta OK.</Typography>
          </Stack>
        </CardContent>
      </Card>

      {categories.map((category) => (
        <Card key={category}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">{category}</Typography>
                <Button disabled={selectedCamperId.length === 0} startIcon={<AddCircleOutlineOutlinedIcon />} onClick={() => addItem(category)} variant="outlined">
                  Aggiungi controllo
                </Button>
              </Stack>
              {items.filter((item) => item.category === category).map((item) => (
                <Grid key={item.localKey} container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth error={item.description.trim().length === 0} label="Controllo" slotProps={{ inputLabel: { shrink: true } }} value={item.description} onChange={(event) => updateItem(item.localKey, { description: event.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      value={item.status}
                      onChange={(_, value: ChecklistItemStatus | null) => value && updateItem(item.localKey, { status: value })}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <ToggleButton key={value} color={value === 'problem' ? 'error' : value === 'ok' ? 'success' : 'standard'} value={value}>{label}</ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Note" slotProps={{ inputLabel: { shrink: true } }} value={item.notes} onChange={(event) => updateItem(item.localKey, { notes: event.target.value })} />
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Card sx={{ position: 'sticky', bottom: 16, zIndex: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}>
            <Typography color="text.secondary" aria-live="polite">
              {summary.problem > 0 ? `${summary.problem} problemi da valutare prima dell'acquisto.` : 'Nessun problema segnato nella checklist.'}
            </Typography>
            <Button disabled={!canSave} startIcon={<SaveOutlinedIcon />} variant="contained" onClick={saveChecklist}>
              {mutation.isPending ? 'Salvataggio...' : selectedChecklistId.length === 0 ? 'Salva checklist' : 'Salva modifiche'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
