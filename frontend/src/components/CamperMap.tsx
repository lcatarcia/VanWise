import 'leaflet/dist/leaflet.css'
import { Box, Typography } from '@mui/material'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { CamperLocation } from '../types/camper'

// Fix default marker icons for Leaflet + bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface CamperMapProps {
  locations: CamperLocation[]
}

const ITALY_CENTER: [number, number] = [42.5, 12.5]

export function CamperMap({ locations }: CamperMapProps) {
  if (locations.length === 0) {
    return (
      <Box sx={{ alignItems: 'center', display: 'flex', height: '100%', justifyContent: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          Aggiungi coordinate ai camper per vederli sulla mappa.
        </Typography>
      </Box>
    )
  }

  const center: [number, number] = locations.length === 1
    ? [locations[0].latitude, locations[0].longitude]
    : ITALY_CENTER

  const zoom = locations.length === 1 ? 10 : 6

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{ height: '100%', width: '100%', borderRadius: 12 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
          <Popup>
            <strong>{loc.brand} {loc.model}</strong>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
