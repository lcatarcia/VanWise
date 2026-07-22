import 'leaflet/dist/leaflet.css'
import { Box, Stack, Typography } from '@mui/material'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet'
import type { CamperLocation } from '../types/camper'

interface CamperMapProps {
  locations: CamperLocation[]
}

const ITALY_CENTER: [number, number] = [42.5, 12.5]

type MarkerKind = 'notInspected' | 'inspectedOk' | 'inspectedProblem'

const markerColors: Record<MarkerKind, string> = {
  notInspected: '#5BA4CF',
  inspectedOk: '#7BAE7F',
  inspectedProblem: '#ff6b5f',
}

const markerLabels: Record<MarkerKind, string> = {
  notInspected: 'Da visionare',
  inspectedOk: 'Visionato',
  inspectedProblem: 'Visionato · criticità',
}

function markerKind(location: CamperLocation): MarkerKind {
  if (!location.isInspected) return 'notInspected'
  return location.problemCount > 0 ? 'inspectedProblem' : 'inspectedOk'
}

const iconCache = new Map<MarkerKind, L.DivIcon>()

function buildIcon(kind: MarkerKind): L.DivIcon {
  const cached = iconCache.get(kind)
  if (cached) return cached

  const color = markerColors[kind]
  const pulse = kind === 'inspectedProblem'
    ? `<span style="position:absolute;left:-4px;top:-4px;width:34px;height:34px;border-radius:50%;background:${color}55;animation:vw-pulse 1.8s ease-out infinite;"></span>`
    : ''
  const glyph = kind === 'inspectedOk'
    ? '<span style="color:#fff;font-size:13px;font-weight:900;line-height:1;">&#10003;</span>'
    : kind === 'inspectedProblem'
      ? '<span style="color:#fff;font-size:14px;font-weight:900;line-height:1;">!</span>'
      : ''

  const html = `
    <div style="position:relative;width:26px;height:26px;">
      ${pulse}
      <div style="position:relative;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;">
        <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">${glyph}</div>
      </div>
    </div>`

  const icon = L.divIcon({
    html,
    className: 'vw-camper-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
    tooltipAnchor: [12, -18],
  })

  iconCache.set(kind, icon)
  return icon
}

function LegendDot({ color }: { color: string }) {
  return <Box sx={{ bgcolor: color, borderRadius: '50%', flexShrink: 0, height: 12, width: 12, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
}

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
  const hasInspected = locations.some((location) => location.isInspected)

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <style>{'@keyframes vw-pulse{0%{transform:scale(.6);opacity:.7}100%{transform:scale(1.4);opacity:0}}'}</style>
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
        {locations.map((location) => {
          const kind = markerKind(location)
          return (
            <Marker key={location.id} position={[location.latitude, location.longitude]} icon={buildIcon(kind)}>
              <Tooltip direction="right" offset={[10, -14]} opacity={1}>
                <span style={{ fontWeight: 700 }}>{location.brand} {location.model}</span>
              </Tooltip>
              <Popup>
                <strong>{location.brand} {location.model}</strong>
                <br />
                <span style={{ color: markerColors[kind], fontWeight: 700 }}>{markerLabels[kind]}</span>
                {location.isInspected && (
                  <>
                    <br />
                    {location.visitCount} {location.visitCount === 1 ? 'visita' : 'visite'}
                    {location.problemCount > 0 && ` · ${location.problemCount} criticità`}
                    {location.lastVisitDate && (
                      <>
                        <br />
                        Ultima visita: {new Date(location.lastVisitDate).toLocaleDateString('it-IT')}
                      </>
                    )}
                  </>
                )}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {hasInspected && (
        <Stack
          spacing={0.75}
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            zIndex: 1000,
            bgcolor: 'rgba(20,26,32,.82)',
            backdropFilter: 'blur(6px)',
            borderRadius: 2,
            px: 1.5,
            py: 1,
            boxShadow: '0 4px 16px rgba(0,0,0,.35)',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LegendDot color={markerColors.inspectedOk} />
            <Typography variant="caption" sx={{ color: '#fff' }}>Visionato</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LegendDot color={markerColors.inspectedProblem} />
            <Typography variant="caption" sx={{ color: '#fff' }}>Con criticità</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LegendDot color={markerColors.notInspected} />
            <Typography variant="caption" sx={{ color: '#fff' }}>Da visionare</Typography>
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
