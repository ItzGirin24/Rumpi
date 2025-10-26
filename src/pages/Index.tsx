import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { DesignPreview } from "@/components/DesignPreview";
import { ColorPalette } from "@/components/ColorPalette";
import { Header } from "@/components/Header";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setGeneratedDesign(null);
    setColorPalette([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!uploadedImage ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-8">
            <div className="text-center space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Design Generator</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight">
                Transform Photos into
                <br />
                Rumpi AI Designs
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload any image and watch AI analyze its colors, composition, and style to generate
                professional, responsive web designs instantly. <span className="text-green-400 font-semibold">Unlimited & Free Forever!</span>
              </p>
            </div>

            <UploadZone 
              onImageUpload={handleImageUpload}
              isAnalyzing={isAnalyzing}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-12">
              <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Color Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically extracts color palettes that match your photo perfectly
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Layouts</h3>
                <p className="text-sm text-muted-foreground">
                  Generates responsive layouts inspired by your image composition
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary-glow flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Export Code</h3>
                <p className="text-sm text-muted-foreground">
                  Get production-ready HTML and Tailwind CSS code instantly
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <UploadZone 
                onImageUpload={handleImageUpload}
                isAnalyzing={isAnalyzing}
                existingImage={uploadedImage}
              />
              
              {colorPalette.length > 0 && (
                <ColorPalette colors={colorPalette} />
              )}
            </div>

            <DesignPreview
              image={uploadedImage}
              design={generatedDesign}
              onGenerate={setGeneratedDesign}
              onColorPaletteExtract={setColorPalette}
              onAnalyzingChange={setIsAnalyzing}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
