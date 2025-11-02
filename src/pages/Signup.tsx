import { SignupForm } from '@/components/Auth/SignupForm'
import { PublicRoute } from '@/components/Auth/PublicRoute'

export function Signup() {
  return (
    <PublicRoute>
      <SignupForm />
    </PublicRoute>
  )
}

