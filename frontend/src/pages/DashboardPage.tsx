import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import StarOutlinedIcon from '@mui/icons-material/StarOutlined'
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined'
import { Avatar, Box, Card, CardActionArea, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getCampers, getDashboardStats } from '../api/campers'
import { CamperMap } from '../components/CamperMap'
import { VanWiseMark } from '../components/VanWiseMark'
import type { CamperLocation, CamperSummary } from '../types/camper'

const fallbackStats = {
  totalCampers: 0,
  favoriteCampers: 0,
  averagePrice: 0,
  averageMileageKm: 0,
  brandDistribution: [],
  priceDistribution: [],
  regionDistribution: [],
  camperLocations: [] as CamperLocation[],
  latestCampers: [] as CamperSummary[],
}

function computeHighlights(campers: CamperSummary[]) {
  if (campers.length === 0) return null

  const withPrice = campers.filter((c) => c.askingPrice !== null && c.askingPrice > 0)
  const withKm = campers.filter((c) => c.mileageKm !== null && c.mileageKm >= 0)
  const favorites = campers.filter((c) => c.isFavorite && c.askingPrice !== null && c.askingPrice > 0)

  const cheapest = withPrice.length > 0
    ? withPrice.reduce((best, c) => (c.askingPrice! < best.askingPrice! ? c : best))
    : null

  const lowestKm = withKm.length > 0
    ? withKm.reduce((best, c) => (c.mileageKm! < best.mileageKm! ? c : best))
    : null

  const cheapestFavorite = favorites.length > 0
    ? favorites.reduce((best, c) => (c.askingPrice! < best.askingPrice! ? c : best))
    : null

  const newest = campers.filter((c) => c.year !== null).length > 0
    ? campers.filter((c) => c.year !== null).reduce((best, c) => (c.year! > best.year! ? c : best))
    : null

  const priceMin = withPrice.length > 0 ? Math.min(...withPrice.map((c) => c.askingPrice!)) : null
  const priceMax = withPrice.length > 0 ? Math.max(...withPrice.map((c) => c.askingPrice!)) : null

  return { cheapest, lowestKm, cheapestFavorite, newest, priceMin, priceMax }
}

function HighlightCard({ camper, icon, label, detail, color }: { camper: CamperSummary; icon: React.ReactNode; label: string; detail: string; color: string }) {
  return (
    <Card component={motion.div} whileHover={{ y: -3 }} sx={{ height: '100%' }}>
      <CardActionArea component={Link} to={`/campers/${camper.id}`} sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Avatar sx={{ bgcolor: `${color}22`, color, height: 36, width: 36 }}>
              {icon}
            </Avatar>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
          </Stack>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {camper.brand} {camper.model}
          </Typography>
          <Typography variant="body2" sx={{ color, fontWeight: 700, mt: 0.5 }}>
            {detail}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {camper.year && <Chip label={camper.year} size="small" variant="outlined" />}
            {camper.region && <Chip label={camper.region} size="small" variant="outlined" />}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export function DashboardPage() {
  const { data: stats = fallbackStats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
    retry: false,
  })

  const { data: campers = [] } = useQuery({
    queryKey: ['campers'],
    queryFn: getCampers,
    retry: false,
  })

  const highlights = computeHighlights(campers)

  const kpis = [
    { label: 'Camper monitorati', value: stats.totalCampers, icon: <DirectionsBusIcon />, color: '#7BAE7F' },
    { label: 'Preferiti', value: stats.favoriteCampers, icon: <FavoriteIcon />, color: '#ff6b5f' },
  ]

  return (
    <Stack spacing={4}>
      {/* Hero */}
      <Card
        sx={{
          overflow: 'hidden',
          position: 'relative',
          '&::after': {
            background: 'radial-gradient(circle, rgba(233,160,59,.24), transparent 62%)',
            content: '""',
            height: 280,
            position: 'absolute',
            right: -90,
            top: -120,
            width: 280,
          },
        }}
      >
        <CardContent sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, justifyContent: 'space-between', minHeight: 150, position: 'relative', zIndex: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: 'secondary.main', fontSize: 12, fontWeight: 900, letterSpacing: '.28em', mb: 1 }}>
              CHOOSE SMARTER
            </Typography>
            <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} variant="h4">Dashboard VanWise</Typography>
            <Typography color="text.secondary">
              Il tuo centro di controllo per trovare il camper perfetto.
            </Typography>
          </Box>
          <VanWiseMark size="lg" />
        </CardContent>
      </Card>

      {/* KPI + Price Range */}
      <Grid container spacing={3}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
            <Card component={motion.div} whileHover={{ y: -4 }}>
              <CardContent sx={{ minHeight: 96 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" variant="body2">{kpi.label}</Typography>
                  <Avatar sx={{ bgcolor: `${kpi.color}22`, color: kpi.color, height: 36, width: 36 }}>
                    {kpi.icon}
                  </Avatar>
                </Stack>
                <Typography sx={{ mt: 1, textShadow: `0 0 24px ${kpi.color}36` }} variant="h5">{kpi.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {highlights?.priceMin != null && highlights?.priceMax != null && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card component={motion.div} whileHover={{ y: -4 }}>
              <CardContent sx={{ minHeight: 96 }}>
                <Typography color="text.secondary" variant="body2">Range prezzo monitorato</Typography>
                <Typography sx={{ mt: 1 }} variant="h5">
                  € {highlights.priceMin.toLocaleString('it-IT')} — € {highlights.priceMax.toLocaleString('it-IT')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Highlights — decision helpers */}
      {highlights && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>🏆 Migliori candidati</Typography>
          <Grid container spacing={2}>
            {highlights.cheapest && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <HighlightCard
                  camper={highlights.cheapest}
                  icon={<TrendingDownOutlinedIcon />}
                  label="Più economico"
                  detail={`€ ${highlights.cheapest.askingPrice!.toLocaleString('it-IT')}`}
                  color="#7BAE7F"
                />
              </Grid>
            )}
            {highlights.lowestKm && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <HighlightCard
                  camper={highlights.lowestKm}
                  icon={<RouteOutlinedIcon />}
                  label="Meno km"
                  detail={`${highlights.lowestKm.mileageKm!.toLocaleString('it-IT')} km`}
                  color="#5BA4CF"
                />
              </Grid>
            )}
            {highlights.cheapestFavorite && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <HighlightCard
                  camper={highlights.cheapestFavorite}
                  icon={<StarOutlinedIcon />}
                  label="Preferito più economico"
                  detail={`€ ${highlights.cheapestFavorite.askingPrice!.toLocaleString('it-IT')}`}
                  color="#E9A03B"
                />
              </Grid>
            )}
            {highlights.newest && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <HighlightCard
                  camper={highlights.newest}
                  icon={<EmojiEventsOutlinedIcon />}
                  label="Più recente"
                  detail={`Anno ${highlights.newest.year}`}
                  color="#b39ddb"
                />
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Latest Campers */}
      {stats.latestCampers.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Ultimi aggiunti</Typography>
          <Grid container spacing={2}>
            {stats.latestCampers.slice(0, 6).map((camper) => (
              <Grid key={camper.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card component={motion.div} whileHover={{ y: -3 }} sx={{ height: '100%' }}>
                  <CardActionArea component={Link} to={`/campers/${camper.id}`}>
                    {camper.coverImageUrl && (
                      <Box
                        component="img"
                        src={camper.coverImageUrl}
                        alt={`${camper.brand} ${camper.model}`}
                        sx={{ height: 140, objectFit: 'cover', width: '100%', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
                      />
                    )}
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {camper.brand} {camper.model}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                        {camper.askingPrice && (
                          <Chip label={`€ ${camper.askingPrice.toLocaleString('it-IT')}`} size="small" sx={{ fontWeight: 600, bgcolor: 'rgba(123,174,127,.15)', color: '#7BAE7F' }} />
                        )}
                        {camper.year && (
                          <Chip label={camper.year} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        )}
                        {camper.mileageKm && (
                          <Chip label={`${(camper.mileageKm / 1000).toFixed(0)}k km`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        )}
                      </Stack>
                      {camper.isFavorite && (
                        <FavoriteIcon sx={{ color: '#ff6b5f', fontSize: 16, mt: 1 }} />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Map */}
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <MapOutlinedIcon sx={{ color: '#5BA4CF' }} />
            <Typography variant="h6">Dove si trovano</Typography>
          </Stack>
          <Typography color="text.secondary" variant="body2">Posizione dei camper che stai monitorando sulla mappa.</Typography>
          <Box sx={{ height: { xs: 300, sm: 400 }, mt: 3, borderRadius: 3, overflow: 'hidden' }}>
            <CamperMap locations={stats.camperLocations} />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}
