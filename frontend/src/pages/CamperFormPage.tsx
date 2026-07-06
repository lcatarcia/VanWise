import { zodResolver } from '@hookform/resolvers/zod'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type KeyboardEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { createCamper, getCamper, parseCamperUrl, updateCamper } from '../api/campers'
import type { CamperDetail, CreateCamperRequest } from '../types/camper'

function parseOptionalNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isNaN(value) ? null : value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'))
    return Number.isNaN(parsed) ? value : parsed
  }
  return value
}

const optionalNumber = z.number().nullable()
const textFieldSlotProps = { inputLabel: { shrink: true } } as const

const camperFormSchema = z.object({
  brand: z.string().min(1, 'Marca obbligatoria').max(100),
  model: z.string().min(1, 'Modello obbligatorio').max(120),
  year: optionalNumber.refine((v) => v === null || Number.isInteger(v), 'Inserisci un anno valido').refine((v) => v === null || (v >= 1980 && v <= new Date().getFullYear() + 1), 'Anno non valido'),
  askingPrice: optionalNumber.refine((v) => v === null || v > 0, 'Il prezzo deve essere maggiore di zero'),
  mileageKm: optionalNumber.refine((v) => v === null || (Number.isInteger(v) && v >= 0), 'Inserisci km validi'),
  lengthMeters: optionalNumber.refine((v) => v === null || (v >= 3 && v <= 12), 'La lunghezza deve essere tra 3 e 12 m'),
  transmission: z.string().max(60),
  engine: z.string().max(120),
  chassis: z.string().max(120),
  sleepingPlaces: optionalNumber.refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 10), 'Inserisci posti letto validi'),
  region: z.string().max(80),
  city: z.string().max(80),
  address: z.string().max(200),
  notes: z.string().max(4000),
  sourceUrl: z.union([z.url('Inserisci un URL valido'), z.literal('')]),
  isFavorite: z.boolean(),
})

type CamperFormValues = z.infer<typeof camperFormSchema>

const defaultValues: CamperFormValues = {
  brand: '',
  model: '',
  year: null,
  askingPrice: null,
  mileageKm: null,
  lengthMeters: null,
  transmission: '',
  engine: '',
  chassis: '',
  sleepingPlaces: null,
  region: '',
  city: '',
  address: '',
  notes: '',
  sourceUrl: '',
  isFavorite: false,
}

function toFormValues(camper: CamperDetail): CamperFormValues {
  return {
    brand: camper.brand,
    model: camper.model,
    year: camper.year,
    askingPrice: camper.askingPrice,
    mileageKm: camper.mileageKm,
    lengthMeters: camper.lengthMeters,
    transmission: camper.transmission,
    engine: camper.engine,
    chassis: camper.chassis,
    sleepingPlaces: camper.sleepingPlaces,
    region: camper.region,
    city: camper.city,
    address: camper.address,
    notes: camper.notes,
    sourceUrl: camper.sourceUrl,
    isFavorite: camper.isFavorite,
  }
}

export function CamperFormPage() {
  const { id } = useParams()
  const isEditing = id !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [synced, setSynced] = useState(false)

  const { data: camperDetail, isLoading: isLoadingCamper, isError: loadError } = useQuery({
    queryKey: ['campers', id],
    queryFn: () => getCamper(id!),
    enabled: isEditing,
    retry: false,
  })

  const form = useForm<CamperFormValues>({
    resolver: zodResolver(camperFormSchema),
    defaultValues,
    values: camperDetail ? toFormValues(camperDetail) : undefined,
  })

  if (camperDetail && !synced) {
    setTags([...camperDetail.tags])
    setImageUrls(camperDetail.images.map((img) => img.url))
    setSynced(true)
  }

  const mutation = useMutation({
    mutationFn: (request: CreateCamperRequest) => (isEditing ? updateCamper(id!, request) : createCamper(request)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['campers'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/campers')
    },
  })

  const parseMutation = useMutation({
    mutationFn: parseCamperUrl,
    onSuccess: (parsedCamper) => {
      form.reset({
        brand: parsedCamper.brand,
        model: parsedCamper.model,
        year: parsedCamper.year,
        askingPrice: parsedCamper.askingPrice,
        mileageKm: parsedCamper.mileageKm,
        lengthMeters: parsedCamper.lengthMeters,
        transmission: parsedCamper.transmission,
        engine: parsedCamper.engine,
        chassis: parsedCamper.chassis,
        sleepingPlaces: parsedCamper.sleepingPlaces,
        region: parsedCamper.region,
        city: parsedCamper.city,
        address: parsedCamper.address,
        notes: parsedCamper.notes,
        sourceUrl: parsedCamper.sourceUrl,
        isFavorite: form.getValues('isFavorite'),
      })
      setImageUrls(parsedCamper.imageUrls)
    },
  })

  if (isEditing && !id) return <Navigate to="/campers" replace />

  if (isEditing && isLoadingCamper) {
    return <Stack spacing={3}><Typography variant="h5">Caricamento...</Typography></Stack>
  }

  if (isEditing && loadError) {
    return (
      <Stack spacing={3}>
        <Alert severity="error">Impossibile caricare il camper selezionato.</Alert>
        <Button component={Link} to="/campers" startIcon={<ArrowBackOutlinedIcon />} variant="outlined">Torna alla lista</Button>
      </Stack>
    )
  }

  function handleSubmit(values: CamperFormValues) {
    const submittedTags = [...tags, tagInput.trim()].reduce<string[]>((acc, tag) => {
      if (tag.length > 0 && !acc.some((t) => t.toLocaleLowerCase() === tag.toLocaleLowerCase())) acc.push(tag)
      return acc
    }, [])
    mutation.mutate({ ...values, tags: submittedTags, imageUrls })
  }

  function parseCurrentUrl() {
    const sourceUrl = form.getValues('sourceUrl').trim()
    if (sourceUrl.length === 0) {
      form.setError('sourceUrl', { message: 'Inserisci una URL da parsare.' })
      return
    }
    parseMutation.mutate(sourceUrl)
  }

  function addTag() {
    const trimmed = tagInput.trim()
    if (trimmed.length === 0 || tags.some((t) => t.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) return
    setTags((cur) => [...cur, trimmed])
    setTagInput('')
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') { event.preventDefault(); addTag() }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button component={Link} to="/campers" startIcon={<ArrowBackOutlinedIcon />} variant="text" sx={{ mb: 1 }}>
          Torna alla lista
        </Button>
        <Typography sx={{ color: 'secondary.main', fontSize: 12, fontWeight: 900, letterSpacing: '.28em', mb: 1 }}>
          {isEditing ? 'MODIFICA' : 'NUOVO CAMPER'}
        </Typography>
        <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }} variant="h4">
          {isEditing ? 'Modifica camper' : 'Aggiungi camper'}
        </Typography>
        <Typography color="text.secondary">
          Inserisci i dati manualmente o incolla un URL per compilare automaticamente.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack component="form" spacing={3} onSubmit={form.handleSubmit(handleSubmit)}>
            {mutation.isError && <Alert severity="error">Impossibile salvare il camper. Controlla i dati e riprova.</Alert>}
            {parseMutation.isError && <Alert severity="error">Impossibile parsare la URL. Controlla che la pagina sia pubblica e riprova.</Alert>}

            <Card sx={{ bgcolor: 'rgba(123,174,127,.08)', border: '1px solid rgba(123,174,127,.22)' }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', md: 'flex-start' } }}>
                  <TextField
                    fullWidth
                    label="URL annuncio"
                    placeholder="https://..."
                    slotProps={textFieldSlotProps}
                    {...form.register('sourceUrl')}
                    error={!!form.formState.errors.sourceUrl}
                    helperText={form.formState.errors.sourceUrl?.message ?? 'VanWise compilerà dati e foto automaticamente.'}
                  />
                  <Button startIcon={<AutoFixHighOutlinedIcon />} type="button" variant="contained" onClick={parseCurrentUrl} disabled={parseMutation.isPending} sx={{ minWidth: { md: 190 } }}>
                    {parseMutation.isPending ? 'Parsing...' : 'Compila da URL'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Marca" slotProps={textFieldSlotProps} {...form.register('brand')} error={!!form.formState.errors.brand} helperText={form.formState.errors.brand?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Modello" slotProps={textFieldSlotProps} {...form.register('model')} error={!!form.formState.errors.model} helperText={form.formState.errors.model?.message} />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField fullWidth label="Anno" slotProps={textFieldSlotProps} type="number" {...form.register('year', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.year} helperText={form.formState.errors.year?.message} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField fullWidth label="Prezzo (€)" slotProps={textFieldSlotProps} type="number" {...form.register('askingPrice', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.askingPrice} helperText={form.formState.errors.askingPrice?.message} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField fullWidth label="Km" slotProps={textFieldSlotProps} type="number" {...form.register('mileageKm', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.mileageKm} helperText={form.formState.errors.mileageKm?.message} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField fullWidth label="Lunghezza (m)" inputMode="decimal" placeholder="6,5" slotProps={textFieldSlotProps} {...form.register('lengthMeters', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.lengthMeters} helperText={form.formState.errors.lengthMeters?.message} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField fullWidth label="Posti letto" slotProps={textFieldSlotProps} type="number" {...form.register('sleepingPlaces', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.sleepingPlaces} helperText={form.formState.errors.sleepingPlaces?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Cambio" slotProps={textFieldSlotProps} {...form.register('transmission')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Motore" slotProps={textFieldSlotProps} {...form.register('engine')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Telaio" slotProps={textFieldSlotProps} {...form.register('chassis')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Regione" slotProps={textFieldSlotProps} {...form.register('region')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Città" slotProps={textFieldSlotProps} {...form.register('city')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Indirizzo" placeholder="es. Via Roma 1" slotProps={textFieldSlotProps} {...form.register('address')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Tag" placeholder="Scrivi e premi Invio" slotProps={textFieldSlotProps} value={tagInput} onBlur={addTag} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} />
                {tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {tags.map((tag) => (
                      <Chip key={tag} label={tag} onDelete={() => setTags((cur) => cur.filter((t) => t !== tag))} />
                    ))}
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  control={form.control}
                  name="isFavorite"
                  render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Segna come preferito" />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline minRows={3} label="Note" slotProps={textFieldSlotProps} {...form.register('notes')} />
              </Grid>
              {imageUrls.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography sx={{ mb: 1, fontWeight: 800 }}>Foto estratte</Typography>
                  <Grid container spacing={2}>
                    {imageUrls.map((url) => (
                      <Grid key={url} size={{ xs: 6, sm: 4, md: 3 }}>
                        <Card sx={{ overflow: 'hidden' }}>
                          <CardMedia component="img" image={url} sx={{ aspectRatio: '16 / 10', objectFit: 'cover' }} />
                          <CardContent sx={{ p: 1 }}>
                            <Button color="error" fullWidth size="small" type="button" variant="text" onClick={() => setImageUrls((cur) => cur.filter((u) => u !== url))}>
                              Rimuovi
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvataggio...' : isEditing ? 'Salva modifiche' : 'Aggiungi camper'}
              </Button>
              <Button component={Link} to="/campers" variant="outlined" disabled={mutation.isPending}>
                Annulla
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
