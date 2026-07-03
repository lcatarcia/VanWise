import { Box } from '@mui/material'
import logoHorizontalDark from '../assets/logo-horizontal-dark.png'
import icon from '../assets/icon.png'

interface VanWiseMarkProps {
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function VanWiseMark({ compact = false, size = 'md' }: VanWiseMarkProps) {
  const heights = { sm: 40, md: 56, lg: 80 }
  const iconHeights = { sm: 36, md: 46, lg: 64 }

  return (
    <Box sx={{ alignItems: 'center', display: 'flex' }}>
      {compact ? (
        <Box
          component="img"
          src={icon}
          alt="VanWise"
          sx={{ height: iconHeights[size], width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))' }}
        />
      ) : (
        <Box
          component="img"
          src={logoHorizontalDark}
          alt="VanWise — Choose Smarter. Travel Farther."
          sx={{ height: heights[size], width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))' }}
        />
      )}
    </Box>
  )
}
