import { Card, CardContent, Stack, Typography } from '@mui/material'

export function ComparatorPage() {
  return (
    <Stack spacing={3}>
      <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} variant="h4">Comparatore</Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Confronto 2-4 camper con evidenziazione automatica delle differenze: endpoint backend gia predisposto.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
