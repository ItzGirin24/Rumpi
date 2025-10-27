import { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  className?: string;
}

export const ImageUploader = ({ onImageSelect, className }: ImageUploaderProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-full min-h-[300px] sm:min-h-[400px]",
        "border-2 border-dashed border-border rounded-2xl",
        "bg-gradient-subtle hover:bg-secondary/50 transition-smooth cursor-pointer",
        "group p-4 sm:p-6",
        className
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-3 sm:gap-4 pointer-events-none">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-smooth" />
          <div className="relative bg-card p-4 sm:p-6 rounded-2xl shadow-soft">
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
            Upload Gambar Anda
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm px-4">
            Drag & drop gambar di sini, atau klik untuk memilih
          </p>
          <div className="flex items-center gap-2 justify-center pt-2">
            <Upload className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">
              JPG, PNG, WEBP hingga 10MB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
