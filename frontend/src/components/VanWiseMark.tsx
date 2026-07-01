import { Box, Typography } from '@mui/material'

interface VanWiseMarkProps {
  compact?: boolean
}

export function VanWiseMark({ compact = false }: VanWiseMarkProps) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.4 }}>
      <Box
        aria-hidden="true"
        component="svg"
        viewBox="0 0 180 118"
        sx={{
          filter: 'drop-shadow(0 12px 24px rgba(0,0,0,.45))',
          height: compact ? 46 : 72,
          width: compact ? 72 : 112,
        }}
      >
        <path d="M28 58c4-32 32-51 68-51 31 0 55 16 66 41" fill="none" stroke="#7BAE7F" strokeLinecap="round" strokeWidth="7" />
        <path d="m73 42 24-20 15 11 17-18 28 29-26-18-17 15-16-9Z" fill="#7BAE7F" opacity=".95" />
        <path d="M33 56h78c17 0 29 8 37 24l7 15H35c-8 0-14-6-13-14l3-17c1-5 4-8 8-8Z" fill="#F8F7F4" stroke="#17343b" strokeWidth="5" />
        <path d="M112 61h24l10 18h-25c-6 0-9-4-9-9Z" fill="#17343b" />
        <path d="M42 65h47v22H40Z" fill="#F8F7F4" stroke="#17343b" strokeWidth="3" />
        <path d="M66 65v22" stroke="#17343b" strokeWidth="3" />
        <path d="M30 96h137" stroke="#7BAE7F" strokeLinecap="round" strokeWidth="5" />
        <circle cx="58" cy="95" r="13" fill="#17343b" stroke="#F8F7F4" strokeWidth="5" />
        <circle cx="129" cy="95" r="13" fill="#17343b" stroke="#F8F7F4" strokeWidth="5" />
        <path d="M98 77h6" stroke="#17343b" strokeLinecap="round" strokeWidth="4" />
        <path d="M145 88c5 0 9-2 13-6" stroke="#17343b" strokeLinecap="round" strokeWidth="4" />
      </Box>
      {!compact && (
        <Box>
          <Typography sx={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 1 }}>
            Van<span style={{ color: '#7BAE7F' }}>Wise</span>
          </Typography>
          <Typography sx={{ color: '#E9A03B', fontSize: 10, fontWeight: 900, letterSpacing: '.24em', mt: 0.7 }}>
            TRAVEL FARTHER
          </Typography>
        </Box>
      )}
    </Box>
  )
}
