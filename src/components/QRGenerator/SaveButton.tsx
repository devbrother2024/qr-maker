import { Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useQRHistory } from '@/hooks/useQRHistory'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import type { CustomizationState } from '@/types/qr'

interface SaveButtonProps {
  inputValue: string
  inputType: 'url' | 'text'
  debouncedInput: string
  qrDataUrl: string | null
  customization: CustomizationState
  exportQRBlob: (
    format?: 'png' | 'svg',
  ) => Promise<{ qrBlob: Blob; logoBlob: Blob | null } | null>
}

export function SaveButton({
  inputValue,
  inputType,
  debouncedInput,
  qrDataUrl,
  customization,
  exportQRBlob,
}: SaveButtonProps) {
  const { user } = useAuth()
  const { saveQR } = useQRHistory()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)

  // 로그인하지 않았거나 이메일 인증이 안 된 경우 표시하지 않음
  if (!user || !user.email_confirmed_at) {
    return null
  }

  const handleSave = async () => {
    // 저장할 때는 실제 QR 코드가 생성된 debouncedInput 사용
    const valueToSave = debouncedInput.trim() || inputValue.trim()

    if (!qrDataUrl || !valueToSave) {
      toast({
        title: '저장 불가',
        description: '먼저 QR 코드를 생성해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      // URL 정규화 (URL 타입인 경우)
      const normalizedUrl =
        inputType === 'url' && !valueToSave.startsWith('http')
          ? `https://${valueToSave}`
          : valueToSave

      // QR Blob 변환
      const blobData = await exportQRBlob('png')
      if (!blobData) {
        throw new Error('QR 코드를 변환할 수 없습니다.')
      }

      // 저장
      const result = await saveQR({
        url: normalizedUrl,
        foregroundColor: customization.foregroundColor,
        backgroundColor: customization.backgroundColor,
        qrImageBlob: blobData.qrBlob,
        qrImageFormat: 'png',
        logoBlob: blobData.logoBlob,
      })

      if (!result.success) {
        throw new Error(result.error || '저장에 실패했습니다.')
      }

      // 저장 성공 시 마이페이지로 이동
      navigate('/my-page')
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'QR 코드 저장 중 오류가 발생했습니다.'
      toast({
        title: '저장 실패',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 버튼 활성화 조건: QR 코드가 생성되었으면 활성화 (저장 시 실제 값은 debouncedInput 또는 inputValue 사용)
  const isDisabled = !qrDataUrl || isSaving

  return (
    <Button
      onClick={handleSave}
      disabled={isDisabled}
      size="lg"
      variant="outline"
      className="w-full"
    >
      <Save className="mr-2 h-4 w-4" />
      {isSaving ? '저장 중...' : '저장'}
    </Button>
  )
}
