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
        sx={{ display: { xs: 'none', lg: 'block' } }}
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
      <Box component="main" sx={{ flex: 1, minWidth: 0, ml: { xs: 0, lg: '280px' }, p: { xs: 2, sm: 3, lg: 4 } }}>
        <Stack
          component="header"
          spacing={2}
          sx={{
            display: { xs: 'flex', lg: 'none' },
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            border: '1px solid rgba(123, 174, 127, 0.22)',
            borderRadius: 4,
            background:
              'linear-gradient(135deg, rgba(13, 20, 22, 0.96), rgba(23, 52, 59, 0.9)), radial-gradient(circle at top right, rgba(123, 174, 127, 0.22), transparent 42%)',
            boxShadow: '0 18px 48px rgba(0, 0, 0, 0.24)',
          }}
        >
          <VanWiseMark />
          <Box
            aria-label="Navigazione principale"
            component="nav"
            sx={{
              display: 'flex',
              gap: 1,
              mx: -0.5,
              overflowX: 'auto',
              pb: 0.5,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {navigation.map((item) => (
              <Box
                key={item.path}
                component={NavLink}
                to={item.path}
                sx={{
                  alignItems: 'center',
                  border: '1px solid rgba(248,247,244,.10)',
                  borderRadius: 999,
                  color: 'text.secondary',
                  display: 'inline-flex',
                  flex: '0 0 auto',
                  gap: 0.75,
                  px: 1.5,
                  py: 1,
                  whiteSpace: 'nowrap',
                  '&.active': {
                    bgcolor: 'rgba(123, 174, 127, 0.14)',
                    borderColor: 'rgba(123, 174, 127, 0.36)',
                    color: '#F8F7F4',
                    fontWeight: 800,
                  },
                }}
              >
                <Box sx={{ display: 'inline-flex', fontSize: 20 }}>{item.icon}</Box>
                <Typography component="span" variant="body2">{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Stack>
        <Outlet />
      </Box>
    </Box>
  )
}
