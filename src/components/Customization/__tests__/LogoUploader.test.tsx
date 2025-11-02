import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogoUploader } from '../LogoUploader'

// useToast 모킹
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('LogoUploader', () => {
  const mockOnUpload = vi.fn()
  const mockOnRemove = vi.fn()
  const mockOnLogoScaleChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로고가 없을 때 업로드 영역이 표시되어야 함', () => {
    render(
      <LogoUploader
        logoDataUrl={null}
        logoScale={1.0}
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
        onLogoScaleChange={mockOnLogoScaleChange}
      />,
    )

    expect(screen.getByText('클릭하거나 드래그하여 업로드')).toBeInTheDocument()
    expect(screen.getByText('PNG, JPG, SVG (최대 5MB)')).toBeInTheDocument()
  })

  it('로고가 있을 때 미리보기가 표시되어야 함', () => {
    const logoDataUrl = 'data:image/png;base64,mockdata'
    render(
      <LogoUploader
        logoDataUrl={logoDataUrl}
        logoScale={1.0}
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
        onLogoScaleChange={mockOnLogoScaleChange}
      />,
    )

    const img = screen.getByAltText('로고 미리보기')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', logoDataUrl)
  })

  it('파일 선택 시 onUpload가 호출되어야 함', async () => {
    const user = userEvent.setup()
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    mockOnUpload.mockResolvedValue({ success: true })

    const { container } = render(
        <LogoUploader
          logoDataUrl={null}
          logoScale={1.0}
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          onLogoScaleChange={mockOnLogoScaleChange}
        />,
    )

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    if (input) {
      await user.upload(input, file)
    }

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file)
    })
  })

  it('로고 제거 버튼 클릭 시 onRemove가 호출되어야 함', async () => {
    const user = userEvent.setup()
    const logoDataUrl = 'data:image/png;base64,mockdata'

    render(
      <LogoUploader
        logoDataUrl={logoDataUrl}
        logoScale={1.0}
        onUpload={mockOnUpload}
        onRemove={mockOnRemove}
        onLogoScaleChange={mockOnLogoScaleChange}
      />,
    )

    const removeButton = screen.getByTitle('로고 제거')
    await user.click(removeButton)

    expect(mockOnRemove).toHaveBeenCalled()
  })

  it('드래그 앤 드롭으로 파일 업로드가 가능해야 함', async () => {
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    mockOnUpload.mockResolvedValue({ success: true })

    render(
        <LogoUploader
          logoDataUrl={null}
          logoScale={1.0}
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          onLogoScaleChange={mockOnLogoScaleChange}
        />,
    )

    const dropZone = screen
      .getByText('클릭하거나 드래그하여 업로드')
      .closest('div')
    if (dropZone) {
      // DataTransfer를 직접 생성할 수 없으므로 파일을 직접 전달
      const dropEvent = new Event('drop', { bubbles: true }) as DragEvent
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
        writable: false,
      })

      dropZone.dispatchEvent(dropEvent)
    }

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalled()
    })
  })
})
