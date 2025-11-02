import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'
import type { QRHistoryState, SaveQRHistoryParams } from '@/types/history'

export function useQRHistory() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [state, setState] = useState<QRHistoryState>({
    items: [],
    loading: false,
    error: null,
  })

  // QR 히스토리 목록 조회
  const fetchHistory = useCallback(async () => {
    if (!user) {
      setState({ items: [], loading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('qr_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setState({
        items: data || [],
        loading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '히스토리를 불러오는 중 오류가 발생했습니다.'
      setState({
        items: [],
        loading: false,
        error: errorMessage,
      })
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [user, toast])

  // QR 코드 저장
  const saveQR = useCallback(
    async (
      params: SaveQRHistoryParams,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: '로그인이 필요합니다.' }
      }

      const {
        url,
        foregroundColor,
        backgroundColor,
        qrImageBlob,
        qrImageFormat,
        logoBlob,
      } = params

      try {
        const qrId = crypto.randomUUID()
        const userId = user.id

        // Storage 경로 생성: {user_id}/{qr_id}.{format}
        const qrImagePath = `${userId}/${qrId}.${qrImageFormat}`
        const logoPath = logoBlob ? `${userId}/${qrId}-logo.png` : null

        // QR 이미지 업로드
        const qrContentType =
          qrImageFormat === 'png' ? 'image/png' : 'image/svg+xml'
        const { error: qrUploadError } = await supabase.storage
          .from('qr-images')
          .upload(qrImagePath, qrImageBlob, {
            contentType: qrContentType,
            upsert: false,
          })

        if (qrUploadError) {
          throw new Error(`QR 이미지 업로드 실패: ${qrUploadError.message}`)
        }

        // 로고 업로드 (있는 경우)
        if (logoBlob && logoPath) {
          const { error: logoUploadError } = await supabase.storage
            .from('logos')
            .upload(logoPath, logoBlob, {
              contentType: 'image/png',
              upsert: false,
            })

          if (logoUploadError) {
            // 로고 업로드 실패 시 QR 이미지는 업로드되었으므로 롤백
            await supabase.storage.from('qr-images').remove([qrImagePath])
            throw new Error(`로고 업로드 실패: ${logoUploadError.message}`)
          }
        }

        // DB에 메타데이터 저장
        const { error: dbError } = await supabase
          .from('qr_history')
          .insert({
            id: qrId,
            user_id: userId,
            url,
            foreground_color: foregroundColor,
            background_color: backgroundColor,
            qr_image_storage_path: qrImagePath,
            logo_storage_path: logoPath,
          })
          .select()
          .single()

        if (dbError) {
          // DB 저장 실패 시 업로드한 파일들 삭제
          await supabase.storage.from('qr-images').remove([qrImagePath])
          if (logoPath) {
            await supabase.storage.from('logos').remove([logoPath])
          }
          throw new Error(`데이터베이스 저장 실패: ${dbError.message}`)
        }

        // 히스토리 목록 갱신
        await fetchHistory()

        toast({
          title: '저장 완료',
          description: 'QR 코드가 저장되었습니다.',
        })

        return { success: true }
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
        return { success: false, error: errorMessage }
      }
    },
    [user, toast, fetchHistory],
  )

  // QR 코드 삭제
  const deleteQR = useCallback(
    async (itemId: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: '로그인이 필요합니다.' }
      }

      try {
        // 먼저 레코드를 조회하여 Storage 경로 확인
        const { data: item, error: fetchError } = await supabase
          .from('qr_history')
          .select('qr_image_storage_path, logo_storage_path')
          .eq('id', itemId)
          .eq('user_id', user.id)
          .single()

        if (fetchError || !item) {
          throw new Error('삭제할 항목을 찾을 수 없습니다.')
        }

        // DB 레코드 삭제
        const { error: deleteError } = await supabase
          .from('qr_history')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id)

        if (deleteError) {
          throw new Error(`데이터베이스 삭제 실패: ${deleteError.message}`)
        }

        // Storage 파일 삭제
        const filesToDelete: string[] = [item.qr_image_storage_path]
        if (item.logo_storage_path) {
          filesToDelete.push(item.logo_storage_path)
        }

        await Promise.all([
          supabase.storage
            .from('qr-images')
            .remove([item.qr_image_storage_path]),
          item.logo_storage_path
            ? supabase.storage.from('logos').remove([item.logo_storage_path])
            : Promise.resolve({ error: null }),
        ])

        // 히스토리 목록 갱신
        await fetchHistory()

        toast({
          title: '삭제 완료',
          description: 'QR 코드가 삭제되었습니다.',
        })

        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'QR 코드 삭제 중 오류가 발생했습니다.'
        toast({
          title: '삭제 실패',
          description: errorMessage,
          variant: 'destructive',
        })
        return { success: false, error: errorMessage }
      }
    },
    [user, toast, fetchHistory],
  )

  // Storage에서 이미지 URL 가져오기
  const getImageUrl = useCallback(
    async (
      storagePath: string,
      bucket: 'qr-images' | 'logos',
    ): Promise<string | null> => {
      if (!user) {
        return null
      }

      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(storagePath, 3600)

        if (error) {
          console.error('이미지 URL 생성 실패:', error)
          return null
        }

        return data?.signedUrl || null
      } catch (error) {
        console.error('이미지 URL 생성 중 오류:', error)
        return null
      }
    },
    [user],
  )

  // 사용자 변경 시 히스토리 자동 로드
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    ...state,
    fetchHistory,
    saveQR,
    deleteQR,
    getImageUrl,
  }
}
