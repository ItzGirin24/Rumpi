import { useCallback } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onImageUpload: (imageUrl: string) => void;
  isAnalyzing: boolean;
  existingImage?: string | null;
}

export const UploadZone = ({ onImageUpload, isAnalyzing, existingImage }: UploadZoneProps) => {
  const { toast } = useToast();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, WEBP, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
      toast({
        title: "Image uploaded successfully",
        description: "Click 'Generate Design' to create your UI",
      });
    };
    reader.readAsDataURL(file);
  }, [onImageUpload, toast]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  }, [handleFileChange]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative group"
      >
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isAnalyzing}
        />
        
        <label
          htmlFor="image-upload"
          className={`
            block cursor-pointer rounded-2xl border-2 border-dashed 
            transition-all duration-300
            ${existingImage 
              ? 'border-primary/50 bg-card/30' 
              : 'border-border hover:border-primary/50 bg-card/50'
            }
            backdrop-blur-sm p-8
            ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(147,51,234,0.2)]'}
          `}
        >
          {existingImage ? (
            <div className="space-y-4">
              <img 
                src={existingImage} 
                alt="Uploaded" 
                className="w-full h-64 object-cover rounded-xl"
              />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Click to upload a different image
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {isAnalyzing ? (
                  <div className="animate-spin">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                ) : (
                  <ImageIcon className="w-10 h-10 text-primary" />
                )}
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">
                  {isAnalyzing ? "Analyzing your image..." : "Drop your image here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse (max 20MB)
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WEBP, and more
                </p>
              </div>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};
