import { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'

interface LogoUploaderProps {
  logoDataUrl: string | null
  logoScale: number
  onUpload: (file: File) => Promise<{ success: boolean; error?: string }>
  onRemove: () => void
  onLogoScaleChange: (scale: number) => void
}

export function LogoUploader({
  logoDataUrl,
  logoScale,
  onUpload,
  onRemove,
  onLogoScaleChange,
}: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const result = await onUpload(file)
    setIsUploading(false)

    if (result.success) {
      toast({
        title: '로고가 업로드되었습니다.',
        description: 'QR 코드에 로고가 추가되었습니다.',
      })
    } else {
      toast({
        title: '로고 업로드 실패',
        description: result.error || '로고 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }

    // 파일 입력 리셋
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    setIsUploading(true)
    const result = await onUpload(file)
    setIsUploading(false)

    if (result.success) {
      toast({
        title: '로고가 업로드되었습니다.',
        description: 'QR 코드에 로고가 추가되었습니다.',
      })
    } else {
      toast({
        title: '로고 업로드 실패',
        description: result.error || '로고 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-2">
      <Label>로고 이미지</Label>
      {logoDataUrl ? (
        <div className="relative">
          <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border bg-card">
            <img
              src={logoDataUrl}
              alt="로고 미리보기"
              className="h-full w-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
            title="로고 제거"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-card p-6 transition-colors hover:bg-accent"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <>
              <Upload className="mb-2 h-8 w-8 animate-pulse text-muted-foreground" />
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            </>
          ) : (
            <>
              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">클릭하거나 드래그하여 업로드</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG (최대 5MB)
              </p>
            </>
          )}
        </div>
      )}
      {logoDataUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="logo-scale">로고 크기</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(logoScale * 100)}%
            </span>
          </div>
          <Slider
            id="logo-scale"
            min={0.5}
            max={1.5}
            step={0.1}
            value={[logoScale]}
            onValueChange={(values) => onLogoScaleChange(values[0])}
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}

