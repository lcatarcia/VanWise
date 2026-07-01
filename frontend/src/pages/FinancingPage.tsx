import { Card, CardContent, Stack, Typography } from '@mui/material'

export function FinancingPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Finanziamenti</Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Area dedicata a finanziamento, leasing, buy back e noleggio con riscatto.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
