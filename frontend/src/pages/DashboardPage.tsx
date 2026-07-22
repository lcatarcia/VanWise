import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import StarOutlinedIcon from '@mui/icons-material/StarOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined'
import { Avatar, Box, Card, CardActionArea, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getCampers, getDashboardStats } from '../api/campers'
import { CamperMap } from '../components/CamperMap'
import { VanWiseMark } from '../components/VanWiseMark'
import type { CamperLocation, CamperSummary, InspectedCamper } from '../types/camper'

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
  inspectedCampers: [] as InspectedCamper[],
}

function daysAgoLabel(dateStr: string) {
  const visit = new Date(dateStr)
  const today = new Date()
  const startOfVisit = Date.UTC(visit.getFullYear(), visit.getMonth(), visit.getDate())
  const startOfToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.round((startOfToday - startOfVisit) / 86_400_000)
  if (days <= 0) return 'visionato oggi'
  if (days === 1) return 'visionato ieri'
  if (days < 30) return `visionato ${days} giorni fa`
  const months = Math.round(days / 30)
  return months === 1 ? 'visionato 1 mese fa' : `visionato ${months} mesi fa`
}

type Verdict = { label: string; color: string; icon: React.ReactElement }

function verdictFor(camper: InspectedCamper): Verdict {
  if (camper.problemCount > 0) {
    return { label: `${camper.problemCount} ${camper.problemCount === 1 ? 'criticità' : 'criticità'}`, color: '#ff6b5f', icon: <ReportProblemOutlinedIcon sx={{ fontSize: 16 }} /> }
  }
  if (camper.toVerifyCount > 0) {
    return { label: `${camper.toVerifyCount} da verificare`, color: '#E9A03B', icon: <FactCheckOutlinedIcon sx={{ fontSize: 16 }} /> }
  }
  return { label: 'Nessun problema', color: '#7BAE7F', icon: <TaskAltOutlinedIcon sx={{ fontSize: 16 }} /> }
}

function HealthBar({ camper }: { camper: InspectedCamper }) {
  const total = camper.totalItems || 1
  const segments = [
    { value: camper.okCount, color: '#7BAE7F' },
    { value: camper.toVerifyCount, color: '#E9A03B' },
    { value: camper.problemCount, color: '#ff6b5f' },
  ]
  return (
    <Box sx={{ borderRadius: 999, display: 'flex', height: 8, overflow: 'hidden', bgcolor: 'rgba(255,255,255,.08)', width: '100%' }}>
      {segments.map((segment, index) => segment.value > 0 && (
        <Box key={index} sx={{ bgcolor: segment.color, width: `${(segment.value / total) * 100}%` }} />
      ))}
    </Box>
  )
}

function InspectedCamperCard({ camper }: { camper: InspectedCamper }) {
  const verdict = verdictFor(camper)
  const readiness = camper.totalItems === 0 ? 0 : Math.round((camper.okCount / camper.totalItems) * 100)

  return (
    <Card component={motion.div} whileHover={{ y: -3 }} sx={{ height: '100%', position: 'relative' }}>
      <CardActionArea component={Link} to={`/campers/${camper.id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative' }}>
          {camper.coverImageUrl ? (
            <Box component="img" src={camper.coverImageUrl} alt={`${camper.brand} ${camper.model}`} sx={{ height: 130, objectFit: 'cover', width: '100%', borderTopLeftRadius: 18, borderTopRightRadius: 18 }} />
          ) : (
            <Box sx={{ alignItems: 'center', bgcolor: 'rgba(91,164,207,.12)', borderTopLeftRadius: 18, borderTopRightRadius: 18, display: 'flex', height: 130, justifyContent: 'center' }}>
              <DirectionsBusIcon sx={{ color: '#5BA4CF', fontSize: 40, opacity: 0.6 }} />
            </Box>
          )}
          <Chip
            size="small"
            icon={verdict.icon}
            label={verdict.label}
            sx={{ position: 'absolute', top: 10, left: 10, fontWeight: 700, bgcolor: `${verdict.color}`, color: '#0d1117', '& .MuiChip-icon': { color: '#0d1117' } }}
          />
          {camper.isFavorite && (
            <Avatar sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(13,17,23,.7)', height: 28, width: 28 }}>
              <FavoriteIcon sx={{ color: '#ff6b5f', fontSize: 16 }} />
            </Avatar>
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {camper.brand} {camper.model}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary', mt: 0.25 }}>
            <EventAvailableOutlinedIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption">
              {daysAgoLabel(camper.lastVisitDate)}
              {camper.visitCount > 1 && ` · ${camper.visitCount} visite`}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1.25 }}>
            {camper.askingPrice != null && (
              <Chip size="small" label={`€ ${camper.askingPrice.toLocaleString('it-IT')}`} sx={{ fontWeight: 600, bgcolor: 'rgba(123,174,127,.15)', color: '#7BAE7F' }} />
            )}
            {camper.year != null && <Chip size="small" variant="outlined" label={camper.year} sx={{ fontWeight: 600 }} />}
            {camper.mileageKm != null && <Chip size="small" variant="outlined" label={`${(camper.mileageKm / 1000).toFixed(0)}k km`} sx={{ fontWeight: 600 }} />}
            {camper.region && <Chip size="small" variant="outlined" label={camper.region} sx={{ fontWeight: 600 }} />}
          </Stack>

          <Box sx={{ mt: 1.75 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Stato controlli</Typography>
              <Typography variant="caption" sx={{ color: '#7BAE7F', fontWeight: 700 }}>{readiness}% OK</Typography>
            </Stack>
            <HealthBar camper={camper} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {camper.okCount} OK · {camper.toVerifyCount} da verificare · {camper.problemCount} problemi
            </Typography>
          </Box>

          {camper.problemHighlights.length > 0 && (
            <Box sx={{ mt: 1.5, borderRadius: 2, bgcolor: 'rgba(255,107,95,.1)', p: 1 }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                <ReportProblemOutlinedIcon sx={{ color: '#ff6b5f', fontSize: 15 }} />
                <Typography variant="caption" sx={{ color: '#ff6b5f', fontWeight: 700 }}>Da valutare prima di comprare</Typography>
              </Stack>
              <Stack component="ul" sx={{ listStyle: 'none', m: 0, pl: 0 }}>
                {camper.problemHighlights.slice(0, 3).map((problem, index) => (
                  <Typography key={index} component="li" variant="caption" color="text.secondary" sx={{ display: 'flex', gap: 0.5 }}>
                    <span style={{ color: '#ff6b5f' }}>•</span> {problem}
                  </Typography>
                ))}
                {camper.problemHighlights.length > 3 && (
                  <Typography component="li" variant="caption" color="text.secondary">+ altri {camper.problemHighlights.length - 3}</Typography>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function computeHighlights(campers: CamperSummary[]) {
  if (campers.length === 0) return null

  const withPrice = campers.filter((c) => c.askingPrice !== null && c.askingPrice >= 1000)
  const withKm = campers.filter((c) => c.mileageKm !== null && c.mileageKm >= 0)
  const favorites = campers.filter((c) => c.isFavorite && c.askingPrice !== null && c.askingPrice >= 1000)

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

      {/* Inspected campers — camper visionati */}
      {stats.inspectedCampers.length > 0 && (
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
            <FactCheckOutlinedIcon sx={{ color: '#7BAE7F' }} />
            <Typography variant="h6">Camper visionati</Typography>
            <Chip size="small" label={`${stats.inspectedCampers.length} con checklist`} sx={{ fontWeight: 600, bgcolor: 'rgba(123,174,127,.15)', color: '#7BAE7F' }} />
            {(() => {
              const withProblems = stats.inspectedCampers.filter((c) => c.problemCount > 0).length
              const ready = stats.inspectedCampers.filter((c) => c.problemCount === 0 && c.toVerifyCount === 0).length
              return (
                <>
                  {ready > 0 && <Chip size="small" icon={<TaskAltOutlinedIcon sx={{ fontSize: 15 }} />} label={`${ready} senza problemi`} variant="outlined" sx={{ fontWeight: 600, borderColor: '#7BAE7F', color: '#7BAE7F' }} />}
                  {withProblems > 0 && <Chip size="small" icon={<ReportProblemOutlinedIcon sx={{ fontSize: 15 }} />} label={`${withProblems} con criticità`} variant="outlined" sx={{ fontWeight: 600, borderColor: '#ff6b5f', color: '#ff6b5f' }} />}
                </>
              )
            })()}
          </Stack>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            Panoramica dei camper che hai già ispezionato, con esito dei controlli e criticità emerse.
          </Typography>
          {(() => {
            const bestPick = stats.inspectedCampers
              .filter((c) => c.problemCount === 0 && c.toVerifyCount === 0 && c.askingPrice != null)
              .sort((a, b) => a.askingPrice! - b.askingPrice!)[0]
            return bestPick ? (
              <Card sx={{ mb: 2, bgcolor: 'rgba(123,174,127,.1)', border: '1px solid rgba(123,174,127,.35)' }}>
                <CardActionArea component={Link} to={`/campers/${bestPick.id}`}>
                  <CardContent sx={{ py: '12px !important' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'rgba(123,174,127,.25)', color: '#7BAE7F' }}><EmojiEventsOutlinedIcon /></Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#7BAE7F', fontWeight: 700, letterSpacing: '.12em' }}>MIGLIOR VISIONATO</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {bestPick.brand} {bestPick.model}
                          {bestPick.askingPrice != null && (
                            <Typography component="span" sx={{ color: '#7BAE7F', fontWeight: 700, ml: 1 }}>
                              € {bestPick.askingPrice.toLocaleString('it-IT')}
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tutti i controlli superati, nessuna criticità · {daysAgoLabel(bestPick.lastVisitDate)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ) : null
          })()}
          <Grid container spacing={2}>
            {stats.inspectedCampers.map((camper) => (
              <Grid key={camper.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <InspectedCamperCard camper={camper} />
              </Grid>
            ))}
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
