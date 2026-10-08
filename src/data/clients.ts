/**
 * Client logos (public/clients). SVG viewBoxes are trimmed to the artwork and
 * the omnity black plate is removed; PNG sources were trimmed to webp.
 * `w`/`h` are the intrinsic aspect, used to reserve space.
 * `filter` overrides the default white-silhouette treatment for marks whose
 * detail is drawn in colour rather than cut out (it would vanish).
 */
import { BASE } from '../utils/base'
export type Client = {
  name: string
  src: string
  w: number
  h: number
  filter?: string
}

export const clients: Client[] = [
  // Lemnity and Omnity look alike: keep them in different marquee rows and apart in the grid.
  { name: 'Lemnity', src: `${BASE}clients/lemnity.svg`, w: 375, h: 95 },
  { name: 'ProStyle', src: `${BASE}clients/prostyle.svg`, w: 340, h: 92 },
  { name: 'i-Doors', src: `${BASE}clients/i-doors.svg`, w: 342, h: 119 },
  { name: 'Fifty Four', src: `${BASE}clients/fifty-four.svg`, w: 342, h: 112 },
  { name: 'MStroy', src: `${BASE}clients/mstroy.svg`, w: 369, h: 118 },
  { name: 'Simourg', src: `${BASE}clients/simourg.svg`, w: 249, h: 49 },
  { name: 'Театр Либерта', src: `${BASE}clients/teatr-liberta.webp`, w: 433, h: 160 },
  { name: 'MSP', src: `${BASE}clients/msp.svg`, w: 321, h: 109 },
  { name: 'Simval', src: `${BASE}clients/simval.svg`, w: 344, h: 90 },
  { name: 'Идеальная пара', src: `${BASE}clients/idealnaya-para.svg`, w: 342, h: 164 },
  { name: 'Omnity', src: `${BASE}clients/omnity.svg`, w: 384, h: 110 },
  { name: 'Dvigex', src: `${BASE}clients/dvigex.webp`, w: 146, h: 160 },
  { name: 'C', src: `${BASE}clients/c-mark.svg`, w: 197, h: 197, filter: 'grayscale(1)' },
]
