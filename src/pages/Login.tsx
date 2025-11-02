import { LoginForm } from '@/components/Auth/LoginForm'
import { PublicRoute } from '@/components/Auth/PublicRoute'

export function Login() {
  return (
    <PublicRoute>
      <LoginForm />
    </PublicRoute>
  )
}

