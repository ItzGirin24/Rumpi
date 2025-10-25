import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt kosong",
        description: "Tolong masukkan deskripsi gambar yang ingin kamu buat",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: prompt.trim() }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "Berhasil!",
          description: "Gambar berhasil dibuat",
        });
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal membuat gambar",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Generator Gambar AI
        </h2>
        <p className="text-muted-foreground">
          Deskripsikan gambar yang ingin kamu buat, dan Rumpi akan membuatkannya untukmu!
        </p>
      </div>

      <div className="flex-1 overflow-y-auto mb-6">
        {generatedImage ? (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full border-2 border-dashed border-border rounded-2xl">
            <div className="text-center p-8">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary/50" />
              <p className="text-muted-foreground">
                Gambar yang kamu buat akan muncul di sini
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Contoh: Seekor kucing lucu dengan topi pesta, style kartun..."
          className="resize-none bg-background/50"
          rows={3}
          disabled={isGenerating}
        />
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full rounded-xl"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sedang membuat...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Buat Gambar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageGenerator;
