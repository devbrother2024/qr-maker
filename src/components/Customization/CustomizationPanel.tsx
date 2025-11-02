import { ColorPicker } from './ColorPicker'
import { LogoUploader } from './LogoUploader'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import type { CustomizationState } from '@/types/qr'

interface CustomizationPanelProps {
  customization: CustomizationState
  onForegroundColorChange: (color: string) => void
  onBackgroundColorChange: (color: string) => void
  onLogoUpload: (file: File) => Promise<{ success: boolean; error?: string }>
  onLogoRemove: () => void
  onLogoScaleChange: (scale: number) => void
  onReset: () => void
  defaultForegroundColor: string
  defaultBackgroundColor: string
}

export function CustomizationPanel({
  customization,
  onForegroundColorChange,
  onBackgroundColorChange,
  onLogoUpload,
  onLogoRemove,
  onLogoScaleChange,
  onReset,
  defaultForegroundColor,
  defaultBackgroundColor,
}: CustomizationPanelProps) {
  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">커스터마이징</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          기본값으로 리셋
        </Button>
      </div>

      <div className="space-y-6">
        <ColorPicker
          label="전경색"
          color={customization.foregroundColor}
          onChange={onForegroundColorChange}
          onReset={() => onForegroundColorChange(defaultForegroundColor)}
          defaultColor={defaultForegroundColor}
        />

        <ColorPicker
          label="배경색"
          color={customization.backgroundColor}
          onChange={onBackgroundColorChange}
          onReset={() => onBackgroundColorChange(defaultBackgroundColor)}
          defaultColor={defaultBackgroundColor}
        />

        <LogoUploader
          logoDataUrl={customization.logoDataUrl}
          logoScale={customization.logoScale}
          onUpload={onLogoUpload}
          onRemove={onLogoRemove}
          onLogoScaleChange={onLogoScaleChange}
        />
      </div>
    </div>
  )
}

