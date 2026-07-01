import { Card, CardContent, Stack, Typography } from '@mui/material'

export function ChecklistPage() {
  return (
    <Stack spacing={3}>
      <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} variant="h4">Checklist visita</Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Categorie Esterno, Interno, Impianti e Meccanica con stati OK, Da verificare e Problema.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
