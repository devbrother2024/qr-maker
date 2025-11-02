import { HexColorPicker, HexColorInput } from 'react-colorful'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RotateCcw } from 'lucide-react'

interface ColorPickerProps {
  label: string
  color: string
  onChange: (color: string) => void
  onReset: () => void
  defaultColor: string
}

export function ColorPicker({
  label,
  color,
  onChange,
  onReset,
  defaultColor,
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 px-2"
          title="기본값으로 리셋"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3 border-2"
          >
            <div
              className="h-6 w-6 rounded border border-input"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm">{color}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-3">
            <HexColorPicker color={color} onChange={onChange} />
            <div className="flex items-center gap-2">
              <HexColorInput
                color={color}
                onChange={onChange}
                className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                prefixed
              />
              <div
                className="h-9 w-12 rounded-md border border-input"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

