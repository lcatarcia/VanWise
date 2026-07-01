import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined'
import { Box, Card, CardContent, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getDashboardStats } from '../api/campers'
import { TrendIcon } from '../components/TrendIcon'
import { VanWiseMark } from '../components/VanWiseMark'

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

  const serviceRows = [
    { label: 'Camper catalogati', value: data.totalCampers, delta: data.totalCampers > 0 ? 'up' : 'flat' },
    { label: 'Preferiti', value: data.favoriteCampers, delta: data.favoriteCampers > 0 ? 'up' : 'flat' },
    { label: 'Prezzo medio', value: `EUR ${data.averagePrice.toLocaleString('it-IT')}`, delta: 'down' },
    { label: 'Km medi', value: data.averageMileageKm.toLocaleString('it-IT'), delta: 'down' },
  ] as const

  return (
    <Stack spacing={4}>
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
        <CardContent sx={{ alignItems: 'center', display: 'flex', gap: 3, justifyContent: 'space-between', minHeight: 150, position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography sx={{ color: 'secondary.main', fontSize: 12, fontWeight: 900, letterSpacing: '.28em', mb: 1 }}>
              CHOOSE SMARTER
            </Typography>
            <Typography variant="h4">Dashboard VanWise</Typography>
            <Typography color="text.secondary">
              KPI e segnali per scegliere il camper giusto prima della prossima strada.
            </Typography>
          </Box>
          <VanWiseMark />
        </CardContent>
      </Card>
      <Grid container spacing={3}>
        {[
          ['Camper monitorati', data.totalCampers],
          ['Preferiti', data.favoriteCampers],
          ['Prezzo medio', `EUR ${data.averagePrice.toLocaleString('it-IT')}`],
          ['Km medi', data.averageMileageKm.toLocaleString('it-IT')],
        ].map(([label, value]) => (
          <Grid key={label} size={{ xs: 12, md: 3 }}>
            <Card component={motion.div} whileHover={{ y: -4 }}>
              <CardContent sx={{ minHeight: 96 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" variant="body2">{label}</Typography>
                  <TrendIcon direction={label === 'Preferiti' ? 'up' : 'down'} />
                </Stack>
                <Typography sx={{ mt: 1, textShadow: '0 0 24px rgba(123,174,127,.22)' }} variant="h5">{value}</Typography>
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
              <Typography color="text.secondary" variant="body2">Vista sintetica del mercato che stai monitorando.</Typography>
              <Box sx={{ height: 320, mt: 3 }}>
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
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Segnali rapidi</Typography>
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell align="right">Valore</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ bgcolor: 'rgba(123,174,127,.18)' }}>
                    <TableCell sx={{ fontWeight: 800 }}>
                      <IndeterminateCheckBoxOutlinedIcon fontSize="inherit" sx={{ mr: 1 }} />
                      VanWise
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{data.totalCampers}</TableCell>
                  </TableRow>
                  {serviceRows.map((row, index) => (
                    <TableRow key={row.label} sx={{ bgcolor: index % 2 === 0 ? 'rgba(248,247,244,.05)' : 'rgba(248,247,244,.025)' }}>
                      <TableCell sx={{ pl: 4 }}>
                        <AddBoxOutlinedIcon color="disabled" fontSize="inherit" sx={{ mr: 1 }} />
                        {row.label}
                      </TableCell>
                      <TableCell align="right">
                        <TrendIcon direction={row.delta} /> {row.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
