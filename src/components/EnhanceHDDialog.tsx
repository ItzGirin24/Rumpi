import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface EnhanceHDDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnhance: (resolution: '2k' | '4k' | '8k') => void;
}

export const EnhanceHDDialog = ({
  open,
  onOpenChange,
  onEnhance,
}: EnhanceHDDialogProps) => {
  const resolutions = [
    { value: '2k' as const, label: '2K (2560x1440)', description: 'Cepat & Tajam' },
    { value: '4k' as const, label: '4K (3840x2160)', description: 'Detail Tinggi' },
    { value: '8k' as const, label: '8K (7680x4320)', description: 'Ultra HD Premium' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Enchant HD
          </DialogTitle>
          <DialogDescription>
            Tingkatkan kualitas gambar dengan AI upscaling
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {resolutions.map((res) => (
            <Button
              key={res.value}
              onClick={() => {
                onEnhance(res.value);
                onOpenChange(false);
              }}
              variant="outline"
              className="w-full justify-start h-auto p-4 hover:bg-primary/10 hover:border-primary transition-smooth"
            >
              <div className="text-left">
                <div className="font-semibold text-foreground">{res.label}</div>
                <div className="text-sm text-muted-foreground">{res.description}</div>
              </div>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Proses upscaling menggunakan AI dapat memakan waktu beberapa saat
        </div>
      </DialogContent>
    </Dialog>
  );
};
