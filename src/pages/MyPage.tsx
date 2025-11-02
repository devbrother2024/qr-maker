import { ProtectedRoute } from '@/components/Auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { QRHistory } from '@/components/History/QRHistory'

function MyPageContent() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">마이페이지</h1>
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">이메일</p>
              <p className="text-lg font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">가입일</p>
              <p className="text-lg font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">QR 히스토리</h2>
          <QRHistory />
        </div>
      </div>
    </div>
  )
}

export function MyPage() {
  return (
    <ProtectedRoute requireAuth requireEmailVerified>
      <MyPageContent />
    </ProtectedRoute>
  )
}

