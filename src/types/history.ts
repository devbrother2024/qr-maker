import type { Database } from './database'

export type QRHistoryItem = Database['public']['Tables']['qr_history']['Row']

export interface QRHistoryState {
  items: QRHistoryItem[]
  loading: boolean
  error: string | null
}

export interface SaveQRHistoryParams {
  url: string
  foregroundColor: string
  backgroundColor: string
  qrImageBlob: Blob
  qrImageFormat: 'png' | 'svg'
  logoBlob?: Blob | null
}
