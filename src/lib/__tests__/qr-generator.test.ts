import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mergeLogoWithQR, mergeLogoWithSVG } from '../qr-generator'

// Canvas API 모킹
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
}

global.Image = MockImage as unknown as typeof Image

describe('qr-generator', () => {
  let getContextSpy: ReturnType<typeof vi.spyOn>
  let toDataURLSpy: ReturnType<typeof vi.spyOn>
  const mockContext = {
    drawImage: vi.fn(),
    fillStyle: '',
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    clip: vi.fn(),
    restore: vi.fn(),
  } as Partial<CanvasRenderingContext2D>

  beforeEach(() => {
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(mockContext as CanvasRenderingContext2D)
    toDataURLSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,mockdata')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('mergeLogoWithQR', () => {
    it('QR 코드와 로고를 합성해야 함', async () => {
      const qrDataUrl = 'data:image/png;base64,qrdata'
      const logoDataUrl = 'data:image/png;base64,logodata'
      const qrSize = 300

      const result = await mergeLogoWithQR(qrDataUrl, logoDataUrl, qrSize)

      expect(result).toBe('data:image/png;base64,mockdata')
    })

    it('Canvas context를 가져올 수 없으면 에러를 throw해야 함', async () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null)

      const qrDataUrl = 'data:image/png;base64,qrdata'
      const logoDataUrl = 'data:image/png;base64,logodata'
      const qrSize = 300

      await expect(
        mergeLogoWithQR(qrDataUrl, logoDataUrl, qrSize),
      ).rejects.toThrow('Canvas context를 가져올 수 없습니다.')
    })
  })

  describe('mergeLogoWithSVG', () => {
    it('SVG QR 코드에 로고를 합성해야 함', () => {
      const svgString =
        '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"></svg>'
      const logoDataUrl = 'data:image/png;base64,logodata'
      const qrSize = 300

      const result = mergeLogoWithSVG(svgString, logoDataUrl, qrSize)

      expect(result).toContain('<circle')
      expect(result).toContain('<image')
      expect(result).toContain(logoDataUrl)
      expect(result).toContain('</svg>')
    })

    it('viewBox가 없는 SVG도 처리해야 함', () => {
      const svgString = '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
      const logoDataUrl = 'data:image/png;base64,logodata'
      const qrSize = 300

      const result = mergeLogoWithSVG(svgString, logoDataUrl, qrSize)

      expect(result).toBe(svgString)
    })
  })
})

