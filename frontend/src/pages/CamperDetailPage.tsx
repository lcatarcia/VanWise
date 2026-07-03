import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import { Box, Button, Card, CardContent, CardMedia, Chip, Grid, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getCamper } from '../api/campers'

function formatOptionalNumber(value: number | null, suffix = '') {
  return value === null ? '-' : `${value.toLocaleString('it-IT')}${suffix}`
}

function formatOptionalCurrency(value: number | null) {
  return value === null ? '-' : `EUR ${value.toLocaleString('it-IT')}`
}

export function CamperDetailPage() {
  const { id } = useParams()
  const { data: camper, isError, isLoading } = useQuery({
    queryKey: ['campers', id],
    queryFn: () => getCamper(id ?? ''),
    enabled: id !== undefined,
    retry: false,
  })

  if (id === undefined) {
    return <Navigate to="/campers" replace />
  }

  if (isLoading) {
    return <Typography color="text.secondary">Caricamento camper...</Typography>
  }

  if (isError || camper === undefined) {
    return (
      <Stack spacing={2}>
        <Button component={Link} startIcon={<ArrowBackOutlinedIcon />} to="/campers" variant="outlined">
          Torna ai camper
        </Button>
        <Typography color="error">Impossibile caricare il dettaglio del camper.</Typography>
      </Stack>
    )
  }

  const facts = [
    ['Marca', camper.brand],
    ['Modello', camper.model],
    ['Anno', formatOptionalNumber(camper.year)],
    ['Prezzo', formatOptionalCurrency(camper.askingPrice)],
    ['Km', formatOptionalNumber(camper.mileageKm)],
    ['Lunghezza', formatOptionalNumber(camper.lengthMeters, ' m')],
    ['Cambio', camper.transmission || '-'],
    ['Motore', camper.engine || '-'],
    ['Telaio', camper.chassis || '-'],
    ['Posti letto', formatOptionalNumber(camper.sleepingPlaces)],
    ['Regione', camper.region || '-'],
    ['Città', camper.city || '-'],
    ['Indirizzo', camper.address || '-'],
    ['Rivenditore', camper.dealerName ?? '-'],
    ['EUR/m', `EUR ${camper.pricePerMeter.toLocaleString('it-IT', { maximumFractionDigits: 0 })}`],
  ]

  return (
    <Stack spacing={3}>
      <Box>
        <Button component={Link} startIcon={<ArrowBackOutlinedIcon />} to="/campers" variant="outlined">
          Torna ai camper
        </Button>
      </Box>
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ color: 'secondary.main', fontSize: 12, fontWeight: 900, letterSpacing: '.28em', mb: 1 }}>
                DETTAGLIO CAMPER
              </Typography>
              <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} variant="h4">
                {camper.brand} {camper.model}
              </Typography>
              <Typography color="text.secondary">
                Scheda completa con caratteristiche, immagini e sorgente annuncio.
              </Typography>
            </Box>
            {camper.isFavorite && (
              <Chip color="secondary" icon={<FavoriteOutlinedIcon />} label="Preferito" sx={{ alignSelf: 'flex-start', fontWeight: 800 }} />
            )}
          </Stack>
        </CardContent>
      </Card>
      {camper.images.length > 0 && (
        <Grid container spacing={2}>
          {camper.images.map((image) => (
            <Grid key={image.url} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card sx={{ height: '100%', overflow: 'hidden' }}>
                <CardMedia alt={image.caption || image.fileName} component="img" image={image.url} sx={{ aspectRatio: '16 / 10', objectFit: 'cover' }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Card>
        <CardContent>
          <Typography variant="h6">Caratteristiche</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {facts.map(([label, value]) => (
              <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ bgcolor: 'rgba(248,247,244,.05)', border: '1px solid rgba(248,247,244,.10)', borderRadius: 3, p: 2 }}>
                  <Typography color="text.secondary" variant="body2">{label}</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Note e tag</Typography>
            <Typography color="text.secondary">{camper.notes || 'Nessuna nota inserita.'}</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {camper.tags.length === 0 && <Typography color="text.secondary">Nessun tag.</Typography>}
              {camper.tags.map((tag) => (
                <Chip key={tag} label={tag} />
              ))}
            </Stack>
            {camper.sourceUrl && (
              <Button component="a" href={camper.sourceUrl} rel="noreferrer" startIcon={<OpenInNewOutlinedIcon />} target="_blank" variant="outlined">
                Apri annuncio originale
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
