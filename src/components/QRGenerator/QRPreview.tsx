import { Loader2 } from 'lucide-react'

interface QRPreviewProps {
  qrDataUrl: string | null
  isLoading: boolean
  error: string | null
}

export function QRPreview({ qrDataUrl, isLoading, error }: QRPreviewProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-card">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">QR 코드 생성 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-card">
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      </div>
    )
  }

  if (!qrDataUrl) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-card">
        <p className="text-sm text-muted-foreground">
          URL 또는 텍스트를 입력하면 QR 코드가 생성됩니다.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center rounded-lg border bg-card p-4">
      <div
        className="flex items-center justify-center"
        dangerouslySetInnerHTML={
          qrDataUrl.startsWith('<svg') ? { __html: qrDataUrl } : undefined
        }
      >
        {!qrDataUrl.startsWith('<svg') && (
          <img
            src={qrDataUrl}
            alt="QR Code"
            className="max-w-full rounded"
            style={{ maxHeight: '500px' }}
          />
        )}
      </div>
    </div>
  )
}

