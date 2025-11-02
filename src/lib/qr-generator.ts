/**
 * QR 코드와 로고를 합성하는 유틸리티 함수들
 */

const LOGO_SIZE_RATIO = 0.2 // QR 코드 크기의 20%
const LOGO_BACKGROUND_PADDING = 5 // 원형 배경 패딩

/**
 * QR 코드에 로고를 합성합니다.
 * @param qrDataUrl QR 코드 이미지의 data URL
 * @param logoDataUrl 로고 이미지의 data URL
 * @param qrSize QR 코드 크기 (픽셀)
 * @param logoScale 로고 크기 배율 (기본값: 1.0)
 * @returns 합성된 이미지의 data URL
 */
export async function mergeLogoWithQR(
  qrDataUrl: string,
  logoDataUrl: string,
  qrSize: number,
  logoScale: number = 1.0,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas context를 가져올 수 없습니다.'))
      return
    }

    canvas.width = qrSize
    canvas.height = qrSize

    const qrImage = new Image()
    qrImage.onload = () => {
      // QR 코드 그리기
      ctx.drawImage(qrImage, 0, 0, qrSize, qrSize)

      const logoSize = qrSize * LOGO_SIZE_RATIO * logoScale
      const logoX = (qrSize - logoSize) / 2
      const logoY = (qrSize - logoSize) / 2

      const logoImage = new Image()
      logoImage.onload = () => {
        // 원형 배경 그리기 (흰색)
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(
          qrSize / 2,
          qrSize / 2,
          logoSize / 2 + LOGO_BACKGROUND_PADDING,
          0,
          Math.PI * 2,
        )
        ctx.fill()

        // 로고를 원형으로 클리핑하여 그리기
        ctx.save()
        ctx.beginPath()
        ctx.arc(qrSize / 2, qrSize / 2, logoSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
        ctx.restore()

        resolve(canvas.toDataURL('image/png'))
      }
      logoImage.onerror = () => {
        reject(new Error('로고 이미지를 로드할 수 없습니다.'))
      }
      logoImage.src = logoDataUrl
    }
    qrImage.onerror = () => {
      reject(new Error('QR 코드 이미지를 로드할 수 없습니다.'))
    }
    qrImage.src = qrDataUrl
  })
}

/**
 * SVG QR 코드에 로고를 합성합니다.
 * @param svgString SVG QR 코드 문자열
 * @param logoDataUrl 로고 이미지의 data URL
 * @param qrSize QR 코드 크기 (픽셀)
 * @param logoScale 로고 크기 배율 (기본값: 1.0)
 * @returns 합성된 SVG 문자열
 */
export function mergeLogoWithSVG(
  svgString: string,
  logoDataUrl: string,
  qrSize: number,
  logoScale: number = 1.0,
): string {
  const logoSize = qrSize * LOGO_SIZE_RATIO * logoScale
  const logoX = (qrSize - logoSize) / 2
  const logoY = (qrSize - logoSize) / 2

  // SVG에서 viewBox 추출
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/)
  if (!viewBoxMatch) {
    return svgString
  }

  // 원형 배경과 로고를 위한 그룹 생성
  const logoGroup = `
    <g>
      <!-- 원형 배경 -->
      <circle
        cx="${qrSize / 2}"
        cy="${qrSize / 2}"
        r="${logoSize / 2 + LOGO_BACKGROUND_PADDING}"
        fill="#FFFFFF"
      />
      <!-- 로고 이미지 (원형 클리핑) -->
      <defs>
        <clipPath id="logoClip">
          <circle
            cx="${qrSize / 2}"
            cy="${qrSize / 2}"
            r="${logoSize / 2}"
          />
        </clipPath>
      </defs>
      <image
        x="${logoX}"
        y="${logoY}"
        width="${logoSize}"
        height="${logoSize}"
        href="${logoDataUrl}"
        clip-path="url(#logoClip)"
      />
    </g>
  `

  // SVG 문자열 끝부분(</svg> 전)에 로고 그룹 삽입
  const svgWithoutClosing = svgString.replace('</svg>', '')
  return `${svgWithoutClosing}${logoGroup}</svg>`
}

