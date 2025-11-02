import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold">
          QR Maker
        </Link>

        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          ) : user ? (
            <>
              <Link to="/my-page">
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  마이페이지
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">회원가입</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

