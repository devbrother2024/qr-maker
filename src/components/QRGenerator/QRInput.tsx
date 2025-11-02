import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { QRInputType } from '@/types/qr'

interface QRInputProps {
  value: string
  inputType: QRInputType
  onChange: (value: string) => void
  onInputTypeChange: (type: QRInputType) => void
  error: string | null
  disabled: boolean
}

export function QRInput({
  value,
  inputType,
  onChange,
  onInputTypeChange,
  error,
  disabled,
}: QRInputProps) {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="qr-input">입력</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={inputType === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onInputTypeChange('url')}
            disabled={disabled}
          >
            URL
          </Button>
          <Button
            type="button"
            variant={inputType === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onInputTypeChange('text')}
            disabled={disabled}
          >
            Text
          </Button>
        </div>
      </div>
      {inputType === 'text' ? (
        <textarea
          id="qr-input"
          placeholder="텍스트를 입력하세요"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          rows={4}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
          )}
          aria-invalid={!!error}
          aria-describedby={error ? 'qr-error' : undefined}
        />
      ) : (
        <Input
          id="qr-input"
          type="url"
          placeholder="https://example.com"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(error && 'border-destructive')}
          aria-invalid={!!error}
          aria-describedby={error ? 'qr-error' : undefined}
        />
      )}
      {error && (
        <p id="qr-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

