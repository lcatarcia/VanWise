import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { Alert, Box, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { getCampers } from '../api/campers'
import type { FinancingScenarioInput, FinancingScenarioResult, FinancingType } from '../types/financing'

const financingLabels: Record<FinancingType, string> = {
  financing: 'Finanziamento',
  leasing: 'Leasing',
  buyBack: 'Buy back',
  rentToBuy: 'Noleggio con riscatto',
}

const defaultInput: FinancingScenarioInput = {
  vehiclePrice: 70000,
  downPayment: 10000,
  termMonths: 60,
  tanPercent: 6.5,
  taegPercent: 7.2,
  finalPayment: 0,
  type: 'financing',
}

function formatCurrency(value: number) {
  return `EUR ${value.toLocaleString('it-IT', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isNaN(parsed) ? 0 : parsed
}

function calculateScenario(input: FinancingScenarioInput): FinancingScenarioResult {
  const financedAmount = Math.max(input.vehiclePrice - input.downPayment - input.finalPayment, 0)
  const monthlyRate = input.tanPercent / 100 / 12
  const monthlyPayment = monthlyRate === 0
    ? financedAmount / input.termMonths
    : financedAmount * monthlyRate / (1 - (1 + monthlyRate) ** -input.termMonths)
  const totalCost = input.downPayment + input.finalPayment + monthlyPayment * input.termMonths

  return {
    financedAmount,
    monthlyPayment,
    totalCost,
    totalInterest: totalCost - input.vehiclePrice,
  }
}

function validateInput(input: FinancingScenarioInput) {
  return {
    vehiclePrice: input.vehiclePrice <= 0 ? 'Il prezzo deve essere maggiore di zero.' : '',
    downPayment: input.downPayment < 0 || input.downPayment > input.vehiclePrice ? 'Anticipo tra 0 e prezzo veicolo.' : '',
    termMonths: input.termMonths < 1 || input.termMonths > 240 ? 'Durata tra 1 e 240 mesi.' : '',
    tanPercent: input.tanPercent < 0 || input.tanPercent > 30 ? 'TAN tra 0 e 30%.' : '',
    taegPercent: input.taegPercent < 0 || input.taegPercent > 30 ? 'TAEG tra 0 e 30%.' : '',
    finalPayment: input.finalPayment < 0 || input.finalPayment > input.vehiclePrice ? 'Maxi rata tra 0 e prezzo veicolo.' : '',
  }
}

export function FinancingPage() {
  const campersQuery = useQuery({ queryKey: ['campers'], queryFn: getCampers, retry: false })
  const [selectedCamperId, setSelectedCamperId] = useState('')
  const [input, setInput] = useState<FinancingScenarioInput>(defaultInput)
  const errors = validateInput(input)
  const hasErrors = Object.values(errors).some(Boolean)
  const scenarios = useMemo(() => [36, 60, 84].map((termMonths) => {
    const scenarioInput = { ...input, termMonths }
    return { termMonths, result: calculateScenario(scenarioInput) }
  }), [input])
  const selectedCamper = campersQuery.data?.find((camper) => camper.id === selectedCamperId)
  const selectedCamperHelper = selectedCamper === undefined
    ? 'Inserisci prezzo o scegli un camper'
    : `Da ${selectedCamper.brand} ${selectedCamper.model}`

  function updateNumber(field: keyof FinancingScenarioInput, value: string) {
    setInput((current) => ({ ...current, [field]: parseNumber(value) }))
  }

  function selectCamper(camperId: string) {
    setSelectedCamperId(camperId)
    const camper = campersQuery.data?.find((candidate) => candidate.id === camperId)
    if (camper?.askingPrice !== null && camper?.askingPrice !== undefined) {
      setInput((current) => ({ ...current, vehiclePrice: camper.askingPrice ?? current.vehiclePrice }))
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ color: 'secondary.main', fontSize: 12, fontWeight: 900, letterSpacing: '.28em', mb: 1 }}>
          SIMULAZIONE INDICATIVA
        </Typography>
        <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} variant="h4">Finanziamenti</Typography>
        <Typography color="text.secondary">
          Stima rata, costo totale e interessi su scenari diversi. Nessuna offerta viene salvata nel MVP.
        </Typography>
      </Box>

      <Alert icon={<WarningAmberOutlinedIcon />} severity="warning">
        Calcolo indicativo non vincolante: non costituisce consulenza finanziaria ne offerta di credito.
      </Alert>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="camper-financing-label" shrink>Camper di riferimento</InputLabel>
                <Select
                  displayEmpty
                  label="Camper di riferimento"
                  labelId="camper-financing-label"
                  value={selectedCamperId}
                  onChange={(event) => selectCamper(event.target.value)}
                >
                  <MenuItem value="">Prezzo manuale</MenuItem>
                  {(campersQuery.data ?? []).map((camper) => (
                    <MenuItem key={camper.id} value={camper.id}>
                      {camper.brand} {camper.model} {camper.askingPrice === null ? '' : `- ${formatCurrency(camper.askingPrice)}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={input.type}
                onChange={(_, value: FinancingType | null) => value && setInput((current) => ({ ...current, type: value }))}
              >
                {Object.entries(financingLabels).map(([value, label]) => (
                  <ToggleButton key={value} value={value}>{label}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth error={!!errors.vehiclePrice} helperText={errors.vehiclePrice || selectedCamperHelper} label="Prezzo veicolo" slotProps={{ inputLabel: { shrink: true } }} value={input.vehiclePrice} onChange={(event) => updateNumber('vehiclePrice', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth error={!!errors.downPayment} helperText={errors.downPayment || 'Importo pagato subito'} label="Anticipo" slotProps={{ inputLabel: { shrink: true } }} value={input.downPayment} onChange={(event) => updateNumber('downPayment', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth error={!!errors.finalPayment} helperText={errors.finalPayment || 'Opzionale per leasing/buy back'} label="Maxi rata finale" slotProps={{ inputLabel: { shrink: true } }} value={input.finalPayment} onChange={(event) => updateNumber('finalPayment', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth error={!!errors.termMonths} helperText={errors.termMonths || 'Durata scenario principale'} label="Durata mesi" slotProps={{ inputLabel: { shrink: true } }} value={input.termMonths} onChange={(event) => updateNumber('termMonths', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth error={!!errors.tanPercent} helperText={errors.tanPercent || 'Tasso annuo nominale'} label="TAN %" slotProps={{ inputLabel: { shrink: true } }} value={input.tanPercent} onChange={(event) => updateNumber('tanPercent', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth error={!!errors.taegPercent} helperText={errors.taegPercent || (input.taegPercent < input.tanPercent ? 'TAEG inferiore al TAN: verifica il dato.' : 'Tasso annuo effettivo globale')} label="TAEG %" slotProps={{ inputLabel: { shrink: true } }} value={input.taegPercent} onChange={(event) => updateNumber('taegPercent', event.target.value)} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {hasErrors ? (
        <Alert severity="error">Correggi i valori evidenziati per visualizzare scenari attendibili.</Alert>
      ) : (
        <Grid container spacing={2}>
          {scenarios.map((scenario) => (
            <Grid key={scenario.termMonths} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1.25}>
                    <AccountBalanceOutlinedIcon color="secondary" />
                    <Typography variant="h6">{scenario.termMonths} mesi</Typography>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 900 }}>{formatCurrency(scenario.result.monthlyPayment)}</Typography>
                    <Typography color="text.secondary">Rata mensile stimata</Typography>
                    <Typography>Importo finanziato: <strong>{formatCurrency(scenario.result.financedAmount)}</strong></Typography>
                    <Typography>Costo totale: <strong>{formatCurrency(scenario.result.totalCost)}</strong></Typography>
                    <Typography>Interessi: <strong>{formatCurrency(scenario.result.totalInterest)}</strong></Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  )
}
