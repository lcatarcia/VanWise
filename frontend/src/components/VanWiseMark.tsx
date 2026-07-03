import { Box } from '@mui/material'
import logoHorizontalDark from '../assets/logo-horizontal-dark.png'
import icon from '../assets/icon.png'

interface VanWiseMarkProps {
  compact?: boolean
}

export function VanWiseMark({ compact = false }: VanWiseMarkProps) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex' }}>
      {compact ? (
        <Box
          component="img"
          src={icon}
          alt="VanWise"
          sx={{ height: 46, width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))' }}
        />
      ) : (
        <Box
          component="img"
          src={logoHorizontalDark}
          alt="VanWise — Choose Smarter. Travel Farther."
          sx={{ height: 56, width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))' }}
        />
      )}
    </Box>
  )
}
