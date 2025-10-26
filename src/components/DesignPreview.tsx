import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Code, Eye, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DesignPreviewProps {
  image: string;
  design: string | null;
  onGenerate: (design: string) => void;
  onColorPaletteExtract: (colors: string[]) => void;
  onAnalyzingChange: (isAnalyzing: boolean) => void;
}

export const DesignPreview = ({
  image,
  design,
  onGenerate,
  onColorPaletteExtract,
  onAnalyzingChange,
}: DesignPreviewProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    onAnalyzingChange(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-design', {
        body: {
          image,
          prompt: prompt || "Create a modern, professional one-page web application UI based on this image's visual style, colors, and composition. Include header, hero section, features, and footer. Make it responsive and visually stunning."
        }
      });

      if (error) throw error;

      if (data.design) {
        onGenerate(data.design);
        toast({
          title: "Design generated!",
          description: "Your AI-powered design is ready. Customize it with prompts or export the code.",
        });
      }

      if (data.colors && data.colors.length > 0) {
        onColorPaletteExtract(data.colors);
      }
    } catch (error) {
      console.error('Error generating design:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      onAnalyzingChange(false);
    }
  };

  const handleCopy = async () => {
    if (!design) return;
    
    try {
      await navigator.clipboard.writeText(design);
      setCopied(true);
      toast({
        title: "Code copied!",
        description: "The design code has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Customize with AI (optional)
            </label>
            <Textarea
              placeholder="e.g., 'Make it more minimalist' or 'Add a pricing section' or 'Use warmer colors'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-background/50 border-border"
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin mr-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                Generating Design...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Design <span className="text-green-300 text-sm">(Free Forever)</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {design && (
        <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border">
          <Tabs defaultValue="preview" className="w-full">
            <div className="border-b border-border px-4">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="preview" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger 
                  value="code"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="p-6 m-0">
              <div className="bg-background/50 rounded-xl p-4 max-h-[600px] overflow-auto">
                <div 
                  dangerouslySetInnerHTML={{ __html: design }}
                  className="w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="p-6 m-0">
              <div className="relative">
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 z-10"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
                <pre className="bg-background/50 p-4 rounded-xl overflow-auto max-h-[600px] text-sm">
                  <code>{design}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};
