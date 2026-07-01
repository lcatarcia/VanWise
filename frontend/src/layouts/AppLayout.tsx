import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined'
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: <AnalyticsOutlinedIcon /> },
  { label: 'Camper', path: '/campers', icon: <DirectionsCarFilledOutlinedIcon /> },
  { label: 'Comparatore', path: '/comparator', icon: <CompareArrowsOutlinedIcon /> },
  { label: 'Finanziamenti', path: '/financing', icon: <PaymentsOutlinedIcon /> },
  { label: 'Checklist', path: '/checklist', icon: <ChecklistOutlinedIcon /> },
]

export function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        slotProps={{
          paper: {
            sx: {
              width: 280,
              border: 0,
              background: 'rgba(7, 11, 20, 0.92)',
              backdropFilter: 'blur(22px)',
            },
          },
        }}
      >
        <Stack spacing={4} sx={{ px: 3, py: 4 }}>
          <Box>
            <Typography variant="h5">VanWise</Typography>
            <Typography color="text.secondary" variant="body2">
              Scegli il camper ideale con dati, scoring e comparazioni.
            </Typography>
          </Box>
          <List sx={{ display: 'grid', gap: 1 }}>
            {navigation.map((item) => (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 3,
                  '&.active': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Stack>
      </Drawer>
      <Box component="main" sx={{ flex: 1, ml: '280px', p: { xs: 3, lg: 5 } }}>
        <Outlet />
      </Box>
    </Box>
  )
}
