import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const BeforeAfterSlider = ({ beforeImage, afterImage }: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== 'click') return;

    const container = e.currentTarget.getBoundingClientRect();
    const position = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativePosition = position - container.left;
    const percentage = (relativePosition / container.width) * 100;

    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <Card className="relative w-full aspect-video sm:aspect-[4/3] overflow-hidden cursor-col-resize select-none bg-muted/20">
      <div
        className="relative w-full h-full"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseMove={handleMove}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleMove}
        onClick={handleMove}
      >
        {/* After Image (Full) */}
        <div className="absolute inset-0">
          <img
            src={afterImage}
            alt="After"
            className="w-full h-full object-contain"
            draggable={false}
          />
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-primary/90 text-primary-foreground px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            Sesudah
          </div>
        </div>

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt="Before"
            className="w-full h-full object-contain"
            draggable={false}
          />
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-secondary/90 text-secondary-foreground px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            Sebelum
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary cursor-col-resize z-10 shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full shadow-xl flex items-center justify-center border-2 sm:border-4 border-background">
            <div className="flex gap-0.5 sm:gap-1">
              <div className="w-0.5 h-3 sm:h-4 bg-primary-foreground rounded-full"></div>
              <div className="w-0.5 h-3 sm:h-4 bg-primary-foreground rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Instruction Overlay (shown briefly) */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-background/90 px-4 py-2 sm:px-6 sm:py-3 rounded-lg backdrop-blur-sm">
            <p className="text-sm font-medium text-foreground">Geser untuk membandingkan</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
