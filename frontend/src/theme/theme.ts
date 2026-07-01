import { createTheme } from '@mui/material'

export const vanWiseTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c5cff',
    },
    secondary: {
      main: '#38d9a9',
    },
    background: {
      default: '#070b14',
      paper: '#0f172a',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'].join(','),
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.04em',
    },
    h5: {
      fontWeight: 750,
      letterSpacing: '-0.03em',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(148, 163, 184, 0.16)',
          backgroundImage: 'linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.72))',
        },
      },
    },
  },
})
