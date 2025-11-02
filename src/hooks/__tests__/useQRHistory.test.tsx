import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useQRHistory } from '../useQRHistory'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../useAuth'
import { useToast } from '../use-toast'

// 모듈 모킹
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}))

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}))

describe('useQRHistory', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
  }

  const mockHistoryItem = {
    id: 'qr-123',
    user_id: 'user-123',
    url: 'https://example.com',
    foreground_color: '#000000',
    background_color: '#FFFFFF',
    qr_image_storage_path: 'user-123/qr-123.png',
    logo_storage_path: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // @ts-expect-error - vi.mocked 타입 이슈
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      error: null,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      resendVerificationEmail: vi.fn(),
    })
  })

  describe('fetchHistory', () => {
    it('히스토리 목록을 가져와야 함', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockHistoryItem],
        error: null,
      })

      // @ts-expect-error - vi.mocked 타입 이슈
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useQRHistory())

      await waitFor(() => {
        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0]).toEqual(mockHistoryItem)
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
      })
    })

    it('에러 발생 시 에러 상태를 설정해야 함', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: '데이터베이스 오류' },
      })

      // @ts-expect-error - vi.mocked 타입 이슈
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any)

      const { result } = renderHook(() => useQRHistory())

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.items).toHaveLength(0)
        expect(result.current.loading).toBe(false)
      })
    })

    it('사용자가 없으면 빈 목록을 반환해야 함', () => {
      // @ts-expect-error - vi.mocked 타입 이슈
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
        resendVerificationEmail: vi.fn(),
      })

      const { result } = renderHook(() => useQRHistory())

      expect(result.current.items).toHaveLength(0)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('saveQR', () => {
    it('QR 코드를 저장해야 함', async () => {
      const mockBlob = new Blob(['qr-image'], { type: 'image/png' })
      const mockLogoBlob = new Blob(['logo'], { type: 'image/png' })

      const mockUpload = vi.fn().mockResolvedValue({ error: null })
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockHistoryItem,
        error: null,
      })

      const mockStorageBucket = {
        upload: mockUpload,
        remove: vi.fn(),
        createSignedUrl: vi.fn(),
      }

      // @ts-expect-error - vi.mocked 타입 이슈
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any)

      // @ts-expect-error - vi.mocked 타입 이슈
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      } as any)

      const { result } = renderHook(() => useQRHistory())

      const saveResult = await result.current.saveQR({
        url: 'https://example.com',
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        qrImageBlob: mockBlob,
        qrImageFormat: 'png',
        logoBlob: mockLogoBlob,
      })

      await waitFor(() => {
        expect(saveResult.success).toBe(true)
        expect(mockUpload).toHaveBeenCalledTimes(2) // QR 이미지 + 로고
        expect(mockInsert).toHaveBeenCalled()
      })
    })

    it('로그인하지 않은 사용자는 저장할 수 없어야 함', async () => {
      // @ts-expect-error - vi.mocked 타입 이슈
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
        resendVerificationEmail: vi.fn(),
      })

      const { result } = renderHook(() => useQRHistory())

      const mockBlob = new Blob(['qr-image'], { type: 'image/png' })
      const saveResult = await result.current.saveQR({
        url: 'https://example.com',
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        qrImageBlob: mockBlob,
        qrImageFormat: 'png',
      })

      expect(saveResult.success).toBe(false)
      expect(saveResult.error).toContain('로그인')
    })
  })

  describe('deleteQR', () => {
    it('QR 코드를 삭제해야 함', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockHistoryItem,
        error: null,
      })
      const mockDelete = vi.fn().mockReturnThis()
      const mockDeleteResolved = vi.fn().mockResolvedValue({ error: null })

      const mockStorageRemove = vi.fn().mockResolvedValue({ error: null })
      const mockStorageBucket = {
        remove: mockStorageRemove,
      }

      // @ts-expect-error - vi.mocked 타입 이슈
      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageBucket as any)

      // @ts-expect-error - vi.mocked 타입 이슈
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
        delete: mockDelete,
      } as any)

      // delete().eq() 체인 모킹
      mockDelete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })

      const { result } = renderHook(() => useQRHistory())

      const deleteResult = await result.current.deleteQR('qr-123')

      await waitFor(() => {
        expect(deleteResult.success).toBe(true)
      })
    })

    it('로그인하지 않은 사용자는 삭제할 수 없어야 함', async () => {
      // @ts-expect-error - vi.mocked 타입 이슈
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
        resendVerificationEmail: vi.fn(),
      })

      const { result } = renderHook(() => useQRHistory())

      const deleteResult = await result.current.deleteQR('qr-123')

      expect(deleteResult.success).toBe(false)
      expect(deleteResult.error).toContain('로그인')
    })
  })
})

