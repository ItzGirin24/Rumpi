import { Button } from '@/components/ui/button';
import { 
  Eraser, 
  Brush, 
  Download, 
  RotateCcw, 
  Sparkles,
  Grid3x3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  onRemoveBackground: () => void;
  onManualEdit: () => void;
  onEraserTool: () => void;
  onPenTool: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onEnhanceHD: () => void;
  onGridInstagram: () => void;
  onReset: () => void;
  onUndoEnchant: () => void;
  onDownload: () => void;
  isProcessing: boolean;
  isManualMode: boolean;
  className?: string;
}

export const EditorToolbar = ({
  onRemoveBackground,
  onManualEdit,
  onEraserTool,
  onPenTool,
  onUndo,
  onRedo,
  onEnhanceHD,
  onGridInstagram,
  onReset,
  onUndoEnchant,
  onDownload,
  isProcessing,
  isManualMode,
  className
}: EditorToolbarProps) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-card border-b border-border shadow-soft gap-3 sm:gap-0",
      className
    )}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <Button
          onClick={onRemoveBackground}
          disabled={isProcessing}
          className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-medium text-sm"
          size="sm"
        >
          <Eraser className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Hapus Background</span>
          <span className="sm:hidden">Hapus BG</span>
        </Button>

        <Button
          onClick={onManualEdit}
          variant={isManualMode ? "default" : "outline"}
          className={cn(
            "transition-smooth text-sm",
            isManualMode && "bg-primary text-primary-foreground"
          )}
          size="sm"
        >
          <Brush className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Edit Manual</span>
          <span className="sm:hidden">Edit</span>
        </Button>

        {isManualMode && (
          <>
            <Button
              onClick={onUndo}
              variant="outline"
              className="border-gray-500/50 hover:bg-gray-500/10 transition-smooth text-sm"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Undo</span>
              <span className="sm:hidden">Undo</span>
            </Button>

            <Button
              onClick={onRedo}
              variant="outline"
              className="border-gray-500/50 hover:bg-gray-500/10 transition-smooth text-sm"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2 rotate-180" />
              <span className="hidden sm:inline">Redo</span>
              <span className="sm:hidden">Redo</span>
            </Button>

            <Button
              onClick={onEraserTool}
              variant="outline"
              className="border-red-500/50 hover:bg-red-500/10 transition-smooth text-sm"
              size="sm"
            >
              <Eraser className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Penghapus</span>
              <span className="sm:hidden">Hapus</span>
            </Button>

            <Button
              onClick={onPenTool}
              variant="outline"
              className="border-blue-500/50 hover:bg-blue-500/10 transition-smooth text-sm"
              size="sm"
            >
              <Brush className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Pulpen</span>
              <span className="sm:hidden">Pulpen</span>
            </Button>
          </>
        )}

        <Button
          onClick={onEnhanceHD}
          variant="outline"
          className="border-primary/50 hover:bg-primary/10 transition-smooth text-sm"
          size="sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Enchant HD</span>
          <span className="sm:hidden">HD</span>
        </Button>

        <Button
          onClick={onUndoEnchant}
          variant="ghost"
          size="sm"
          className="hover:bg-secondary transition-smooth"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Undo Enchant</span>
          <span className="sm:hidden">Undo</span>
        </Button>

        <Button
          onClick={onGridInstagram}
          variant="outline"
          className="border-primary/50 hover:bg-primary/10 transition-smooth text-sm"
          size="sm"
        >
          <Grid3x3 className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Grid Instagram</span>
          <span className="sm:hidden">Grid</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">

        <Button
          onClick={onDownload}
          className="bg-gradient-primary hover:opacity-90 transition-smooth text-sm"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Download</span>
          <span className="sm:hidden">Save</span>
        </Button>
      </div>
    </div>
  );
};
