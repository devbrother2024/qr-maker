import { useEffect } from 'react'
import { useSearchParams, Navigate, Link } from 'react-router-dom'
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function VerifyEmailContent() {
  const { user, resendVerificationEmail } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const type = searchParams.get('type')

    if (token && type === 'signup') {
      // Supabase가 자동으로 처리하므로, 세션이 업데이트되면 확인됨
      // verificationStatus는 현재 사용되지 않으므로 제거
    }
  }, [searchParams, user])

  const handleResend = async () => {
    await resendVerificationEmail()
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.email_confirmed_at) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>이메일 인증 완료</CardTitle>
              <CardDescription>계정이 성공적으로 활성화되었습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/my-page">마이페이지로 이동</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>이메일 인증 필요</CardTitle>
            <CardDescription>
              {user.email}로 발송된 인증 링크를 확인해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              이메일을 받지 못하셨나요? 아래 버튼을 클릭하여 다시 발송할 수 있습니다.
            </p>
            <Button onClick={handleResend} className="w-full" variant="outline">
              인증 이메일 재발송
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function VerifyEmail() {
  return (
    <ProtectedRoute requireAuth>
      <VerifyEmailContent />
    </ProtectedRoute>
  )
}

