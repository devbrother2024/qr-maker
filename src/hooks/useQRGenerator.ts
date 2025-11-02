import { useState, useCallback } from 'react'
import QRCode from 'qrcode'
import { mergeLogoWithQR, mergeLogoWithSVG } from '@/lib/qr-generator'
import type {
  QRFormat,
  QRGenerationOptions,
  QRGeneratorState,
  CustomizationState,
  LogoValidationResult,
} from '@/types/qr'

const DEFAULT_SIZE = 300
const DEFAULT_FOREGROUND_COLOR = '#000000'
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF'
const MAX_LOGO_SIZE_MB = 5
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']

function isValidUrl(url: string): boolean {
  if (!url || url.trim().length === 0) {
    return false
  }

  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    // http:// 또는 https://가 없으면 자동으로 추가 시도
    try {
      const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
      const testUrl = new URL(urlWithProtocol)
      // 도메인만 있고 경로가 없는 경우도 체크 (예: example.com)
      return testUrl.hostname.includes('.') || testUrl.hostname === 'localhost'
    } catch {
      return false
    }
  }
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return `https://${trimmed}`
}

function validateInput(data: string, inputType: 'url' | 'text'): {
  valid: boolean
  error?: string
} {
  if (!data || data.trim().length === 0) {
    return {
      valid: false,
      error: inputType === 'url' ? '유효한 URL을 입력해주세요.' : '텍스트를 입력해주세요.',
    }
  }

  if (inputType === 'url' && !isValidUrl(data)) {
    return {
      valid: false,
      error: '유효한 URL을 입력해주세요.',
    }
  }

  return { valid: true }
}

function validateLogoFile(file: File): LogoValidationResult {
  // 파일 타입 검증
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'PNG, JPG, SVG 파일만 업로드 가능합니다.',
    }
  }

  // 파일 크기 검증 (5MB)
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > MAX_LOGO_SIZE_MB) {
    return {
      valid: false,
      error: `파일 크기는 ${MAX_LOGO_SIZE_MB}MB 이하여야 합니다.`,
    }
  }

  return { valid: true }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function useQRGenerator() {
  const [state, setState] = useState<QRGeneratorState>({
    qrDataUrl: null,
    isLoading: false,
    error: null,
  })

  const [customization, setCustomization] = useState<CustomizationState>({
    foregroundColor: DEFAULT_FOREGROUND_COLOR,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    logoFile: null,
    logoDataUrl: null,
    logoScale: 1.0,
  })

  const generateQR = useCallback(
    async (options: QRGenerationOptions) => {
      const {
        data,
        inputType = 'url',
        format = 'png',
        size = DEFAULT_SIZE,
      } = options

      const validation = validateInput(data, inputType)
      if (!validation.valid) {
        setState({
          qrDataUrl: null,
          isLoading: false,
          error: validation.error || '입력값이 유효하지 않습니다.',
        })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        // URL 타입이면 정규화, Text 타입이면 그대로 사용
        const qrData = inputType === 'url' ? normalizeUrl(data) : data
        const foregroundColor =
          options.foregroundColor || customization.foregroundColor
        const backgroundColor =
          options.backgroundColor || customization.backgroundColor

        let dataUrl: string

        if (format === 'svg') {
          dataUrl = await QRCode.toString(qrData, {
            type: 'svg',
            width: size,
            color: {
              dark: foregroundColor,
              light: backgroundColor,
            },
            margin: 1,
          })
        } else {
          dataUrl = await QRCode.toDataURL(qrData, {
            width: size,
            color: {
              dark: foregroundColor,
              light: backgroundColor,
            },
            margin: 1,
          })
        }

        // 로고가 있으면 합성
        if (customization.logoDataUrl) {
          if (format === 'svg') {
            dataUrl = mergeLogoWithSVG(
              dataUrl,
              customization.logoDataUrl,
              size,
              customization.logoScale,
            )
          } else {
            dataUrl = await mergeLogoWithQR(
              dataUrl,
              customization.logoDataUrl,
              size,
              customization.logoScale,
            )
          }
        }

        setState({
          qrDataUrl: dataUrl,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        setState({
          qrDataUrl: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'QR 코드 생성 중 오류가 발생했습니다.',
        })
      }
    },
    [customization],
  )


  const downloadQR = useCallback(
    (format: QRFormat = 'png', filename?: string) => {
      if (!state.qrDataUrl) {
        return
      }

      const defaultFilename = `qr-code-${Date.now()}.${format}`
      const finalFilename = filename || defaultFilename

      if (format === 'svg') {
        // SVG는 data URL이 SVG 문자열이므로 blob으로 변환
        const svgBlob = new Blob([state.qrDataUrl], {
          type: 'image/svg+xml',
        })
        const url = URL.createObjectURL(svgBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = finalFilename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // PNG는 data URL을 직접 사용
        const link = document.createElement('a')
        link.href = state.qrDataUrl
        link.download = finalFilename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    [state.qrDataUrl],
  )

  const setForegroundColor = useCallback((color: string) => {
    setCustomization((prev) => ({ ...prev, foregroundColor: color }))
  }, [])

  const setBackgroundColor = useCallback((color: string) => {
    setCustomization((prev) => ({ ...prev, backgroundColor: color }))
  }, [])

  const uploadLogo = useCallback(async (file: File) => {
    const validation = validateLogoFile(file)
    if (!validation.valid) {
      setState((prev) => ({
        ...prev,
        error: validation.error || '로고 업로드에 실패했습니다.',
      }))
      return { success: false, error: validation.error }
    }

    try {
      const logoDataUrl = await fileToDataUrl(file)
      setCustomization((prev) => ({
        ...prev,
        logoFile: file,
        logoDataUrl,
      }))
      return { success: true }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '로고 파일을 읽는 중 오류가 발생했습니다.'
      setState((prev) => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  const removeLogo = useCallback(() => {
    setCustomization((prev) => ({
      ...prev,
      logoFile: null,
      logoDataUrl: null,
    }))
  }, [])

  const setLogoScale = useCallback((scale: number) => {
    setCustomization((prev) => ({ ...prev, logoScale: scale }))
  }, [])

  const resetCustomization = useCallback(() => {
    setCustomization({
      foregroundColor: DEFAULT_FOREGROUND_COLOR,
      backgroundColor: DEFAULT_BACKGROUND_COLOR,
      logoFile: null,
      logoDataUrl: null,
      logoScale: 1.0,
    })
  }, [])

  const reset = useCallback(() => {
    setState({
      qrDataUrl: null,
      isLoading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    customization,
    generateQR,
    downloadQR,
    setForegroundColor,
    setBackgroundColor,
    uploadLogo,
    removeLogo,
    setLogoScale,
    resetCustomization,
    reset,
  }
}
