import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Grid3x3, Archive, FileImage } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import JSZip from 'jszip';

interface GridPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gridImages: string[];
  rows: number;
  cols: number;
  onDownloadAll: () => void;
}

export const GridPreviewDialog = ({
  open,
  onOpenChange,
  gridImages,
  rows,
  cols,
  onDownloadAll,
}: GridPreviewDialogProps) => {
  const downloadAsZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder(`grid-${rows}x${cols}`);

    for (let i = 0; i < gridImages.length; i++) {
      const response = await fetch(gridImages[i]);
      const blob = await response.blob();
      folder?.file(`grid-piece-${i + 1}.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `grid-${rows}x${cols}.zip`;
    link.click();
  };

  const downloadAsRar = async () => {
    // Since JSZip doesn't support RAR format, we'll create a ZIP file with .rar extension
    // This is a workaround - in a real app you'd use a server-side solution
    const zip = new JSZip();
    const folder = zip.folder(`grid-${rows}x${cols}`);

    for (let i = 0; i < gridImages.length; i++) {
      const response = await fetch(gridImages[i]);
      const blob = await response.blob();
      folder?.file(`grid-piece-${i + 1}.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `grid-${rows}x${cols}.rar`;
    link.click();
  };

  const downloadIndividual = (index: number) => {
    const link = document.createElement('a');
    link.href = gridImages[index];
    link.download = `grid-piece-${index + 1}.png`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-primary" />
            Preview Grid {rows}×{cols}
          </DialogTitle>
          <DialogDescription>
            {gridImages.length} bagian siap untuk diunduh
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] w-full rounded-xl">
          <div
            className="grid gap-2 p-4"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
          >
            {gridImages.map((src, index) => (
              <div
                key={index}
                className="relative group bg-secondary/30 rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={src}
                  alt={`Grid ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-smooth flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-smooth flex flex-col items-center gap-2">
                    <div className="bg-white/90 px-3 py-1.5 rounded-full text-xs font-semibold text-foreground">
                      #{index + 1}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white text-xs"
                      onClick={() => downloadIndividual(index)}
                    >
                      <FileImage className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={downloadAsZip}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Download ZIP
            </Button>
            <Button
              onClick={downloadAsRar}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Download RAR
            </Button>
            <Button
              onClick={onDownloadAll}
              className="bg-gradient-primary hover:opacity-90 transition-smooth flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Semua
            </Button>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Hover pada gambar untuk download individual
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Upload ke Instagram dalam urutan yang benar untuk hasil terbaik
        </div>
      </DialogContent>
    </Dialog>
  );
};
