import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getDashboardStats } from '../api/campers'

const fallbackStats = {
  totalCampers: 0,
  favoriteCampers: 0,
  averagePrice: 0,
  averageMileageKm: 0,
  brandDistribution: [],
  priceDistribution: [],
  lengthDistribution: [],
  latestCampers: [],
}

export function DashboardPage() {
  const { data = fallbackStats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
    retry: false,
  })

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4">Dashboard</Typography>
        <Typography color="text.secondary">
          KPI, trend e distribuzioni per valutare rapidamente le opportunita migliori.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {[
          ['Camper monitorati', data.totalCampers],
          ['Preferiti', data.favoriteCampers],
          ['Prezzo medio', `EUR ${data.averagePrice.toLocaleString('it-IT')}`],
          ['Km medi', data.averageMileageKm.toLocaleString('it-IT')],
        ].map(([label, value]) => (
          <Grid key={label} size={{ xs: 12, md: 3 }}>
            <Card component={motion.div} whileHover={{ y: -4 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">{label}</Typography>
                <Typography variant="h5">{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Distribuzione marchi</Typography>
              <Box sx={{ height: 320, mt: 3 }}>
                <ResponsiveContainer>
                  <BarChart data={data.brandDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7c5cff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Ultimi camper</Typography>
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                {data.latestCampers.slice(0, 5).map((camper) => (
                  <Chip
                    key={camper.id}
                    label={`${camper.brand} ${camper.model} - EUR ${camper.askingPrice.toLocaleString('it-IT')}`}
                    sx={{ justifyContent: 'flex-start' }}
                  />
                ))}
                {data.latestCampers.length === 0 && (
                  <Typography color="text.secondary">Nessun camper ancora presente.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
