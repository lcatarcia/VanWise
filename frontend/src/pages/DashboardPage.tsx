import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import SpeedIcon from '@mui/icons-material/Speed'
import { Avatar, Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getDashboardStats } from '../api/campers'
import { CamperMap } from '../components/CamperMap'
import { VanWiseMark } from '../components/VanWiseMark'
import type { CamperLocation, CamperSummary } from '../types/camper'
import { getBrandInitial, getBrandLogoUrl } from '../utils/brandLogos'

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

const PIE_COLORS = ['#7BAE7F', '#E9A03B', '#5BA4CF', '#ff6b5f', '#b39ddb', '#80cbc4']

export function DashboardPage() {
  const { data = fallbackStats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
    retry: false,
  })

  const kpis = [
    { label: 'Camper monitorati', value: data.totalCampers, icon: <DirectionsBusIcon />, color: '#7BAE7F' },
    { label: 'Preferiti', value: data.favoriteCampers, icon: <FavoriteIcon />, color: '#ff6b5f' },
    { label: 'Prezzo medio', value: `€ ${data.averagePrice.toLocaleString('it-IT', { maximumFractionDigits: 0 })}`, icon: <LocalOfferOutlinedIcon />, color: '#E9A03B' },
    { label: 'Km medi', value: data.averageMileageKm.toLocaleString('it-IT', { maximumFractionDigits: 0 }), icon: <SpeedIcon />, color: '#5BA4CF' },
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

      {/* KPI Cards */}
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
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Distribuzione marchi</Typography>
              <Typography color="text.secondary" variant="body2">Vista sintetica del mercato che stai monitorando.</Typography>
              <Box sx={{ height: { xs: 260, sm: 320 }, mt: 3, minWidth: 0 }}>
                <ResponsiveContainer>
                  <BarChart data={data.brandDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,247,244,.10)" />
                    <XAxis dataKey="label" stroke="#aebbb3" />
                    <YAxis stroke="#aebbb3" />
                    <Tooltip contentStyle={{ background: '#172225', border: '1px solid rgba(123,174,127,.28)', borderRadius: 12, color: '#F8F7F4' }} />
                    <Bar dataKey="value" fill="#7BAE7F" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              {data.brandDistribution.length > 0 && (
                <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
                  {data.brandDistribution.map((point) => {
                    const logoUrl = getBrandLogoUrl(point.label)
                    return (
                      <Stack key={point.label} sx={{ alignItems: 'center', gap: 0.5 }}>
                        <Avatar
                          src={logoUrl ?? undefined}
                          sx={{
                            bgcolor: logoUrl ? '#F8F7F4' : 'rgba(123,174,127,.18)',
                            border: '1px solid rgba(123,174,127,.3)',
                            color: '#7BAE7F',
                            fontSize: 14,
                            fontWeight: 800,
                            height: 36,
                            width: 36,
                            '& img': { objectFit: 'contain', p: 0.5 },
                          }}
                        >
                          {!logoUrl && getBrandInitial(point.label)}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                          {point.label}
                        </Typography>
                      </Stack>
                    )
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Fasce di prezzo</Typography>
              <Typography color="text.secondary" variant="body2">Come si distribuisce il budget.</Typography>
              <Box sx={{ height: 260, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data.priceDistribution.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.priceDistribution} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} strokeWidth={0}>
                        {data.priceDistribution.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#172225', border: '1px solid rgba(123,174,127,.28)', borderRadius: 12, color: '#F8F7F4' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" variant="body2">Nessun dato disponibile</Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {data.priceDistribution.map((point, index) => (
                  <Chip
                    key={point.label}
                    label={`${point.label} (${point.value})`}
                    size="small"
                    sx={{ bgcolor: `${PIE_COLORS[index % PIE_COLORS.length]}22`, color: PIE_COLORS[index % PIE_COLORS.length], fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Map */}
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <MapOutlinedIcon sx={{ color: '#5BA4CF' }} />
            <Typography variant="h6">Dove si trovano</Typography>
          </Stack>
          <Typography color="text.secondary" variant="body2">Posizione dei camper che stai monitorando sulla mappa.</Typography>
          <Box sx={{ height: { xs: 300, sm: 400 }, mt: 3, borderRadius: 3, overflow: 'hidden' }}>
            <CamperMap locations={data.camperLocations} />
          </Box>
        </CardContent>
      </Card>

      {/* Latest Campers */}
      {data.latestCampers.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Ultimi aggiunti</Typography>
          <Grid container spacing={2}>
            {data.latestCampers.slice(0, 6).map((camper) => (
              <Grid key={camper.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card component={motion.div} whileHover={{ y: -3 }} sx={{ height: '100%' }}>
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
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Stack>
  )
}
