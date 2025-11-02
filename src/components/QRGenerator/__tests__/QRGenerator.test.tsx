import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QRGenerator } from '../QRGenerator'
import { useQRGenerator } from '@/hooks/useQRGenerator'

// useQRGenerator 훅 모킹
vi.mock('@/hooks/useQRGenerator')
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

describe('QRGenerator', () => {
  const mockGenerateQR = vi.fn()
  const mockDownloadQR = vi.fn()
  const mockExportQRBlob = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQRGenerator).mockReturnValue({
      qrDataUrl: null,
      isLoading: false,
      error: null,
      customization: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        logoFile: null,
        logoDataUrl: null,
        logoScale: 1.0,
      },
      generateQR: mockGenerateQR,
      downloadQR: mockDownloadQR,
      exportQRBlob: mockExportQRBlob,
      setForegroundColor: vi.fn(),
      setBackgroundColor: vi.fn(),
      uploadLogo: vi.fn(),
      removeLogo: vi.fn(),
      setLogoScale: vi.fn(),
      resetCustomization: vi.fn(),
      reset: vi.fn(),
    })
  })

  it('초기 렌더링 시 입력 필드가 표시되어야 함', () => {
    render(<QRGenerator />)

    expect(screen.getByLabelText('입력')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('https://example.com'),
    ).toBeInTheDocument()
  })

  it('URL 입력 시 generateQR이 호출되어야 함', async () => {
    const user = userEvent.setup()
    render(<QRGenerator />)

    const input = screen.getByLabelText('입력')
    await user.type(input, 'https://example.com')

    await waitFor(() => {
      expect(mockGenerateQR).toHaveBeenCalledWith({
        data: 'https://example.com',
        inputType: 'url',
        format: 'png',
      })
    })
  })

  it('로딩 중일 때 로딩 메시지가 표시되어야 함', () => {
    vi.mocked(useQRGenerator).mockReturnValue({
      qrDataUrl: null,
      isLoading: true,
      error: null,
      customization: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        logoFile: null,
        logoDataUrl: null,
        logoScale: 1.0,
      },
      setLogoScale: vi.fn(),
      generateQR: mockGenerateQR,
      downloadQR: mockDownloadQR,
      exportQRBlob: mockExportQRBlob,
      setForegroundColor: vi.fn(),
      setBackgroundColor: vi.fn(),
      uploadLogo: vi.fn(),
      removeLogo: vi.fn(),
      resetCustomization: vi.fn(),
      reset: vi.fn(),
    })

    render(<QRGenerator />)

    expect(screen.getByText('QR 코드 생성 중...')).toBeInTheDocument()
  })

  it('에러 발생 시 에러 메시지가 표시되어야 함', () => {
    const errorMessage = '유효한 URL을 입력해주세요.'
    vi.mocked(useQRGenerator).mockReturnValue({
      qrDataUrl: null,
      isLoading: false,
      error: errorMessage,
      customization: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        logoFile: null,
        logoDataUrl: null,
        logoScale: 1.0,
      },
      setLogoScale: vi.fn(),
      generateQR: mockGenerateQR,
      downloadQR: mockDownloadQR,
      exportQRBlob: mockExportQRBlob,
      setForegroundColor: vi.fn(),
      setBackgroundColor: vi.fn(),
      uploadLogo: vi.fn(),
      removeLogo: vi.fn(),
      resetCustomization: vi.fn(),
      reset: vi.fn(),
    })

    render(<QRGenerator />)

    // 에러 메시지가 여러 곳에 표시될 수 있으므로 getAllByText 사용
    const errorMessages = screen.getAllByText(errorMessage)
    expect(errorMessages.length).toBeGreaterThan(0)
    expect(screen.getByLabelText('입력')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('QR 코드가 생성되면 미리보기가 표시되어야 함', () => {
    const mockDataUrl = 'data:image/png;base64,mockdata'
    vi.mocked(useQRGenerator).mockReturnValue({
      qrDataUrl: mockDataUrl,
      isLoading: false,
      error: null,
      customization: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        logoFile: null,
        logoDataUrl: null,
        logoScale: 1.0,
      },
      setLogoScale: vi.fn(),
      generateQR: mockGenerateQR,
      downloadQR: mockDownloadQR,
      exportQRBlob: mockExportQRBlob,
      setForegroundColor: vi.fn(),
      setBackgroundColor: vi.fn(),
      uploadLogo: vi.fn(),
      removeLogo: vi.fn(),
      resetCustomization: vi.fn(),
      reset: vi.fn(),
    })

    render(<QRGenerator />)

    const img = screen.getByAltText('QR Code')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', mockDataUrl)
  })

  it('QR 코드가 없을 때 안내 메시지가 표시되어야 함', () => {
    render(<QRGenerator />)

    expect(
      screen.getByText('URL 또는 텍스트를 입력하면 QR 코드가 생성됩니다.'),
    ).toBeInTheDocument()
  })

  it('다운로드 버튼이 비활성화되어야 함 (QR 코드 없음)', () => {
    render(<QRGenerator />)

    const downloadButton = screen.getByRole('button', { name: /다운로드/i })
    expect(downloadButton).toBeDisabled()
  })

  it('다운로드 버튼이 활성화되어야 함 (QR 코드 있음)', () => {
    const mockDataUrl = 'data:image/png;base64,mockdata'
    vi.mocked(useQRGenerator).mockReturnValue({
      qrDataUrl: mockDataUrl,
      isLoading: false,
      error: null,
      customization: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        logoFile: null,
        logoDataUrl: null,
        logoScale: 1.0,
      },
      setLogoScale: vi.fn(),
      generateQR: mockGenerateQR,
      downloadQR: mockDownloadQR,
      exportQRBlob: mockExportQRBlob,
      setForegroundColor: vi.fn(),
      setBackgroundColor: vi.fn(),
      uploadLogo: vi.fn(),
      removeLogo: vi.fn(),
      resetCustomization: vi.fn(),
      reset: vi.fn(),
    })

    render(<QRGenerator />)

    const downloadButton = screen.getByRole('button', { name: /다운로드/i })
    expect(downloadButton).not.toBeDisabled()
  })

  it('PNG 다운로드가 동작해야 함', async () => {
    const user = userEvent.setup()
    const mockDataUrl = 'data:image/png;base64,mockdata'
    mockGenerateQR.mockResolvedValue(undefined)
    vi.mocked(useQRGenerator).mockReturnValue({
      qrDataUrl: mockDataUrl,
      isLoading: false,
      error: null,
      customization: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        logoFile: null,
        logoDataUrl: null,
        logoScale: 1.0,
      },
      setLogoScale: vi.fn(),
      generateQR: mockGenerateQR,
      downloadQR: mockDownloadQR,
      exportQRBlob: mockExportQRBlob,
      setForegroundColor: vi.fn(),
      setBackgroundColor: vi.fn(),
      uploadLogo: vi.fn(),
      removeLogo: vi.fn(),
      resetCustomization: vi.fn(),
      reset: vi.fn(),
    })

    render(<QRGenerator />)

    const downloadButton = screen.getByRole('button', { name: /다운로드/i })
    await user.click(downloadButton)

    const pngOption = screen.getByText('PNG로 다운로드')
    await user.click(pngOption)

    expect(mockDownloadQR).toHaveBeenCalledWith('png')
  })

  it('SVG 다운로드가 동작해야 함', async () => {
    const user = userEvent.setup()
    const mockDataUrl = 'data:image/png;base64,mockdata'
    mockGenerateQR.mockResolvedValue(undefined)
    vi.mocked(useQRGenerator).mockReturnValue({
      qrDataUrl: mockDataUrl,
      isLoading: false,
      error: null,
      customization: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        logoFile: null,
        logoDataUrl: null,
        logoScale: 1.0,
      },
      setLogoScale: vi.fn(),
      generateQR: mockGenerateQR,
      downloadQR: mockDownloadQR,
      exportQRBlob: mockExportQRBlob,
      setForegroundColor: vi.fn(),
      setBackgroundColor: vi.fn(),
      uploadLogo: vi.fn(),
      removeLogo: vi.fn(),
      resetCustomization: vi.fn(),
      reset: vi.fn(),
    })

    render(<QRGenerator />)

    const downloadButton = screen.getByRole('button', { name: /다운로드/i })
    await user.click(downloadButton)

    const svgOption = screen.getByText('SVG로 다운로드')
    await user.click(svgOption)

    expect(mockDownloadQR).toHaveBeenCalledWith('svg')
  })

  it('로딩 중일 때 다운로드 버튼이 비활성화되어야 함', () => {
    vi.mocked(useQRGenerator).mockReturnValue({
      qrDataUrl: 'data:image/png;base64,mockdata',
      isLoading: true,
      error: null,
      customization: {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        logoFile: null,
        logoDataUrl: null,
        logoScale: 1.0,
      },
      setLogoScale: vi.fn(),
      generateQR: mockGenerateQR,
      downloadQR: mockDownloadQR,
      exportQRBlob: mockExportQRBlob,
      setForegroundColor: vi.fn(),
      setBackgroundColor: vi.fn(),
      uploadLogo: vi.fn(),
      removeLogo: vi.fn(),
      resetCustomization: vi.fn(),
      reset: vi.fn(),
    })

    render(<QRGenerator />)

    const downloadButton = screen.getByRole('button', { name: /다운로드/i })
    expect(downloadButton).toBeDisabled()
  })
})
