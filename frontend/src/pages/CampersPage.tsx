import { zodResolver } from '@hookform/resolvers/zod'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { createCamper, getCampers } from '../api/campers'
import { TrendIcon } from '../components/TrendIcon'
import type { CreateCamperRequest } from '../types/camper'
import type { CamperSummary } from '../types/camper'

const columnHelper = createColumnHelper<CamperSummary>()

const columns = [
  columnHelper.accessor((row) => `${row.brand} ${row.model}`, { id: 'model', header: 'Camper' }),
  columnHelper.accessor('year', { header: 'Anno' }),
  columnHelper.accessor('askingPrice', {
    header: 'Prezzo',
    cell: (info) => `EUR ${info.getValue().toLocaleString('it-IT')}`,
  }),
  columnHelper.accessor('mileageKm', {
    header: 'Km',
    cell: (info) => info.getValue().toLocaleString('it-IT'),
  }),
  columnHelper.accessor('region', { header: 'Regione' }),
  columnHelper.accessor('pricePerMeter', {
    header: 'EUR/m',
    cell: (info) => `EUR ${info.getValue().toLocaleString('it-IT', { maximumFractionDigits: 0 })}`,
  }),
]

const camperFormSchema = z.object({
  brand: z.string().min(1, 'Marca obbligatoria').max(100),
  model: z.string().min(1, 'Modello obbligatorio').max(120),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  askingPrice: z.number().positive('Prezzo obbligatorio'),
  mileageKm: z.number().int().min(0),
  lengthMeters: z.number().min(3).max(12),
  transmission: z.string().max(60),
  engine: z.string().max(120),
  chassis: z.string().max(120),
  sleepingPlaces: z.number().int().min(1).max(10),
  region: z.string().min(1, 'Regione obbligatoria').max(80),
  notes: z.string().max(4000),
  sourceUrl: z.union([z.url('Inserisci un URL valido'), z.literal('')]),
  isFavorite: z.boolean(),
  tags: z.string(),
})

type CamperFormValues = z.infer<typeof camperFormSchema>

const defaultValues: CamperFormValues = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  askingPrice: 0,
  mileageKm: 0,
  lengthMeters: 6.5,
  transmission: '',
  engine: '',
  chassis: '',
  sleepingPlaces: 4,
  region: '',
  notes: '',
  sourceUrl: '',
  isFavorite: false,
  tags: '',
}

export function CampersPage() {
  const queryClient = useQueryClient()
  const { data = [] } = useQuery({ queryKey: ['campers'], queryFn: getCampers, retry: false })
  const form = useForm<CamperFormValues>({ resolver: zodResolver(camperFormSchema), defaultValues })
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
  const mutation = useMutation({
    mutationFn: createCamper,
    onSuccess: async () => {
      form.reset(defaultValues)
      await queryClient.invalidateQueries({ queryKey: ['campers'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  function handleSubmit(values: CamperFormValues) {
    const request: CreateCamperRequest = {
      ...values,
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    mutation.mutate(request)
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Camper</Typography>
        <Typography color="text.secondary">
          Inserisci manualmente i dati e, se parti da un annuncio online, salva anche il link sorgente.
        </Typography>
      </Box>
      <Card>
        <CardContent sx={{ bgcolor: '#fbfbfa' }}>
          <Stack component="form" spacing={3} onSubmit={form.handleSubmit(handleSubmit)}>
            <Typography variant="h6">Nuovo camper</Typography>
            {mutation.isError && <Alert severity="error">Impossibile salvare il camper. Controlla i dati e riprova.</Alert>}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Marca" {...form.register('brand')} error={!!form.formState.errors.brand} helperText={form.formState.errors.brand?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Modello" {...form.register('model')} error={!!form.formState.errors.model} helperText={form.formState.errors.model?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="URL annuncio" placeholder="https://..." {...form.register('sourceUrl')} error={!!form.formState.errors.sourceUrl} helperText={form.formState.errors.sourceUrl?.message ?? 'Opzionale: pagina web da cui hai preso i dati'} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Anno" type="number" {...form.register('year', { valueAsNumber: true })} error={!!form.formState.errors.year} helperText={form.formState.errors.year?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Prezzo" type="number" {...form.register('askingPrice', { valueAsNumber: true })} error={!!form.formState.errors.askingPrice} helperText={form.formState.errors.askingPrice?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Km" type="number" {...form.register('mileageKm', { valueAsNumber: true })} error={!!form.formState.errors.mileageKm} helperText={form.formState.errors.mileageKm?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Lunghezza (m)" type="number" {...form.register('lengthMeters', { valueAsNumber: true })} error={!!form.formState.errors.lengthMeters} helperText={form.formState.errors.lengthMeters?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Cambio" {...form.register('transmission')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Motore" {...form.register('engine')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Telaio" {...form.register('chassis')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth label="Posti letto" type="number" {...form.register('sleepingPlaces', { valueAsNumber: true })} error={!!form.formState.errors.sleepingPlaces} helperText={form.formState.errors.sleepingPlaces?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Regione" {...form.register('region')} error={!!form.formState.errors.region} helperText={form.formState.errors.region?.message} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Tag" placeholder="garage, pannelli solari, automatico" {...form.register('tags')} />
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
                <TextField fullWidth multiline minRows={3} label="Note" {...form.register('notes')} />
              </Grid>
            </Grid>
            <Box>
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvataggio...' : 'Aggiungi camper'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              <TableRow sx={{ bgcolor: '#d1d1d1' }}>
                <TableCell colSpan={columns.length} sx={{ borderLeft: '4px solid #111', fontWeight: 900 }}>
                  <AddBoxOutlinedIcon fontSize="inherit" sx={{ mr: 1 }} />
                  Camper monitorati
                </TableCell>
              </TableRow>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} sx={{ '&:nth-of-type(even)': { bgcolor: '#f2f2f2' } }}>
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell key={cell.id} sx={{ fontWeight: index === 0 ? 700 : 500 }}>
                      {index === 0 && <TrendIcon direction={row.original.isFavorite ? 'up' : 'down'} />}{' '}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Typography color="text.secondary">Compila la form qui sopra per aggiungere il primo camper.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  )
}
