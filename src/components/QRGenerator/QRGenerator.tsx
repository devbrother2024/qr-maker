import { useState, useEffect } from 'react'
import { useQRGenerator } from '@/hooks/useQRGenerator'
import { useDebounce } from '@/hooks/useDebounce'
import { QRInput } from './QRInput'
import { QRPreview } from './QRPreview'
import { DownloadButton } from './DownloadButton'
import { SaveButton } from './SaveButton'
import { CustomizationPanel } from '@/components/Customization/CustomizationPanel'
import type { QRFormat, QRInputType } from '@/types/qr'

const DEBOUNCE_DELAY = 500
const DEFAULT_FOREGROUND_COLOR = '#000000'
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF'

export function QRGenerator() {
  const [inputValue, setInputValue] = useState('')
  const [inputType, setInputType] = useState<QRInputType>('url')
  const [currentFormat, setCurrentFormat] = useState<QRFormat>('png')
  const debouncedInput = useDebounce(inputValue, DEBOUNCE_DELAY)
  const {
    qrDataUrl,
    isLoading,
    error,
    customization,
    generateQR,
    downloadQR,
    exportQRBlob,
    setForegroundColor,
    setBackgroundColor,
    uploadLogo,
    removeLogo,
    setLogoScale,
    resetCustomization,
  } = useQRGenerator()

  // 입력값이 변경되면 QR 코드 재생성
  useEffect(() => {
    if (debouncedInput.trim()) {
      generateQR({
        data: debouncedInput,
        inputType,
        format: currentFormat,
      })
    }
  }, [debouncedInput, inputType, currentFormat, generateQR])

  // 커스터마이징 옵션이 변경되면 QR 코드 재생성
  useEffect(() => {
    if (debouncedInput.trim()) {
      generateQR({
        data: debouncedInput,
        inputType,
        format: currentFormat,
      })
    }
  }, [
    customization.foregroundColor,
    customization.backgroundColor,
    customization.logoDataUrl,
    customization.logoScale,
    debouncedInput,
    inputType,
    currentFormat,
    generateQR,
  ])

  const handleDownload = async (format: QRFormat) => {
    // 다운로드 전에 선택한 포맷으로 QR 코드 재생성
    if (debouncedInput.trim()) {
      setCurrentFormat(format)
      await generateQR({
        data: debouncedInput,
        inputType,
        format,
      })
      // QR 코드 생성 후 다운로드
      setTimeout(() => {
        downloadQR(format)
      }, 100)
    } else {
      downloadQR(format)
    }
  }

  return (
    <div className="space-y-6">
      <QRInput
        value={inputValue}
        inputType={inputType}
        onChange={setInputValue}
        onInputTypeChange={setInputType}
        error={error}
        disabled={isLoading}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 왼쪽: 커스터마이징 패널 */}
        <div className="order-2 lg:order-1">
          <CustomizationPanel
            customization={customization}
            onForegroundColorChange={setForegroundColor}
            onBackgroundColorChange={setBackgroundColor}
            onLogoUpload={uploadLogo}
            onLogoRemove={removeLogo}
            onLogoScaleChange={setLogoScale}
            onReset={resetCustomization}
            defaultForegroundColor={DEFAULT_FOREGROUND_COLOR}
            defaultBackgroundColor={DEFAULT_BACKGROUND_COLOR}
          />
        </div>
        {/* 오른쪽: QR 미리보기 및 다운로드 */}
        <div className="order-1 lg:order-2 space-y-4">
          <QRPreview
            qrDataUrl={qrDataUrl}
            isLoading={isLoading}
            error={error}
          />
          <div className="space-y-2">
            <DownloadButton
              onDownload={handleDownload}
              disabled={!qrDataUrl || isLoading}
            />
            <SaveButton
              inputValue={inputValue}
              inputType={inputType}
              debouncedInput={debouncedInput}
              qrDataUrl={qrDataUrl}
              customization={customization}
              exportQRBlob={exportQRBlob}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
