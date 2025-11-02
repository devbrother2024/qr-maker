import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker } from '../ColorPicker'

describe('ColorPicker', () => {
  const defaultProps = {
    label: '전경색',
    color: '#000000',
    onChange: vi.fn(),
    onReset: vi.fn(),
    defaultColor: '#000000',
  }

  it('레이블이 표시되어야 함', () => {
    render(<ColorPicker {...defaultProps} />)
    expect(screen.getByText('전경색')).toBeInTheDocument()
  })

  it('현재 색상 값이 버튼에 표시되어야 함', () => {
    render(<ColorPicker {...defaultProps} color="#FF0000" />)
    expect(screen.getByText('#FF0000')).toBeInTheDocument()
  })

  it('색상 선택 버튼 클릭 시 Popover가 열려야 함', async () => {
    const user = userEvent.setup()
    render(<ColorPicker {...defaultProps} />)

    const triggerButton = screen.getByRole('button', { name: /#000000/i })
    await user.click(triggerButton)

    await waitFor(() => {
      // HexColorInput이 Popover 안에 있어야 함
      const colorInput = screen.getByDisplayValue('#000000')
      expect(colorInput).toBeInTheDocument()
    })
  })

  it('Popover 내에서 색상 입력 필드 변경 시 onChange가 호출되어야 함', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} onChange={onChange} />)

    const triggerButton = screen.getByRole('button', { name: /#000000/i })
    await user.click(triggerButton)

    await waitFor(async () => {
      const colorInput = screen.getByDisplayValue('#000000')
      await user.clear(colorInput)
      await user.type(colorInput, '#FF0000')
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('리셋 버튼 클릭 시 onReset이 호출되어야 함', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(<ColorPicker {...defaultProps} onReset={onReset} />)

    const resetButton = screen.getByTitle('기본값으로 리셋')
    await user.click(resetButton)

    expect(onReset).toHaveBeenCalled()
  })

  it('색상 미리보기가 버튼에 표시되어야 함', () => {
    const { container } = render(<ColorPicker {...defaultProps} color="#FF0000" />)
    const preview = container.querySelector(
      '[style*="background-color: rgb(255, 0, 0)"]',
    )
    expect(preview).toBeInTheDocument()
  })
})

