import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined'
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined'
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined'
import { Box } from '@mui/material'

interface TrendIconProps {
  direction: 'down' | 'up' | 'flat'
}

export function TrendIcon({ direction }: TrendIconProps) {
  if (direction === 'flat') {
    return <RemoveOutlinedIcon color="disabled" fontSize="small" />
  }

  const Icon = direction === 'down' ? KeyboardDoubleArrowDownOutlinedIcon : KeyboardDoubleArrowUpOutlinedIcon
  const color = direction === 'down' ? '#ff6b5f' : '#7BAE7F'

  return (
    <Box component="span" sx={{ color, display: 'inline-flex', verticalAlign: 'middle' }}>
      <Icon fontSize="small" />
    </Box>
  )
}
