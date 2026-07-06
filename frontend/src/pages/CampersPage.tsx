import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCampers } from '../api/campers'
import { VanWiseMark } from '../components/VanWiseMark'
import type { CamperSummary } from '../types/camper'

function CamperCard({ camper }: { camper: CamperSummary }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = camper.coverImageUrl && !imageFailed

  return (
    <Card component={motion.div} whileHover={{ y: -3 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} to={`/campers/${camper.id}`} sx={{ flexGrow: 1 }}>
        <Box sx={{ height: 160, position: 'relative', bgcolor: 'rgba(248,247,244,.06)' }}>
          {showImage ? (
            <Box
              component="img"
              src={camper.coverImageUrl ?? undefined}
              alt={`${camper.brand} ${camper.model}`}
              onError={() => setImageFailed(true)}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <VanWiseMark compact />
            </Box>
          )}
          {camper.isFavorite && (
            <FavoriteIcon sx={{ position: 'absolute', top: 8, right: 8, color: '#ff6b5f', fontSize: 20, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.4))' }} />
          )}
        </Box>
        <CardContent sx={{ pb: '8px !important' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {camper.brand} {camper.model}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {camper.askingPrice && (
              <Chip label={`€ ${camper.askingPrice.toLocaleString('it-IT')}`} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(123,174,127,.15)', color: '#7BAE7F' }} />
            )}
            {camper.year && <Chip label={camper.year} size="small" variant="outlined" />}
            {camper.mileageKm && <Chip label={`${(camper.mileageKm / 1000).toFixed(0)}k km`} size="small" variant="outlined" />}
          </Stack>
          {(camper.city || camper.region) && (
            <Stack direction="row" spacing={0.5} sx={{ mt: 1, alignItems: 'center' }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {[camper.city, camper.region].filter(Boolean).join(', ')}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
        <IconButton component={Link} to={`/campers/${camper.id}`} size="small" title="Dettaglio">
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
        <IconButton component={Link} to={`/campers/${camper.id}/edit`} size="small" title="Modifica">
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Card>
  )
}

export function CampersPage() {
  const { data = [] } = useQuery({ queryKey: ['campers'], queryFn: getCampers, retry: false })

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }} spacing={2}>
        <Box>
          <Typography sx={{ color: 'secondary.main', fontSize: 12, fontWeight: 900, letterSpacing: '.28em', mb: 1 }}>
            GARAGE INTELLIGENTE
          </Typography>
          <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }} variant="h4">Camper</Typography>
          <Typography color="text.secondary">
            I camper che stai valutando per l'acquisto.
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/campers/new"
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
        >
          Nuovo camper
        </Button>
      </Stack>

      {data.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <VanWiseMark size="lg" />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Nessun camper aggiunto. Inizia aggiungendone uno!
            </Typography>
            <Button component={Link} to="/campers/new" variant="contained" startIcon={<AddOutlinedIcon />} sx={{ mt: 3 }}>
              Aggiungi il primo camper
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {data.map((camper) => (
            <Grid key={camper.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <CamperCard camper={camper} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  )
}
