import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ControlSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  icon?: React.ReactNode;
}

const ControlSlider = ({ 
  label, 
  value, 
  onChange, 
  min = -100, 
  max = 100, 
  step = 1,
  icon 
}: ControlSliderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <Label className="text-sm font-medium text-foreground">{label}</Label>
        </div>
        <span className="text-sm font-semibold text-primary tabular-nums min-w-[3ch] text-right">
          {value > 0 ? '+' : ''}{value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
};

interface EditorControlsProps {
  adjustments: {
    exposure: number;
    contrast: number;
    brightness: number;
    saturation: number;
    highlights: number;
    shadows: number;
    temperature: number;
    tint: number;
    clarity: number;
    vibrance: number;
  };
  onAdjustmentChange: (key: string, value: number) => void;
  className?: string;
}

export const EditorControls = ({ 
  adjustments, 
  onAdjustmentChange,
  className 
}: EditorControlsProps) => {
  return (
    <div className={cn("bg-editor-controls rounded-xl p-4 sm:p-6 shadow-soft space-y-4 sm:space-y-6", className)}>
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Pencahayaan
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <ControlSlider
            label="Exposure"
            value={adjustments.exposure}
            onChange={(val) => onAdjustmentChange('exposure', val)}
          />
          <ControlSlider
            label="Contrast"
            value={adjustments.contrast}
            onChange={(val) => onAdjustmentChange('contrast', val)}
          />
          <ControlSlider
            label="Brightness"
            value={adjustments.brightness}
            onChange={(val) => onAdjustmentChange('brightness', val)}
          />
          <ControlSlider
            label="Highlights"
            value={adjustments.highlights}
            onChange={(val) => onAdjustmentChange('highlights', val)}
          />
          <ControlSlider
            label="Shadows"
            value={adjustments.shadows}
            onChange={(val) => onAdjustmentChange('shadows', val)}
          />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Warna
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <ControlSlider
            label="Saturation"
            value={adjustments.saturation}
            onChange={(val) => onAdjustmentChange('saturation', val)}
          />
          <ControlSlider
            label="Vibrance"
            value={adjustments.vibrance}
            onChange={(val) => onAdjustmentChange('vibrance', val)}
          />
          <ControlSlider
            label="Temperature"
            value={adjustments.temperature}
            onChange={(val) => onAdjustmentChange('temperature', val)}
          />
          <ControlSlider
            label="Tint"
            value={adjustments.tint}
            onChange={(val) => onAdjustmentChange('tint', val)}
          />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Detail
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <ControlSlider
            label="Clarity"
            value={adjustments.clarity}
            onChange={(val) => onAdjustmentChange('clarity', val)}
          />
        </div>
      </div>
    </div>
  );
};
