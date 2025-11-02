import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// ResizeObserver 모킹 (슬라이더 컴포넌트 사용 시 필요)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 테스트 후 DOM 정리
afterEach(() => {
  cleanup()
})

