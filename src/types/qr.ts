export type QRFormat = 'png' | 'svg'
export type QRInputType = 'url' | 'text'

export interface QRGenerationOptions {
  data: string
  inputType?: QRInputType
  foregroundColor?: string
  backgroundColor?: string
  logoUrl?: string
  format?: QRFormat
  size?: number
}

export interface QRGeneratorState {
  qrDataUrl: string | null
  isLoading: boolean
  error: string | null
}

export interface CustomizationState {
  foregroundColor: string
  backgroundColor: string
  logoFile: File | null
  logoDataUrl: string | null
  logoScale: number
}

export interface LogoValidationResult {
  valid: boolean
  error?: string
}

