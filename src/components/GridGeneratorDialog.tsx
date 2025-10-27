import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Grid3x3, Layout } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface GridGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (rows: number, cols: number) => void;
  imageSrc?: string;
}

export const GridGeneratorDialog = ({
  open,
  onOpenChange,
  onGenerate,
  imageSrc,
}: GridGeneratorDialogProps) => {
  const [selectedGrid, setSelectedGrid] = useState<{ rows: number; cols: number } | null>(null);
  const [customRows, setCustomRows] = useState(3);
  const [customCols, setCustomCols] = useState(3);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gridOptions = [
    { rows: 3, cols: 3, label: '3×3 Grid', description: '9 bagian - Instagram populer' },
    { rows: 4, cols: 4, label: '4×4 Grid', description: '16 bagian - Detail lebih banyak' },
    { rows: 2, cols: 3, label: '2×3 Grid', description: '6 bagian - Landscape' },
    { rows: 3, cols: 2, label: '3×2 Grid', description: '6 bagian - Portrait' },
    { rows: 5, cols: 5, label: '5×5 Grid', description: '25 bagian - Ultra detail' },
    { rows: 2, cols: 2, label: '2×2 Grid', description: '4 bagian - Simple' },
    { rows: 3, cols: 1, label: '3 Halaman', description: '3 bagian vertikal' },
    { rows: 1, cols: 3, label: '3 Halaman', description: '3 bagian horizontal' },
    { rows: 4, cols: 1, label: '4 Halaman', description: '4 bagian vertikal' },
    { rows: 1, cols: 4, label: '4 Halaman', description: '4 bagian horizontal' },
  ];

  const handleSelect = (rows: number, cols: number) => {
    setSelectedGrid({ rows, cols });
    setIsCustomMode(false);
  };

  const handleCustomSelect = () => {
    setSelectedGrid({ rows: customRows, cols: customCols });
    setIsCustomMode(true);
  };

  useEffect(() => {
    if (open && imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Set canvas size to match the photo's aspect ratio, scaled to fit within 400px max dimension
        // This allows the preview to show the image in its natural proportions more clearly
        const maxDimension = 400;
        const aspectRatio = img.width / img.height;
        let canvasWidth, canvasHeight;

        if (aspectRatio > 1) {
          // Landscape: fit width to maxDimension
          canvasWidth = maxDimension;
          canvasHeight = maxDimension / aspectRatio;
        } else {
          // Portrait or square: fit height to maxDimension
          canvasHeight = maxDimension;
          canvasWidth = maxDimension * aspectRatio;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        drawGrid();
      };
      img.src = imageSrc;
    }
  }, [open, imageSrc]);

  const drawGrid = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw image
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw grid lines for dividing the entire image
      const rows = isCustomMode ? customRows : (selectedGrid?.rows || 3);
      const cols = isCustomMode ? customCols : (selectedGrid?.cols || 3);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;

      // Vertical lines across the entire image
      for (let i = 1; i < cols; i++) {
        const x = (canvas.width / cols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines across the entire image
      for (let i = 1; i < rows; i++) {
        const y = (canvas.height / rows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw border around the entire image
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    };
    img.src = imageSrc || '';
  };

  useEffect(() => {
    if (open && imageSrc) {
      drawGrid();
    }
  }, [selectedGrid, customRows, customCols, isCustomMode]);

  const handleGenerate = () => {
    if (selectedGrid) {
      onGenerate(selectedGrid.rows, selectedGrid.cols);
      onOpenChange(false);
      setSelectedGrid(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-primary" />
            Grid Instagram
          </DialogTitle>
          <DialogDescription>
            Pilih ukuran grid untuk membagi foto Anda menjadi beberapa postingan Instagram
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Custom Grid Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Custom Grid</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="rows" className="text-xs">Rows (Baris)</Label>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  max="10"
                  value={customRows}
                  onChange={(e) => setCustomRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="text-center h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cols" className="text-xs">Columns (Kolom)</Label>
                <Input
                  id="cols"
                  type="number"
                  min="1"
                  max="10"
                  value={customCols}
                  onChange={(e) => setCustomCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="text-center h-8"
                />
              </div>
            </div>

            <Button
              onClick={handleCustomSelect}
              variant={isCustomMode ? "default" : "outline"}
              className="w-full h-8 text-sm"
              size="sm"
            >
              Pilih {customRows}×{customCols} Grid
            </Button>
          </div>

          {/* Preview Section */}
          {imageSrc && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Preview Potongan</h3>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="border border-border rounded-lg max-w-full"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {isCustomMode ? `${customRows}×${customCols}` : selectedGrid ? `${selectedGrid.rows}×${selectedGrid.cols}` : 'Pilih grid'} = {isCustomMode ? customRows * customCols : selectedGrid ? selectedGrid.rows * selectedGrid.cols : 0} bagian
              </p>
            </div>
          )}

          {/* Preset Grids */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Preset Grid</h3>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {gridOptions.map((option) => (
                <button
                  key={`${option.rows}x${option.cols}`}
                  onClick={() => onGenerate(option.rows, option.cols)}
                  className="
                    relative p-2 rounded-lg border transition-smooth text-left
                    hover:bg-primary/5 hover:border-primary/50
                    bg-card border-border
                  "
                >
                  <div className="flex items-start gap-2">
                    <div className="bg-gradient-primary p-1 rounded shadow-soft">
                      <Layout className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground text-xs mb-0.5">
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-8 text-sm"
            size="sm"
          >
            Batal
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!selectedGrid}
            className="flex-1 bg-gradient-primary hover:opacity-90 transition-smooth h-8 text-sm"
            size="sm"
          >
            Buat Grid {selectedGrid ? `${selectedGrid.rows}×${selectedGrid.cols}` : ''}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2">
          Gambar akan dipotong dengan presisi tinggi tanpa kehilangan kualitas
        </div>
      </DialogContent>
    </Dialog>
  );
};
