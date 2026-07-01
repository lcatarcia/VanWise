import { createTheme } from '@mui/material'

export const vanWiseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2f3a45',
    },
    secondary: {
      main: '#2f8f5b',
    },
    error: {
      main: '#c74f46',
    },
    success: {
      main: '#2f8f5b',
    },
    background: {
      default: '#f4f4f2',
      paper: '#ffffff',
    },
    text: {
      primary: '#262626',
      secondary: '#646464',
    },
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'].join(','),
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h5: {
      fontWeight: 750,
      letterSpacing: '-0.02em',
    },
    body2: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #d8d8d8',
          backgroundImage: 'none',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e1e1e1',
          fontSize: 14,
          paddingBottom: 8,
          paddingTop: 8,
        },
        head: {
          color: '#2b2b2b',
          fontWeight: 800,
          backgroundColor: '#efefef',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
  },
})
