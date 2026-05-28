import type { Theater } from '../types'

export const theaters: Theater[] = [
  {
    id: 't1',
    name: 'IMAX Downtown',
    address: '123 Main St, Downtown',
    screens: 8,
    amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats', 'VIP Lounge'],
  },
  {
    id: 't2',
    name: 'Cineplex Central',
    address: '456 Broadway Ave, Central',
    screens: 12,
    amenities: ['4DX', 'Dolby Cinema', 'Gold Class', 'Play Area'],
  },
  {
    id: 't3',
    name: 'Starlite Megaplex',
    address: '789 Park Blvd, Westside',
    screens: 15,
    amenities: ['ScreenX', 'RealD 3D', 'Beanbags', 'Bar'],
  },
]
