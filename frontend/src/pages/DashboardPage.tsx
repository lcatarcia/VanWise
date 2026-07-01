import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined'
import { Box, Card, CardContent, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getDashboardStats } from '../api/campers'
import { TrendIcon } from '../components/TrendIcon'

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
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" variant="body2">{label}</Typography>
                  <TrendIcon direction={label === 'Preferiti' ? 'up' : 'down'} />
                </Stack>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#dedede" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8a8a8a" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Vista servizi</Typography>
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell align="right">Valore</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ bgcolor: '#d7d7d7' }}>
                    <TableCell sx={{ fontWeight: 800 }}>
                      <IndeterminateCheckBoxOutlinedIcon fontSize="inherit" sx={{ mr: 1 }} />
                      VanWise
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{data.totalCampers}</TableCell>
                  </TableRow>
                  {serviceRows.map((row, index) => (
                    <TableRow key={row.label} sx={{ bgcolor: index % 2 === 0 ? '#f1f1f1' : '#ffffff' }}>
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
