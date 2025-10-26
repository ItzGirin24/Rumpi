import { Card } from "@/components/ui/card";
import { Palette } from "lucide-react";

interface ColorPaletteProps {
  colors: string[];
}

export const ColorPalette = ({ colors }: ColorPaletteProps) => {
  if (!colors || colors.length === 0) return null;

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Extracted Color Palette</h3>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {colors.map((color, index) => (
          <div key={index} className="space-y-2">
            <div
              className="w-full aspect-square rounded-xl border border-border shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: color }}
            />
            <p className="text-xs text-center text-muted-foreground font-mono">
              {color}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
