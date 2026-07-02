import DifferenceOutlinedIcon from '@mui/icons-material/DifferenceOutlined'
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import { Alert, Autocomplete, Box, Button, Card, CardContent, Chip, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { compareCampers, getCampers } from '../api/campers'
import type { CamperComparison, CamperSummary } from '../types/camper'

function formatNumber(value: number | null, suffix = '') {
  return value === null ? '-' : `${value.toLocaleString('it-IT')}${suffix}`
}

function formatCurrency(value: number | null) {
  return value === null ? '-' : `EUR ${value.toLocaleString('it-IT')}`
}

function bestValue(values: CamperComparison[], selector: (camper: CamperComparison) => number | null, direction: 'min' | 'max') {
  const numericValues = values.map(selector).filter((value): value is number => value !== null)
  if (numericValues.length === 0) {
    return null
  }

  return direction === 'min' ? Math.min(...numericValues) : Math.max(...numericValues)
}

export function ComparatorPage() {
  const [selectedCampers, setSelectedCampers] = useState<CamperSummary[]>([])
  const selectedIds = selectedCampers.map((camper) => camper.id)
  const canCompare = selectedIds.length >= 2 && selectedIds.length <= 4
  const campersQuery = useQuery({ queryKey: ['campers'], queryFn: getCampers, retry: false })
  const comparisonQuery = useQuery({
    queryKey: ['campers', 'compare', selectedIds],
    queryFn: () => compareCampers(selectedIds),
    enabled: canCompare,
    retry: false,
  })

  const orderedComparison = selectedIds
    .map((id) => comparisonQuery.data?.find((camper) => camper.id === id))
    .filter((camper): camper is CamperComparison => camper !== undefined)

  const rows = [
    { label: 'Prezzo', value: (camper: CamperComparison) => formatCurrency(camper.askingPrice), best: bestValue(orderedComparison, (camper) => camper.askingPrice, 'min') },
    { label: 'Km', value: (camper: CamperComparison) => formatNumber(camper.mileageKm), best: bestValue(orderedComparison, (camper) => camper.mileageKm, 'min') },
    { label: 'Anno', value: (camper: CamperComparison) => formatNumber(camper.year), best: bestValue(orderedComparison, (camper) => camper.year, 'max') },
    {
      label: 'EUR/m',
      value: (camper: CamperComparison) => camper.askingPrice === null || camper.lengthMeters === null || camper.lengthMeters <= 0 ? '-' : `EUR ${camper.pricePerMeter.toLocaleString('it-IT', { maximumFractionDigits: 0 })}`,
      best: bestValue(orderedComparison, (camper) => camper.askingPrice === null || camper.lengthMeters === null || camper.lengthMeters <= 0 ? null : camper.pricePerMeter, 'min'),
    },
    { label: 'Lunghezza', value: (camper: CamperComparison) => formatNumber(camper.lengthMeters, ' m') },
    { label: 'Posti letto', value: (camper: CamperComparison) => formatNumber(camper.sleepingPlaces), best: bestValue(orderedComparison, (camper) => camper.sleepingPlaces, 'max') },
    { label: 'Cambio', value: (camper: CamperComparison) => camper.transmission || '-' },
    { label: 'Motore', value: (camper: CamperComparison) => camper.engine || '-' },
    { label: 'Telaio', value: (camper: CamperComparison) => camper.chassis || '-' },
  ]

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ color: 'secondary.main', fontSize: 12, fontWeight: 900, letterSpacing: '.28em', mb: 1 }}>
          ANALISI AFFIANCATA
        </Typography>
        <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} variant="h4">Comparatore</Typography>
        <Typography color="text.secondary">
          Seleziona da 2 a 4 camper e confronta prezzi, chilometri, caratteristiche e valore al metro.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              getOptionLabel={(option) => `${option.brand} ${option.model}`}
              loading={campersQuery.isLoading}
              options={campersQuery.data ?? []}
              value={selectedCampers}
              onChange={(_, value) => setSelectedCampers(value.slice(0, 4))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Camper da confrontare"
                  helperText="Minimo 2, massimo 4 camper. L'ordine di selezione viene mantenuto nella matrice."
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            {selectedCampers.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {selectedCampers.map((camper) => (
                  <Chip key={camper.id} label={`${camper.brand} ${camper.model}`} onDelete={() => setSelectedCampers((current) => current.filter((selected) => selected.id !== camper.id))} />
                ))}
              </Stack>
            )}
            {!canCompare && <Alert severity="info">Seleziona almeno 2 camper per avviare il confronto.</Alert>}
            {comparisonQuery.isError && <Alert severity="error">Impossibile confrontare i camper selezionati. Controlla che siano ancora presenti.</Alert>}
          </Stack>
        </CardContent>
      </Card>

      {canCompare && orderedComparison.length > 0 && (
        <>
          <Grid container spacing={2}>
            {orderedComparison.map((camper) => (
              <Grid key={camper.id} size={{ xs: 12, md: 6, xl: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 900 }}>{camper.brand} {camper.model}</Typography>
                        {camper.isFavorite && <Chip color="secondary" icon={<FavoriteOutlinedIcon />} label="Preferito" size="small" />}
                      </Stack>
                      <Typography color="text.secondary">Prezzo {formatCurrency(camper.askingPrice)} · Km {formatNumber(camper.mileageKm)}</Typography>
                      <Button component={Link} size="small" startIcon={<OpenInNewOutlinedIcon />} to={`/campers/${camper.id}`} variant="outlined">
                        Dettaglio
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 860 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Parametro</TableCell>
                      {orderedComparison.map((camper) => (
                        <TableCell key={camper.id}>{camper.brand} {camper.model}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell sx={{ fontWeight: 900 }}>
                          <DifferenceOutlinedIcon fontSize="inherit" sx={{ mr: 1 }} />
                          {row.label}
                        </TableCell>
                        {orderedComparison.map((camper) => {
                          const rawValue = row.label === 'Prezzo' ? camper.askingPrice : row.label === 'Km' ? camper.mileageKm : row.label === 'Anno' ? camper.year : row.label === 'EUR/m' ? camper.pricePerMeter : row.label === 'Posti letto' ? camper.sleepingPlaces : null
                          const isBest = row.best !== undefined && row.best !== null && rawValue === row.best
                          return (
                            <TableCell key={camper.id} sx={{ bgcolor: isBest ? 'rgba(123,174,127,.16)' : undefined, fontWeight: isBest ? 900 : 500 }}>
                              {row.value(camper)}
                              {isBest && <Chip color="primary" label="Migliore" size="small" sx={{ ml: 1 }} />}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  )
}
