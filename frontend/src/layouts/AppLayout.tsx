import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined'
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import { Box, Checkbox, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
import { NavLink, Outlet } from 'react-router-dom'
import { VanWiseMark } from '../components/VanWiseMark'

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: <AnalyticsOutlinedIcon /> },
  { label: 'Camper', path: '/campers', icon: <DirectionsCarFilledOutlinedIcon /> },
  { label: 'Comparatore', path: '/comparator', icon: <CompareArrowsOutlinedIcon /> },
  { label: 'Finanziamenti', path: '/financing', icon: <PaymentsOutlinedIcon /> },
  { label: 'Checklist', path: '/checklist', icon: <ChecklistOutlinedIcon /> },
]

const filterFields = ['Marca', 'Modello', 'Prezzo', 'Km', 'Lunghezza', 'Regione', 'Città', 'Rivenditore', 'Tag']

export function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        slotProps={{
          paper: {
            sx: {
              width: 280,
              borderRight: '1px solid rgba(123, 174, 127, 0.22)',
              background:
                'linear-gradient(180deg, rgba(13, 20, 22, 0.96), rgba(23, 52, 59, 0.92)), radial-gradient(circle at top, rgba(123, 174, 127, 0.22), transparent 38%)',
              boxShadow: '18px 0 60px rgba(0, 0, 0, 0.32)',
            },
          },
        }}
      >
        <Stack spacing={3} sx={{ px: 2.5, py: 3 }}>
          <Box sx={{ borderBottom: '1px solid rgba(248,247,244,.12)', pb: 2 }}>
            <VanWiseMark />
            <Typography color="text.secondary" variant="body2">
              Scegli il camper ideale con dati, scoring e comparazioni.
            </Typography>
          </Box>
          <List sx={{ display: 'grid', gap: 0.5 }}>
            {navigation.map((item) => (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                sx={{
                  border: '1px solid transparent',
                  borderRadius: 3,
                  color: 'text.secondary',
                  my: 0.25,
                  '&.active': {
                    bgcolor: 'rgba(123, 174, 127, 0.14)',
                    borderColor: 'rgba(123, 174, 127, 0.36)',
                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.24)',
                    color: '#F8F7F4',
                    fontWeight: 800,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(248, 247, 244, 0.07)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ borderColor: 'rgba(248,247,244,.12)' }} />
          <Stack spacing={1} sx={{ bgcolor: 'rgba(248,247,244,.05)', border: '1px solid rgba(248,247,244,.10)', borderRadius: 4, p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FilterAltOutlinedIcon fontSize="small" />
              <Typography sx={{ fontWeight: 800 }}>Campi filtro</Typography>
            </Stack>
            <Stack spacing={0.25}>
              {filterFields.map((field, index) => (
                <Box key={field} sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
                  <Checkbox checked={index < 4} size="small" sx={{ color: 'rgba(248,247,244,.45)', p: 0.25 }} />
                  <Typography color="text.secondary" variant="body2">{field}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Drawer>
      <Box component="main" sx={{ flex: 1, ml: '280px', p: { xs: 3, lg: 4 } }}>
        <Outlet />
      </Box>
    </Box>
  )
}
