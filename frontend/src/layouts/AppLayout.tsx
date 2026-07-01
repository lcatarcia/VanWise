import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined'
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import { Box, Checkbox, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: <AnalyticsOutlinedIcon /> },
  { label: 'Camper', path: '/campers', icon: <DirectionsCarFilledOutlinedIcon /> },
  { label: 'Comparatore', path: '/comparator', icon: <CompareArrowsOutlinedIcon /> },
  { label: 'Finanziamenti', path: '/financing', icon: <PaymentsOutlinedIcon /> },
  { label: 'Checklist', path: '/checklist', icon: <ChecklistOutlinedIcon /> },
]

const filterFields = ['Marca', 'Modello', 'Prezzo', 'Km', 'Lunghezza', 'Regione', 'Rivenditore', 'Tag']

export function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        slotProps={{
          paper: {
            sx: {
              width: 280,
              borderRight: '1px solid #d4d4d4',
              background: '#f8f8f6',
            },
          },
        }}
      >
        <Stack spacing={3} sx={{ px: 2.5, py: 3 }}>
          <Box>
            <Typography color="primary" variant="h5">VanWise</Typography>
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
                  borderRadius: 1,
                  color: 'text.secondary',
                  '&.active': {
                    bgcolor: '#dedede',
                    color: 'text.primary',
                    fontWeight: 800,
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FilterAltOutlinedIcon fontSize="small" />
              <Typography sx={{ fontWeight: 800 }}>Campi filtro</Typography>
            </Stack>
            <Stack spacing={0.25}>
              {filterFields.map((field, index) => (
                <Box key={field} sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
                  <Checkbox checked={index < 4} size="small" sx={{ p: 0.25 }} />
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
