import { zodResolver } from '@hookform/resolvers/zod'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useState, type KeyboardEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { createCamper, getCamper, getCampers, parseCamperUrl, updateCamper } from '../api/campers'
import { TrendIcon } from '../components/TrendIcon'
import { VanWiseMark } from '../components/VanWiseMark'
import type { CamperDetail, CreateCamperRequest } from '../types/camper'
import type { CamperSummary } from '../types/camper'

const columnHelper = createColumnHelper<CamperSummary>()

function formatOptionalNumber(value: number | null, options?: Intl.NumberFormatOptions) {
  return value === null ? '-' : value.toLocaleString('it-IT', options)
}

function parseOptionalNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value.replace(',', '.'))
    return Number.isNaN(parsedValue) ? value : parsedValue
  }

  return value
}

const optionalNumber = z.number().nullable()
const textFieldSlotProps = { inputLabel: { shrink: true } } as const

function CamperThumbnail({ camper }: { camper: CamperSummary }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = camper.coverImageUrl && !imageFailed

  return (
    <Box sx={{ alignItems: 'center', bgcolor: 'rgba(248,247,244,.06)', border: '1px solid rgba(248,247,244,.12)', borderRadius: 2, display: 'flex', height: 58, justifyContent: 'center', overflow: 'hidden', width: 86 }}>
      {showImage
        ? <Box alt={`${camper.brand} ${camper.model}`} component="img" src={camper.coverImageUrl ?? undefined} sx={{ height: '100%', objectFit: 'cover', width: '100%' }} onError={() => setImageFailed(true)} />
        : <VanWiseMark compact />}
    </Box>
  )
}

const columns = [
  columnHelper.display({
    id: 'cover',
    header: 'Foto',
    cell: (info) => <CamperThumbnail camper={info.row.original} />,
  }),
  columnHelper.accessor((row) => `${row.brand} ${row.model}`, {
    id: 'model',
    header: 'Camper',
    cell: (info) => (
      <>
        <TrendIcon direction={info.row.original.isFavorite ? 'up' : 'down'} />{' '}
        {info.getValue()}
      </>
    ),
  }),
  columnHelper.accessor('year', { header: 'Anno' }),
  columnHelper.accessor('askingPrice', {
    header: 'Prezzo',
    cell: (info) => (info.getValue() === null ? '-' : `EUR ${formatOptionalNumber(info.getValue())}`),
  }),
  columnHelper.accessor('mileageKm', {
    header: 'Km',
    cell: (info) => formatOptionalNumber(info.getValue()),
  }),
  columnHelper.accessor('region', { header: 'Regione' }),
  columnHelper.accessor('city', { header: 'Città' }),
  columnHelper.accessor('pricePerMeter', {
    header: 'EUR/m',
    cell: (info) => `EUR ${info.getValue().toLocaleString('it-IT', { maximumFractionDigits: 0 })}`,
  }),
]

const camperFormSchema = z.object({
  brand: z.string().min(1, 'Marca obbligatoria').max(100),
  model: z.string().min(1, 'Modello obbligatorio').max(120),
  year: optionalNumber.refine((value) => value === null || Number.isInteger(value), 'Inserisci un anno valido').refine((value) => value === null || (value >= 1980 && value <= new Date().getFullYear() + 1), 'Anno non valido'),
  askingPrice: optionalNumber.refine((value) => value === null || value > 0, 'Il prezzo deve essere maggiore di zero'),
  mileageKm: optionalNumber.refine((value) => value === null || (Number.isInteger(value) && value >= 0), 'Inserisci km validi'),
  lengthMeters: optionalNumber.refine((value) => value === null || (value >= 3 && value <= 12), 'La lunghezza deve essere tra 3 e 12 m'),
  transmission: z.string().max(60),
  engine: z.string().max(120),
  chassis: z.string().max(120),
  sleepingPlaces: optionalNumber.refine((value) => value === null || (Number.isInteger(value) && value >= 1 && value <= 10), 'Inserisci posti letto validi'),
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

export function CampersPage() {
  const queryClient = useQueryClient()
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [editingCamperId, setEditingCamperId] = useState<string | null>(null)
  const [loadingCamperId, setLoadingCamperId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const { data = [] } = useQuery({ queryKey: ['campers'], queryFn: getCampers, retry: false })
  const form = useForm<CamperFormValues>({ resolver: zodResolver(camperFormSchema), defaultValues })
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
  const mutation = useMutation({
    mutationFn: (request: CreateCamperRequest) => (editingCamperId === null ? createCamper(request) : updateCamper(editingCamperId, request)),
    onSuccess: async () => {
      resetForm()
      await queryClient.invalidateQueries({ queryKey: ['campers'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
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

  function resetForm() {
    form.reset(defaultValues)
    setTags([])
    setImageUrls([])
    setTagInput('')
    setEditingCamperId(null)
    setLoadError(false)
  }

  function handleSubmit(values: CamperFormValues) {
    const submittedTags = [...tags, tagInput.trim()].reduce<string[]>((uniqueTags, tag) => {
      if (tag.length > 0 && !uniqueTags.some((uniqueTag) => uniqueTag.toLocaleLowerCase() === tag.toLocaleLowerCase())) {
        uniqueTags.push(tag)
      }

      return uniqueTags
    }, [])
    const request: CreateCamperRequest = {
      ...values,
      latitude: null,
      longitude: null,
      tags: submittedTags,
      imageUrls,
    }

    mutation.mutate(request)
  }

  function parseCurrentUrl() {
    const sourceUrl = form.getValues('sourceUrl').trim()
    if (sourceUrl.length === 0) {
      form.setError('sourceUrl', { message: 'Inserisci una URL da parsare.' })
      return
    }

    parseMutation.mutate(sourceUrl)
  }

  async function editCamper(camper: CamperSummary) {
    setLoadError(false)
    setLoadingCamperId(camper.id)

    try {
      const detail = await queryClient.fetchQuery({
        queryKey: ['campers', camper.id],
        queryFn: () => getCamper(camper.id),
      })

      form.reset(toFormValues(detail))
      setTags([...detail.tags])
      setImageUrls(detail.images.map((image) => image.url))
      setTagInput('')
      setEditingCamperId(detail.id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setLoadError(true)
    } finally {
      setLoadingCamperId(null)
    }
  }

  function addTag() {
    const trimmedTag = tagInput.trim()
    if (trimmedTag.length === 0 || tags.some((tag) => tag.toLocaleLowerCase() === trimmedTag.toLocaleLowerCase())) {
      return
    }

    setTags((currentTags) => [...currentTags, trimmedTag])
    setTagInput('')
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    addTag()
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ color: 'secondary.main', fontSize: 12, fontWeight: 900, letterSpacing: '.28em', mb: 1 }}>
          GARAGE INTELLIGENTE
        </Typography>
        <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} variant="h4">Camper</Typography>
        <Typography color="text.secondary">
          Inserisci manualmente i dati e, se parti da un annuncio online, salva anche il link sorgente.
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <Stack component="form" spacing={3} onSubmit={form.handleSubmit(handleSubmit)}>
            <Typography variant="h6">{editingCamperId === null ? 'Nuovo camper' : 'Modifica camper'}</Typography>
            {loadError && <Alert severity="error">Impossibile caricare il camper selezionato. Riprova.</Alert>}
            {mutation.isError && <Alert severity="error">Impossibile salvare il camper. Controlla i dati e riprova.</Alert>}
            {parseMutation.isError && <Alert severity="error">Impossibile parsare la URL. Controlla che la pagina sia pubblica e riprova.</Alert>}
            <Card sx={{ bgcolor: 'rgba(123,174,127,.08)', border: '1px solid rgba(123,174,127,.22)' }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', md: 'flex-start' } }}>
                  <TextField
                    fullWidth
                    label="Inserisci solo la URL annuncio"
                    placeholder="https://..."
                    slotProps={textFieldSlotProps}
                    {...form.register('sourceUrl')}
                    error={!!form.formState.errors.sourceUrl}
                    helperText={form.formState.errors.sourceUrl?.message ?? 'VanWise proverà a compilare dati e foto automaticamente.'}
                  />
                  <Button
                    startIcon={<AutoFixHighOutlinedIcon />}
                    type="button"
                    variant="contained"
                    onClick={parseCurrentUrl}
                    disabled={parseMutation.isPending}
                    sx={{ minWidth: { md: 190 } }}
                  >
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
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="URL annuncio" placeholder="https://..." slotProps={textFieldSlotProps} {...form.register('sourceUrl')} error={!!form.formState.errors.sourceUrl} helperText={form.formState.errors.sourceUrl?.message ?? 'Opzionale: pagina web da cui hai preso i dati'} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Anno" slotProps={textFieldSlotProps} type="number" {...form.register('year', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.year} helperText={form.formState.errors.year?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Prezzo" slotProps={textFieldSlotProps} type="number" {...form.register('askingPrice', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.askingPrice} helperText={form.formState.errors.askingPrice?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Km" slotProps={textFieldSlotProps} type="number" {...form.register('mileageKm', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.mileageKm} helperText={form.formState.errors.mileageKm?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Lunghezza (m)" inputMode="decimal" placeholder="6,5" slotProps={textFieldSlotProps} {...form.register('lengthMeters', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.lengthMeters} helperText={form.formState.errors.lengthMeters?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Cambio" slotProps={textFieldSlotProps} {...form.register('transmission')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Motore" slotProps={textFieldSlotProps} {...form.register('engine')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Telaio" slotProps={textFieldSlotProps} {...form.register('chassis')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Posti letto" slotProps={textFieldSlotProps} type="number" {...form.register('sleepingPlaces', { setValueAs: parseOptionalNumber })} error={!!form.formState.errors.sleepingPlaces} helperText={form.formState.errors.sleepingPlaces?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Regione" slotProps={textFieldSlotProps} {...form.register('region')} error={!!form.formState.errors.region} helperText={form.formState.errors.region?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Città" slotProps={textFieldSlotProps} {...form.register('city')} error={!!form.formState.errors.city} helperText={form.formState.errors.city?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Indirizzo" placeholder="es. Via Roma 1, Milano" slotProps={textFieldSlotProps} {...form.register('address')} error={!!form.formState.errors.address} helperText={form.formState.errors.address?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Tag" placeholder="Scrivi un tag e premi Invio" slotProps={textFieldSlotProps} value={tagInput} onBlur={addTag} onChange={(event) => setTagInput(event.target.value)} onKeyDown={handleTagKeyDown} />
                {tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {tags.map((tag) => (
                      <Chip key={tag} label={tag} onDelete={() => setTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag))} />
                    ))}
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  control={form.control}
                  name="isFavorite"
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Segna come preferito"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline minRows={3} label="Note" slotProps={textFieldSlotProps} {...form.register('notes')} />
              </Grid>
              {imageUrls.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography sx={{ mb: 1, fontWeight: 800 }}>Foto estratte dalla URL</Typography>
                  <Grid container spacing={2}>
                    {imageUrls.map((imageUrl) => (
                      <Grid key={imageUrl} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card sx={{ overflow: 'hidden' }}>
                          <CardMedia component="img" image={imageUrl} sx={{ aspectRatio: '16 / 10', objectFit: 'cover' }} />
                          <CardContent sx={{ p: 1 }}>
                            <Button color="error" fullWidth size="small" type="button" variant="text" onClick={() => setImageUrls((current) => current.filter((url) => url !== imageUrl))}>
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
            <Box>
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvataggio...' : editingCamperId === null ? 'Aggiungi camper' : 'Salva modifiche'}
              </Button>
              {editingCamperId !== null && (
                <Button sx={{ ml: 2 }} type="button" variant="outlined" onClick={resetForm} disabled={mutation.isPending}>
                  Annulla modifica
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 820 }}>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                    <TableCell>Azioni</TableCell>
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                <TableRow sx={{ bgcolor: 'rgba(123,174,127,.18)' }}>
                  <TableCell colSpan={columns.length + 1} sx={{ borderLeft: '4px solid #E9A03B', fontWeight: 900 }}>
                    <AddBoxOutlinedIcon fontSize="inherit" sx={{ mr: 1 }} />
                    Camper monitorati
                  </TableCell>
                </TableRow>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(248,247,244,.04)' }, '&:hover': { bgcolor: 'rgba(123,174,127,.10)' } }}>
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell key={cell.id} sx={{ fontWeight: index === 0 ? 700 : 500 }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          component={Link}
                          size="small"
                          startIcon={<VisibilityOutlinedIcon />}
                          to={`/campers/${row.original.id}`}
                          variant="outlined"
                        >
                          Dettaglio
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          variant="outlined"
                          onClick={() => void editCamper(row.original)}
                          disabled={mutation.isPending || loadingCamperId === row.original.id}
                        >
                          {loadingCamperId === row.original.id ? 'Carico...' : 'Modifica'}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1}>
                      <Typography color="text.secondary">Compila la form qui sopra per aggiungere il primo camper.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}
