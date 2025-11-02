import { createContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resendVerificationEmail: () => Promise<{ error: Error | null }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let isInitialSession = true

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // 초기 세션이거나 TOKEN_REFRESHED 이벤트는 토스트 표시 안 함
      if (
        isInitialSession ||
        _event === 'INITIAL_SESSION' ||
        _event === 'TOKEN_REFRESHED'
      ) {
        isInitialSession = false
        return
      }

      if (_event === 'SIGNED_IN') {
        toast({
          title: '로그인 성공',
          description: '환영합니다!',
        })
      } else if (_event === 'SIGNED_OUT') {
        toast({
          title: '로그아웃 완료',
          description: '안전하게 로그아웃되었습니다.',
        })
      }

      isInitialSession = false
    })

    return () => subscription.unsubscribe()
  }, [toast])

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      })

      if (error) {
        setError(error)
        return { error }
      }

      toast({
        title: '회원가입 완료',
        description: '이메일 인증 링크를 확인해주세요.',
      })

      return { error: null }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('회원가입 중 오류가 발생했습니다.')
      setError(error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error)
        return { error }
      }

      return { error: null }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('로그인 중 오류가 발생했습니다.')
      setError(error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await supabase.auth.signOut()
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('로그아웃 중 오류가 발생했습니다.')
      setError(error)
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const resendVerificationEmail = async () => {
    try {
      setError(null)
      if (!user) {
        const error = new Error('로그인이 필요합니다.')
        setError(error)
        return { error }
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      })

      if (error) {
        setError(error)
        return { error }
      }

      toast({
        title: '인증 이메일 재발송',
        description: '이메일을 확인해주세요.',
      })

      return { error: null }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('이메일 재발송 중 오류가 발생했습니다.')
      setError(error)
      return { error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
