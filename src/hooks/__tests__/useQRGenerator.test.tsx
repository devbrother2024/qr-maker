import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useQRGenerator } from '../useQRGenerator'

// qrcode 모듈 모킹
const mockToDataURL = vi.fn()
const mockToString = vi.fn()

vi.mock('qrcode', () => ({
  default: {
    toDataURL: mockToDataURL,
    toString: mockToString,
  },
}))

// qr-generator 모듈 모킹
vi.mock('@/lib/qr-generator', () => ({
  mergeLogoWithQR: vi.fn(() => Promise.resolve('merged-png')),
  mergeLogoWithSVG: vi.fn(() => 'merged-svg'),
}))

describe('useQRGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() => useQRGenerator())

      expect(result.current.qrDataUrl).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('URL 검증', () => {
    it('빈 문자열은 에러를 반환해야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({ data: '', inputType: 'url' })

      await waitFor(() => {
        expect(result.current.error).toBe('유효한 URL을 입력해주세요.')
        expect(result.current.qrDataUrl).toBeNull()
      })
    })

    it('유효하지 않은 URL은 에러를 반환해야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({ data: 'not a valid url!!!', inputType: 'url' })

      await waitFor(() => {
        expect(result.current.error).toBe('유효한 URL을 입력해주세요.')
        expect(result.current.qrDataUrl).toBeNull()
      })
    })

    it('http://로 시작하는 URL은 정상 처리되어야 함', async () => {
      const mockDataUrl = 'data:image/png;base64,mockdata'
      mockToDataURL.mockResolvedValue(mockDataUrl)

      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({ data: 'http://example.com', inputType: 'url' })

      await waitFor(() => {
        expect(result.current.qrDataUrl).toBe(mockDataUrl)
        expect(result.current.error).toBeNull()
      })

      expect(mockToDataURL).toHaveBeenCalledWith(
        'http://example.com',
        expect.objectContaining({
          width: 300,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        }),
      )
    })

    it('https://로 시작하는 URL은 정상 처리되어야 함', async () => {
      const mockDataUrl = 'data:image/png;base64,mockdata'
      mockToDataURL.mockResolvedValue(mockDataUrl)

      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({ data: 'https://example.com', inputType: 'url' })

      await waitFor(() => {
        expect(result.current.qrDataUrl).toBe(mockDataUrl)
        expect(result.current.error).toBeNull()
      })
    })

    it('프로토콜이 없는 URL은 자동으로 https://를 추가해야 함', async () => {
      const mockDataUrl = 'data:image/png;base64,mockdata'
      mockToDataURL.mockResolvedValue(mockDataUrl)

      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({ data: 'example.com', inputType: 'url' })

      await waitFor(() => {
        expect(result.current.qrDataUrl).toBe(mockDataUrl)
        expect(result.current.error).toBeNull()
      })

      expect(mockToDataURL).toHaveBeenCalledWith(
        'https://example.com',
        expect.any(Object),
      )
    })
  })

  describe('QR 코드 생성', () => {
    it('PNG 포맷으로 QR 코드를 생성해야 함', async () => {
      const mockDataUrl = 'data:image/png;base64,mockdata'
      mockToDataURL.mockResolvedValue(mockDataUrl)

      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({
        data: 'https://example.com',
        inputType: 'url',
        format: 'png',
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.qrDataUrl).toBe(mockDataUrl)
      })

      expect(mockToDataURL).toHaveBeenCalled()
    })

    it('SVG 포맷으로 QR 코드를 생성해야 함', async () => {
      const mockSvg = '<svg>mock</svg>'
      mockToString.mockResolvedValue(mockSvg)

      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({
        data: 'https://example.com',
        inputType: 'url',
        format: 'svg',
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.qrDataUrl).toBe(mockSvg)
      })

      expect(mockToString).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          type: 'svg',
        }),
      )
    })

    it('커스텀 색상을 적용해야 함', async () => {
      const mockDataUrl = 'data:image/png;base64,mockdata'
      mockToDataURL.mockResolvedValue(mockDataUrl)

      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({
        data: 'https://example.com',
        inputType: 'url',
        foregroundColor: '#FF0000',
        backgroundColor: '#00FF00',
      })

      await waitFor(() => {
        expect(result.current.qrDataUrl).toBe(mockDataUrl)
      })

      expect(mockToDataURL).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          color: {
            dark: '#FF0000',
            light: '#00FF00',
          },
        }),
      )
    })

    it('QR 코드 생성 중 로딩 상태가 true여야 함', async () => {
      const mockDataUrl = 'data:image/png;base64,mockdata'
      let resolvePromise: (value: string) => void
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve
      })
      mockToDataURL.mockReturnValue(promise)

      const { result } = renderHook(() => useQRGenerator())

      result.current.generateQR({
        data: 'https://example.com',
        inputType: 'url',
      })

      // 로딩 상태 확인
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Promise 해결
      resolvePromise!(mockDataUrl)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.qrDataUrl).toBe(mockDataUrl)
      })
    })

    it('QR 코드 생성 실패 시 에러를 반환해야 함', async () => {
      const errorMessage = 'QR 생성 실패'
      mockToDataURL.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({ data: 'https://example.com', inputType: 'url' })

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage)
        expect(result.current.qrDataUrl).toBeNull()
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('다운로드 기능', () => {
    it('PNG 다운로드가 동작해야 함', async () => {
      const mockDataUrl = 'data:image/png;base64,mockdata'
      const { result } = renderHook(() => useQRGenerator())

      // QR 코드 생성
      mockToDataURL.mockResolvedValue(mockDataUrl)

      await result.current.generateQR({ data: 'https://example.com', inputType: 'url' })

      await waitFor(() => {
        expect(result.current.qrDataUrl).toBe(mockDataUrl)
      })

      // 다운로드 동작 테스트
      const createElementSpy = vi.spyOn(document, 'createElement')
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      result.current.downloadQR('png')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
    })

    it('QR 코드가 없으면 다운로드가 동작하지 않아야 함', () => {
      const { result } = renderHook(() => useQRGenerator())

      const createElementSpy = vi.spyOn(document, 'createElement')

      result.current.downloadQR('png')

      expect(createElementSpy).not.toHaveBeenCalled()
    })
  })

  describe('reset 기능', () => {
    it('상태를 초기화해야 함', async () => {
      const mockDataUrl = 'data:image/png;base64,mockdata'
      mockToDataURL.mockResolvedValue(mockDataUrl)

      const { result } = renderHook(() => useQRGenerator())

      await result.current.generateQR({ data: 'https://example.com', inputType: 'url' })

      await waitFor(() => {
        expect(result.current.qrDataUrl).toBe(mockDataUrl)
      })

      result.current.reset()

      await waitFor(() => {
        expect(result.current.qrDataUrl).toBeNull()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('커스터마이징 기능', () => {
    const MOCK_LOGO_DATA_URL = 'data:image/png;base64,logodata'
    let originalFileReader: typeof FileReader

    class MockFileReader {
      result: string | null = null
      onload:
        | ((this: FileReader, ev: ProgressEvent<FileReader>) => void)
        | null = null

      readAsDataURL = vi.fn(() => {
        this.result = MOCK_LOGO_DATA_URL
        if (this.onload) {
          const event = {
            target: { result: this.result },
          } as ProgressEvent<FileReader>
          this.onload.call(this as unknown as FileReader, event)
        }
      })

      // Stub the rest of the interface
      onerror: FileReader['onerror'] = null
      onabort: FileReader['onabort'] = null
      onloadstart: FileReader['onloadstart'] = null
      onloadend: FileReader['onloadend'] = null
      onprogress: FileReader['onprogress'] = null
      abort = vi.fn()
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
      dispatchEvent = vi.fn(() => true)
      readAsArrayBuffer = vi.fn()
      readAsBinaryString = vi.fn()
      readAsText = vi.fn()
      readyState = 0
    }

    beforeEach(() => {
      originalFileReader = global.FileReader
      global.FileReader = MockFileReader as unknown as typeof FileReader
    })

    afterEach(() => {
      global.FileReader = originalFileReader
    })

    it('초기 커스터마이징 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() => useQRGenerator())

      expect(result.current.customization.foregroundColor).toBe('#000000')
      expect(result.current.customization.backgroundColor).toBe('#FFFFFF')
      expect(result.current.customization.logoFile).toBeNull()
      expect(result.current.customization.logoDataUrl).toBeNull()
    })

    it('전경색을 변경할 수 있어야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())

      result.current.setForegroundColor('#FF0000')

      await waitFor(() => {
        expect(result.current.customization.foregroundColor).toBe('#FF0000')
      })
    })

    it('배경색을 변경할 수 있어야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())

      result.current.setBackgroundColor('#00FF00')

      await waitFor(() => {
        expect(result.current.customization.backgroundColor).toBe('#00FF00')
      })
    })

    it('유효한 로고 파일을 업로드할 수 있어야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())
      const file = new File(['logo'], 'logo.png', { type: 'image/png' })

      const uploadResult = await result.current.uploadLogo(file)

      expect(uploadResult.success).toBe(true)
      await waitFor(() => {
        expect(result.current.customization.logoFile).toBe(file)
        expect(result.current.customization.logoDataUrl).toBe(
          MOCK_LOGO_DATA_URL,
        )
      })
    })

    it('유효하지 않은 파일 타입은 업로드할 수 없어야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())
      const file = new File(['document'], 'document.pdf', {
        type: 'application/pdf',
      })

      const uploadResult = await result.current.uploadLogo(file)

      expect(uploadResult.success).toBe(false)
      expect(uploadResult.error).toContain('PNG, JPG, SVG')
    })

    it('5MB 초과 파일은 업로드할 수 없어야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())
      // 6MB 파일 생성
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', {
        type: 'image/png',
      })

      const uploadResult = await result.current.uploadLogo(largeFile)

      expect(uploadResult.success).toBe(false)
      expect(uploadResult.error).toContain('5MB')
    })

    it('로고를 제거할 수 있어야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())
      const file = new File(['logo'], 'logo.png', { type: 'image/png' })

      await result.current.uploadLogo(file)

      await waitFor(() => {
        expect(result.current.customization.logoDataUrl).toBeTruthy()
      })

      result.current.removeLogo()

      await waitFor(() => {
        expect(result.current.customization.logoFile).toBeNull()
        expect(result.current.customization.logoDataUrl).toBeNull()
      })
    })

    it('커스터마이징을 기본값으로 리셋할 수 있어야 함', () => {
      const { result } = renderHook(() => useQRGenerator())

      result.current.setForegroundColor('#FF0000')
      result.current.setBackgroundColor('#00FF00')

      result.current.resetCustomization()

      expect(result.current.customization.foregroundColor).toBe('#000000')
      expect(result.current.customization.backgroundColor).toBe('#FFFFFF')
      expect(result.current.customization.logoFile).toBeNull()
      expect(result.current.customization.logoDataUrl).toBeNull()
    })

    it('로고가 있을 때 PNG 생성 시 로고가 합성되어야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())
      const mockDataUrl = 'data:image/png;base64,mockdata'
      mockToDataURL.mockResolvedValue(mockDataUrl)

      const file = new File(['logo'], 'logo.png', { type: 'image/png' })
      await result.current.uploadLogo(file)

      await waitFor(() => {
        expect(result.current.customization.logoDataUrl).toBeTruthy()
      })

      await result.current.generateQR({
        data: 'https://example.com',
        inputType: 'url',
        format: 'png',
      })

      await waitFor(() => {
        expect(result.current.qrDataUrl).toBeTruthy()
      })
    })

    it('로고가 있을 때 SVG 생성 시 로고가 합성되어야 함', async () => {
      const { result } = renderHook(() => useQRGenerator())
      const mockSvg = '<svg>mock</svg>'
      mockToString.mockResolvedValue(mockSvg)

      const file = new File(['logo'], 'logo.png', { type: 'image/png' })
      await result.current.uploadLogo(file)

      await waitFor(() => {
        expect(result.current.customization.logoDataUrl).toBeTruthy()
      })

      await result.current.generateQR({
        data: 'https://example.com',
        inputType: 'url',
        format: 'svg',
      })

      await waitFor(() => {
        expect(result.current.qrDataUrl).toBeTruthy()
      })
    })
  })
})
