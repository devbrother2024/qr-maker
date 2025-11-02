import { useState, ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface URLInputProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
  disabled?: boolean
}

export function URLInput({ value, onChange, error, disabled }: URLInputProps) {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="url-input">URL 입력</Label>
      <Input
        id="url-input"
        type="url"
        placeholder="https://example.com"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        className={error ? 'border-destructive' : ''}
        aria-invalid={!!error}
        aria-describedby={error ? 'url-error' : undefined}
      />
      {error && (
        <p id="url-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

