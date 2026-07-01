import { createTheme } from '@mui/material'

export const vanWiseTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7BAE7F',
    },
    secondary: {
      main: '#E9A03B',
    },
    error: {
      main: '#ff6b5f',
    },
    success: {
      main: '#7BAE7F',
    },
    background: {
      default: '#10181b',
      paper: '#172225',
    },
    text: {
      primary: '#F8F7F4',
      secondary: '#aebbb3',
    },
  },
  shape: {
    borderRadius: 18,
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
          border: '1px solid rgba(123, 174, 127, 0.22)',
          backgroundImage:
            'linear-gradient(145deg, rgba(23, 34, 37, 0.94), rgba(38, 70, 83, 0.50)), radial-gradient(circle at top right, rgba(233, 160, 59, 0.16), transparent 32%)',
          boxShadow: '0 18px 60px rgba(0, 0, 0, 0.34)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(248, 247, 244, 0.10)',
          fontSize: 14,
          paddingBottom: 8,
          paddingTop: 8,
        },
        head: {
          color: '#F8F7F4',
          fontWeight: 800,
          backgroundColor: 'rgba(123, 174, 127, 0.14)',
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(248, 247, 244, 0.06)',
        },
        notchedOutline: {
          borderColor: 'rgba(248, 247, 244, 0.18)',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#aebbb3',
        },
      },
    },
  },
})
